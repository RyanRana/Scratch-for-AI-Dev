interface Entry {
  id: string;
  vector: number[];
  payload: string;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * In-process vector store. Linear scan over ~505 entries is ~1ms and avoids
 * pulling in a native-module dependency.
 */
export class VectorStore {
  private entries: Entry[] = [];

  add(id: string, vector: number[], payload: string): void {
    this.entries.push({ id, vector, payload });
  }

  addMany(items: Entry[]): void {
    this.entries.push(...items);
  }

  topK(query: number[], k: number): { id: string; payload: string; score: number }[] {
    const scored = this.entries.map((e) => ({
      id: e.id,
      payload: e.payload,
      score: cosine(query, e.vector),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }

  size(): number {
    return this.entries.length;
  }
}
