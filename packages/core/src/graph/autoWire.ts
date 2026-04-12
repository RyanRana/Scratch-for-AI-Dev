// ============================================================================
// Auto-connect missing required inputs (suggestions, AI-placed nodes, imports)
// ============================================================================

import type { BlockRegistry, PortDefinition } from "@ai-blocks/block-schemas";
import { arePortsCompatible } from "@ai-blocks/block-schemas";
import { addEdge, removeEdge, topologicalSort } from "./graph.js";
import type { Graph, GraphNode } from "./types.js";

const NODE_W = 250;

function scoreDonor(
  srcNode: GraphNode,
  srcOut: PortDefinition,
  tgtNode: GraphNode,
  tgtIn: PortDefinition
): number {
  let s = 0;
  if (srcOut.type === tgtIn.type) s += 100;
  else s += 45;
  if (srcNode.position.x + NODE_W <= tgtNode.position.x + 40) s += 35;
  else if (srcNode.position.x < tgtNode.position.x) s += 18;
  const midSrc = srcNode.position.x + NODE_W / 2;
  const midTgt = tgtNode.position.x + NODE_W / 2;
  const dx = Math.abs(midSrc - midTgt);
  s += Math.max(0, 30 - dx / 40);
  return s;
}

/**
 * For every required input that has no incoming edge, add the best compatible
 * upstream edge that keeps the graph acyclic. Repeats until no progress.
 */
export function autoWireRequiredInputs(
  graph: Graph,
  registry: BlockRegistry,
  options?: { maxPasses?: number }
): number {
  const maxPasses = options?.maxPasses ?? 12;
  let total = 0;
  const nodeIds = () => Object.keys(graph.nodes).sort();

  for (let pass = 0; pass < maxPasses; pass++) {
    let progress = false;
    for (const tgtId of nodeIds()) {
      const tgtNode = graph.nodes[tgtId];
      const tgtDef = registry.get(tgtNode.blockId);
      if (!tgtDef) continue;

      for (const inPort of tgtDef.inputs) {
        if (!inPort.required) continue;
        const hasIn = Object.values(graph.edges).some(
          (e) => e.targetNodeId === tgtId && e.targetPortId === inPort.id
        );
        if (hasIn) continue;

        let best: { score: number; srcId: string; srcOutId: string } | null = null;
        for (const srcId of nodeIds()) {
          if (srcId === tgtId) continue;
          const srcNode = graph.nodes[srcId];
          const srcDef = registry.get(srcNode.blockId);
          if (!srcDef) continue;
          for (const outPort of srcDef.outputs) {
            if (!arePortsCompatible(outPort.type, inPort.type)) continue;
            const score = scoreDonor(srcNode, outPort, tgtNode, inPort);
            if (!best || score > best.score) {
              best = { score, srcId, srcOutId: outPort.id };
            }
          }
        }
        if (!best) continue;

        const edge = addEdge(graph, best.srcId, best.srcOutId, tgtId, inPort.id);
        if (!edge) continue;
        if (topologicalSort(graph) === null) {
          removeEdge(graph, edge.id);
          continue;
        }
        total++;
        progress = true;
      }
    }
    if (!progress) break;
  }

  return total;
}
