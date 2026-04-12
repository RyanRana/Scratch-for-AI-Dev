// ============================================================================
// Claude Haiku: map Python / notebook code → import plan JSON (browser)
// ============================================================================

import {
  compactBlockCatalog,
  parseImportPlanJson,
  splitPythonTopLevelStatements,
  type ImportPlan,
  type ImportPlanEdge,
  type ImportPlanNode,
} from "@ai-blocks/core";
import type { BlockRegistry } from "@ai-blocks/block-schemas";

const MODEL = "claude-haiku-4-5-20251001";
// Smaller caps = faster first-token + fewer input tokens. Real plans fit
// well under these, and truncation falls back to the regex parser.
const MAX_CATALOG_CHARS = 32_000;
const MAX_CODE_CHARS = 16_000;

const SYSTEM = `You are a strict JSON emitter for "AI Blocks" pipelines.

Output a single JSON object ONLY — no markdown, no code fences, no commentary.

Schema:
{
  "nodes": [
    { "blockId": "<exact id from CATALOG>", "parameters": { }, "label": "optional short label" }
  ],
  "edges": [
    { "fromIdx": 0, "fromPort": "upstream_output_port_id", "toIdx": 1, "toPort": "downstream_input_port_id" }
  ]
}

Rules:
1. Every blockId MUST be copied EXACTLY from the CATALOG lines (format: id|name [in:… out:…]). Never invent new ids.
2. Use "utilities.python-snippet" when a step cannot be one catalog block; put Python in parameters.source (multiline string).
3. nodes are ordered left-to-right in execution order. fromIdx/toIdx are 0-based indices into nodes.
4. Edges flow from an output on nodes[fromIdx] to an input on nodes[toIdx]. Use the exact port ids from the catalog [in:…] and [out:…] on each block line (e.g. load-csv out:dataframe → next block in:dataframe).
5. Omit parameters to use defaults; only set parameters you can infer from the code (paths, column names, hyperparameters).
6. Prefer fewer, correct blocks over many fragments.`;

export async function fetchClaudeImportPlan(
  code: string,
  registry: BlockRegistry,
  apiKey: string
): Promise<ImportPlan> {
  let catalog = compactBlockCatalog(registry);
  if (catalog.length > MAX_CATALOG_CHARS) {
    catalog = catalog.slice(0, MAX_CATALOG_CHARS) + "\n# … catalog truncated …";
  }
  let userCode = code.trim();
  if (userCode.length > MAX_CODE_CHARS) {
    userCode =
      userCode.slice(0, MAX_CODE_CHARS) +
      "\n\n# … code truncated for API size; pipeline may be incomplete …";
  }

  const user = `CATALOG (id|name [in:portIds out:portIds], one per line):\n${catalog}\n\nCODE:\n${userCode}`;

  const body = JSON.stringify({
    model: MODEL,
    // Needs enough headroom that large files don't truncate mid-JSON —
    // truncation causes JSON.parse to throw and silently drop back to
    // the raw "Step N" parser.
    max_tokens: 6144,
    // Pin to 0 so the same file deterministically maps to the same
    // block plan every call. Without this, Haiku samples at its default
    // (~1.0) and you get a different graph on every drill-in.
    temperature: 0,
    system: SYSTEM,
    messages: [{ role: "user", content: user }],
  });

  // One retry for transient rate-limit / overload blips so a single 429/529
  // doesn't kick us into the grey-blocks fallback.
  let resp: Response | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body,
    });
    if (resp.ok) break;
    if (attempt === 0 && (resp.status === 429 || resp.status === 529)) {
      await new Promise((r) => setTimeout(r, 700));
      continue;
    }
    break;
  }
  if (!resp || !resp.ok) {
    const err = resp ? await resp.text() : "no response";
    throw new Error(`Claude import failed (${resp?.status ?? "?"}): ${err.slice(0, 500)}`);
  }

  const data = (await resp.json()) as {
    content?: { type: string; text?: string }[];
    stop_reason?: string;
  };
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Claude returned empty content");
  // max_tokens hit mid-emit → JSON is truncated and unparseable. Surface
  // it as a distinct error so the caller can tell the user instead of
  // silently falling back to the regex parser.
  if (data.stop_reason === "max_tokens") {
    throw new Error(
      "Claude output truncated (stop_reason: max_tokens). File is too large — try a smaller one or raise max_tokens.",
    );
  }

  return parseImportPlanJson(text);
}

// ── Sliding-window chunked import ────────────────────────────────────────
//
// Long files don't fit in a single Claude call: either `MAX_CODE_CHARS` cuts
// the source mid-statement before sending, or `max_tokens` cuts the JSON
// response mid-emit so parsing fails and we fall back to grey blocks. Both
// failure modes show up as "missing blocks at the bottom of the file".
//
// Fix: split the source at top-level Python statement boundaries, pack those
// statements into overlap-free windows of ≤ `CHUNK_BUDGET_CHARS` each, fan
// out one Claude call per window in parallel, and stitch the resulting plans
// back together in document order (with edge indices shifted per chunk).

const CHUNK_BUDGET_CHARS = 9_000;
// Short files go through the single-call path — fewer round-trips, lower
// latency, and the original behavior users already know.
const CHUNK_THRESHOLD_CHARS = 12_000;

/**
 * Greedily pack top-level Python statements into windows of at most
 * `budget` characters. Each statement lands in exactly one window — no
 * overlap — so merging is a simple concat + index shift.
 */
function packPythonWindows(source: string, budget: number): string[] {
  const stmts = splitPythonTopLevelStatements(source);
  if (stmts.length === 0) return [source];
  const windows: string[] = [];
  let current: string[] = [];
  let currentSize = 0;
  for (const stmt of stmts) {
    const size = stmt.length + 1;
    // A single statement larger than the budget still goes through on its
    // own — the alternative (mid-statement splitting) breaks Python syntax
    // and confuses Claude far worse than one oversized window.
    if (currentSize + size > budget && current.length > 0) {
      windows.push(current.join("\n"));
      current = [];
      currentSize = 0;
    }
    current.push(stmt);
    currentSize += size;
  }
  if (current.length > 0) windows.push(current.join("\n"));
  return windows;
}

/**
 * Merge N per-window import plans into one, preserving document order and
 * rewriting edge indices so they point at the stitched `nodes` array.
 */
function mergeImportPlans(plans: ImportPlan[]): ImportPlan {
  const nodes: ImportPlanNode[] = [];
  const edges: ImportPlanEdge[] = [];
  for (const plan of plans) {
    const base = nodes.length;
    for (const n of plan.nodes) nodes.push(n);
    for (const e of plan.edges) {
      edges.push({
        fromIdx: e.fromIdx + base,
        fromPort: e.fromPort,
        toIdx: e.toIdx + base,
        toPort: e.toPort,
      });
    }
  }
  return { nodes, edges };
}

/**
 * Route long files through the sliding-window chunker; short files stay on
 * the single-call fast path. Windows fan out in parallel so end-to-end
 * latency is roughly max(single-call) instead of sum(single-calls).
 */
export async function fetchClaudeImportPlanChunked(
  code: string,
  registry: BlockRegistry,
  apiKey: string,
): Promise<ImportPlan> {
  if (code.length <= CHUNK_THRESHOLD_CHARS) {
    return fetchClaudeImportPlan(code, registry, apiKey);
  }
  const windows = packPythonWindows(code, CHUNK_BUDGET_CHARS);
  if (windows.length <= 1) {
    return fetchClaudeImportPlan(code, registry, apiKey);
  }
  const plans = await Promise.all(
    windows.map((chunk) => fetchClaudeImportPlan(chunk, registry, apiKey)),
  );
  return mergeImportPlans(plans);
}
