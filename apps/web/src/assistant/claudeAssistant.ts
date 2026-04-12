// ============================================================================
// Claude assistant with graph-editing JSON protocol
// ============================================================================

import { CATEGORIES, type BlockRegistry } from "@ai-blocks/block-schemas";
import { compactBlockCatalog, serializeGraph, validateGraph, type Graph } from "@ai-blocks/core";
import type { ChatMessage } from "@ai-blocks/ui-components";
import { parseAssistantResponse } from "./parseAssistantJson.js";
import { applyAssistantCommands } from "./applyAssistantCommands.js";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_CATALOG = 80_000;
const MAX_GRAPH_JSON = 24_000;

function buildSystemPrompt(registry: BlockRegistry, graph: Graph): string {
  const catalog = compactBlockCatalog(registry);
  const cat = catalog.length > MAX_CATALOG ? catalog.slice(0, MAX_CATALOG) + "\n# …truncated…" : catalog;

  let graphJson = "";
  try {
    graphJson = serializeGraph(graph);
  } catch {
    graphJson = "{}";
  }
  if (graphJson.length > MAX_GRAPH_JSON) {
    graphJson = graphJson.slice(0, MAX_GRAPH_JSON) + "\n// …truncated…";
  }

  const categories = CATEGORIES.map((c) => `${c.id}: ${c.name}`).join("; ");

  return `You are the AI Blocks copilot. You can MODIFY the user's visual ML pipeline and the generated Python by emitting structured commands.

BLOCK CATALOG (use blockId EXACTLY as shown — id|display name per line):
${cat}

Categories: ${categories}

CURRENT GRAPH JSON (node ids are stable — use connectIds with these ids when editing existing nodes):
${graphJson}

RESPONSE FORMAT — always end your reply with a single JSON code block (markdown \`\`\`json ... \`\`\`) containing:
{
  "message": "Short user-facing summary of what you did or suggest.",
  "commands": [ ... ]
}

commands is an array of operations executed in order. Allowed shapes:
- { "op": "clear" } — empty canvas
- { "op": "setName", "name": "My Pipeline" }
- { "op": "replaceGraph", "plan": { "nodes": [...], "edges": [...] } } — full graph; nodes use blockId from catalog; edges use fromIdx/toIdx like import
- { "op": "addNode", "ref": "a", "blockId": "data-io.load-csv", "x": 40, "y": 120, "parameters": { "file_path": "data.csv" } } — use varied x/y (branches up/down, ~200–220px vertical spread) so the canvas isn’t one flat row
- { "op": "connect", "fromRef": "a", "fromPort": "<upstream OUTPUT port id>", "toRef": "b", "toPort": "<downstream INPUT port id>" } — use exact ids from catalog [out:…] / [in:…]; refs only for nodes created earlier in THIS command list
- { "op": "connectIds", "fromNodeId": "n_abc", "fromPort": "…", "toNodeId": "n_xyz", "toPort": "…" } — same: upstream output → downstream input; use graph JSON node ids
- { "op": "setParams", "ref": "a", "parameters": { ... } } or { "op": "setParamsById", "nodeId": "...", "parameters": { ... } }
- { "op": "removeNode", "ref": "a" } or { "op": "removeNodeById", "nodeId": "..." }

If the user only wants an explanation and no edits, use "commands": [].

After your commands run, the app auto-wires missing **required** inputs when a compatible upstream exists without creating a cycle, then validates — use catalog port ids; data flows from out ports to in ports.`;
}

export interface AssistantTurnResult {
  message: string;
  commandsApplied: boolean;
  commandLog: string[];
  /** Present when commands changed the graph */
  nextGraph?: Graph;
}

export async function runAssistantTurn(
  messages: ChatMessage[],
  apiKey: string,
  graph: Graph,
  registry: BlockRegistry
): Promise<AssistantTurnResult> {
  if (!apiKey) {
    return {
      message: "Set your Anthropic API key in the panel above first.",
      commandsApplied: false,
      commandLog: [],
    };
  }

  const system = buildSystemPrompt(registry, graph);

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    if (resp.status === 401) {
      return { message: "Invalid API key.", commandsApplied: false, commandLog: [] };
    }
    return { message: `API error (${resp.status}): ${err.slice(0, 400)}`, commandsApplied: false, commandLog: [] };
  }

  const data = (await resp.json()) as { content?: { text?: string }[] };
  const text = data.content?.[0]?.text ?? "";
  const parsed = parseAssistantResponse(text);

  if (parsed.commands.length === 0) {
    return { message: parsed.message || text, commandsApplied: false, commandLog: [] };
  }

  const { graph: next, log } = applyAssistantCommands(graph, registry, parsed.commands);
  const errors = validateGraph(next, registry);
  const errLines = errors.length
    ? errors.map((e) => `• ${e.message}`).join("\n")
    : "Graph validates (no blocking issues reported).";

  const fullMessage = `${parsed.message}\n\n**Changes:**\n${log.map((l) => `• ${l}`).join("\n")}\n\n**Validation:**\n${errLines}`;

  return {
    message: fullMessage,
    commandsApplied: true,
    commandLog: log,
    nextGraph: next,
  };
}
