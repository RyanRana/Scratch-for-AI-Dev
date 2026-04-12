// ============================================================================
// Graph Serialization — JSON format
// ============================================================================

import type { Graph } from "../graph/types.js";

const CURRENT_VERSION = 1;

export interface SerializedGraph {
  version: number;
  graph: Graph;
  savedAt: string;
}

/** Serialize a graph to a JSON string */
export function serializeGraph(graph: Graph): string {
  const doc: SerializedGraph = {
    version: CURRENT_VERSION,
    graph,
    savedAt: new Date().toISOString(),
  };
  return JSON.stringify(doc, null, 2);
}

/** Deserialize a JSON string back into a Graph */
export function deserializeGraph(json: string): Graph {
  const doc: SerializedGraph = JSON.parse(json);

  if (typeof doc.version !== "number") {
    throw new Error("Invalid graph document: missing version");
  }
  if (doc.version > CURRENT_VERSION) {
    throw new Error(
      `Graph version ${doc.version} is newer than supported (${CURRENT_VERSION})`
    );
  }
  if (!doc.graph || typeof doc.graph.id !== "string") {
    throw new Error("Invalid graph document: missing graph data");
  }

  return doc.graph;
}

/** Export graph as a downloadable blob URL (for browser use) */
export function graphToDownloadUrl(graph: Graph): string {
  const json = serializeGraph(graph);
  const blob = new Blob([json], { type: "application/json" });
  return URL.createObjectURL(blob);
}
