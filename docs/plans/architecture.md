# AI Blocks — Project Tree Architecture

Concrete architecture for expanding from flat-Python pipeline output to full multi-file, multi-language project generation, *and* a reverse pipeline that ingests an existing repo as a block layout.

---

## Goals

1. Keep the 505 existing Python pipeline blocks as-is. No manual migration.
2. Add block kinds that contribute files, fragments, scaffolds, MCP servers, and tool schemas.
3. Output is a **project tree** (many files, many languages), not a single script.
4. **Reverse mode:** upload a repo, get a `BlockLayout` back plus suggestions for new blocks where coverage is incomplete.
5. Preserve the existing router / assembler / retriever / validator architecture; grow it, don't replace it.

## Non-goals

- Cross-language type safety (a Python block referring to a TS symbol). Not in v1.
- Lossless reverse of arbitrary repos. Round-trip fidelity is a scale, not a boolean.
- An AST-based compiler. Regions are anchor-comment based; language-agnostic by design.

---

## Core types

### ProjectTree

The in-memory compilation output. Written to disk by a separate `write()` step.

```ts
export type FilePath = string;

export type Language =
  | "python" | "typescript" | "javascript" | "jsx" | "tsx"
  | "yaml" | "json" | "toml" | "dockerfile" | "shell"
  | "markdown" | "sql" | "css" | "html" | "text";

export interface FileState {
  path: FilePath;
  language: Language;
  template?: string;                    // base content with {{region:name}} anchors
  regions: Map<string, string[]>;       // region name → ordered fragments
  imports: Set<string>;                 // deduped, language-native format
  deps: Partial<DepsManifest>;          // per-file dep contributions
  finalized?: string;                   // rendered content after compile
}

export interface DepsManifest {
  pip: Set<string>;
  npm: Set<string>;
  system: Set<string>;                  // apt / brew package names
  dockerBase?: string;
}

export interface StackDescriptor {
  id: string;                           // scaffold block id that seeded this tree
  language: Language;                   // primary language
  paramValues: Record<string, unknown>;
}

export interface ProjectTree {
  files: Map<FilePath, FileState>;
  stack: StackDescriptor | null;
  deps: DepsManifest;                   // project-level, merged from files
}
```

### BlockLayout

The serializable, forward-compilable, reverse-derivable artifact. This is the thing you save, diff, and share.

```ts
export interface BlockLayout {
  version: "1.0";
  stack: { blockId: string; params: Record<string, unknown> } | null;
  instances: BlockInstance[];
  pipelines: Pipeline[];                // one per Python file that contains a pipeline
}

export interface BlockInstance {
  id: string;                           // layout-local: "i1", "i2", ...
  blockId: string;                      // resolves in registry
  params: Record<string, unknown>;
  targetPath?: FilePath;                // override default target for fragment blocks
}
```

`Pipeline` (existing `nodes[] + connections[]`) is now one *content* of a `pipeline`-kind instance. A `BlockLayout` can hold multiple pipelines — one per Python file.

---

## Block taxonomy

Every block carries a `kind`. The compiler dispatches per kind.

```ts
export type BlockKind =
  | "pipeline"   // existing 505 Python blocks — contribute to one file's body region
  | "scaffold"   // seed a ProjectTree with a base file set + stack metadata
  | "file"       // contribute a whole file (Dockerfile, package.json, etc.)
  | "fragment"   // contribute to named region(s) of one or more files
  | "mcp"        // reference an MCP server (emits into mcp.json)
  | "tool";      // declare a tool/function schema + optional impl stub

export interface BlockDefinition {
  id: string;
  kind: BlockKind;
  name: string;
  category: string;
  description: string;
  tags: string[];
  docUrl?: string;
  deprecated?: boolean;

  inputs: PortDefinition[];     // only used for kind="pipeline"
  outputs: PortDefinition[];    // only used for kind="pipeline"
  parameters: ParameterDefinition[];

  emits: EmitSpec;              // NEW — per-kind contribution spec

  // Legacy shim, not written by hand for new blocks:
  codeTemplate?: CodeTemplate;
}
```

### EmitSpec

A discriminated union keyed by `kind`.

```ts
export type EmitSpec =
  | PipelineEmit
  | ScaffoldEmit
  | FileEmit
  | FragmentEmit
  | McpEmit
  | ToolEmit;

export interface PipelineEmit {
  kind: "pipeline";
  file?: FilePath;              // default "pipeline.py"
  region?: string;              // default "body"
  imports: string[];
  pipDeps?: string[];
  body: string;                 // supports {in:<portId>}, {out:<portId>}, {param:<id>}
  setup?: string;
  teardown?: string;
  outputBindings: Record<string, string>;
}

export interface ScaffoldEmit {
  kind: "scaffold";
  language: Language;
  files: FileTemplate[];        // base files to seed the ProjectTree
  deps: Partial<DepsManifest>;
  conventions: ScaffoldConventions;
}

export interface FileEmit {
  kind: "file";
  path: FilePath;
  language: Language;
  content: string;              // supports {{param:x}} substitutions
  deps?: Partial<DepsManifest>;
}

export interface FragmentEmit {
  kind: "fragment";
  contributions: FileContribution[];
}

export interface FileContribution {
  path: FilePath | PathResolver;   // static path or convention-driven
  region: string;                   // anchor region in target file template
  content: string;                  // supports {{param:x}}, {{in:portId}}
  imports?: string[];
  deps?: Partial<DepsManifest>;
}

export type PathResolver =
  | { use: "conventions"; key: keyof ScaffoldConventions; suffix?: string }
  | { use: "param"; paramId: string };

export interface McpEmit {
  kind: "mcp";
  serverId: string;
  configPath: FilePath;             // typically "mcp.json"
  serverConfig: McpServerConfig;
  toolsProvided: string[];
}

export interface ToolEmit {
  kind: "tool";
  toolName: string;
  jsonSchema: Record<string, unknown>;  // Anthropic/OpenAI tool schema
  implementation?: FileContribution;    // optional generated stub
}
```

### FileTemplate + regions

```ts
export interface FileTemplate {
  path: FilePath;
  language: Language;
  body: string;                     // contains {{region:name}} anchors
  deps?: Partial<DepsManifest>;
}
```

Anchors use the comment syntax of the target language, so templates are valid files on their own:

```python
# {{region:imports}}

app = FastAPI()

# {{region:middleware}}
# {{region:routes}}
```

```ts
// {{region:imports}}

export const metadata = {
  // {{region:metadata-fields}}
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // {{region:layout-body}}
  return <>{children}</>;
}
```

JSON files can't host comments, so JSON file blocks use `FileEmit` (full replacement) or `FragmentEmit` with a deep-merge strategy — explicitly opt-in per-block.

### ScaffoldConventions

```ts
export interface ScaffoldConventions {
  mainFile?: FilePath;            // e.g. "app/main.py"
  routesDir?: FilePath;           // e.g. "app/routes"
  modelsFile?: FilePath;          // e.g. "app/models.py"
  componentsDir?: FilePath;       // e.g. "web/components"
  configDir?: FilePath;           // e.g. "config"
  migrationsDir?: FilePath;       // e.g. "migrations"
  testDir?: FilePath;             // e.g. "tests"
}
```

Conventions let fragment blocks say *"put me in the routes dir"* without hardcoding a scaffold-specific path.

---

## Forward pipeline: goal → ProjectTree → disk

```text
User goal
    │
    ▼
Router ─────────────────────────────────────► DirectGenerator (unchanged)
    │ (high-confidence)                              │
    ▼                                                ▼
Stage A: Scaffold pick                        Python code (no BlockLayout)
    │ LLM sees scaffold-kind manifests only
    │ emits: { blockId, params }
    ▼
Stage B: Block pick
    │ LLM sees scaffold's conventions + retrieved blocks filtered by
    │ scaffold.language and block compatibility
    │ emits: BlockInstance[] + Pipeline[]
    ▼
Validate
    │ ID gate, fuzzy recovery
    │ File-path conflict gate   (two FileEmits claiming same path → error)
    │ Region gate               (every FileContribution.region exists in template)
    │ Port gate                 (pipeline-kind nodes only)
    │ DAG gate                  (pipeline-kind nodes only)
    │ Deps gate                 (every import resolvable in pip/npm/stdlib)
    ▼
ProjectCompiler
    │ 1. Instantiate ProjectTree from scaffold
    │ 2. Apply instances in deterministic order:
    │       scaffolds → file → fragment → pipeline
    │ 3. Render each file: substitute regions into template
    │ 4. Dedupe imports per-file
    │ 5. Merge DepsManifest across files into project-level deps
    │    (emit requirements.txt / package.json / etc. via synthetic file blocks)
    ▼
ProjectTree (in-memory)
    │
    ▼
write(tree, targetDir)       // separate, side-effecting step
```

Two-stage decomposition keeps each LLM call small:

- **Stage A** sees only 10–30 scaffold manifests (~3k tokens). Output is ~100 tokens. Cheap.
- **Stage B** sees retrieved extension blocks scoped to the chosen scaffold (~4–8k tokens depending on retrieval budget). Output is the `BlockInstance[]` + pipelines.

Stage A's output *seeds* retrieval in Stage B — once we know we're in FastAPI-land, we filter the catalog to Python + FastAPI-tagged blocks before embedding-retrieval runs. That raises retrieval precision substantially.

---

## Reverse pipeline: repo → BlockLayout

The "upload a repo" flow. Output is *best-effort forward-compilable*, not guaranteed round-trip-exact.

```ts
export interface ReverseResult {
  layout: BlockLayout;
  unmatched: UnmatchedFile[];
  suggestions: NewBlockSuggestion[];
  coverage: number;                // 0..1, fraction of repo lines accounted for
}

export interface UnmatchedFile {
  path: FilePath;
  content: string;
  reason: "no-scaffold-match" | "no-block-match" | "binary" | "too-large";
}

export interface NewBlockSuggestion {
  proposedId: string;
  proposedKind: BlockKind;
  examplePath: FilePath;
  exampleContent: string;
  reasoning: string;               // LLM explanation
  confidence: number;              // 0..1
}
```

### Reverse stages

1. **Scaffold detection** — heuristic, no LLM.
    - Walk the repo tree, match against each scaffold's `files[]` signature (path + content patterns).
    - Example signals: `package.json` depends on `"next"` → Next.js; `pyproject.toml` with `fastapi` → FastAPI; `Cargo.toml` → Rust (no scaffold yet → suggestion).
    - Score by coverage; highest wins. If nothing scores > 0.3, emit a `NewBlockSuggestion` of kind `scaffold`.

2. **File classification** — heuristic first, LLM fallback.
    - Known filenames map 1:1: `Dockerfile` → `infra.dockerfile` block, `tsconfig.json` → `config.tsconfig` block, `.github/workflows/*.yml` → `ci.github-actions` block.
    - Unknown files go to the LLM with retrieval: embed the file contents, pull top-10 candidate blocks, ask *"which of these best matches this file? If none, propose a new block."*

3. **Fragment extraction** — LLM.
    - For each file matching a scaffold template (e.g. `app/main.py` in FastAPI scaffold):
        - Diff the file against the template.
        - Each non-empty region becomes a list of candidate fragments.
        - LLM classifies each fragment against catalog `fragment`-kind blocks scoped by target region.

4. **Pipeline reconstruction** — LLM-assisted, optional.
    - For flat Python files not in any scaffold template: ask the LLM *"does this file represent a data pipeline? If so, split into catalog blocks and infer the connection DAG."*
    - This is the weakest step. Budget: one attempt per file; on failure, fall back to capturing the file as a single `FileEmit` block with full content.

5. **Emit `BlockLayout`** with everything matched, plus `unmatched[]` and `suggestions[]`.

### Reverse gives you three things at once

- **A BlockLayout for the repo** — you can now edit it with the assembler.
- **Gap report** — every file we couldn't match is a concrete block idea.
- **Round-trip regression test** — `forward(reverse(repo))` ≈ `repo` is a correctness signal for the forward compiler. Run it on the repo's own test corpus in CI.

### What reverse is not

- It's not a code-understanding tool. Use Claude directly if you want "what does this repo do."
- It's not a refactoring tool. It captures structure, not intent.
- It doesn't guarantee byte-exact round-trip for arbitrary files. See correctness bar below.

---

## Retrieval at scale

Current manifest: 34k tokens at 505 blocks. Plan scales to 5,000+. Hierarchical retrieval:

1. **Level 1 — Category pick.** Tiny manifest: category ids + one-line descriptions. ~1k tokens. LLM picks 2–5 relevant categories.
2. **Level 2 — Block pick.** Within chosen categories + glue (data-io, utilities, control-flow), retrieve top-K by embedding cosine. Manifest lines ~120 tokens each; budget ~4k tokens total.
3. **Level 3 — Full spec on demand.** When the decomposer commits to a specific block, it can request the full spec (all parameters, canonical example, cross-references) via a follow-up call. One extra round-trip; rarely needed.

Cost is amortized per block-instance used, not per catalog size. A 5,000-block catalog behaves like a ~50-block retrieval at inference time.

Stage A (scaffold pick) *also* filters Level 2. Once the scaffold is known, Level 2 retrieval is scoped to blocks whose tags include the scaffold's language or stack. This is the single biggest precision win.

---

## Preserving the 505 Python blocks

The existing blocks have `codeTemplate` but no `emits`. Lazy shim, applied at registry load:

```ts
function ensureEmits(block: BlockDefinition): BlockDefinition {
  if (block.emits) return block;
  if (!block.codeTemplate) {
    throw new Error(`block ${block.id} has neither emits nor codeTemplate`);
  }
  return {
    ...block,
    kind: block.kind ?? "pipeline",
    emits: {
      kind: "pipeline",
      file: "pipeline.py",
      region: "body",
      imports: block.codeTemplate.imports,
      pipDeps: block.codeTemplate.pipDeps,
      body: block.codeTemplate.body,
      setup: block.codeTemplate.setup,
      teardown: block.codeTemplate.teardown,
      outputBindings: block.codeTemplate.outputBindings,
    },
  };
}
```

Applied in `BlockRegistry.register()`. All 505 blocks become valid `kind="pipeline"` blocks without a single source edit. Individual blocks migrate to native `emits` declarations when there's a reason (e.g., to target `src/ml/train.py` inside a scaffold instead of the default `pipeline.py`).

The `flat-python` scaffold is the implicit default when no explicit scaffold is picked. It has one file template (`pipeline.py`) with an `imports` and `body` region and zero conventions. In that scaffold, the new compiler produces output byte-identical to the current compiler.

---

## File layout

```text
packages/
  block-schemas/
    src/
      types.ts                    # extend: BlockKind, EmitSpec, Language, DepsManifest
      manifest.ts                 # unchanged
      registry.ts                 # apply ensureEmits shim at register()
      project-tree.ts             # NEW — ProjectTree, FileState, merge helpers
      scaffolds/                  # NEW — curated scaffolds
        flat-python.ts            # implicit default, holds the legacy pipeline.py
        fastapi-postgres.ts
        nextjs-prisma.ts
      blocks/                     # existing 505 python blocks, untouched
  assembler/
    src/
      types.ts                    # BlockLayout, BlockInstance, ReverseResult
      retrieve.ts                 # extend with hierarchical mode
      router.ts                   # unchanged
      decompose.ts                # two-stage: scaffold → blocks
      validate.ts                 # add file-path, region, deps gates
      project-compiler.ts         # NEW — replaces compile.ts
      compile.ts                  # kept as thin wrapper for back-compat
      reverse/                    # NEW
        scaffold-detect.ts
        file-classify.ts
        fragment-extract.ts
        pipeline-rebuild.ts
        index.ts
      session.ts                  # same public API, dispatches to project-compiler
      direct.ts                   # unchanged
```

---

## Migration phases

| # | Phase | Days | Shipping criterion |
|---|---|---|---|
| 0 | Types + `ensureEmits` shim | 2 | Registry loads all 505 blocks as `kind="pipeline"`; no behavior change |
| 1 | `ProjectCompiler` v1 under `flat-python` scaffold | 4 | Compiles 10 existing pipelines byte-identical to current compiler |
| 2 | Scaffolds + file blocks | 5 | "Build a FastAPI service for sentiment" → multi-file project that runs |
| 3 | Fragment blocks + two-stage decomposer | 4 | FastAPI route block writes to `app/routes/*.py` *and* registers in `app/main.py` |
| 4 | Reverse: scaffold detect + filename-based file classify | 3 | Reverse-then-forward on our own `apps/web` hits > 80% coverage |
| 5 | Reverse: LLM fragment extraction + suggestions | 5 | Reverse a 3rd-party FastAPI repo, emit ≥ 3 `NewBlockSuggestion`s |
| 6 | Hierarchical retrieval | 4 | Synthetic 2,000-block catalog retrieves in < 6k tokens, > 85% recall@10 |
| 7 | MCP + Tool block kinds | 4 | One example MCP block + one tool block wired end-to-end |
| 8 | TS/JSX target + one frontend scaffold | 5 | "Build a Next.js page that calls the FastAPI service" → mixed-language project |

**Total: ~36 working days (~7 calendar weeks).** Phases 0–3 are the core path to multi-file output. Phases 4–5 unlock the reverse flow. Phases 6–8 are incremental.

---

## Resolved decisions

1. **Scaffold granularity:** **coarse.** 5–10 curated full-stack presets. Split later if demand proves fine-grained composition worthwhile.
2. **File conflict resolution:** **last-write-wins.** Deterministic apply order (scaffolds → file → fragment → pipeline) makes this predictable. Compiler logs every overwrite so silent clobbers are still traceable.
3. **Cross-file pipeline bindings:** **allowed.** A pipeline output in `train.py` can be consumed by a block in `serve.py`. Implementation is a small extension to `BlockLayout` — see *Cross-file bindings* section below. Adds ~2 days to Phase 1.
4. **Reverse-mode LLM budget:** **cheap + low-latency.** Use DeepSeek-V3 (not Claude) for classification; batch up to 30 files per call; parallelize up to 5 concurrent calls; cap at **30 calls per repo**. Above the cap, surface the remaining directories to the user for prioritization.
5. **Round-trip correctness bar:** confirmed.
    - `scaffold` + `file` blocks: **byte-exact** (modulo whitespace).
    - `fragment` blocks: **semantic** (same regions populated, content maps to same block ids).
    - `pipeline` blocks: **structural** (same nodes + connections + params).
    - Unmatched content: captured as raw `FileEmit` — lossless but "unblocked".
6. **Reverse input:** **local directory path only** in v1. Browser / remote upload is app-layer concern, out of scope for the assembler package.

## Cross-file bindings (from resolved decision 3)

A `BlockLayout` holds multiple `Pipeline`s, each targeting a different file. Cross-file edges are modelled explicitly, not overloaded onto intra-pipeline connections:

```ts
export interface CrossPipelineConnection {
  fromPipeline: string;      // pipeline id within the layout
  fromNode: string;
  fromPort: string;
  toPipeline: string;
  toNode: string;
  toPort: string;
}

export interface BlockLayout {
  version: "1.0";
  stack: { blockId: string; params: Record<string, unknown> } | null;
  instances: BlockInstance[];
  pipelines: Pipeline[];
  crossEdges: CrossPipelineConnection[];   // NEW
}
```

Compiler behavior:

- Run intra-pipeline topo-sort per pipeline as today.
- Run a layout-level topo-sort over `crossEdges` treating each pipeline as a super-node. Reject cycles at the pipeline level (Python can't circular-import anyway).
- For each `CrossPipelineConnection`: the source binding already sits at module scope in its file (pipeline bodies live at module scope). In the destination file, emit `from <source_module> import <binding_name>` in the `imports` region and wire the destination block's `{in:port}` substitution to the imported name.
- Validator gains two new gates: *cross-edge resolves* (both endpoints exist) and *no cross-pipeline cycles*.

---

## What this architecture *doesn't* change

- The `Router` → `Assembler` vs `Direct` split stays exactly as-is.
- `Retriever` + `EmbeddingClient` + `VectorStore` are unchanged in structure, only extended for hierarchical mode.
- `Validator` gains new gates (file conflicts, regions, deps) but the existing ID / port / DAG gates stay.
- The existing session + history + diff machinery in `session.ts` stays. Incremental edits on a `BlockLayout` work the same way as edits on a `Pipeline`.

The through-line: **a BlockLayout is a generalized Pipeline**. Everything we built for pipelines gets reused at the layout level.
