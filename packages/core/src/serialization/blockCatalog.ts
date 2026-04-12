// ============================================================================
// Minimal block list for LLM import (low token footprint)
// ============================================================================

import type { BlockRegistry } from "@ai-blocks/block-schemas";

/**
 * One block per line: id|name [in:portIds out:portIds] (sorted by id).
 * Port ids are what `connect` / import edges must use (output → input).
 */
export function compactBlockCatalog(registry: BlockRegistry): string {
  return registry
    .getAll()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((b) => {
      const ins = b.inputs.map((p) => p.id).join(",");
      const outs = b.outputs.map((p) => p.id).join(",");
      return `${b.id}|${b.name} [in:${ins || "-"} out:${outs || "-"}]`;
    })
    .join("\n");
}
