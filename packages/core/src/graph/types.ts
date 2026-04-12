// ============================================================================
// Graph Model Types
// Runtime representation of a visual block pipeline
// ============================================================================

import type { PortType } from "@ai-blocks/block-schemas";

/** Position of a node on the canvas */
export interface Position {
  x: number;
  y: number;
}

/** Dimensions of a node */
export interface Size {
  width: number;
  height: number;
}

/** A node instance on the canvas — references a BlockDefinition by blockId */
export interface GraphNode {
  id: string;
  blockId: string; // references BlockDefinition.id
  position: Position;
  size?: Size;
  label?: string; // user-defined override of block name
  parameters: Record<string, unknown>; // current parameter values
  collapsed?: boolean;

  /** Original statement index when built from Python import (ties topological sort) */
  importOrder?: number;

  // For scope blocks (if/else, loops): child node ids per branch
  branchChildren?: Record<string, string[]>;
}

/** A connection between two ports */
export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
}

/** Top-level graph document */
export interface Graph {
  id: string;
  name: string;
  description?: string;
  nodes: Record<string, GraphNode>;
  edges: Record<string, GraphEdge>;
  metadata?: Record<string, unknown>;
  version: number; // schema version for migrations
}

/** Validation error on a graph */
export interface GraphError {
  type: "disconnected_required" | "type_mismatch" | "cycle" | "missing_param" | "duplicate_edge";
  nodeId: string;
  portId?: string;
  edgeId?: string;
  message: string;
}

/** Result of resolving a port on a node */
export interface ResolvedPort {
  nodeId: string;
  portId: string;
  portType: PortType;
  portName: string;
}
