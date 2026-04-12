import { LLMClient } from "./llm.js";
import { RetrievalHit } from "./retrieve.js";
import { AssemblyResponse, Pipeline, ValidationErrors } from "./types.js";

const SYSTEM_PROMPT = `You are a pipeline assembler. You will be given a catalog of blocks and a user goal.
Your job: emit a directed-acyclic pipeline of blocks that achieves the goal.

Hard rules:
- Every "blockId" MUST match an id from the catalog EXACTLY. Do not invent ids.
- Every connection's "fromPort" and "toPort" MUST match a port id on the resolved block.
- Every param key MUST match a parameter id on the resolved block.
- Only include params that differ from the catalog defaults.
- No cycles. Every node's inputs must be satisfied by upstream outputs or left unconnected only if optional.
- Node instance ids are local to this pipeline (e.g. "n1", "n2", "n3").

Respond with pure JSON, no prose outside the JSON:
{
  "reasoning": "<free-form reasoning, 1-3 sentences>",
  "pipeline": {
    "nodes": [{"id": "n1", "blockId": "<catalog id>", "params": {}}],
    "connections": [{"from": "n1", "fromPort": "out", "to": "n2", "toPort": "in"}]
  }
}`;

export interface DecomposeOptions {
  goal: string;
  hits: RetrievalHit[];
  history?: { role: "user" | "assistant"; content: string }[];
  priorErrors?: ValidationErrors;
}

export class Decomposer {
  constructor(private llm: LLMClient) {}

  async decompose(opts: DecomposeOptions): Promise<AssemblyResponse> {
    const catalog = opts.hits.map((h) => h.line).join("\n\n");
    const userMsg = this.buildUserMessage(opts.goal, catalog, opts.priorErrors);

    const raw = await this.llm.complete({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...(opts.history ?? []),
        { role: "user", content: userMsg },
      ],
    });

    return parseAssemblyResponse(raw);
  }

  async decomposeDiff(opts: {
    currentGraph: Pipeline;
    edit: string;
    hits: RetrievalHit[];
  }): Promise<AssemblyResponse> {
    const catalog = opts.hits.map((h) => h.line).join("\n\n");
    const userMsg = `Current pipeline:
${JSON.stringify(opts.currentGraph, null, 2)}

Relevant catalog:
${catalog}

User edit: ${opts.edit}

Emit the COMPLETE revised pipeline as JSON.`;
    const raw = await this.llm.complete({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
    });
    return parseAssemblyResponse(raw);
  }

  private buildUserMessage(
    goal: string,
    catalog: string,
    priorErrors?: ValidationErrors,
  ): string {
    const errorSection = priorErrors ? formatErrors(priorErrors) : "";
    return `Goal: ${goal}

Catalog:
${catalog}
${errorSection}`;
  }
}

function formatErrors(e: ValidationErrors): string {
  const parts: string[] = ["\n\nPrior attempt had validation errors. Fix them:"];
  if (e.unknownIds.length) {
    parts.push("Unknown blockIds:");
    for (const u of e.unknownIds) {
      parts.push(`  - node ${u.nodeId}: "${u.blockId}" → try one of: ${u.suggestions.join(", ")}`);
    }
  }
  if (e.portMismatches.length) {
    parts.push("Port mismatches:");
    for (const p of e.portMismatches) {
      parts.push(`  - ${JSON.stringify(p.connection)}: ${p.reason}`);
    }
  }
  if (e.badParams.length) {
    parts.push("Bad params:");
    for (const bp of e.badParams) {
      parts.push(`  - node ${bp.nodeId} key "${bp.key}": ${bp.reason}`);
    }
  }
  if (e.cycles.length) {
    parts.push("Cycles detected (DAG required):");
    for (const c of e.cycles) parts.push(`  - ${c.join(" → ")}`);
  }
  return parts.join("\n");
}

export function parseAssemblyResponse(raw: string): AssemblyResponse {
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("LLM response contained no JSON object");
  }
  const sliced = raw.slice(jsonStart, jsonEnd + 1);
  const parsed = JSON.parse(sliced) as unknown;
  if (!isAssemblyResponse(parsed)) {
    throw new Error("LLM response did not match AssemblyResponse schema");
  }
  return parsed;
}

function isAssemblyResponse(x: unknown): x is AssemblyResponse {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  if (typeof o.reasoning !== "string") return false;
  const p = o.pipeline as Record<string, unknown> | undefined;
  if (!p || !Array.isArray(p.nodes) || !Array.isArray(p.connections)) return false;
  return true;
}
