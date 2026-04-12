import { BlockDefinition, PortDefinition, ParameterDefinition } from "./types.js";

const DESC_MAX_WORDS = 12;

function shortenDescription(desc: string): string {
  const words = desc.trim().split(/\s+/);
  if (words.length <= DESC_MAX_WORDS) return words.join(" ");
  return words.slice(0, DESC_MAX_WORDS).join(" ") + "…";
}

function formatPort(p: PortDefinition): string {
  const req = p.required ? "" : "?";
  const multi = p.multiple ? "*" : "";
  return `${p.id}:${p.type}${req}${multi}`;
}

function formatParam(p: ParameterDefinition): string {
  const def =
    typeof p.default === "string"
      ? `"${p.default}"`
      : p.default === undefined || p.default === null
      ? "null"
      : String(p.default);
  return `${p.id}:${p.type}=${def}`;
}

/**
 * Render a BlockDefinition as a deterministic manifest line for LLM context.
 * Target: ~80–120 tokens per block.
 */
export function formatManifestLine(block: BlockDefinition): string {
  const header = `${block.id} | ${block.category} | ${block.name}: ${shortenDescription(block.description)}`;
  const ins = block.inputs.length
    ? `  in:  ${block.inputs.map(formatPort).join(" ")}`
    : "  in:  —";
  const outs = block.outputs.length
    ? `  out: ${block.outputs.map(formatPort).join(" ")}`
    : "  out: —";
  const params = block.parameters.length
    ? `  params: ${block.parameters.map(formatParam).join(" ")}`
    : null;
  return [header, ins, outs, params].filter(Boolean).join("\n");
}
