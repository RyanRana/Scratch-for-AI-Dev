import {
  BlockRegistry,
  BlockDefinition,
  FragmentEmit,
  ScaffoldConventions,
  ScaffoldEmit,
  arePortsCompatible,
} from "@ai-blocks/block-schemas";
import { resolveContributionPath, mergeParamDefaults } from "./project-tree.js";
import { distance } from "fastest-levenshtein";
import {
  Pipeline,
  PipelineNode,
  PipelineConnection,
  ValidationErrors,
  hasErrors,
  BlockLayout,
  LayoutPipeline,
  CrossPipelineConnection,
  LayoutValidationErrors,
  hasLayoutErrors,
} from "./types.js";

const FUZZY_MAX_DISTANCE = 2;

export interface ValidationResult {
  ok: boolean;
  errors: ValidationErrors;
  /** IDs the fuzzy gate auto-corrected, so callers can log them. */
  corrections: { nodeId: string; from: string; to: string }[];
  /** The pipeline after fuzzy corrections are applied. */
  pipeline: Pipeline;
}

export interface LayoutValidationResult {
  ok: boolean;
  /** Per-pipeline results, keyed by LayoutPipeline.id. */
  pipelineResults: Record<string, ValidationResult>;
  layoutErrors: LayoutValidationErrors;
  /** Layout with fuzzy-corrected pipelines substituted in. */
  layout: BlockLayout;
}

export class Validator {
  constructor(private registry: BlockRegistry) {}

  validate(pipeline: Pipeline): ValidationResult {
    const errors: ValidationErrors = {
      unknownIds: [],
      portMismatches: [],
      badParams: [],
      cycles: [],
    };
    const corrections: ValidationResult["corrections"] = [];

    // 1 + 2: ID gate + fuzzy recovery
    const correctedNodes: PipelineNode[] = [];
    for (const node of pipeline.nodes) {
      const def = this.registry.get(node.blockId);
      if (def) {
        correctedNodes.push(node);
        continue;
      }
      const fuzzy = this.fuzzyMatch(node.blockId);
      if (fuzzy) {
        corrections.push({ nodeId: node.id, from: node.blockId, to: fuzzy.id });
        correctedNodes.push({ ...node, blockId: fuzzy.id });
      } else {
        errors.unknownIds.push({
          nodeId: node.id,
          blockId: node.blockId,
          suggestions: this.topSuggestions(node.blockId, 3),
        });
        correctedNodes.push(node);
      }
    }

    const corrected: Pipeline = {
      nodes: correctedNodes,
      connections: pipeline.connections,
    };

    // 3: Port gate — only run on nodes whose block resolved.
    const nodeById = new Map(correctedNodes.map((n) => [n.id, n]));
    for (const conn of pipeline.connections) {
      const err = this.validateConnection(conn, nodeById);
      if (err) errors.portMismatches.push({ connection: conn, reason: err });
    }

    // Param validation
    for (const node of correctedNodes) {
      const def = this.registry.get(node.blockId);
      if (!def || !node.params) continue;
      for (const [key, value] of Object.entries(node.params)) {
        const paramDef = def.parameters.find((p) => p.id === key);
        if (!paramDef) {
          errors.badParams.push({ nodeId: node.id, key, reason: "unknown parameter" });
          continue;
        }
        const reason = this.validateParamValue(paramDef.type, value, paramDef.options);
        if (reason) errors.badParams.push({ nodeId: node.id, key, reason });
      }
    }

    // 4: DAG gate
    const cycles = this.findCycles(corrected);
    if (cycles.length) errors.cycles = cycles;

    return { ok: !hasErrors(errors), errors, corrections, pipeline: corrected };
  }

  /**
   * Phase 1 layout validator. Runs the per-pipeline gates plus layout-level
   * checks: unique target paths, cross-edge endpoint resolution, cross-edge
   * port compatibility, and no cross-pipeline cycles.
   */
  validateLayout(layout: BlockLayout): LayoutValidationResult {
    const layoutErrors: LayoutValidationErrors = {
      duplicateTargetPaths: [],
      unresolvedCrossEdges: [],
      crossEdgePortMismatches: [],
      crossPipelineCycles: [],
      fileConflicts: [],
      missingTargetRegions: [],
      unknownStack: [],
      unknownInstanceBlocks: [],
      unresolvableFragments: [],
    };

    // Stack resolution.
    let stackBlock: BlockDefinition | null = null;
    if (layout.stack) {
      const def = this.registry.get(layout.stack.blockId);
      if (!def || def.kind !== "scaffold" || !def.emits || def.emits.kind !== "scaffold") {
        layoutErrors.unknownStack.push(layout.stack.blockId);
      } else {
        stackBlock = def;
      }
    }

    // Instance block resolution + file-conflict gate.
    const filePathOwners = new Map<string, string[]>();
    if (stackBlock && stackBlock.emits && stackBlock.emits.kind === "scaffold") {
      for (const ft of stackBlock.emits.files) {
        filePathOwners.set(ft.path, [stackBlock.id]);
      }
    }
    for (const inst of layout.instances) {
      const def = this.registry.get(inst.blockId);
      if (!def) {
        layoutErrors.unknownInstanceBlocks.push({
          instanceId: inst.id,
          blockId: inst.blockId,
        });
        continue;
      }
      if (def.kind === "file" && def.emits && def.emits.kind === "file") {
        const owners = filePathOwners.get(def.emits.path) ?? [];
        owners.push(def.id);
        filePathOwners.set(def.emits.path, owners);
      }
    }
    for (const [path, owners] of filePathOwners) {
      if (owners.length > 1) {
        layoutErrors.fileConflicts.push({
          path,
          winnerBlockId: owners[owners.length - 1],
          overwrittenCount: owners.length - 1,
        });
      }
    }

    // Region gate: pipelines contributing into a scaffold file must target
    // a region that exists on that file's template.
    const regionsByPath = new Map<string, Set<string>>();
    if (stackBlock && stackBlock.emits && stackBlock.emits.kind === "scaffold") {
      for (const ft of stackBlock.emits.files) {
        regionsByPath.set(ft.path, extractRegionAnchors(ft.body));
      }
      for (const lp of layout.pipelines) {
        const region = lp.targetRegion ?? "body";
        const regions = regionsByPath.get(lp.targetPath);
        // If the path isn't a scaffold-seeded file, skip the check (pipeline
        // may be writing into a non-template file; compileLegacy handles it).
        if (!regions) continue;
        if (!regions.has(region)) {
          layoutErrors.missingTargetRegions.push({
            pipelineId: lp.id,
            path: lp.targetPath,
            region,
          });
        }
      }
    }

    // Fragment gate: each contribution must resolve to a path, and when that
    // path names a scaffold-backed file the region must exist on its
    // template. Synthetic (fragment-created) paths are allowed — they auto-
    // declare their regions when the first contribution lands.
    const conventions: ScaffoldConventions | null =
      stackBlock && stackBlock.emits && stackBlock.emits.kind === "scaffold"
        ? (stackBlock.emits as ScaffoldEmit).conventions ?? null
        : null;
    for (const inst of layout.instances) {
      const def = this.registry.get(inst.blockId);
      if (!def) continue; // already reported via unknownInstanceBlocks
      if (def.kind !== "fragment" || !def.emits || def.emits.kind !== "fragment") {
        continue;
      }
      const emit = def.emits as FragmentEmit;
      const merged = mergeParamDefaults(def, inst.params ?? {});
      for (const contribution of emit.contributions) {
        const resolved = resolveContributionPath(
          contribution.path,
          merged,
          conventions,
        );
        if (resolved === null) {
          layoutErrors.unresolvableFragments.push({
            instanceId: inst.id,
            blockId: inst.blockId,
            reason: `unresolved contribution path (${describeContributionPath(contribution.path)})`,
          });
          continue;
        }
        const regions = regionsByPath.get(resolved);
        if (regions && !regions.has(contribution.region)) {
          layoutErrors.unresolvableFragments.push({
            instanceId: inst.id,
            blockId: inst.blockId,
            reason: `region "${contribution.region}" not declared on scaffold file "${resolved}"`,
          });
        }
      }
    }

    // Duplicate target paths.
    const seenPaths = new Map<string, string>(); // path -> first pipeline.id that claimed it
    for (const lp of layout.pipelines) {
      const prev = seenPaths.get(lp.targetPath);
      if (prev) {
        layoutErrors.duplicateTargetPaths.push(lp.targetPath);
      } else {
        seenPaths.set(lp.targetPath, lp.id);
      }
    }

    // Per-pipeline validation (fuzzy-correct each pipeline).
    const pipelineResults: Record<string, ValidationResult> = {};
    const correctedPipelines: LayoutPipeline[] = [];
    for (const lp of layout.pipelines) {
      const res = this.validate(lp.pipeline);
      pipelineResults[lp.id] = res;
      correctedPipelines.push({ ...lp, pipeline: res.pipeline });
    }
    const correctedLayout: BlockLayout = { ...layout, pipelines: correctedPipelines };
    const pipById = new Map(correctedPipelines.map((lp) => [lp.id, lp]));

    // Cross-edge resolution + port compatibility.
    for (const edge of layout.crossEdges) {
      const reason = this.resolveCrossEdge(edge, pipById);
      if (reason === null) continue;
      if (reason.kind === "unresolved") {
        layoutErrors.unresolvedCrossEdges.push({ edge, reason: reason.message });
      } else {
        layoutErrors.crossEdgePortMismatches.push({ edge, reason: reason.message });
      }
    }

    // Cross-pipeline cycle detection.
    const cycles = this.findCrossPipelineCycles(correctedLayout);
    if (cycles.length) layoutErrors.crossPipelineCycles = cycles;

    const perPipelineOk = Object.values(pipelineResults).every((r) => r.ok);
    const ok = perPipelineOk && !hasLayoutErrors(layoutErrors);
    return { ok, pipelineResults, layoutErrors, layout: correctedLayout };
  }

  private resolveCrossEdge(
    edge: CrossPipelineConnection,
    pipById: Map<string, LayoutPipeline>,
  ): { kind: "unresolved" | "port-mismatch"; message: string } | null {
    const fromPipe = pipById.get(edge.fromPipeline);
    const toPipe = pipById.get(edge.toPipeline);
    if (!fromPipe) {
      return { kind: "unresolved", message: `unknown fromPipeline "${edge.fromPipeline}"` };
    }
    if (!toPipe) {
      return { kind: "unresolved", message: `unknown toPipeline "${edge.toPipeline}"` };
    }
    const fromNode = fromPipe.pipeline.nodes.find((n) => n.id === edge.fromNode);
    const toNode = toPipe.pipeline.nodes.find((n) => n.id === edge.toNode);
    if (!fromNode) {
      return { kind: "unresolved", message: `node "${edge.fromNode}" not in pipeline "${edge.fromPipeline}"` };
    }
    if (!toNode) {
      return { kind: "unresolved", message: `node "${edge.toNode}" not in pipeline "${edge.toPipeline}"` };
    }
    const fromDef = this.registry.get(fromNode.blockId);
    const toDef = this.registry.get(toNode.blockId);
    if (!fromDef || !toDef) return null; // per-pipeline ID gate will surface this
    const outPort = fromDef.outputs.find((p) => p.id === edge.fromPort);
    const inPort = toDef.inputs.find((p) => p.id === edge.toPort);
    if (!outPort) {
      return { kind: "unresolved", message: `port "${edge.fromPort}" not on ${fromDef.id}` };
    }
    if (!inPort) {
      return { kind: "unresolved", message: `port "${edge.toPort}" not on ${toDef.id}` };
    }
    if (!arePortsCompatible(outPort.type, inPort.type)) {
      return {
        kind: "port-mismatch",
        message: `type mismatch: ${outPort.type} → ${inPort.type}`,
      };
    }
    return null;
  }

  private findCrossPipelineCycles(layout: BlockLayout): string[][] {
    const adj = new Map<string, string[]>();
    const indeg = new Map<string, number>();
    for (const lp of layout.pipelines) {
      adj.set(lp.id, []);
      indeg.set(lp.id, 0);
    }
    for (const edge of layout.crossEdges) {
      if (!adj.has(edge.fromPipeline) || !adj.has(edge.toPipeline)) continue;
      if (edge.fromPipeline === edge.toPipeline) continue;
      adj.get(edge.fromPipeline)!.push(edge.toPipeline);
      indeg.set(edge.toPipeline, (indeg.get(edge.toPipeline) ?? 0) + 1);
    }
    const queue: string[] = [];
    for (const [id, d] of indeg) if (d === 0) queue.push(id);
    let visited = 0;
    while (queue.length) {
      const u = queue.shift()!;
      visited++;
      for (const v of adj.get(u) ?? []) {
        indeg.set(v, indeg.get(v)! - 1);
        if (indeg.get(v) === 0) queue.push(v);
      }
    }
    if (visited === layout.pipelines.length) return [];
    const remaining = [...indeg.entries()].filter(([, d]) => d > 0).map(([id]) => id);
    return remaining.length ? [remaining] : [];
  }

  private validateConnection(
    conn: PipelineConnection,
    nodeById: Map<string, PipelineNode>,
  ): string | null {
    const fromNode = nodeById.get(conn.from);
    const toNode = nodeById.get(conn.to);
    if (!fromNode) return `from node "${conn.from}" not in pipeline`;
    if (!toNode) return `to node "${conn.to}" not in pipeline`;
    const fromDef = this.registry.get(fromNode.blockId);
    const toDef = this.registry.get(toNode.blockId);
    if (!fromDef || !toDef) return null; // ID gate will surface this
    const outPort = fromDef.outputs.find((p) => p.id === conn.fromPort);
    const inPort = toDef.inputs.find((p) => p.id === conn.toPort);
    if (!outPort) return `port "${conn.fromPort}" not on block ${fromDef.id}`;
    if (!inPort) return `port "${conn.toPort}" not on block ${toDef.id}`;
    if (!arePortsCompatible(outPort.type, inPort.type)) {
      return `type mismatch: ${outPort.type} → ${inPort.type}`;
    }
    return null;
  }

  private validateParamValue(
    type: string,
    value: unknown,
    options?: { label: string; value: unknown }[],
  ): string | null {
    switch (type) {
      case "number":
        return typeof value === "number" ? null : "expected number";
      case "string":
      case "code":
        return typeof value === "string" ? null : "expected string";
      case "boolean":
        return typeof value === "boolean" ? null : "expected boolean";
      case "select":
        if (!options) return null;
        return options.some((o) => o.value === value)
          ? null
          : `not in allowed set: ${options.map((o) => o.value).join(", ")}`;
      case "multiselect":
        if (!Array.isArray(value)) return "expected array";
        return null;
      case "json":
      case "file":
        return null;
      default:
        return null;
    }
  }

  private fuzzyMatch(blockId: string): BlockDefinition | null {
    // Match on name+category via provided blockId heuristic.
    // Split on '.' — category hint is everything before the dot.
    const [catHint] = blockId.includes(".") ? blockId.split(".") : [null];
    const all = this.registry.getAll();
    let best: { block: BlockDefinition; dist: number } | null = null;
    for (const block of all) {
      if (catHint && block.category !== catHint) continue;
      const d = distance(blockId, block.id);
      if (d <= FUZZY_MAX_DISTANCE && (!best || d < best.dist)) {
        best = { block, dist: d };
      }
    }
    return best?.block ?? null;
  }

  private topSuggestions(blockId: string, n: number): string[] {
    const all = this.registry.getAll();
    return all
      .map((b) => ({ id: b.id, dist: distance(blockId, b.id) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, n)
      .map((x) => x.id);
  }

  private findCycles(p: Pipeline): string[][] {
    const adj = new Map<string, string[]>();
    const indeg = new Map<string, number>();
    for (const n of p.nodes) {
      adj.set(n.id, []);
      indeg.set(n.id, 0);
    }
    for (const c of p.connections) {
      if (!adj.has(c.from) || !adj.has(c.to)) continue;
      adj.get(c.from)!.push(c.to);
      indeg.set(c.to, (indeg.get(c.to) ?? 0) + 1);
    }
    const queue: string[] = [];
    for (const [id, d] of indeg) if (d === 0) queue.push(id);
    let visited = 0;
    while (queue.length) {
      const u = queue.shift()!;
      visited++;
      for (const v of adj.get(u) ?? []) {
        indeg.set(v, indeg.get(v)! - 1);
        if (indeg.get(v) === 0) queue.push(v);
      }
    }
    if (visited === p.nodes.length) return [];
    // Return the node ids still in the cycle(s) as a single group.
    const remaining = [...indeg.entries()].filter(([, d]) => d > 0).map(([id]) => id);
    return remaining.length ? [remaining] : [];
  }
}

/** Human-readable label for a FileContribution path — matches project-tree.ts. */
function describeContributionPath(
  path: import("@ai-blocks/block-schemas").FileContribution["path"],
): string {
  if (typeof path === "string") return path;
  if (path.use === "conventions") {
    return `conventions.${path.key}${path.suffix ?? ""}`;
  }
  return `param.${path.paramId}`;
}

/** Extract all `{{region:name}}` anchors declared in a file template body. */
function extractRegionAnchors(body: string): Set<string> {
  const out = new Set<string>();
  const re = /\{\{region:([a-zA-Z0-9_-]+)\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) out.add(m[1]);
  return out;
}

/** Kahn topo order over a pipeline. Assumes validation has passed. */
export function topoOrder(p: Pipeline): string[] {
  const adj = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  for (const n of p.nodes) {
    adj.set(n.id, []);
    indeg.set(n.id, 0);
  }
  for (const c of p.connections) {
    adj.get(c.from)?.push(c.to);
    indeg.set(c.to, (indeg.get(c.to) ?? 0) + 1);
  }
  const queue: string[] = [];
  for (const [id, d] of indeg) if (d === 0) queue.push(id);
  const order: string[] = [];
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    for (const v of adj.get(u) ?? []) {
      indeg.set(v, indeg.get(v)! - 1);
      if (indeg.get(v) === 0) queue.push(v);
    }
  }
  return order;
}
