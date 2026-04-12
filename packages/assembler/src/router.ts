import { Retriever, RetrievalHit } from "./retrieve.js";

export type RouteDecision = "assembler" | "direct";

export interface RouteResult {
  decision: RouteDecision;
  /** Mean cosine over top-K semantic hits. 0 when no scored hits exist. */
  confidence: number;
  hits: RetrievalHit[];
  /** Breakdown for debugging / threshold tuning. */
  diagnostic: {
    topK: number;
    threshold: number;
    topScores: number[];
  };
}

export interface RouterOptions {
  /** How many hits to average for the confidence score. */
  topK?: number;
  /** Below this mean score we fall back to direct code generation. */
  threshold?: number;
}

/**
 * Decides whether a goal should go through the block assembler or fall back
 * to direct Python generation.
 *
 * Heuristic: mean cosine similarity of the top-K retrieval hits. If the
 * catalog contains nothing semantically close to the goal, the mean drops
 * and we route direct. Threshold default (0.35) is a placeholder — calibrate
 * against real eval data before shipping.
 */
export class Router {
  private topK: number;
  private threshold: number;

  constructor(
    private retriever: Retriever,
    opts: RouterOptions = {},
  ) {
    this.topK = opts.topK ?? 5;
    this.threshold = opts.threshold ?? 0.35;
  }

  async route(goal: string): Promise<RouteResult> {
    const hits = await this.retriever.retrieve(goal);
    const scored = hits.filter((h) => h.score > 0);
    const top = scored.slice(0, this.topK);
    const confidence =
      top.length > 0 ? top.reduce((s, h) => s + h.score, 0) / top.length : 0;
    const decision: RouteDecision =
      confidence >= this.threshold ? "assembler" : "direct";
    return {
      decision,
      confidence,
      hits,
      diagnostic: {
        topK: this.topK,
        threshold: this.threshold,
        topScores: top.map((h) => h.score),
      },
    };
  }
}
