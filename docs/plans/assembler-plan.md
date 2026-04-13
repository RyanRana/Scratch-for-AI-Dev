# Assembler Plan — NL Goal → Python Pipeline

Source of truth: `packages/block-schemas/src/blocks/*.ts` → exported via `BlockRegistry`.
New work lives in a standalone package: `packages/assembler/` (not inside `apps/web` or the VS Code extension, so it can use Node-only libs and be consumed by either).

---

## Locked decisions

1. **Decomposer LLM** — default DeepSeek-V3 API. At ~4k input tokens/turn it runs ~$0.0003/turn, so "cheaper" is effectively moot; latency is the real win vs local. Ship a pluggable `LLMClient` interface so an Ollama adapter can be swapped in for fully-offline mode.
2. **Embeddings** — Ollama `nomic-embed-text`, local. One-time embed at startup, cached to disk by block-def content hash.
3. **Package location** — new `packages/assembler/` package. Node-only. Consumed by both `apps/web` (via a thin server endpoint) and the extension.
4. **Parameter generation** — LLM fills `params` per node in the same decomposition call. Output must be directly compilable. To keep latency down: tight JSON schema, only emit params that differ from defaults, and use DeepSeek's function-calling mode so we pay no reasoning/prose overhead.
5. **Dependencies** — add `pipDeps: string[]` to `CodeTemplate`. `compile.ts` unions these into `requirements.txt`. No heuristic import-scraping.

---

## Package layout

```text
packages/assembler/
  src/
    manifest.ts      # compress BlockDefinition → one-line manifest entry
    embed.ts         # Ollama nomic-embed-text client
    vector-store.ts  # in-process vectra wrapper
    retrieve.ts      # goal → top-K manifest lines
    llm.ts           # LLMClient interface + DeepSeek + Ollama adapters
    decompose.ts     # build prompt, call LLM, parse AssemblyResponse
    validate.ts      # id / fuzzy / port / DAG gates
    compile.ts       # topo sort → pipeline.py + requirements.txt
    session.ts       # per-conversation cache + incremental diff
    types.ts         # AssemblyResponse, Pipeline, Session
    index.ts
```

Assembler imports `BlockRegistry` from `@ai-blocks/block-schemas` directly — no JSON dump.

---

## Phase 1 — Registry augmentation

Extend the existing `BlockRegistry` in `packages/block-schemas/src/registry.ts` (don't fork):

- Add `byPortType: { inputs: Map<PortType, BlockDefinition[]>, outputs: Map<PortType, BlockDefinition[]> }`.
- Add `manifest(): string[]` → memoized, delegates to `packages/assembler/src/manifest.ts`.

Add `pipDeps: string[]` to `CodeTemplate` in `types.ts`. Backfill as `[]` on every existing block (cheap codemod).

**Manifest line format** (~80–120 tokens, deterministic):

```text
<id> | <category> | <name>: <description shortened to 12 words>
  in:  <port.id>:<type>[?] ...
  out: <port.id>:<type> ...
  params: <paramId>:<type>=<default> ...
```

Port IDs + types are non-negotiable — without them the LLM cannot emit valid connections. Param signatures are included so the model knows which keys are legal when generating `params`.

---

## Phase 2 — Retrieval (local, fast)

`retrieve.ts`:

1. On registry load, embed every manifest line once via Ollama `nomic-embed-text` (~50ms each, parallelized; cached to disk by content hash).
2. Store vectors in-process with `vectra`.
3. On user goal:
   - Embed goal.
   - Pull top-K (K=40) by cosine.
   - **Union with category-filtered glue blocks**: always include top 3 blocks from `data-io`, `data-processing`, `utilities`, and anything in `control-flow`, so semantic retrieval can't silently drop the wiring.

---

## Phase 3 — Decomposition (cloud LLM)

`decompose.ts`:

- Primary model: DeepSeek-V3 via function calling. Fallback adapter: Ollama (same `LLMClient` interface).
- System prompt pastes retrieved manifest lines only + a hard rule: "every `blockId` must match an id from the list exactly; every port id must match; params keys must match."
- Response schema:

  ```ts
  type AssemblyResponse = {
    reasoning: string;
    pipeline: {
      nodes: {
        id: string;
        blockId: string;
        params?: Record<string, unknown>; // only non-default values
      }[];
      connections: {
        from: string; fromPort: string;
        to: string;   toPort: string;
      }[];
    };
  };
  ```

**Retry protocol:** on validation failure, feed back `{ unknownIds, portMismatches, cycles, badParams }` + manifest lines for just the offending IDs. Max 2 retries before surfacing a user-visible error.

---

## Phase 4 — Validation

`validate.ts` — four gates, in order:

1. **ID gate** — every `blockId` ∈ `registry.byId`. Unknown IDs go to fuzzy recovery.
2. **Fuzzy recovery** — match on `name + category` (not raw ID) using `fastest-levenshtein`; accept only if distance ≤ 2 AND category matches. Otherwise kick back to decomposer.
3. **Port gate** — each connection's `fromPort`/`toPort` exists on the resolved block, types compatible via existing `arePortsCompatible`.
4. **DAG gate** — build adjacency list, run Kahn's. Cycle → hard fail (no cycles legal).

Param validation runs alongside the ID gate: keys must exist on the block, types must match `ParameterDefinition`, select values must be in the allowed set.

---

## Phase 5 — Compile

`compile.ts`:

1. Kahn topological order over nodes.
2. Dedup `codeTemplate.imports` into a `Set<string>`.
3. Union all `codeTemplate.pipDeps` into `requirements.txt`.
4. Resolve variable bindings: for each node, map input ports to upstream node's `outputBindings[port.id]`.
5. Emit:
   - `pipeline.py` — imports, each block's `setup`, then bodies in topo order, then `teardown`s reversed.
   - `requirements.txt` — from the deduped `pipDeps` set.

Output must be directly runnable via `pip install -r requirements.txt && python pipeline.py`. Compile failures surface as assembler errors, not runtime errors.

---

## Phase 6 — Session / incremental

`session.ts` per-conversation state:

```ts
type Session = {
  graph: Pipeline | null;
  history: { role: "user" | "assistant"; content: string }[];
  lastManifestHits: string[]; // retrieval cache across turns
};
```

Two entry points:

- `assembleFresh(goal)` — full pipeline on first turn or on "start over."
- `assembleDiff(session, edit)` — sends current graph + edit instruction, asks LLM for a **graph patch** (add/remove nodes, rewire connections), then revalidates. Falls back to `assembleFresh` if the patch touches more than ~40% of nodes.

---

## What I'm *not* doing (and why)

- **No separate manifest JSON file.** Regenerated in-memory from TS at startup. One source of truth.
- **No Levenshtein on raw IDs.** Too collision-prone (`training.sft` vs `training.dpo`).
- **No full re-decomposition on every edit.** Diff mode keeps interactive latency sane.
- **No cycles.** DAG-only; enforced in validator, not just dataset.
- **No heuristic import-scraping.** Blocks declare `pipDeps` explicitly.
