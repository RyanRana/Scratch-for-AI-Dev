// ============================================================================
// Parse assistant response: natural language + optional JSON command block
// ============================================================================

import type { AssistantCommand } from "./applyAssistantCommands.js";
import type { ImportPlan } from "@ai-blocks/core";

export interface ParsedAssistantResponse {
  message: string;
  commands: AssistantCommand[];
}

function stripJsonFence(text: string): string | null {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return m ? m[1].trim() : null;
}

/** Best-effort: find outermost JSON object with "commands" array. */
function extractJsonObject(text: string): string | null {
  const fenced = stripJsonFence(text);
  if (fenced) return fenced;
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function isImportPlan(o: unknown): o is ImportPlan {
  if (!o || typeof o !== "object") return false;
  const p = o as Record<string, unknown>;
  return Array.isArray(p.nodes);
}

export function parseAssistantResponse(raw: string): ParsedAssistantResponse {
  const jsonStr = extractJsonObject(raw);
  if (!jsonStr) {
    return { message: raw.trim(), commands: [] };
  }

  let message = raw;
  try {
    const doc = JSON.parse(jsonStr) as Record<string, unknown>;
    if (typeof doc.message === "string") {
      message = doc.message.trim();
    }
    const cmds = doc.commands;
    if (!Array.isArray(cmds)) {
      return { message: message || raw.trim(), commands: [] };
    }

    const commands: AssistantCommand[] = [];
    for (const c of cmds) {
      if (!c || typeof c !== "object") continue;
      const o = c as Record<string, unknown>;
      const op = o.op;
      if (op === "clear") commands.push({ op: "clear" });
      else if (op === "setName" && typeof o.name === "string") commands.push({ op: "setName", name: o.name });
      else if (op === "replaceGraph" && isImportPlan(o.plan)) commands.push({ op: "replaceGraph", plan: o.plan });
      else if (op === "addNode" && typeof o.ref === "string" && typeof o.blockId === "string") {
        commands.push({
          op: "addNode",
          ref: o.ref,
          blockId: o.blockId,
          x: Number(o.x) || 0,
          y: Number(o.y) || 0,
          parameters: typeof o.parameters === "object" && o.parameters ? (o.parameters as Record<string, unknown>) : undefined,
          label: typeof o.label === "string" ? o.label : undefined,
        });
      } else if (
        op === "connect" &&
        typeof o.fromRef === "string" &&
        typeof o.toRef === "string" &&
        typeof o.fromPort === "string" &&
        typeof o.toPort === "string"
      ) {
        commands.push({
          op: "connect",
          fromRef: o.fromRef,
          fromPort: o.fromPort,
          toRef: o.toRef,
          toPort: o.toPort,
        });
      } else if (
        op === "connectIds" &&
        typeof o.fromNodeId === "string" &&
        typeof o.toNodeId === "string" &&
        typeof o.fromPort === "string" &&
        typeof o.toPort === "string"
      ) {
        commands.push({
          op: "connectIds",
          fromNodeId: o.fromNodeId,
          fromPort: o.fromPort,
          toNodeId: o.toNodeId,
          toPort: o.toPort,
        });
      } else if (op === "setParams" && typeof o.ref === "string" && o.parameters && typeof o.parameters === "object") {
        commands.push({ op: "setParams", ref: o.ref, parameters: o.parameters as Record<string, unknown> });
      } else if (op === "setParamsById" && typeof o.nodeId === "string" && o.parameters && typeof o.parameters === "object") {
        commands.push({ op: "setParamsById", nodeId: o.nodeId, parameters: o.parameters as Record<string, unknown> });
      } else if (op === "removeNode" && typeof o.ref === "string") commands.push({ op: "removeNode", ref: o.ref });
      else if (op === "removeNodeById" && typeof o.nodeId === "string") commands.push({ op: "removeNodeById", nodeId: o.nodeId });
    }

    return { message: message || "Done.", commands };
  } catch {
    return { message: raw.trim(), commands: [] };
  }
}
