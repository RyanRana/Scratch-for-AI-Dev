// ============================================================================
// Build a graph from a Claude / LLM JSON import plan (registry blocks only)
// ============================================================================

import type { BlockRegistry } from "@ai-blocks/block-schemas";
import { addEdge, addNode, createGraph } from "../graph/graph.js";
import { layoutGraphBalanced } from "../graph/layoutBalanced.js";
import { resolveAssistantConnection } from "../graph/resolveAssistantConnection.js";
import type { Graph } from "../graph/types.js";

const SNIPPET = "utilities.python-snippet";

export interface ImportPlanNode {
  blockId: string;
  parameters?: Record<string, unknown>;
  label?: string;
}

export interface ImportPlanEdge {
  fromIdx: number;
  fromPort: string;
  toIdx: number;
  toPort: string;
}

export interface ImportPlan {
  nodes: ImportPlanNode[];
  edges: ImportPlanEdge[];
}

export interface GraphFromImportPlanOptions {
  name?: string;
}

/**
 * Turn a validated import plan into a graph. Unknown blockIds become Python Snippet
 * with a short comment (never inventing new block types).
 */
export function graphFromImportPlan(
  plan: ImportPlan,
  registry: BlockRegistry,
  options?: GraphFromImportPlanOptions
): Graph {
  const graph = createGraph(options?.name ?? "Imported Pipeline");
  graph.metadata = { ...graph.metadata, importSource: "claude-plan" };

  const nodeIds: string[] = [];
  const placeholder = { x: 0, y: 0 };

  for (let i = 0; i < plan.nodes.length; i++) {
    const spec = plan.nodes[i];
    const def = registry.get(spec.blockId);
    const snippetDef = registry.get(SNIPPET);

    if (!def) {
      if (!snippetDef) throw new Error(`Registry missing "${SNIPPET}"`);
      const node = addNode(graph, snippetDef, placeholder, {
        parameters: {
          source: `# Unknown blockId "${spec.blockId}" (not in registry).\npass`,
        },
        label: spec.label ?? "Python Snippet",
        importOrder: i,
      });
      nodeIds.push(node.id);
      continue;
    }

    const node = addNode(graph, def, placeholder, {
      parameters: spec.parameters,
      label: spec.label ?? def.name,
      importOrder: i,
    });
    nodeIds.push(node.id);
  }

  for (const e of plan.edges) {
    const a = nodeIds[e.fromIdx];
    const b = nodeIds[e.toIdx];
    if (!a || !b) continue;
    const resolved = resolveAssistantConnection(registry, graph, a, e.fromPort, b, e.toPort);
    if (resolved) {
      addEdge(
        graph,
        resolved.sourceNodeId,
        resolved.sourcePortId,
        resolved.targetNodeId,
        resolved.targetPortId
      );
    }
  }

  layoutGraphBalanced(graph);
  return graph;
}

/** Extract JSON object from model output (handles ```json fences). */
export function parseImportPlanJson(text: string): ImportPlan {
  let raw = text.trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) raw = fence[1].trim();

  const data = JSON.parse(raw) as unknown;
  if (!data || typeof data !== "object") throw new Error("Expected JSON object");

  const obj = data as Record<string, unknown>;
  const nodes = obj.nodes;
  const edges = obj.edges;
  if (!Array.isArray(nodes)) throw new Error('JSON must include "nodes" array');

  const outNodes: ImportPlanNode[] = nodes.map((n, i) => {
    if (!n || typeof n !== "object") throw new Error(`nodes[${i}] invalid`);
    const o = n as Record<string, unknown>;
    if (typeof o.blockId !== "string" || !o.blockId) {
      throw new Error(`nodes[${i}].blockId required`);
    }
    return {
      blockId: o.blockId,
      parameters:
        o.parameters && typeof o.parameters === "object"
          ? (o.parameters as Record<string, unknown>)
          : undefined,
      label: typeof o.label === "string" ? o.label : undefined,
    };
  });

  const outEdges: ImportPlanEdge[] = [];
  if (Array.isArray(edges)) {
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      if (!e || typeof e !== "object") continue;
      const o = e as Record<string, unknown>;
      const fromIdx = Number(o.fromIdx);
      const toIdx = Number(o.toIdx);
      const fromPort = String(o.fromPort ?? "");
      const toPort = String(o.toPort ?? "");
      if (!Number.isInteger(fromIdx) || !Number.isInteger(toIdx) || !fromPort || !toPort) continue;
      outEdges.push({ fromIdx, fromPort, toIdx, toPort });
    }
  }

  return { nodes: outNodes, edges: outEdges };
}
