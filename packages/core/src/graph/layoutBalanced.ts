// ============================================================================
// Balanced DAG layout — even spacing with symmetric fork/merge positioning
// ============================================================================

import { topologicalSort } from "./graph.js";
import type { Graph } from "./types.js";

const NODE_WIDTH = 240;
const X_STEP = 320;      // horizontal gap between layers
const Y_GAP = 180;       // vertical gap between nodes in same layer
const MARGIN_X = 80;
const MARGIN_Y = 300;

/**
 * Build adjacency maps: predecessors and successors for each node.
 */
function buildAdjacency(graph: Graph, ids: string[]) {
  const pred = new Map<string, string[]>();
  const succ = new Map<string, string[]>();
  for (const id of ids) {
    pred.set(id, []);
    succ.set(id, []);
  }
  for (const e of Object.values(graph.edges)) {
    pred.get(e.targetNodeId)?.push(e.sourceNodeId);
    succ.get(e.sourceNodeId)?.push(e.targetNodeId);
  }
  return { pred, succ };
}

/**
 * Assign each node to a layer based on longest-path from sources.
 */
function assignLayers(ids: string[], pred: Map<string, string[]>): Map<string, number> {
  const layer = new Map<string, number>();
  for (const id of ids) layer.set(id, 0);

  let changed = true;
  let guard = 0;
  while (changed && guard < ids.length + 2) {
    guard++;
    changed = false;
    for (const id of ids) {
      const ps = pred.get(id) ?? [];
      if (ps.length === 0) continue;
      const nl = Math.max(...ps.map((p) => layer.get(p) ?? 0)) + 1;
      if (nl > (layer.get(id) ?? 0)) {
        layer.set(id, nl);
        changed = true;
      }
    }
  }
  return layer;
}

/**
 * Group nodes by layer and sort within each layer.
 * Merge nodes (multiple predecessors) are placed at the average y of their parents.
 */
function groupByLayer(
  ids: string[],
  layer: Map<string, number>,
  graph: Graph,
  pred: Map<string, string[]>
): { maxL: number; byLayer: Map<number, string[]> } {
  let maxL = 0;
  const byLayer = new Map<number, string[]>();
  for (const id of ids) {
    const L = layer.get(id) ?? 0;
    maxL = Math.max(maxL, L);
    if (!byLayer.has(L)) byLayer.set(L, []);
    byLayer.get(L)!.push(id);
  }

  // Sort layer 0 by import order
  const layer0 = byLayer.get(0) ?? [];
  layer0.sort((a, b) => {
    const oa = graph.nodes[a]?.importOrder ?? 0;
    const ob = graph.nodes[b]?.importOrder ?? 0;
    return oa !== ob ? oa - ob : a.localeCompare(b);
  });

  // Sort subsequent layers by average parent import order
  for (let L = 1; L <= maxL; L++) {
    const row = byLayer.get(L) ?? [];
    row.sort((a, b) => {
      const avgA = avgImportOrder(a, pred, graph);
      const avgB = avgImportOrder(b, pred, graph);
      return avgA !== avgB ? avgA - avgB : a.localeCompare(b);
    });
  }

  return { maxL, byLayer };
}

function avgImportOrder(id: string, pred: Map<string, string[]>, graph: Graph): number {
  const ps = pred.get(id) ?? [];
  if (ps.length === 0) return graph.nodes[id]?.importOrder ?? 0;
  let s = 0, n = 0;
  for (const p of ps) {
    const o = graph.nodes[p]?.importOrder;
    if (typeof o === "number") { s += o; n++; }
  }
  return n > 0 ? s / n : graph.nodes[id]?.importOrder ?? 0;
}

/**
 * Balanced layout: assigns positions layer-by-layer, then repositions merge
 * nodes to sit at the vertical midpoint of their predecessors for symmetry.
 */
export function layoutGraphBalanced(graph: Graph): void {
  const ids = Object.keys(graph.nodes);
  if (ids.length === 0) return;

  // Cycle fallback — simple grid
  if (topologicalSort(graph) === null) {
    const sorted = [...ids].sort((a, b) => {
      const oa = graph.nodes[a]?.importOrder ?? 0;
      const ob = graph.nodes[b]?.importOrder ?? 0;
      return oa !== ob ? oa - ob : a.localeCompare(b);
    });
    sorted.forEach((id, k) => {
      const node = graph.nodes[id];
      if (node) {
        node.position = {
          x: MARGIN_X + (k % 4) * (NODE_WIDTH + 80),
          y: MARGIN_Y + Math.floor(k / 4) * Y_GAP,
        };
      }
    });
    return;
  }

  const { pred, succ } = buildAdjacency(graph, ids);
  const layer = assignLayers(ids, pred);
  const { maxL, byLayer } = groupByLayer(ids, layer, graph, pred);

  // --- Pass 1: initial even spacing per layer, centered at MARGIN_Y ---
  const yPos = new Map<string, number>();

  for (let L = 0; L <= maxL; L++) {
    const row = byLayer.get(L) ?? [];
    const span = (row.length - 1) * Y_GAP;
    row.forEach((id, k) => {
      yPos.set(id, MARGIN_Y - span / 2 + k * Y_GAP);
    });
  }

  // --- Pass 2: reposition merge nodes to the centroid of their parents ---
  // Process layers left-to-right so parent positions are final.
  for (let L = 1; L <= maxL; L++) {
    const row = byLayer.get(L) ?? [];
    for (const id of row) {
      const parents = pred.get(id) ?? [];
      if (parents.length >= 2) {
        // Center between parents
        const parentYs = parents.map((p) => yPos.get(p) ?? MARGIN_Y);
        const avgY = parentYs.reduce((a, b) => a + b, 0) / parentYs.length;
        yPos.set(id, avgY);
      }
    }

    // After repositioning merges, re-space the layer to avoid overlaps
    // while keeping relative order and trying to honor merge positions.
    resolveOverlaps(row, yPos);
  }

  // --- Pass 3: nudge fork children toward symmetry ---
  // For nodes with multiple children in the same next layer, spread them
  // symmetrically around the parent's y position.
  for (let L = 0; L < maxL; L++) {
    const row = byLayer.get(L) ?? [];
    for (const parentId of row) {
      const children = (succ.get(parentId) ?? []).filter(
        (c) => (layer.get(c) ?? 0) === L + 1
      );
      if (children.length < 2) continue;

      const parentY = yPos.get(parentId) ?? MARGIN_Y;
      const span = (children.length - 1) * Y_GAP;

      // Sort children by their current y to preserve relative order
      children.sort((a, b) => (yPos.get(a) ?? 0) - (yPos.get(b) ?? 0));

      children.forEach((cid, k) => {
        yPos.set(cid, parentY - span / 2 + k * Y_GAP);
      });
    }

    // Re-resolve overlaps in the child layer
    const nextRow = byLayer.get(L + 1) ?? [];
    resolveOverlaps(nextRow, yPos);
  }

  // --- Pass 4: final merge re-centering (after fork adjustments) ---
  for (let L = 1; L <= maxL; L++) {
    const row = byLayer.get(L) ?? [];
    for (const id of row) {
      const parents = pred.get(id) ?? [];
      if (parents.length >= 2) {
        const parentYs = parents.map((p) => yPos.get(p) ?? MARGIN_Y);
        const avgY = parentYs.reduce((a, b) => a + b, 0) / parentYs.length;
        yPos.set(id, avgY);
      }
    }
    resolveOverlaps(row, yPos);
  }

  // --- Apply positions ---
  for (const id of ids) {
    const node = graph.nodes[id];
    if (node) {
      node.position = {
        x: MARGIN_X + (layer.get(id) ?? 0) * X_STEP,
        y: yPos.get(id) ?? MARGIN_Y,
      };
    }
  }
}

/**
 * Push overlapping nodes apart while preserving order and staying as close
 * to their desired positions as possible.
 */
function resolveOverlaps(row: string[], yPos: Map<string, number>): void {
  if (row.length <= 1) return;

  const MIN_GAP = Y_GAP * 0.85;  // allow slightly tighter than default

  // Sort by current y
  row.sort((a, b) => (yPos.get(a) ?? 0) - (yPos.get(b) ?? 0));

  // Push down any node that's too close to the one above it
  for (let i = 1; i < row.length; i++) {
    const prevY = yPos.get(row[i - 1]) ?? 0;
    const curY = yPos.get(row[i]) ?? 0;
    if (curY - prevY < MIN_GAP) {
      yPos.set(row[i], prevY + MIN_GAP);
    }
  }

  // Re-center the group around the original centroid to minimize drift
  const ys = row.map((id) => yPos.get(id) ?? 0);
  const currentCenter = ys.reduce((a, b) => a + b, 0) / ys.length;
  const desiredCenter = MARGIN_Y;
  // Only re-center if group drifted significantly
  if (Math.abs(currentCenter - desiredCenter) > Y_GAP * 2) {
    const shift = desiredCenter - currentCenter;
    for (const id of row) {
      yPos.set(id, (yPos.get(id) ?? 0) + shift);
    }
  }
}
