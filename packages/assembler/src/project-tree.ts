import {
  BlockDefinition,
  FileContribution,
  FileEmit,
  FileTemplate,
  FragmentEmit,
  Language,
  PathResolver,
  ScaffoldConventions,
  ScaffoldEmit,
} from "@ai-blocks/block-schemas";

/**
 * Phase 2 in-memory project model. A `ProjectTree` is a mutable workspace
 * that scaffold, file, fragment, and pipeline blocks contribute into. The
 * compiler seeds it from a scaffold, applies each instance in a deterministic
 * apply order, and finally renders each file by substituting region anchors.
 *
 * Regions are collected as ordered fragment lists so two blocks that target
 * the same region concatenate rather than overwrite each other. Imports are
 * deduped via Set. Deps are unioned across contributions.
 */

export interface ProjectTreeDeps {
  pip: Set<string>;
  npm: Set<string>;
  system: Set<string>;
  dockerBase?: string;
}

export interface ProjectFile {
  path: string;
  language: Language;
  /** Raw template with `{{region:name}}` anchors, or a static body for file-kind. */
  template: string;
  /** Region name → ordered contributions. */
  regions: Map<string, string[]>;
  /** Ordered region-name insertion order. Used to render synthetic files deterministically. */
  regionOrder: string[];
  /** Deduped import statements injected into the `imports` region. */
  imports: Set<string>;
  deps: ProjectTreeDeps;
  /**
   * True when a file was materialized by a `FileEmit` (whole-file replacement)
   * rather than a scaffold template. Fragment/pipeline contributions into a
   * whole-file replacement are ignored and logged.
   */
  whole: boolean;
  /**
   * True when a file has no scaffold-provided template — it was created
   * on-demand by a fragment contribution. Rendered by concatenating imports
   * and regions in insertion order.
   */
  synthetic: boolean;
}

export interface ProjectTree {
  files: Map<string, ProjectFile>;
  stack: { blockId: string; params: Record<string, unknown> } | null;
  deps: ProjectTreeDeps;
  /** Compiler notes for the caller (overwrites, skipped contributions, etc). */
  notes: string[];
}

export function emptyDeps(): ProjectTreeDeps {
  return { pip: new Set(), npm: new Set(), system: new Set() };
}

export function emptyTree(): ProjectTree {
  return { files: new Map(), stack: null, deps: emptyDeps(), notes: [] };
}

export function seedFromScaffold(
  tree: ProjectTree,
  block: BlockDefinition,
  params: Record<string, unknown>,
): void {
  if (block.kind !== "scaffold" || !block.emits || block.emits.kind !== "scaffold") {
    throw new Error(
      `seedFromScaffold: block ${block.id} is not a scaffold (kind=${block.kind ?? "undefined"})`,
    );
  }
  const emit = block.emits as ScaffoldEmit;
  tree.stack = { blockId: block.id, params };
  mergeDeps(tree.deps, emit.deps);
  for (const fileTpl of emit.files) {
    tree.files.set(fileTpl.path, fileFromTemplate(fileTpl));
  }
}

function fileFromTemplate(tpl: FileTemplate): ProjectFile {
  const { regions, order } = extractRegions(tpl.body);
  const file: ProjectFile = {
    path: tpl.path,
    language: tpl.language,
    template: tpl.body,
    regions,
    regionOrder: order,
    imports: new Set(),
    deps: emptyDeps(),
    whole: false,
    synthetic: false,
  };
  if (tpl.deps) mergeDeps(file.deps, tpl.deps);
  return file;
}

/** Identify every `{{region:<name>}}` anchor in a template body. */
function extractRegions(body: string): { regions: Map<string, string[]>; order: string[] } {
  const regions = new Map<string, string[]>();
  const order: string[] = [];
  const re = /\{\{region:([a-zA-Z0-9_-]+)\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    if (!regions.has(m[1])) {
      regions.set(m[1], []);
      order.push(m[1]);
    }
  }
  return { regions, order };
}

export function applyFileBlock(
  tree: ProjectTree,
  block: BlockDefinition,
  params: Record<string, unknown>,
): void {
  if (block.kind !== "file" || !block.emits || block.emits.kind !== "file") {
    throw new Error(
      `applyFileBlock: block ${block.id} is not a file block (kind=${block.kind ?? "undefined"})`,
    );
  }
  const emit = block.emits as FileEmit;
  const existing = tree.files.get(emit.path);
  if (existing) {
    tree.notes.push(
      `overwrite: ${emit.path} (${existing.whole ? "previous whole-file" : "scaffold template"} replaced by ${block.id})`,
    );
  }
  const content = substituteParams(emit.content, params, block);
  const file: ProjectFile = {
    path: emit.path,
    language: emit.language,
    template: content,
    regions: new Map(),
    regionOrder: [],
    imports: new Set(),
    deps: emptyDeps(),
    whole: true,
    synthetic: false,
  };
  if (emit.deps) mergeDeps(file.deps, emit.deps);
  tree.files.set(emit.path, file);
  if (emit.deps) mergeDeps(tree.deps, emit.deps);
}

/**
 * Apply a fragment block: resolve each contribution's path, create a synthetic
 * file if none exists, register the region, and append the (param-substituted)
 * content + imports. Whole-file replacements reject fragment contributions
 * with a note rather than silently dropping them.
 */
export function applyFragmentBlock(
  tree: ProjectTree,
  block: BlockDefinition,
  params: Record<string, unknown>,
  conventions: ScaffoldConventions | null,
): void {
  if (block.kind !== "fragment" || !block.emits || block.emits.kind !== "fragment") {
    throw new Error(
      `applyFragmentBlock: block ${block.id} is not a fragment block (kind=${block.kind ?? "undefined"})`,
    );
  }
  const emit = block.emits as FragmentEmit;
  const merged = mergeParamDefaults(block, params);
  for (const contribution of emit.contributions) {
    applyContribution(tree, block, contribution, merged, conventions);
  }
}

/**
 * Returns an effective params map that falls back to each parameter's default
 * for any key not explicitly supplied. Path-resolver substitution uses this
 * directly; content substitution still consults defaults in substituteParams,
 * but centralizing here keeps path + validator behavior aligned.
 */
export function mergeParamDefaults(
  block: BlockDefinition,
  params: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const p of block.parameters) {
    if ("default" in p) out[p.id] = p.default;
  }
  return { ...out, ...params };
}

function applyContribution(
  tree: ProjectTree,
  block: BlockDefinition,
  contribution: FileContribution,
  params: Record<string, unknown>,
  conventions: ScaffoldConventions | null,
): void {
  const resolved = resolveContributionPath(
    contribution.path,
    params,
    conventions,
  );
  if (resolved === null) {
    tree.notes.push(
      `drop: fragment ${block.id} path unresolved (${describePath(contribution.path)})`,
    );
    return;
  }
  let file = tree.files.get(resolved);
  if (!file) {
    file = synthesizeFile(resolved);
    tree.files.set(resolved, file);
  }
  if (file.whole) {
    tree.notes.push(
      `drop: fragment ${block.id} cannot contribute to whole-file "${resolved}"`,
    );
    return;
  }
  if (!file.regions.has(contribution.region)) {
    if (file.synthetic) {
      file.regions.set(contribution.region, []);
      file.regionOrder.push(contribution.region);
    } else {
      tree.notes.push(
        `drop: region "${contribution.region}" not declared in "${resolved}" for fragment ${block.id}`,
      );
      return;
    }
  }
  const content = substituteParams(contribution.content, params, block);
  file.regions.get(contribution.region)!.push(content);
  for (const rawImport of contribution.imports ?? []) {
    file.imports.add(substituteParams(rawImport, params, block));
  }
  if (contribution.deps) {
    mergeDeps(file.deps, contribution.deps);
    mergeDeps(tree.deps, contribution.deps);
  }
}

function synthesizeFile(path: string): ProjectFile {
  return {
    path,
    language: inferLanguage(path),
    template: "",
    regions: new Map(),
    regionOrder: [],
    imports: new Set(),
    deps: emptyDeps(),
    whole: false,
    synthetic: true,
  };
}

function inferLanguage(path: string): Language {
  if (path.endsWith(".py")) return "python";
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".tsx")) return "tsx";
  if (path.endsWith(".jsx")) return "jsx";
  if (path.endsWith(".js")) return "javascript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".yaml") || path.endsWith(".yml")) return "yaml";
  if (path.endsWith(".toml")) return "toml";
  if (path.endsWith(".md")) return "markdown";
  if (path.endsWith(".sql")) return "sql";
  if (path.endsWith(".sh")) return "shell";
  return "text";
}

/**
 * Resolve a contribution path. Literal strings pass through param
 * substitution; PathResolver values consult scaffold conventions or block
 * params. Returns null when a resolver can't produce a path.
 */
export function resolveContributionPath(
  path: string | PathResolver,
  params: Record<string, unknown>,
  conventions: ScaffoldConventions | null,
): string | null {
  if (typeof path === "string") {
    return substitutePathParams(path, params);
  }
  if (path.use === "conventions") {
    if (!conventions) return null;
    const base = conventions[path.key];
    if (!base) return null;
    const suffix = path.suffix ? substitutePathParams(path.suffix, params) : "";
    return `${base}${suffix}`;
  }
  if (path.use === "param") {
    const v = params[path.paramId];
    if (typeof v !== "string" || v.length === 0) return null;
    return v;
  }
  return null;
}

function substitutePathParams(
  path: string,
  params: Record<string, unknown>,
): string {
  return path.replace(/\{\{param:([a-zA-Z0-9_-]+)\}\}/g, (_m, key: string) => {
    const v = params[key];
    if (v === undefined || v === null) return "";
    return String(v);
  });
}

function describePath(path: string | PathResolver): string {
  if (typeof path === "string") return path;
  if (path.use === "conventions") {
    return `conventions.${path.key}${path.suffix ?? ""}`;
  }
  return `param.${path.paramId}`;
}

/** Substitute `{{param:<id>}}` occurrences with the instance's param values. */
function substituteParams(
  template: string,
  params: Record<string, unknown>,
  block: BlockDefinition,
): string {
  return template.replace(
    /\{\{param:([a-zA-Z0-9_-]+)\}\}/g,
    (_m, key: string) => {
      if (key in params) return stringify(params[key]);
      const def = block.parameters.find((p) => p.id === key);
      if (def && "default" in def) return stringify(def.default);
      return "";
    },
  );
}

function stringify(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

/**
 * Append to a named region on a file. If the file doesn't exist or isn't
 * template-backed, the contribution is dropped and logged.
 */
export function appendToRegion(
  tree: ProjectTree,
  path: string,
  region: string,
  content: string,
): void {
  const file = tree.files.get(path);
  if (!file) {
    tree.notes.push(`drop: no file at "${path}" for region "${region}"`);
    return;
  }
  if (file.whole) {
    tree.notes.push(
      `drop: file "${path}" is a whole-file emit; cannot append to region "${region}"`,
    );
    return;
  }
  const existing = file.regions.get(region);
  if (!existing) {
    tree.notes.push(
      `drop: region "${region}" not declared in file "${path}"`,
    );
    return;
  }
  existing.push(content);
}

/** Add an import line to a file's import set. Auto-creates an `imports` region if absent. */
export function addImport(tree: ProjectTree, path: string, importLine: string): void {
  const file = tree.files.get(path);
  if (!file) {
    tree.notes.push(`drop: no file at "${path}" for import "${importLine}"`);
    return;
  }
  file.imports.add(importLine);
}

export function mergeDeps(target: ProjectTreeDeps, source: Partial<ProjectTreeDeps>): void {
  if (source.pip) for (const d of source.pip) target.pip.add(d);
  if (source.npm) for (const d of source.npm) target.npm.add(d);
  if (source.system) for (const d of source.system) target.system.add(d);
  if (source.dockerBase && !target.dockerBase) target.dockerBase = source.dockerBase;
}

/**
 * Render a single file. Whole files pass through verbatim. Synthetic files
 * (fragment-created, no template) render as sorted imports + regions in
 * insertion order. Template-backed files substitute regions into the
 * template and strip any unpopulated anchors.
 */
export function renderFile(file: ProjectFile): string {
  if (file.whole) return file.template;

  if (file.synthetic) {
    const chunks: string[] = [];
    if (file.imports.size > 0) {
      chunks.push([...file.imports].sort().join("\n"));
    }
    for (const name of file.regionOrder) {
      const contributions = file.regions.get(name) ?? [];
      if (contributions.length) chunks.push(contributions.join("\n\n"));
    }
    return chunks.join("\n\n") + (chunks.length ? "\n" : "");
  }

  let out = file.template;
  const allRegionNames = new Set<string>([
    ...file.regions.keys(),
    ...(file.imports.size > 0 ? ["imports"] : []),
  ]);
  for (const name of allRegionNames) {
    const contributions = file.regions.get(name) ?? [];
    let block: string;
    if (name === "imports") {
      const imports = [...file.imports].sort();
      block = [...imports, ...contributions].join("\n");
    } else {
      block = contributions.join("\n\n");
    }
    out = out.replace(new RegExp(`\\{\\{region:${escape(name)}\\}\\}`, "g"), block);
  }
  out = out.replace(/\{\{region:[a-zA-Z0-9_-]+\}\}/g, "");
  return out;
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Flatten the tree to a path→content record for the CompiledProject. */
export function flattenTree(tree: ProjectTree): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [path, file] of tree.files) out[path] = renderFile(file);
  return out;
}
