// ============================================================================
// Embed / extract pipeline graph in exported Python (optional round-trip)
// ============================================================================

/** First line of the embedded block (payload may continue on following # lines) */
export const AI_BLOCKS_GRAPH_B64_PREFIX = "# AI_BLOCKS_GRAPH_B64:";

const CHUNK_SIZE = 100;

function utf8ToBase64(s: string): string {
  return btoa(unescape(encodeURIComponent(s)));
}

function base64ToUtf8(b64: string): string {
  return decodeURIComponent(escape(atob(b64.trim())));
}

/** Append embedded graph to Python source so "Import .py" can restore blocks */
export function appendGraphToPythonSource(pythonCode: string, serializedGraphJson: string): string {
  const b64 = utf8ToBase64(serializedGraphJson);
  const trimmed = pythonCode.replace(/\s+$/, "");
  const lines: string[] = [
    trimmed,
    "",
    "# --- AI Blocks: graph data for re-import (safe to delete if you only need code) ---",
    "# AI_BLOCKS_GRAPH_B64:",
  ];
  for (let i = 0; i < b64.length; i += CHUNK_SIZE) {
    lines.push(`# ${b64.slice(i, i + CHUNK_SIZE)}`);
  }
  return `${lines.join("\n")}\n`;
}

/**
 * True only for our saved project JSON shape — avoids treating random ML scripts
 * (or JSON-looking snippets) as a graph document.
 */
export function isSerializedGraphDocument(jsonStr: string): boolean {
  try {
    const doc = JSON.parse(jsonStr.trim()) as Record<string, unknown>;
    if (typeof doc.version !== "number") return false;
    const g = doc.graph as Record<string, unknown> | undefined;
    if (!g || typeof g !== "object") return false;
    if (typeof g.id !== "string") return false;
    if (!g.nodes || typeof g.nodes !== "object") return false;
    if (!g.edges || typeof g.edges !== "object") return false;
    return true;
  } catch {
    return false;
  }
}

function extractFromMarkerComments(normalized: string): string | null {
  const lines = normalized.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    const m = t.match(/^#\s*AI_BLOCKS_GRAPH_B64:\s*(.*)$/);
    if (!m) continue;

    let b64 = (m[1] ?? "").replace(/\s/g, "");
    i++;

    while (i < lines.length) {
      const ln = lines[i].trim();
      if (ln === "" || ln === "#") {
        i++;
        continue;
      }
      const cm = ln.match(/^#\s*([A-Za-z0-9+/=]+)\s*$/);
      if (cm) {
        b64 += cm[1];
        i++;
      } else {
        break;
      }
    }

    if (!b64) continue;

    try {
      return base64ToUtf8(b64);
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Extract serialized graph JSON from an exported .py file, or null if missing.
 * Order: (1) # AI_BLOCKS_GRAPH_B64: chunks, (2) whole file = valid project JSON only.
 */
export function extractGraphJsonFromPythonSource(source: string): string | null {
  const normalized = source.replace(/^\uFEFF/, "");

  const fromMarker = extractFromMarkerComments(normalized);
  if (fromMarker) {
    if (isSerializedGraphDocument(fromMarker)) return fromMarker;
    return null;
  }

  const trimmedAll = normalized.trim();
  if (isSerializedGraphDocument(trimmedAll)) {
    return trimmedAll;
  }

  return null;
}
