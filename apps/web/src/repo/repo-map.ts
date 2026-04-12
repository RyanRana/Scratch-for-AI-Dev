// ============================================================================
// Repo Mind Map
// Walk an uploaded directory, parse cross-file imports, and build a synthetic
// Graph whose nodes are files and whose edges are import relationships.
// Supports Python (`from x import y`) plus JS/TS (`import x from "./y"`).
// ============================================================================

import type { Graph, GraphNode, GraphEdge } from "@ai-blocks/core";

export const REPO_FILE_BLOCK_ID = "meta.repo-file";
export const REPO_FOLDER_BLOCK_ID = "meta.repo-folder";

/** Coarse file type — controls how imports are parsed and whether drill-in works. */
export type RepoFileKind = "python" | "js" | "other";

export interface RepoFile {
  /** Repo-relative POSIX path (e.g. "src/api/routes.py"). */
  path: string;
  content: string;
  kind: RepoFileKind;
}

export interface RepoMap {
  /** Repo-relative path → raw source. */
  files: Record<string, string>;
  /** Repo-relative path → file kind. */
  kinds: Record<string, RepoFileKind>;
  /** The currently-visible folder view (starts at the repo root, `""`). */
  graph: Graph;
  /** GraphNode.id → repo-relative file path (visible files only). */
  nodeIdByPath: Record<string, string>;
  pathByNodeId: Record<string, string>;
  /** GraphNode.id → folder path for folder-kind nodes (used for drill-in). */
  folderPathByNodeId: Record<string, string>;
  /** Directory currently rendered in `graph` — `""` means repo root. */
  currentDir: string;
}

/** Skip binary / VCS / lockfile cruft so the mind map stays signal-heavy. */
const SKIP_DIR_SEGMENTS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  ".cache",
  "__pycache__",
  ".venv",
  "venv",
  ".mypy_cache",
  ".pytest_cache",
  ".idea",
  ".vscode",
]);

const SKIP_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".bmp",
  ".mp3", ".mp4", ".mov", ".wav", ".ogg",
  ".zip", ".tar", ".gz", ".bz2", ".7z", ".rar",
  ".pdf", ".psd", ".ai",
  ".woff", ".woff2", ".ttf", ".otf", ".eot",
  ".pyc", ".pyo", ".so", ".dylib", ".dll", ".exe",
  ".lock",
]);

export function classifyRepoPath(path: string): RepoFileKind {
  return classify(path);
}

function classify(path: string): RepoFileKind {
  const lower = path.toLowerCase();
  if (lower.endsWith(".py")) return "python";
  if (
    lower.endsWith(".ts") ||
    lower.endsWith(".tsx") ||
    lower.endsWith(".js") ||
    lower.endsWith(".jsx") ||
    lower.endsWith(".mjs") ||
    lower.endsWith(".cjs")
  ) {
    return "js";
  }
  return "other";
}

export function shouldSkipRepoPath(path: string): boolean {
  return shouldSkip(path);
}

function shouldSkip(webkitPath: string): boolean {
  const parts = webkitPath.split("/");
  for (const seg of parts) {
    if (SKIP_DIR_SEGMENTS.has(seg)) return true;
  }
  const last = parts[parts.length - 1] ?? "";
  const dot = last.lastIndexOf(".");
  if (dot >= 0) {
    const ext = last.slice(dot).toLowerCase();
    if (SKIP_EXTENSIONS.has(ext)) return true;
  }
  return false;
}

/**
 * Read a browser-native FileList (from a `<input webkitdirectory>` picker)
 * into an array of {path, content, kind}. Skips binary assets and common
 * cruft directories. Paths are rewritten relative to the top-level directory
 * so the first segment (e.g. "ai-blocks-main/") doesn't pollute the mind map.
 */
export async function readRepoFiles(fileList: FileList): Promise<RepoFile[]> {
  const raws: { file: File; webkitPath: string }[] = [];
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const webkitPath =
      (file as unknown as { webkitRelativePath?: string }).webkitRelativePath ||
      file.name;
    if (shouldSkip(webkitPath)) continue;
    raws.push({ file, webkitPath });
  }

  const topLevel = commonTopLevel(raws.map((r) => r.webkitPath));

  const out: RepoFile[] = [];
  for (const { file, webkitPath } of raws) {
    const relPath = topLevel
      ? webkitPath.slice(topLevel.length + 1)
      : webkitPath;
    const kind = classify(relPath);
    // For non-code files, we still want the node to exist — but we skip
    // reading the contents to save memory on large repos.
    let content = "";
    if (kind !== "other") {
      try {
        content = await file.text();
      } catch {
        content = "";
      }
    }
    out.push({ path: relPath, content, kind });
  }
  return out;
}

/** Legacy alias: some callers imported the old .py-only variant. */
export const readPythonFiles = readRepoFiles;

function commonTopLevel(paths: string[]): string | null {
  if (paths.length === 0) return null;
  const first = paths[0].split("/")[0];
  if (!first) return null;
  return paths.every((p) => p.startsWith(`${first}/`)) ? first : null;
}

/**
 * Parse imports out of a Python source. Returns raw module paths as they
 * appeared (dotted names, possibly with leading dots for relative imports).
 */
export function parsePythonImports(source: string): string[] {
  const out: string[] = [];
  const lines = source.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const fromMatch = line.match(/^from\s+([.\w]+)\s+import\s+/);
    if (fromMatch) {
      out.push(fromMatch[1]);
      continue;
    }
    const importMatch = line.match(/^import\s+([.\w]+)(?:\s+as\s+\w+)?\s*$/);
    if (importMatch) out.push(importMatch[1]);
  }
  return out;
}

/**
 * Parse the from-spec of every ES import / re-export in a JS/TS source.
 * Only relative specifiers (`./x`, `../x`) produce intra-repo edges; bare
 * specifiers (`react`, `lodash`) are dropped. Covers: `import x from 'y'`,
 * `import 'y'`, `export … from 'y'`, and bare `require('./x')` calls.
 */
export function parseJsImports(source: string): string[] {
  const out: string[] = [];
  const stripped = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
  const specRe = /(?:import\s+(?:[^'"`]*?from\s+)?|export\s+(?:[^'"`]*?from\s+)|require\s*\(\s*)(['"`])([^'"`]+)\1/g;
  let m: RegExpExecArray | null;
  while ((m = specRe.exec(stripped)) !== null) {
    const spec = m[2];
    if (spec.startsWith(".")) out.push(spec);
  }
  return out;
}

/** @deprecated Use parsePythonImports. Kept for existing unit tests. */
export const parseImports = parsePythonImports;

/**
 * Resolve a Python dotted import to a repo-relative .py path inside the
 * uploaded file set. Returns null for stdlib/pypi imports.
 */
export function resolvePythonImport(
  importPath: string,
  importerPath: string,
  fileSet: Set<string>,
): string | null {
  if (importPath.startsWith(".")) {
    let dotCount = 0;
    while (importPath[dotCount] === ".") dotCount++;
    const tail = importPath.slice(dotCount).replace(/\./g, "/");
    const importerDir = importerPath.split("/").slice(0, -1);
    const upLevels = dotCount - 1;
    if (upLevels > importerDir.length) return null;
    const baseDir = importerDir.slice(0, importerDir.length - upLevels);
    const joined = [...baseDir, tail].filter(Boolean).join("/");
    return firstPythonExisting(joined, fileSet);
  }
  const joined = importPath.replace(/\./g, "/");
  return firstPythonExisting(joined, fileSet);
}

/** Legacy export — kept so prior call-sites still compile. */
export const resolveImport = resolvePythonImport;

function firstPythonExisting(base: string, fileSet: Set<string>): string | null {
  if (fileSet.has(`${base}.py`)) return `${base}.py`;
  if (fileSet.has(`${base}/__init__.py`)) return `${base}/__init__.py`;
  return null;
}

const JS_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const JS_INDEX_NAMES = ["index.ts", "index.tsx", "index.js", "index.jsx"];

/**
 * Resolve a relative JS/TS import specifier (always starts with `.`) to a
 * file in the uploaded set. Tries the exact path first, then common
 * extensions, then index files.
 */
export function resolveJsImport(
  spec: string,
  importerPath: string,
  fileSet: Set<string>,
): string | null {
  if (!spec.startsWith(".")) return null;
  const importerDir = importerPath.split("/").slice(0, -1);
  const joined = [...importerDir, ...spec.split("/")]
    .reduce<string[]>((acc, part) => {
      if (part === "." || part === "") return acc;
      if (part === "..") {
        acc.pop();
        return acc;
      }
      acc.push(part);
      return acc;
    }, [])
    .join("/");

  if (fileSet.has(joined)) return joined;
  for (const ext of JS_EXTENSIONS) {
    if (fileSet.has(`${joined}${ext}`)) return `${joined}${ext}`;
  }
  for (const idx of JS_INDEX_NAMES) {
    const p = joined ? `${joined}/${idx}` : idx;
    if (fileSet.has(p)) return p;
  }
  // Handles "./foo.js" when the actual file is foo.ts (common TS pattern).
  const extMatch = joined.match(/\.(m?js|cjs|jsx)$/);
  if (extMatch) {
    const withoutExt = joined.slice(0, -extMatch[0].length);
    for (const ext of [".ts", ".tsx"]) {
      if (fileSet.has(`${withoutExt}${ext}`)) return `${withoutExt}${ext}`;
    }
  }
  return null;
}

/**
 * Build the synthetic repo-map Graph for a single directory level. Root
 * is `""`; drilling into a subfolder rebuilds with that folder as the new
 * current dir. Only immediate children (subfolders + files) are rendered —
 * deeper contents appear after another click. Labels are always basenames.
 */
export function buildRepoMap(files: RepoFile[], currentDir: string = ""): RepoMap {
  const filesRecord: Record<string, string> = {};
  const kindsRecord: Record<string, RepoFileKind> = {};
  for (const f of files) {
    filesRecord[f.path] = f.content;
    kindsRecord[f.path] = f.kind;
  }
  return buildRepoMapWith(filesRecord, kindsRecord, currentDir);
}

/**
 * Rebuild just the directory-level graph. Reuses already-indexed file
 * contents so navigating folders doesn't re-read every file.
 */
export function rebuildRepoMapForDir(existing: RepoMap, currentDir: string): RepoMap {
  return buildRepoMapWith(existing.files, existing.kinds, currentDir);
}

function buildRepoMapWith(
  filesRecord: Record<string, string>,
  kindsRecord: Record<string, RepoFileKind>,
  currentDir: string,
): RepoMap {
  const fileSet = new Set(Object.keys(filesRecord));
  const prefix = currentDir === "" ? "" : `${currentDir}/`;

  // Find immediate children of currentDir — files directly inside it and
  // subfolders one level deep.
  const immediateFiles: string[] = [];
  const immediateSubdirs = new Set<string>();
  for (const path of fileSet) {
    if (currentDir !== "" && !path.startsWith(prefix)) continue;
    const rest = currentDir === "" ? path : path.slice(prefix.length);
    const slash = rest.indexOf("/");
    if (slash === -1) {
      immediateFiles.push(path);
    } else {
      immediateSubdirs.add(`${prefix}${rest.slice(0, slash)}`);
    }
  }
  immediateFiles.sort((a, b) => a.localeCompare(b));
  const sortedSubdirs = [...immediateSubdirs].sort((a, b) => a.localeCompare(b));

  const nodes: Record<string, GraphNode> = {};
  const edges: Record<string, GraphEdge> = {};
  const nodeIdByPath: Record<string, string> = {};
  const pathByNodeId: Record<string, string> = {};
  const folderPathByNodeId: Record<string, string> = {};

  const items: Array<{ kind: "folder"; path: string } | { kind: "file"; path: string }> = [
    ...sortedSubdirs.map((p) => ({ kind: "folder" as const, path: p })),
    ...immediateFiles.map((p) => ({ kind: "file" as const, path: p })),
  ];

  const cols = Math.max(1, Math.ceil(Math.sqrt(items.length)));
  const NODE_W = 240;
  const NODE_H = 120;
  const GAP_X = 300;
  const GAP_Y = 170;

  items.forEach((item, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = 120 + col * GAP_X;
    const y = 120 + row * GAP_Y;
    const basename = item.path.slice(item.path.lastIndexOf("/") + 1);
    if (item.kind === "folder") {
      const id = `repo-folder-${i}`;
      nodes[id] = {
        id,
        blockId: REPO_FOLDER_BLOCK_ID,
        label: basename,
        parameters: {},
        position: { x, y },
        size: { width: NODE_W, height: NODE_H },
      };
      folderPathByNodeId[id] = item.path;
    } else {
      const id = `repo-file-${i}`;
      nodes[id] = {
        id,
        blockId: REPO_FILE_BLOCK_ID,
        label: basename,
        parameters: {},
        position: { x, y },
        size: { width: NODE_W, height: NODE_H },
      };
      nodeIdByPath[item.path] = id;
      pathByNodeId[id] = item.path;
    }
  });

  // Edges: only between files visible at this level. Nested imports are
  // hidden until you drill in.
  let edgeCounter = 0;
  const addEdge = (fromPath: string, toPath: string) => {
    if (fromPath === toPath) return;
    const src = nodeIdByPath[fromPath];
    const tgt = nodeIdByPath[toPath];
    if (!src || !tgt) return;
    const id = `repo-edge-${edgeCounter++}`;
    edges[id] = {
      id,
      sourceNodeId: src,
      sourcePortId: "exports",
      targetNodeId: tgt,
      targetPortId: "imports",
    };
  };
  for (const path of immediateFiles) {
    const content = filesRecord[path] ?? "";
    const kind = kindsRecord[path];
    if (kind === "python") {
      for (const imp of parsePythonImports(content)) {
        const resolved = resolvePythonImport(imp, path, fileSet);
        if (resolved) addEdge(resolved, path);
      }
    } else if (kind === "js") {
      for (const spec of parseJsImports(content)) {
        const resolved = resolveJsImport(spec, path, fileSet);
        if (resolved) addEdge(resolved, path);
      }
    }
  }

  const graph: Graph = {
    id: "repo-map",
    name: currentDir === "" ? "Repo Mind Map" : currentDir,
    nodes,
    edges,
    version: 1,
  };

  return {
    files: filesRecord,
    kinds: kindsRecord,
    graph,
    nodeIdByPath,
    pathByNodeId,
    folderPathByNodeId,
    currentDir,
  };
}
