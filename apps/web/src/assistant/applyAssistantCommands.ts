// ============================================================================
// Apply structured assistant commands to the graph (add/connect/edit/remove)
// ============================================================================

import type { BlockRegistry } from "@ai-blocks/block-schemas";
import {
  type Graph,
  createGraph,
  addNode,
  addEdge,
  removeNode,
  updateNodeParams,
  resolveAssistantConnection,
  autoWireRequiredInputs,
} from "@ai-blocks/core";
import { graphFromImportPlan, type ImportPlan } from "@ai-blocks/core";

export type AssistantCommand =
  | { op: "clear" }
  | { op: "setName"; name: string }
  /** Replace entire canvas with a valid import plan (registry blockIds only). */
  | { op: "replaceGraph"; plan: ImportPlan }
  | { op: "addNode"; ref: string; blockId: string; x: number; y: number; parameters?: Record<string, unknown>; label?: string }
  | { op: "connect"; fromRef: string; fromPort: string; toRef: string; toPort: string }
  | { op: "connectIds"; fromNodeId: string; fromPort: string; toNodeId: string; toPort: string }
  | { op: "setParams"; ref: string; parameters: Record<string, unknown> }
  | { op: "setParamsById"; nodeId: string; parameters: Record<string, unknown> }
  | { op: "removeNode"; ref: string }
  | { op: "removeNodeById"; nodeId: string };

function cloneGraph(g: Graph): Graph {
  return JSON.parse(JSON.stringify(g)) as Graph;
}

export function applyAssistantCommands(
  graph: Graph,
  registry: BlockRegistry,
  commands: AssistantCommand[]
): { graph: Graph; log: string[] } {
  const log: string[] = [];
  let g = cloneGraph(graph);
  const refToId: Record<string, string> = {};

  const resolveRef = (ref: string): string | undefined => refToId[ref];

  for (const cmd of commands) {
    try {
      switch (cmd.op) {
        case "clear": {
          g = createGraph(g.name);
          Object.keys(refToId).forEach((k) => delete refToId[k]);
          log.push("Cleared canvas.");
          break;
        }
        case "setName": {
          g.name = cmd.name;
          log.push(`Pipeline name → "${cmd.name}".`);
          break;
        }
        case "replaceGraph": {
          g = graphFromImportPlan(cmd.plan, registry, { name: g.name });
          Object.keys(refToId).forEach((k) => delete refToId[k]);
          log.push(`Replaced graph (${cmd.plan.nodes.length} nodes).`);
          break;
        }
        case "addNode": {
          const def = registry.get(cmd.blockId);
          if (!def) {
            log.push(`Skip addNode: unknown blockId "${cmd.blockId}".`);
            break;
          }
          const node = addNode(g, def, { x: cmd.x, y: cmd.y }, { parameters: cmd.parameters, label: cmd.label });
          refToId[cmd.ref] = node.id;
          log.push(`Added ${cmd.blockId} as "${cmd.ref}" → ${node.id}.`);
          break;
        }
        case "connect": {
          const a = resolveRef(cmd.fromRef);
          const b = resolveRef(cmd.toRef);
          if (!a || !b) {
            log.push(
              `Skip connect: unknown ref (from "${cmd.fromRef}"=${a ?? "?"} to "${cmd.toRef}"=${b ?? "?"}).`
            );
            break;
          }
          const resolved = resolveAssistantConnection(registry, g, a, cmd.fromPort, b, cmd.toPort);
          if (!resolved) {
            log.push(
              `Skip connect: no valid output→input pair (${cmd.fromRef}.${cmd.fromPort} → ${cmd.toRef}.${cmd.toPort}).`
            );
            break;
          }
          const e = addEdge(
            g,
            resolved.sourceNodeId,
            resolved.sourcePortId,
            resolved.targetNodeId,
            resolved.targetPortId
          );
          if (e) {
            const used = `${resolved.sourcePortId}→${resolved.targetPortId}`;
            const asked = `${cmd.fromPort}→${cmd.toPort}`;
            log.push(
              asked === used
                ? `Connected ${cmd.fromRef} → ${cmd.toRef} (${used}).`
                : `Connected ${cmd.fromRef} → ${cmd.toRef} (resolved ${asked} to ${used}).`
            );
          } else log.push(`Skip connect (duplicate edge).`);
          break;
        }
        case "connectIds": {
          const resolved = resolveAssistantConnection(
            registry,
            g,
            cmd.fromNodeId,
            cmd.fromPort,
            cmd.toNodeId,
            cmd.toPort
          );
          if (!resolved) {
            log.push(
              `Skip connectIds: could not resolve ports (${cmd.fromNodeId}.${cmd.fromPort} → ${cmd.toNodeId}.${cmd.toPort}).`
            );
            break;
          }
          const e = addEdge(
            g,
            resolved.sourceNodeId,
            resolved.sourcePortId,
            resolved.targetNodeId,
            resolved.targetPortId
          );
          if (e) {
            log.push(
              `Connected ${resolved.sourceNodeId}.${resolved.sourcePortId} → ${resolved.targetNodeId}.${resolved.targetPortId}.`
            );
          } else log.push(`Skip connectIds (duplicate edge).`);
          break;
        }
        case "setParams": {
          const id = resolveRef(cmd.ref);
          if (!id) {
            log.push(`Skip setParams: unknown ref "${cmd.ref}".`);
            break;
          }
          updateNodeParams(g, id, cmd.parameters);
          log.push(`Updated parameters on "${cmd.ref}".`);
          break;
        }
        case "setParamsById": {
          if (!g.nodes[cmd.nodeId]) {
            log.push(`Skip setParamsById: unknown node "${cmd.nodeId}".`);
            break;
          }
          updateNodeParams(g, cmd.nodeId, cmd.parameters);
          log.push(`Updated parameters on ${cmd.nodeId}.`);
          break;
        }
        case "removeNode": {
          const id = resolveRef(cmd.ref);
          if (!id) {
            log.push(`Skip removeNode: unknown ref "${cmd.ref}".`);
            break;
          }
          removeNode(g, id);
          for (const [k, v] of Object.entries(refToId)) {
            if (v === id) delete refToId[k];
          }
          log.push(`Removed node "${cmd.ref}".`);
          break;
        }
        case "removeNodeById": {
          if (!g.nodes[cmd.nodeId]) {
            log.push(`Skip removeNodeById: unknown node.`);
            break;
          }
          removeNode(g, cmd.nodeId);
          for (const [k, v] of Object.entries(refToId)) {
            if (v === cmd.nodeId) delete refToId[k];
          }
          log.push(`Removed node ${cmd.nodeId}.`);
          break;
        }
      }
    } catch (e) {
      log.push(`Error on ${JSON.stringify(cmd).slice(0, 80)}…: ${(e as Error).message}`);
    }
  }

  const wired = autoWireRequiredInputs(g, registry);
  if (wired > 0) {
    log.push(`Auto-wired ${wired} missing required input(s).`);
  }

  return { graph: g, log };
}
