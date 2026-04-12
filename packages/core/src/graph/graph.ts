// ============================================================================
// Graph — mutable graph model with operations
// ============================================================================

import {
  type BlockDefinition,
  type BlockRegistry,
  arePortsCompatible,
} from "@ai-blocks/block-schemas";
import type { Graph, GraphNode, GraphEdge, GraphError, Position } from "./types.js";

let _counter = 0;
function uid(): string {
  return `n_${Date.now().toString(36)}_${(++_counter).toString(36)}`;
}

// ── Factory ────────────────────────────────────────────────────────────────

export function createGraph(name = "Untitled Pipeline"): Graph {
  return {
    id: uid(),
    name,
    description: "",
    nodes: {},
    edges: {},
    version: 1,
  };
}

// ── Node operations ────────────────────────────────────────────────────────

export function addNode(
  graph: Graph,
  blockDef: BlockDefinition,
  position: Position,
  overrides?: Partial<Pick<GraphNode, "label" | "parameters" | "importOrder">>
): GraphNode {
  const id = uid();
  const parameters: Record<string, unknown> = {};
  for (const p of blockDef.parameters) {
    parameters[p.id] = overrides?.parameters?.[p.id] ?? p.default;
  }

  const node: GraphNode = {
    id,
    blockId: blockDef.id,
    position,
    parameters,
    label: overrides?.label,
    importOrder: overrides?.importOrder,
  };

  if (blockDef.branches && blockDef.branches.length > 0) {
    node.branchChildren = {};
    for (const b of blockDef.branches) {
      node.branchChildren[b.id] = [];
    }
  }

  graph.nodes[id] = node;
  return node;
}

export function removeNode(graph: Graph, nodeId: string): void {
  // Remove all edges connected to this node
  for (const [edgeId, edge] of Object.entries(graph.edges)) {
    if (edge.sourceNodeId === nodeId || edge.targetNodeId === nodeId) {
      delete graph.edges[edgeId];
    }
  }
  // Remove from any parent scope branches
  for (const node of Object.values(graph.nodes)) {
    if (node.branchChildren) {
      for (const branchId of Object.keys(node.branchChildren)) {
        node.branchChildren[branchId] = node.branchChildren[branchId].filter(
          (id) => id !== nodeId
        );
      }
    }
  }
  delete graph.nodes[nodeId];
}

export function moveNode(graph: Graph, nodeId: string, position: Position): void {
  const node = graph.nodes[nodeId];
  if (node) node.position = position;
}

export function updateNodeParams(
  graph: Graph,
  nodeId: string,
  params: Record<string, unknown>
): void {
  const node = graph.nodes[nodeId];
  if (node) {
    node.parameters = { ...node.parameters, ...params };
  }
}

// ── Edge operations ────────────────────────────────────────────────────────

export function addEdge(
  graph: Graph,
  sourceNodeId: string,
  sourcePortId: string,
  targetNodeId: string,
  targetPortId: string
): GraphEdge | null {
  // Prevent self-connections
  if (sourceNodeId === targetNodeId) return null;

  // Prevent duplicate edges
  for (const edge of Object.values(graph.edges)) {
    if (
      edge.sourceNodeId === sourceNodeId &&
      edge.sourcePortId === sourcePortId &&
      edge.targetNodeId === targetNodeId &&
      edge.targetPortId === targetPortId
    ) {
      return null;
    }
  }

  const id = uid();
  const edge: GraphEdge = { id, sourceNodeId, sourcePortId, targetNodeId, targetPortId };
  graph.edges[id] = edge;
  return edge;
}

export function removeEdge(graph: Graph, edgeId: string): void {
  delete graph.edges[edgeId];
}

/** Remove all edges connected to a specific port */
export function disconnectPort(graph: Graph, nodeId: string, portId: string): void {
  for (const [edgeId, edge] of Object.entries(graph.edges)) {
    if (
      (edge.sourceNodeId === nodeId && edge.sourcePortId === portId) ||
      (edge.targetNodeId === nodeId && edge.targetPortId === portId)
    ) {
      delete graph.edges[edgeId];
    }
  }
}

// ── Queries ────────────────────────────────────────────────────────────────

export function getIncomingEdges(graph: Graph, nodeId: string): GraphEdge[] {
  return Object.values(graph.edges).filter((e) => e.targetNodeId === nodeId);
}

export function getOutgoingEdges(graph: Graph, nodeId: string): GraphEdge[] {
  return Object.values(graph.edges).filter((e) => e.sourceNodeId === nodeId);
}

export function getConnectedPort(
  graph: Graph,
  nodeId: string,
  portId: string,
  direction: "input" | "output"
): GraphEdge | undefined {
  return Object.values(graph.edges).find(
    direction === "input"
      ? (e) => e.targetNodeId === nodeId && e.targetPortId === portId
      : (e) => e.sourceNodeId === nodeId && e.sourcePortId === portId
  );
}

// ── Validation ─────────────────────────────────────────────────────────────

export function validateGraph(graph: Graph, registry: BlockRegistry): GraphError[] {
  const errors: GraphError[] = [];

  for (const node of Object.values(graph.nodes)) {
    const blockDef = registry.get(node.blockId);
    if (!blockDef) {
      errors.push({
        type: "missing_param",
        nodeId: node.id,
        message: `Unknown block type "${node.blockId}"`,
      });
      continue;
    }

    // Check required inputs are connected
    for (const input of blockDef.inputs) {
      if (!input.required) continue;
      const connected = Object.values(graph.edges).some(
        (e) => e.targetNodeId === node.id && e.targetPortId === input.id
      );
      if (!connected) {
        errors.push({
          type: "disconnected_required",
          nodeId: node.id,
          portId: input.id,
          message: `Required input "${input.name}" is not connected`,
        });
      }
    }
  }

  // Check type compatibility on edges
  for (const edge of Object.values(graph.edges)) {
    const srcBlock = registry.get(graph.nodes[edge.sourceNodeId]?.blockId ?? "");
    const tgtBlock = registry.get(graph.nodes[edge.targetNodeId]?.blockId ?? "");
    if (!srcBlock || !tgtBlock) continue;

    const srcPort = srcBlock.outputs.find((p: { id: string }) => p.id === edge.sourcePortId);
    const tgtPort = tgtBlock.inputs.find((p: { id: string }) => p.id === edge.targetPortId);

    if (srcPort && tgtPort && !arePortsCompatible(srcPort.type, tgtPort.type)) {
      errors.push({
        type: "type_mismatch",
        nodeId: edge.targetNodeId,
        portId: edge.targetPortId,
        edgeId: edge.id,
        message: `Type mismatch: ${srcPort.type} → ${tgtPort.type}`,
      });
    }
  }

  // Cycle detection via DFS
  const adjacency: Record<string, string[]> = {};
  for (const node of Object.values(graph.nodes)) {
    adjacency[node.id] = [];
  }
  for (const edge of Object.values(graph.edges)) {
    adjacency[edge.sourceNodeId]?.push(edge.targetNodeId);
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    inStack.add(nodeId);
    for (const neighbor of adjacency[nodeId] ?? []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (inStack.has(neighbor)) {
        errors.push({
          type: "cycle",
          nodeId: neighbor,
          message: `Cycle detected involving node "${neighbor}"`,
        });
        return true;
      }
    }
    inStack.delete(nodeId);
    return false;
  }

  for (const nodeId of Object.keys(adjacency)) {
    if (!visited.has(nodeId)) dfs(nodeId);
  }

  return errors;
}

// ── Topological sort ───────────────────────────────────────────────────────

/** Stable tie-break for nodes at the same topological depth (e.g. Python import order). */
function compareImportOrder(graph: Graph, a: string, b: string): number {
  const oa = graph.nodes[a]?.importOrder;
  const ob = graph.nodes[b]?.importOrder;
  if (oa !== undefined && ob !== undefined && oa !== ob) return oa - ob;
  return a.localeCompare(b);
}

/** Kahn's algorithm — returns a valid topological order or null if cycle */
function kahnTopologicalOrder(graph: Graph): string[] | null {
  const inDegree: Record<string, number> = {};
  for (const nodeId of Object.keys(graph.nodes)) {
    inDegree[nodeId] = 0;
  }
  for (const edge of Object.values(graph.edges)) {
    inDegree[edge.targetNodeId] = (inDegree[edge.targetNodeId] ?? 0) + 1;
  }

  const queue: string[] = [];
  for (const [nodeId, deg] of Object.entries(inDegree)) {
    if (deg === 0) queue.push(nodeId);
  }

  const sortKey = (a: string, b: string) => compareImportOrder(graph, a, b);

  const sorted: string[] = [];
  while (queue.length > 0) {
    queue.sort(sortKey);
    const nodeId = queue.shift()!;
    sorted.push(nodeId);
    for (const edge of Object.values(graph.edges)) {
      if (edge.sourceNodeId === nodeId) {
        inDegree[edge.targetNodeId]--;
        if (inDegree[edge.targetNodeId] === 0) {
          queue.push(edge.targetNodeId);
        }
      }
    }
  }

  return sorted.length === Object.keys(graph.nodes).length ? sorted : null;
}

/**
 * Longest-path depth from sources (0 = no incoming edges). Used to break ties
 * in Kahn's order so dependencies run before dependents (same graph, stable order).
 */
function longestPathDepth(graph: Graph, topoOrder: string[]): Record<string, number> {
  const depth: Record<string, number> = {};
  for (const id of Object.keys(graph.nodes)) {
    depth[id] = 0;
  }
  for (const u of topoOrder) {
    for (const edge of Object.values(graph.edges)) {
      if (edge.sourceNodeId !== u) continue;
      const v = edge.targetNodeId;
      depth[v] = Math.max(depth[v], depth[u] + 1);
    }
  }
  return depth;
}

/**
 * Topological sort with deterministic ordering: prefer nodes with smaller
 * dependency depth (closer to sources) so parents run before children.
 */
export function topologicalSort(graph: Graph): string[] | null {
  const firstOrder = kahnTopologicalOrder(graph);
  if (!firstOrder) return null;

  const depth = longestPathDepth(graph, firstOrder);

  const inDegree: Record<string, number> = {};
  for (const nodeId of Object.keys(graph.nodes)) {
    inDegree[nodeId] = 0;
  }
  for (const edge of Object.values(graph.edges)) {
    inDegree[edge.targetNodeId] = (inDegree[edge.targetNodeId] ?? 0) + 1;
  }

  const ready: string[] = [];
  for (const [nodeId, deg] of Object.entries(inDegree)) {
    if (deg === 0) ready.push(nodeId);
  }

  const sorted: string[] = [];
  while (ready.length > 0) {
    ready.sort((a, b) => {
      if (depth[a] !== depth[b]) return depth[a] - depth[b];
      return compareImportOrder(graph, a, b);
    });
    const nodeId = ready.shift()!;
    sorted.push(nodeId);
    for (const edge of Object.values(graph.edges)) {
      if (edge.sourceNodeId === nodeId) {
        inDegree[edge.targetNodeId]--;
        if (inDegree[edge.targetNodeId] === 0) {
          ready.push(edge.targetNodeId);
        }
      }
    }
  }

  return sorted.length === Object.keys(graph.nodes).length ? sorted : null;
}
