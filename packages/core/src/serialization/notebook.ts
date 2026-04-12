// ============================================================================
// Jupyter notebook (.ipynb) → concatenated code for import
// ============================================================================

/** Concatenate code cell sources in order (markdown cells skipped). */
export function extractCodeFromNotebook(jsonText: string): string {
  let nb: { cells?: unknown[] };
  try {
    nb = JSON.parse(jsonText) as { cells?: unknown[] };
  } catch {
    throw new Error("Invalid JSON: expected a Jupyter notebook (.ipynb).");
  }
  const cells = nb.cells ?? [];
  const parts: string[] = [];
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i] as { cell_type?: string; source?: unknown };
    if (cell.cell_type !== "code") continue;
    const raw = cell.source;
    const src = Array.isArray(raw) ? raw.join("") : String(raw ?? "");
    const t = src.trim();
    if (t) parts.push(`# --- cell ${i} ---\n${src}`);
  }
  return parts.length > 0 ? parts.join("\n\n") : "";
}
