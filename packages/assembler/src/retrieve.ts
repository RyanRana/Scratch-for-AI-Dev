import { BlockRegistry } from "@ai-blocks/block-schemas";
import { EmbeddingClient } from "./embed.js";
import { VectorStore } from "./vector-store.js";

const GLUE_CATEGORIES = ["data-io", "data-processing", "utilities", "control-flow"];
const GLUE_PER_CATEGORY = 3;

export interface RetrievalHit {
  id: string;
  line: string;
  /** Cosine similarity against the goal embedding; 1.0 = exact match. Semantic hits carry real scores, glue-block unions carry 0. */
  score: number;
}

export class Retriever {
  private store = new VectorStore();
  private manifestById = new Map<string, string>();
  private ready = false;

  constructor(
    private registry: BlockRegistry,
    private embedder: EmbeddingClient,
  ) {}

  async init(): Promise<void> {
    if (this.ready) return;
    const entries = this.registry.manifest();
    const vectors = await this.embedder.embed(entries.map((e) => e.line));
    for (let i = 0; i < entries.length; i++) {
      const { id, line } = entries[i]!;
      this.manifestById.set(id, line);
      this.store.add(id, vectors[i]!, line);
    }
    this.ready = true;
  }

  /** Top-K semantic hits for the user goal, unioned with category glue. */
  async retrieve(goal: string, k = 40): Promise<RetrievalHit[]> {
    if (!this.ready) await this.init();
    const [goalVec] = await this.embedder.embed([goal]);
    const semantic = this.store.topK(goalVec!, k);

    const seen = new Set(semantic.map((h) => h.id));
    const hits: RetrievalHit[] = semantic.map((h) => ({
      id: h.id,
      line: h.payload,
      score: h.score,
    }));

    for (const cat of GLUE_CATEGORIES) {
      const cands = this.registry.getByCategory(cat).slice(0, GLUE_PER_CATEGORY);
      for (const block of cands) {
        if (seen.has(block.id)) continue;
        const line = this.manifestById.get(block.id);
        if (!line) continue;
        seen.add(block.id);
        hits.push({ id: block.id, line, score: 0 });
      }
    }

    return hits;
  }

  /** Look up manifest lines by id (for retry prompts). */
  linesFor(ids: string[]): RetrievalHit[] {
    return ids
      .map((id) => {
        const line = this.manifestById.get(id);
        return line ? { id, line, score: 0 } : null;
      })
      .filter((x): x is RetrievalHit => x !== null);
  }
}
