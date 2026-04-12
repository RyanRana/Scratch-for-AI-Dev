// ============================================================================
// Python Code Generator
// Transforms a Graph into executable Python code
// ============================================================================

import type { BlockRegistry } from "@ai-blocks/block-schemas";
import type { Graph, GraphNode } from "../graph/types.js";
import { topologicalSort, getIncomingEdges } from "../graph/graph.js";

interface CodeGenOptions {
  /** Include comments showing block names */
  comments?: boolean;
  /** Variable name prefix for block outputs */
  varPrefix?: string;
}

const DEFAULT_OPTIONS: Required<CodeGenOptions> = {
  comments: true,
  varPrefix: "out",
};

/** Sanitize a node id into a valid Python variable name */
function varName(nodeId: string, portId: string, prefix: string): string {
  const clean = nodeId.replace(/[^a-zA-Z0-9]/g, "_");
  return `${prefix}_${clean}_${portId}`;
}

/** Python literal for a parameter value */
function paramToPython(val: unknown): string {
  if (val === undefined || val === null) return "None";
  if (typeof val === "boolean") return val ? "True" : "False";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") return val;
  return JSON.stringify(val) ?? "None";
}

/** Interpolate {{params}}, {{inputs}}, {{outputs}}, {{branches}} in template text */
function interpolate(
  template: string,
  params: Record<string, unknown>,
  inputBindings: Record<string, string>,
  branchBodies: Record<string, string>,
  outputShortNames: Record<string, string> | undefined
): string {
  let result = template;

  // Replace {{params.xxx}}
  result = result.replace(/\{\{params\.(\w+)\}\}/g, (_match, key) => {
    return paramToPython(params[key]);
  });

  // Replace {{inputs.xxx}}
  result = result.replace(/\{\{inputs\.(\w+)\}\}/g, (_match, key) => {
    return inputBindings[key] ?? "None";
  });

  // Replace {{outputs.xxx}} with short local names from outputBindings (e.g. df, rf_model)
  if (outputShortNames) {
    result = result.replace(/\{\{outputs\.(\w+)\}\}/g, (_match, key) => {
      const expr = outputShortNames[key];
      if (expr === undefined) return "None";
      return interpolate(expr, params, inputBindings, branchBodies, undefined);
    });
  }

  // Replace {{branches.xxx}} with indented branch bodies
  result = result.replace(/\{\{branches\.(\w+)\}\}/g, (_match, key) => {
    return branchBodies[key] ?? "pass";
  });

  return result;
}

/** Generate Python code from a graph */
export function generatePython(
  graph: Graph,
  registry: BlockRegistry,
  options?: CodeGenOptions
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const sorted = topologicalSort(graph);
  if (!sorted) {
    throw new Error("Cannot generate code: graph contains cycles");
  }

  const allImports = new Set<string>();
  const setupLines: string[] = [];
  const bodyLines: string[] = [];
  const teardownLines: string[] = [];

  // Map: nodeId:portId -> python variable name
  const outputVarMap = new Map<string, string>();

  for (const nodeId of sorted) {
    const node = graph.nodes[nodeId];
    if (!node) continue;
    const blockDef = registry.get(node.blockId);
    if (!blockDef) continue;

    const template = blockDef.codeTemplate;
    if (!template) continue; // non-pipeline kinds (scaffold/file/…) are handled by ProjectCompiler

    // Collect imports
    for (const imp of template.imports) {
      allImports.add(imp);
    }

    // Build input bindings: which python variable feeds each input port
    const inputBindings: Record<string, string> = {};
    const incoming = getIncomingEdges(graph, nodeId);
    for (const edge of incoming) {
      const srcKey = `${edge.sourceNodeId}:${edge.sourcePortId}`;
      const srcVar = outputVarMap.get(srcKey);
      if (srcVar) {
        inputBindings[edge.targetPortId] = srcVar;
      }
    }

    // Branch bodies (for scope blocks — placeholder pass for now)
    const branchBodies: Record<string, string> = {};
    if (node.branchChildren) {
      for (const [branchId, childIds] of Object.entries(node.branchChildren)) {
        if (childIds.length === 0) {
          branchBodies[branchId] = "pass";
        } else {
          branchBodies[branchId] = `# [${childIds.length} block(s)]`;
        }
      }
    }

    const outputShortNames = template.outputBindings;

    // Generate setup
    if (template.setup) {
      setupLines.push(
        interpolate(template.setup, node.parameters, inputBindings, branchBodies, outputShortNames)
      );
    }

    // Generate body
    if (opts.comments) {
      const label = node.label ?? blockDef.name;
      bodyLines.push(`# ${label}`);
    }
    bodyLines.push(
      interpolate(template.body, node.parameters, inputBindings, branchBodies, outputShortNames)
    );

    // Register output variables (graph-facing names → short local names)
    for (const [portId, expr] of Object.entries(template.outputBindings)) {
      const vName = varName(nodeId, portId, opts.varPrefix);
      const resolved = interpolate(expr, node.parameters, inputBindings, branchBodies, undefined);
      bodyLines.push(`${vName} = ${resolved}`);
      outputVarMap.set(`${nodeId}:${portId}`, vName);
    }

    bodyLines.push(""); // blank line between blocks

    // Generate teardown
    if (template.teardown) {
      teardownLines.push(
        interpolate(template.teardown, node.parameters, inputBindings, branchBodies, outputShortNames)
      );
    }
  }

  // Assemble final script
  const sections: string[] = [];

  if (allImports.size > 0) {
    sections.push(Array.from(allImports).sort().join("\n"));
    sections.push("");
  }

  if (setupLines.length > 0) {
    sections.push(setupLines.join("\n"));
    sections.push("");
  }

  sections.push(bodyLines.join("\n"));

  if (teardownLines.length > 0) {
    sections.push("");
    sections.push(teardownLines.join("\n"));
  }

  return sections.join("\n").trimEnd() + "\n";
}
