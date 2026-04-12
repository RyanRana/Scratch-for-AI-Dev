import {
  BlockRegistry,
  BlockDefinition,
  PipelineEmit,
  ScaffoldConventions,
  ScaffoldEmit,
} from "@ai-blocks/block-schemas";
import {
  Pipeline,
  BlockLayout,
  BlockInstance,
  LayoutPipeline,
  CompiledPipeline,
  CompiledProject,
  CrossPipelineConnection,
} from "./types.js";
import { topoOrder } from "./validate.js";
import {
  ProjectTree,
  emptyTree,
  seedFromScaffold,
  applyFileBlock,
  applyFragmentBlock,
  appendToRegion,
  addImport,
  mergeDeps,
  flattenTree,
} from "./project-tree.js";

/**
 * Phase 1 multi-file compiler.
 *
 * Compiles a `BlockLayout` into a `CompiledProject` (path → file content).
 * For a layout holding exactly one pipeline targeting `pipeline.py` with
 * no cross-pipeline edges, the emitted file is byte-identical to the legacy
 * `Compiler.compile()` output — that is the Phase 1 shipping criterion.
 *
 * Cross-pipeline edges translate to `from <module> import <var>` lines in
 * the destination file and a binding substitution on the destination input
 * port. A layout-level topo-sort over the cross-edge DAG rejects cycles
 * (Python can't circular-import anyway).
 */
export class ProjectCompiler {
  constructor(private registry: BlockRegistry) {}

  /** Wrap a plain Pipeline in the implicit flat-python layout. */
  static flatPythonLayout(pipeline: Pipeline): BlockLayout {
    return {
      version: "1.0",
      stack: null,
      instances: [],
      pipelines: [{ id: "main", targetPath: "pipeline.py", pipeline }],
      crossEdges: [],
    };
  }

  /** Back-compat shim: compile a lone pipeline as if it were flat-python. */
  compile(pipeline: Pipeline): CompiledPipeline {
    const project = this.compileLayout(ProjectCompiler.flatPythonLayout(pipeline));
    return {
      pythonSource: project.files["pipeline.py"] ?? "",
      requirements: project.requirements,
    };
  }

  compileLayout(layout: BlockLayout): CompiledProject {
    if (layout.stack) {
      return this.compileWithScaffold(layout);
    }
    return this.compileLegacy(layout);
  }

  private compileLegacy(layout: BlockLayout): CompiledProject {
    const pipById = new Map(layout.pipelines.map((lp) => [lp.id, lp]));

    const usedPaths = new Set<string>();
    for (const lp of layout.pipelines) {
      if (usedPaths.has(lp.targetPath)) {
        throw new Error(
          `ProjectCompiler: duplicate targetPath "${lp.targetPath}" in layout`,
        );
      }
      usedPaths.add(lp.targetPath);
    }

    const pipeOrder = topoPipelines(layout);

    const extraImportsByPipe = new Map<string, Set<string>>();
    const extraBindingsByPipe = new Map<string, Map<string, string>>();

    for (const edge of layout.crossEdges) {
      const fromPipe = pipById.get(edge.fromPipeline);
      const toPipe = pipById.get(edge.toPipeline);
      if (!fromPipe) {
        throw new Error(
          `ProjectCompiler: cross edge references unknown pipeline "${edge.fromPipeline}"`,
        );
      }
      if (!toPipe) {
        throw new Error(
          `ProjectCompiler: cross edge references unknown pipeline "${edge.toPipeline}"`,
        );
      }
      const fromNode = fromPipe.pipeline.nodes.find((n) => n.id === edge.fromNode);
      if (!fromNode) {
        throw new Error(
          `ProjectCompiler: cross edge source node "${edge.fromNode}" not in pipeline "${edge.fromPipeline}"`,
        );
      }
      const fromDef = this.registry.getOrThrow(fromNode.blockId);
      const fromEmit = pipelineEmitOf(fromDef);
      const rawBinding = fromEmit.outputBindings[edge.fromPort];
      if (!rawBinding) {
        throw new Error(
          `ProjectCompiler: cross edge source port "${edge.fromPort}" has no binding on ${fromDef.id}`,
        );
      }
      const srcVar = nodeScoped(edge.fromNode, rawBinding);
      const srcModule = pathToModule(fromPipe.targetPath);

      const imports = extraImportsByPipe.get(edge.toPipeline) ?? new Set<string>();
      imports.add(`from ${srcModule} import ${srcVar}`);
      extraImportsByPipe.set(edge.toPipeline, imports);

      const bindings = extraBindingsByPipe.get(edge.toPipeline) ?? new Map<string, string>();
      bindings.set(`${edge.toNode}:${edge.toPort}`, srcVar);
      extraBindingsByPipe.set(edge.toPipeline, bindings);
    }

    const files: Record<string, string> = {};
    const allPipDeps = new Set<string>();
    for (const pipeId of pipeOrder) {
      const lp = pipById.get(pipeId)!;
      const { pythonSource, requirements } = this.compilePipeline(
        lp.pipeline,
        extraImportsByPipe.get(pipeId),
        extraBindingsByPipe.get(pipeId),
      );
      files[lp.targetPath] = pythonSource;
      for (const d of requirements) allPipDeps.add(d);
    }
    return { files, requirements: [...allPipDeps].sort() };
  }

  /**
   * Scaffold-backed compile. Apply order:
   *   1. scaffold  — seed the ProjectTree from `layout.stack`
   *   2. file      — apply each kind="file" BlockInstance (last-write-wins)
   *   3. pipeline  — compile each LayoutPipeline and append into its target region
   *
   * Fragment (kind="fragment") support is a Phase 3 concern and is rejected
   * here with a note rather than silently dropped.
   */
  private compileWithScaffold(layout: BlockLayout): CompiledProject {
    if (!layout.stack) {
      // unreachable — compileLayout dispatches on stack presence
      return this.compileLegacy(layout);
    }

    const tree: ProjectTree = emptyTree();

    const stackBlock = this.registry.getOrThrow(layout.stack.blockId);
    seedFromScaffold(tree, stackBlock, layout.stack.params);
    const conventions = scaffoldConventionsOf(stackBlock);

    // Group instances by kind for deterministic apply order.
    const byKind = new Map<string, BlockInstance[]>();
    for (const inst of layout.instances) {
      const def = this.registry.getOrThrow(inst.blockId);
      const k = def.kind ?? "pipeline";
      const arr = byKind.get(k) ?? [];
      arr.push(inst);
      byKind.set(k, arr);
    }

    // 2. file instances
    for (const inst of byKind.get("file") ?? []) {
      const def = this.registry.getOrThrow(inst.blockId);
      applyFileBlock(tree, def, inst.params ?? {});
    }

    // 3. fragment instances — contribute into named regions across one or
    //    more files, creating synthetic files when the target does not yet
    //    exist. Must precede pipelines so pipelines see any fragment-created
    //    files as valid targets.
    for (const inst of byKind.get("fragment") ?? []) {
      const def = this.registry.getOrThrow(inst.blockId);
      applyFragmentBlock(tree, def, inst.params ?? {}, conventions);
    }

    // 3. pipelines — compile each and append the produced body + imports into
    //    the target file region. Cross edges are resolved first so destination
    //    pipelines see the injected imports/bindings.
    const pipById = new Map(layout.pipelines.map((lp) => [lp.id, lp]));
    const pipeOrder = topoPipelines(layout);
    const { extraImportsByPipe, extraBindingsByPipe } = this.resolveCrossEdges(
      layout.crossEdges,
      pipById,
    );
    const allPipDeps = new Set<string>();

    for (const pipeId of pipeOrder) {
      const lp = pipById.get(pipeId)!;
      const region = lp.targetRegion ?? "body";
      const compiled = this.compilePipelineRaw(
        lp.pipeline,
        extraImportsByPipe.get(pipeId),
        extraBindingsByPipe.get(pipeId),
      );
      for (const d of compiled.pipDeps) allPipDeps.add(d);
      for (const imp of compiled.imports) addImport(tree, lp.targetPath, imp);
      if (compiled.setup.length) {
        appendToRegion(tree, lp.targetPath, region, compiled.setup.join("\n\n"));
      }
      if (compiled.bodies.length) {
        appendToRegion(tree, lp.targetPath, region, compiled.bodies.join("\n\n"));
      }
      if (compiled.teardown.length) {
        appendToRegion(tree, lp.targetPath, region, compiled.teardown.join("\n\n"));
      }
    }

    // Merge scaffold pip deps + pipeline pipDeps into the project-level set.
    mergeDeps(tree.deps, { pip: allPipDeps });

    return {
      files: flattenTree(tree),
      requirements: [...tree.deps.pip].sort(),
      notes: tree.notes.length ? [...tree.notes] : undefined,
    };
  }

  /**
   * Resolve layout.crossEdges into per-destination extra imports and
   * extra bindings. Shared between legacy and scaffold paths so both routes
   * produce identical cross-file wiring.
   */
  private resolveCrossEdges(
    edges: CrossPipelineConnection[],
    pipById: Map<string, LayoutPipeline>,
  ): {
    extraImportsByPipe: Map<string, Set<string>>;
    extraBindingsByPipe: Map<string, Map<string, string>>;
  } {
    const extraImportsByPipe = new Map<string, Set<string>>();
    const extraBindingsByPipe = new Map<string, Map<string, string>>();
    for (const edge of edges) {
      const fromPipe = pipById.get(edge.fromPipeline);
      const toPipe = pipById.get(edge.toPipeline);
      if (!fromPipe || !toPipe) {
        throw new Error(
          `ProjectCompiler: cross edge references unknown pipeline(s) ${edge.fromPipeline}→${edge.toPipeline}`,
        );
      }
      const fromNode = fromPipe.pipeline.nodes.find((n) => n.id === edge.fromNode);
      if (!fromNode) {
        throw new Error(
          `ProjectCompiler: cross edge source node "${edge.fromNode}" missing`,
        );
      }
      const fromDef = this.registry.getOrThrow(fromNode.blockId);
      const fromEmit = pipelineEmitOf(fromDef);
      const rawBinding = fromEmit.outputBindings[edge.fromPort];
      if (!rawBinding) {
        throw new Error(
          `ProjectCompiler: cross edge source port "${edge.fromPort}" has no binding on ${fromDef.id}`,
        );
      }
      const srcVar = nodeScoped(edge.fromNode, rawBinding);
      const srcModule = pathToModule(fromPipe.targetPath);
      const imports = extraImportsByPipe.get(edge.toPipeline) ?? new Set<string>();
      imports.add(`from ${srcModule} import ${srcVar}`);
      extraImportsByPipe.set(edge.toPipeline, imports);
      const bindings = extraBindingsByPipe.get(edge.toPipeline) ?? new Map<string, string>();
      bindings.set(`${edge.toNode}:${edge.toPort}`, srcVar);
      extraBindingsByPipe.set(edge.toPipeline, bindings);
    }
    return { extraImportsByPipe, extraBindingsByPipe };
  }

  /**
   * Raw pipeline compilation: produces the distinct import / setup / body /
   * teardown lists + pipDeps. Used by the scaffold path so each piece can be
   * inserted into a file template region. The legacy path serializes them
   * into a full file string via compilePipeline().
   */
  private compilePipelineRaw(
    pipeline: Pipeline,
    extraImports?: Set<string>,
    extraBindings?: Map<string, string>,
  ): {
    imports: Set<string>;
    pipDeps: Set<string>;
    setup: string[];
    bodies: string[];
    teardown: string[];
  } {
    const order = topoOrder(pipeline);
    const nodeById = new Map(pipeline.nodes.map((n) => [n.id, n]));
    const defById = new Map<string, BlockDefinition>();
    for (const n of pipeline.nodes) {
      defById.set(n.id, this.registry.getOrThrow(n.blockId));
    }

    const bindings = new Map<string, string>();
    for (const conn of pipeline.connections) {
      const fromDef = defById.get(conn.from);
      if (!fromDef) continue;
      const srcVar = pipelineEmitOf(fromDef).outputBindings[conn.fromPort];
      if (!srcVar) continue;
      bindings.set(`${conn.to}:${conn.toPort}`, nodeScoped(conn.from, srcVar));
    }
    if (extraBindings) {
      for (const [k, v] of extraBindings) bindings.set(k, v);
    }

    const imports = new Set<string>(extraImports ?? []);
    const pipDeps = new Set<string>();
    const setup: string[] = [];
    const bodies: string[] = [];
    const teardown: string[] = [];

    for (const nodeId of order) {
      const node = nodeById.get(nodeId)!;
      const def = defById.get(nodeId)!;
      const emit = pipelineEmitOf(def);
      for (const imp of emit.imports) imports.add(imp);
      for (const d of emit.pipDeps ?? []) pipDeps.add(d);
      const rendered = renderBlock(nodeId, def, emit, node.params ?? {}, bindings);
      if (emit.setup) setup.push(emit.setup);
      bodies.push(`# ${def.id} (${nodeId})\n${rendered}`);
      if (emit.teardown) teardown.unshift(emit.teardown);
    }

    return { imports, pipDeps, setup, bodies, teardown };
  }

  /**
   * Compile one pipeline to a Python source string. Identical to the legacy
   * Compiler.compile() algorithm, extended with optional extra imports and
   * extra bindings supplied by the layout-level cross-edge resolver.
   */
  private compilePipeline(
    pipeline: Pipeline,
    extraImports?: Set<string>,
    extraBindings?: Map<string, string>,
  ): CompiledPipeline {
    const order = topoOrder(pipeline);
    const nodeById = new Map(pipeline.nodes.map((n) => [n.id, n]));
    const defById = new Map<string, BlockDefinition>();
    for (const n of pipeline.nodes) {
      defById.set(n.id, this.registry.getOrThrow(n.blockId));
    }

    const bindings = new Map<string, string>();
    for (const conn of pipeline.connections) {
      const fromDef = defById.get(conn.from);
      if (!fromDef) continue;
      const fromEmit = pipelineEmitOf(fromDef);
      const srcVar = fromEmit.outputBindings[conn.fromPort];
      if (!srcVar) continue;
      bindings.set(`${conn.to}:${conn.toPort}`, nodeScoped(conn.from, srcVar));
    }
    if (extraBindings) {
      for (const [k, v] of extraBindings) bindings.set(k, v);
    }

    const imports = new Set<string>();
    if (extraImports) {
      for (const line of extraImports) imports.add(line);
    }
    const pipDeps = new Set<string>();
    const setups: string[] = [];
    const bodies: string[] = [];
    const teardowns: string[] = [];

    for (const nodeId of order) {
      const node = nodeById.get(nodeId)!;
      const def = defById.get(nodeId)!;
      const emit = pipelineEmitOf(def);
      for (const imp of emit.imports) imports.add(imp);
      for (const dep of emit.pipDeps ?? []) pipDeps.add(dep);

      const rendered = renderBlock(nodeId, def, emit, node.params ?? {}, bindings);
      if (emit.setup) setups.push(emit.setup);
      bodies.push(`# ${def.id} (${nodeId})\n${rendered}`);
      if (emit.teardown) {
        teardowns.unshift(emit.teardown);
      }
    }

    const pythonSource = [
      "# Auto-generated by @ai-blocks/assembler",
      [...imports].sort().join("\n"),
      "",
      setups.join("\n\n"),
      setups.length ? "" : null,
      bodies.join("\n\n"),
      "",
      teardowns.join("\n\n"),
    ]
      .filter((x) => x !== null)
      .join("\n");

    return { pythonSource, requirements: [...pipDeps].sort() };
  }
}

// ---------------------------------------------------------------------------

function nodeScoped(nodeId: string, varName: string): string {
  return `${varName}_${nodeId}`;
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pyLiteral(v: unknown): string {
  if (v === null || v === undefined) return "None";
  if (typeof v === "boolean") return v ? "True" : "False";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "float('nan')";
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(pyLiteral).join(", ")}]`;
  if (typeof v === "object") {
    const entries = Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${JSON.stringify(k)}: ${pyLiteral(val)}`)
      .join(", ");
    return `{${entries}}`;
  }
  return "None";
}

function renderBlock(
  nodeId: string,
  def: BlockDefinition,
  emit: PipelineEmit,
  params: Record<string, unknown>,
  bindings: Map<string, string>,
): string {
  let body = emit.body;

  for (const inp of def.inputs) {
    const bound = bindings.get(`${nodeId}:${inp.id}`);
    if (bound) {
      body = body.replace(new RegExp(`\\{in:${escape(inp.id)}\\}`, "g"), bound);
    }
  }

  for (const p of def.parameters) {
    const value = params[p.id] ?? p.default;
    body = body.replace(
      new RegExp(`\\{param:${escape(p.id)}\\}`, "g"),
      pyLiteral(value),
    );
  }

  for (const out of def.outputs) {
    const raw = emit.outputBindings[out.id];
    if (!raw) continue;
    body = body.replace(
      new RegExp(`\\{out:${escape(out.id)}\\}`, "g"),
      nodeScoped(nodeId, raw),
    );
  }

  return body;
}

function pipelineEmitOf(def: BlockDefinition): PipelineEmit {
  if (def.emits && def.emits.kind === "pipeline") {
    return def.emits;
  }
  throw new Error(
    `block ${def.id} is not a pipeline-kind block (kind=${def.kind ?? "undefined"})`,
  );
}

function scaffoldConventionsOf(def: BlockDefinition): ScaffoldConventions | null {
  if (def.emits && def.emits.kind === "scaffold") {
    return (def.emits as ScaffoldEmit).conventions ?? null;
  }
  return null;
}

/**
 * Convert a file path to a Python module path for `from … import` statements.
 * `pipeline.py` → `pipeline`; `src/ml/train.py` → `src.ml.train`.
 */
function pathToModule(path: string): string {
  const noExt = path.replace(/\.py$/, "");
  return noExt.replace(/\//g, ".").replace(/^\.+/, "");
}

/**
 * Layout-level topo sort over cross-pipeline edges. Each pipeline is a
 * super-node; an edge from pipeline A → pipeline B means A must be emitted
 * before B so B's imports resolve. Missing cross-edges means an arbitrary
 * stable order (pipelines as declared).
 */
function topoPipelines(layout: BlockLayout): string[] {
  const adj = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  const order: string[] = [];
  for (const lp of layout.pipelines) {
    adj.set(lp.id, []);
    indeg.set(lp.id, 0);
  }
  for (const edge of layout.crossEdges) {
    if (!adj.has(edge.fromPipeline) || !adj.has(edge.toPipeline)) {
      throw new Error(
        `ProjectCompiler: cross edge references unknown pipeline(s) ${edge.fromPipeline}→${edge.toPipeline}`,
      );
    }
    if (edge.fromPipeline === edge.toPipeline) continue;
    adj.get(edge.fromPipeline)!.push(edge.toPipeline);
    indeg.set(edge.toPipeline, (indeg.get(edge.toPipeline) ?? 0) + 1);
  }
  const queue: string[] = [];
  for (const lp of layout.pipelines) {
    if ((indeg.get(lp.id) ?? 0) === 0) queue.push(lp.id);
  }
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    for (const v of adj.get(u) ?? []) {
      indeg.set(v, indeg.get(v)! - 1);
      if (indeg.get(v) === 0) queue.push(v);
    }
  }
  if (order.length !== layout.pipelines.length) {
    throw new Error(
      `ProjectCompiler: cross-pipeline cycle detected — Python cannot circular-import`,
    );
  }
  return order;
}

/** Used by the validator to expose cross-edge targets that are pre-satisfied. */
export function crossEdgeTargets(
  edges: CrossPipelineConnection[],
): Map<string, Set<string>> {
  const byPipe = new Map<string, Set<string>>();
  for (const e of edges) {
    const set = byPipe.get(e.toPipeline) ?? new Set<string>();
    set.add(`${e.toNode}:${e.toPort}`);
    byPipe.set(e.toPipeline, set);
  }
  return byPipe;
}
