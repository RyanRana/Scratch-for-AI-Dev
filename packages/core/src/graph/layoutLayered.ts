// ============================================================================
// Layered DAG layout — fork/merge pipelines instead of a single horizontal row
// ============================================================================

import { topologicalSort } from "./graph.js";
import type { Graph } from "./types.js";

const X_STEP = 310;
const Y_GAP = 168;
const MARGIN_X = 80;
const MARGIN_Y = 280;

/**
 * Assigns positions from left-to-right layers (topological depth) with vertical
 * stacking per layer. Cycles fall back to a gentle vertical column by import order.
 */
export function layoutGraphAsLayeredDag(graph: Graph): void {
  const ids = Object.keys(graph.nodes);
  if (ids.length === 0) return;

  if (topologicalSort(graph) === null) {
    const sorted = [...ids].sort((a, b) => {
      const oa = graph.nodes[a]?.importOrder;
      const ob = graph.nodes[b]?.importOrder;
      if (oa !== undefined && ob !== undefined && oa !== ob) return oa - ob;
      return a.localeCompare(b);
    });
    sorted.forEach((id, k) => {
      const node = graph.nodes[id];
      if (node) node.position = { x: MARGIN_X + (k % 4) * 280, y: MARGIN_Y + Math.floor(k / 4) * Y_GAP };
    });
    return;
  }

  const pred = new Map<string, string[]>();
  for (const id of ids) pred.set(id, []);
  for (const e of Object.values(graph.edges)) {
    pred.get(e.targetNodeId)?.push(e.sourceNodeId);
  }

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

  let maxL = 0;
  const byLayer = new Map<number, string[]>();
  for (const id of ids) {
    const L = layer.get(id) ?? 0;
    maxL = Math.max(maxL, L);
    if (!byLayer.has(L)) byLayer.set(L, []);
    byLayer.get(L)!.push(id);
  }

  const avgPredImportOrder = (id: string): number => {
    const ps = pred.get(id) ?? [];
    if (ps.length === 0) return graph.nodes[id]?.importOrder ?? 0;
    let s = 0;
    let n = 0;
    for (const p of ps) {
      const o = graph.nodes[p]?.importOrder;
      if (typeof o === "number") {
        s += o;
        n++;
      }
    }
    return n > 0 ? s / n : graph.nodes[id]?.importOrder ?? 0;
  };

  for (let L = 0; L <= maxL; L++) {
    const row = byLayer.get(L) ?? [];
    row.sort((a, b) => {
      if (L === 0) {
        const oa = graph.nodes[a]?.importOrder;
        const ob = graph.nodes[b]?.importOrder;
        if (oa !== undefined && ob !== undefined && oa !== ob) return oa - ob;
        return a.localeCompare(b);
      }
      const da = avgPredImportOrder(a);
      const db = avgPredImportOrder(b);
      if (da !== db) return da - db;
      return a.localeCompare(b);
    });
  }

  for (let L = 0; L <= maxL; L++) {
    const row = byLayer.get(L) ?? [];
    const span = (row.length - 1) * Y_GAP;
    row.forEach((id, k) => {
      const node = graph.nodes[id];
      if (node) {
        node.position = {
          x: MARGIN_X + L * X_STEP,
          y: MARGIN_Y - span / 2 + k * Y_GAP,
        };
      }
    });
  }
}
