// ============================================================================
// Resolve AI/assistant edge guesses → valid output→input port pairs
// ============================================================================

import type { BlockDefinition, BlockRegistry, PortDefinition } from "@ai-blocks/block-schemas";
import { arePortsCompatible } from "@ai-blocks/block-schemas";
import type { Graph } from "./types.js";

export interface ResolvedAssistantEdge {
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "_");
}

function matchPortHint(port: PortDefinition, guess: string): boolean {
  const g = norm(guess);
  if (!g) return false;
  if (norm(port.id) === g || norm(port.name) === g) return true;
  return false;
}

interface Pair {
  out: PortDefinition;
  in: PortDefinition;
}

function compatiblePairs(src: BlockDefinition, tgt: BlockDefinition): Pair[] {
  const pairs: Pair[] = [];
  for (const o of src.outputs) {
    for (const i of tgt.inputs) {
      if (arePortsCompatible(o.type, i.type)) pairs.push({ out: o, in: i });
    }
  }
  return pairs;
}

/**
 * Try one orientation: data flows srcNode → tgtNode (src output → tgt input).
 */
function tryOriented(
  srcDef: BlockDefinition,
  tgtDef: BlockDefinition,
  srcNodeId: string,
  tgtNodeId: string,
  hintOut: string,
  hintIn: string
): ResolvedAssistantEdge | null {
  const pairs = compatiblePairs(srcDef, tgtDef);
  if (pairs.length === 0) return null;

  const outByHint = hintOut.trim()
    ? srcDef.outputs.find((p) => matchPortHint(p, hintOut))
    : undefined;
  const inByHint = hintIn.trim()
    ? tgtDef.inputs.find((p) => matchPortHint(p, hintIn))
    : undefined;

  if (outByHint && inByHint && arePortsCompatible(outByHint.type, inByHint.type)) {
    return {
      sourceNodeId: srcNodeId,
      sourcePortId: outByHint.id,
      targetNodeId: tgtNodeId,
      targetPortId: inByHint.id,
    };
  }

  if (outByHint) {
    const ins = tgtDef.inputs.filter((i) => arePortsCompatible(outByHint.type, i.type));
    if (ins.length === 1) {
      return {
        sourceNodeId: srcNodeId,
        sourcePortId: outByHint.id,
        targetNodeId: tgtNodeId,
        targetPortId: ins[0].id,
      };
    }
  }

  if (inByHint) {
    const outs = srcDef.outputs.filter((o) => arePortsCompatible(o.type, inByHint.type));
    if (outs.length === 1) {
      return {
        sourceNodeId: srcNodeId,
        sourcePortId: outs[0].id,
        targetNodeId: tgtNodeId,
        targetPortId: inByHint.id,
      };
    }
  }

  const both = pairs.filter(
    ({ out, in: inp }) =>
      (hintOut.trim() ? matchPortHint(out, hintOut) : true) &&
      (hintIn.trim() ? matchPortHint(inp, hintIn) : true)
  );
  if (both.length === 1) {
    return {
      sourceNodeId: srcNodeId,
      sourcePortId: both[0].out.id,
      targetNodeId: tgtNodeId,
      targetPortId: both[0].in.id,
    };
  }

  if (pairs.length === 1) {
    return {
      sourceNodeId: srcNodeId,
      sourcePortId: pairs[0].out.id,
      targetNodeId: tgtNodeId,
      targetPortId: pairs[0].in.id,
    };
  }

  const requiredInIds = new Set(tgtDef.inputs.filter((i) => i.required).map((i) => i.id));
  const toRequired = pairs.filter((p) => requiredInIds.has(p.in.id));
  if (toRequired.length === 1) {
    return {
      sourceNodeId: srcNodeId,
      sourcePortId: toRequired[0].out.id,
      targetNodeId: tgtNodeId,
      targetPortId: toRequired[0].in.id,
    };
  }

  if (hintOut.trim()) {
    const h = pairs.filter(({ out }) => matchPortHint(out, hintOut));
    if (h.length === 1) {
      return {
        sourceNodeId: srcNodeId,
        sourcePortId: h[0].out.id,
        targetNodeId: tgtNodeId,
        targetPortId: h[0].in.id,
      };
    }
  }
  if (hintIn.trim()) {
    const h = pairs.filter(({ in: inp }) => matchPortHint(inp, hintIn));
    if (h.length === 1) {
      return {
        sourceNodeId: srcNodeId,
        sourcePortId: h[0].out.id,
        targetNodeId: tgtNodeId,
        targetPortId: h[0].in.id,
      };
    }
  }

  return null;
}

/**
 * Map assistant/model port guesses to a real edge. Tries correct orientation, swapped
 * (model listed input→output backwards), then unique compatible type pairs.
 */
export function resolveAssistantConnection(
  registry: BlockRegistry,
  graph: Graph,
  nodeA: string,
  portA: string,
  nodeB: string,
  portB: string
): ResolvedAssistantEdge | null {
  const na = graph.nodes[nodeA];
  const nb = graph.nodes[nodeB];
  if (!na || !nb) return null;
  const da = registry.get(na.blockId);
  const db = registry.get(nb.blockId);
  if (!da || !db) return null;

  return (
    tryOriented(da, db, nodeA, nodeB, portA, portB) ??
    tryOriented(db, da, nodeB, nodeA, portB, portA)
  );
}
