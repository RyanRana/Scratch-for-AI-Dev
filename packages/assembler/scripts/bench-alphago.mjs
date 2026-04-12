#!/usr/bin/env node
/**
 * Comparative benchmark: build an AlphaGo clone via
 *   (A) our assembler method (DeepSeek-V3 + full manifest + validate + compile)
 *   (B) direct ask to Claude (Python code straight out)
 *
 * Measures wall-clock latency, input/output tokens, cost, and validity.
 * Expects DEEPSEEK_API_KEY and ANTHROPIC_API_KEY in env. No keys in source.
 */

import { BlockRegistry } from "../../block-schemas/dist/index.js";
import { ALL_BLOCKS } from "../../block-schemas/dist/blocks/index.js";
import { Validator } from "../dist/validate.js";
import { Compiler } from "../dist/compile.js";
import { parseAssemblyResponse } from "../dist/decompose.js";
import { writeFileSync, mkdirSync } from "node:fs";

const OUT_DIR = "/tmp/bench-alphago";
mkdirSync(OUT_DIR, { recursive: true });

const GOAL =
  "Build an AlphaGo clone: Monte Carlo Tree Search guided by a policy+value neural network, trained via self-play on 19x19 Go. Include data loading, the dual-head network, MCTS rollout logic, self-play training loop, and evaluation.";

// Public pricing (USD per 1M tokens) — update if Anthropic/DeepSeek change rates.
const PRICING = {
  "deepseek-chat": { in: 0.27, out: 1.1 },
  "claude-sonnet-4-5": { in: 3.0, out: 15.0 },
};

function cost(model, inTok, outTok) {
  const p = PRICING[model];
  if (!p) return null;
  return (inTok * p.in + outTok * p.out) / 1_000_000;
}

// ---- Our-method system prompt (mirrors decompose.ts) ----
const SYSTEM_PROMPT = `You are a pipeline assembler. You will be given a catalog of blocks and a user goal.
Your job: emit a directed-acyclic pipeline of blocks that achieves the goal.

Hard rules:
- Every "blockId" MUST match an id from the catalog EXACTLY. Do not invent ids.
- Every connection's "fromPort" and "toPort" MUST match a port id on the resolved block.
- Every param key MUST match a parameter id on the resolved block.
- Only include params that differ from the catalog defaults.
- No cycles. Every node's inputs must be satisfied by upstream outputs.
- Node instance ids are local to this pipeline (e.g. "n1", "n2", "n3").

Respond with pure JSON, no prose outside the JSON:
{
  "reasoning": "<1-3 sentences>",
  "pipeline": {
    "nodes": [{"id": "n1", "blockId": "<catalog id>", "params": {}}],
    "connections": [{"from": "n1", "fromPort": "out", "to": "n2", "toPort": "in"}]
  }
}`;

async function callDeepSeek(messages) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY missing");
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${await res.text()}`);
  return res.json();
}

function formatErrors(e) {
  const parts = ["Prior attempt had validation errors. Fix them and re-emit the full pipeline JSON:"];
  for (const u of e.unknownIds) parts.push(`  unknown blockId in node ${u.nodeId}: "${u.blockId}" → try: ${u.suggestions.join(", ")}`);
  for (const p of e.portMismatches) parts.push(`  port mismatch: ${JSON.stringify(p.connection)} — ${p.reason}`);
  for (const bp of e.badParams) parts.push(`  bad param on node ${bp.nodeId} key "${bp.key}": ${bp.reason}`);
  for (const c of e.cycles) parts.push(`  cycle: ${c.join(" → ")}`);
  return parts.join("\n");
}

const MAX_RETRIES = 2;

async function runOurs(registry, catalog) {
  const baseMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Goal: ${GOAL}\n\nCatalog:\n${catalog}` },
  ];

  let messages = baseMessages;
  let totalIn = 0;
  let totalOut = 0;
  let totalLatency = 0;
  let parsed = null;
  let validation = null;
  let compiled = null;
  let parseError = null;
  let attempts = 0;
  let content = "";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    attempts = attempt + 1;
    const t0 = Date.now();
    const json = await callDeepSeek(messages);
    totalLatency += Date.now() - t0;
    content = json.choices[0].message.content;
    totalIn += json.usage.prompt_tokens;
    totalOut += json.usage.completion_tokens;

    try {
      parsed = parseAssemblyResponse(content);
      const validator = new Validator(registry);
      validation = validator.validate(parsed.pipeline);
      if (validation.ok) {
        compiled = new Compiler(registry).compile(validation.pipeline);
        break;
      }
    } catch (e) {
      parseError = String(e);
      break;
    }

    // Retry with error feedback
    messages = [
      ...baseMessages,
      { role: "assistant", content },
      { role: "user", content: formatErrors(validation.errors) },
    ];
  }

  const inTok = totalIn;
  const outTok = totalOut;
  const latencyMs = totalLatency;

  writeFileSync(`${OUT_DIR}/ours-raw.json`, content);
  if (compiled) {
    writeFileSync(`${OUT_DIR}/ours-pipeline.py`, compiled.pythonSource);
    writeFileSync(`${OUT_DIR}/ours-requirements.txt`, compiled.requirements.join("\n"));
  }

  return {
    latencyMs,
    inTok,
    outTok,
    cost: cost("deepseek-chat", inTok, outTok),
    parseOk: parsed != null,
    parseError,
    validationOk: validation?.ok ?? false,
    nodeCount: parsed?.pipeline.nodes.length ?? 0,
    connectionCount: parsed?.pipeline.connections.length ?? 0,
    unknownIds: validation?.errors.unknownIds.length ?? 0,
    portMismatches: validation?.errors.portMismatches.length ?? 0,
    badParams: validation?.errors.badParams.length ?? 0,
    cycles: validation?.errors.cycles.length ?? 0,
    corrections: validation?.corrections.length ?? 0,
    compiledLines: compiled?.pythonSource.split("\n").length ?? 0,
    reqsCount: compiled?.requirements.length ?? 0,
    attempts,
  };
}

async function runDirect() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY missing");
  const body = {
    model: "claude-sonnet-4-5",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `Write a complete, runnable Python implementation for the following goal. Output only Python code inside a single \`\`\`python fenced block — no explanation.\n\nGoal: ${GOAL}`,
      },
    ],
  };
  const t0 = Date.now();
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  const latencyMs = Date.now() - t0;
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const text = json.content.map((c) => c.text ?? "").join("");
  const inTok = json.usage.input_tokens;
  const outTok = json.usage.output_tokens;

  // Extract Python from the fenced block (if any)
  const match = text.match(/```python\n([\s\S]*?)```/);
  const pyCode = match ? match[1] : text;
  const pyLines = pyCode.split("\n").length;

  writeFileSync(`${OUT_DIR}/direct-raw.md`, text);
  writeFileSync(`${OUT_DIR}/direct.py`, pyCode);

  return {
    latencyMs,
    inTok,
    outTok,
    cost: cost("claude-sonnet-4-5", inTok, outTok),
    pyLines,
    extractedPython: !!match,
  };
}

function table(rows) {
  const cols = Object.keys(rows[0]);
  const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => String(r[c] ?? "").length)));
  const line = (r) =>
    cols.map((c, i) => String(r[c] ?? "").padEnd(widths[i])).join("  ");
  console.log(line(Object.fromEntries(cols.map((c) => [c, c]))));
  console.log(cols.map((_, i) => "-".repeat(widths[i])).join("  "));
  for (const r of rows) console.log(line(r));
}

(async () => {
  const registry = new BlockRegistry(ALL_BLOCKS);
  const manifest = registry.manifest();
  const catalog = manifest.map((m) => m.line).join("\n\n");

  console.log(`Catalog: ${manifest.length} blocks, ${catalog.length} chars (~${Math.round(catalog.length / 4)} tokens est)`);
  console.log(`Goal: ${GOAL}`);
  console.log();

  console.log("=== (A) Our method: DeepSeek-V3 + validate + compile ===");
  const ours = await runOurs(registry, catalog);
  console.log(JSON.stringify(ours, null, 2));
  console.log();

  console.log("=== (B) Direct ask: Claude Sonnet 4.5 → Python ===");
  const direct = await runDirect();
  console.log(JSON.stringify(direct, null, 2));
  console.log();

  console.log("=== Summary ===");
  table([
    {
      method: "ours (DeepSeek+validate+compile)",
      latency_s: (ours.latencyMs / 1000).toFixed(2),
      in_tok: ours.inTok,
      out_tok: ours.outTok,
      cost_usd: ours.cost?.toFixed(4),
      valid: ours.validationOk ? "yes" : "no",
      artifact_lines: ours.compiledLines,
    },
    {
      method: "direct (Claude → python)",
      latency_s: (direct.latencyMs / 1000).toFixed(2),
      in_tok: direct.inTok,
      out_tok: direct.outTok,
      cost_usd: direct.cost?.toFixed(4),
      valid: direct.extractedPython ? "parsed" : "raw",
      artifact_lines: direct.pyLines,
    },
  ]);
  console.log(`\nArtifacts written to ${OUT_DIR}/`);
})().catch((e) => {
  console.error("BENCH FAILED:", e);
  process.exit(1);
});
