// ============================================================================
// Build a graph from arbitrary Python source (import .py without embedded JSON)
// ============================================================================

import { parser } from "@lezer/python";
import type { BlockRegistry } from "@ai-blocks/block-schemas";
import { addEdge, addNode, createGraph } from "../graph/graph.js";
import { layoutGraphBalanced } from "../graph/layoutBalanced.js";
import type { Graph } from "../graph/types.js";
import { classifyStatement, type SymbolBinding } from "./pythonHeuristics.js";

const SNIPPET_BLOCK_ID = "utilities.python-snippet";

export interface GraphFromPythonOptions {
  /** Pipeline title (e.g. derived from filename) */
  name?: string;
}

/**
 * Split source into top-level statement chunks using a Python 3 grammar (Lezer).
 * Falls back to a single chunk when the parse yields nothing usable.
 */
export function splitPythonTopLevelStatements(source: string): string[] {
  const normalized = source.replace(/^\uFEFF/, "");
  const tree = parser.parse(normalized);
  const out: string[] = [];
  let n = tree.topNode.firstChild;
  while (n) {
    if (n.name === "⚠") {
      n = n.nextSibling;
      continue;
    }
    const slice = normalized.slice(n.from, n.to);
    if (slice.trim().length === 0) {
      n = n.nextSibling;
      continue;
    }
    out.push(slice);
    n = n.nextSibling;
  }
  if (out.length === 0) {
    const t = normalized.trim();
    return [t.length > 0 ? normalized : "pass"];
  }
  return out;
}

function shortLabel(chunk: string, index: number): string {
  const line = (chunk.trim().split(/\r?\n/)[0] ?? "").trim();
  if (!line) return `Step ${index + 1}`;
  if (line.length > 52) return `Step ${index + 1}: ${line.slice(0, 49)}…`;
  return `Step ${index + 1}: ${line}`;
}

/**
 * Turn arbitrary Python into a graph: pattern-match statements to real blocks when
 * possible, wire data dependencies by variable name, and fall back to Python Snippet.
 */
export function graphFromPythonSource(
  source: string,
  registry: BlockRegistry,
  options?: GraphFromPythonOptions
): Graph {
  const snippetDef = registry.get(SNIPPET_BLOCK_ID);
  if (!snippetDef) {
    throw new Error(`Block "${SNIPPET_BLOCK_ID}" is not registered`);
  }

  const chunks = splitPythonTopLevelStatements(source);
  const graph = createGraph(options?.name ?? "Imported Python");
  graph.metadata = { ...graph.metadata, importSource: "python-text", importHeuristic: true };

  const env = new Map<string, SymbolBinding>();

  const placeholder = { x: 0, y: 0 };

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const pos = placeholder;
    const classified = classifyStatement(chunk);

    if (classified.kind === "snippet") {
      addNode(graph, snippetDef, pos, {
        parameters: { source: chunk },
        label: shortLabel(chunk, i),
        importOrder: i,
      });
      continue;
    }

    const def = registry.get(classified.block.blockId);
    if (!def) {
      addNode(graph, snippetDef, pos, {
        parameters: { source: chunk },
        label: shortLabel(chunk, i),
        importOrder: i,
      });
      continue;
    }

    const node = addNode(graph, def, pos, {
      parameters: classified.block.params,
      label: def.name,
      importOrder: i,
    });

    for (const [portId, varName] of Object.entries(classified.block.inputWires)) {
      if (!varName) continue;
      const sym = env.get(varName);
      if (sym) {
        addEdge(graph, sym.nodeId, sym.portId, node.id, portId);
      }
    }

    for (const out of def.outputs) {
      const pyName = classified.block.outputNames[out.id];
      if (pyName) {
        env.set(pyName, { nodeId: node.id, portId: out.id, portType: out.type });
      }
    }
  }

  layoutGraphBalanced(graph);
  return graph;
}
