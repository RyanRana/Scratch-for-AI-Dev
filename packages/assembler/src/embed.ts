import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export interface EmbeddingClient {
  embed(texts: string[]): Promise<number[][]>;
  dim(): number;
}

interface OllamaEmbedOptions {
  baseUrl?: string;
  model?: string;
  cacheDir?: string;
}

/**
 * Ollama embedding client with content-hash disk cache.
 * Default model: nomic-embed-text (768-dim, fast on CPU).
 */
export class OllamaEmbeddingClient implements EmbeddingClient {
  private baseUrl: string;
  private model: string;
  private cacheDir: string;
  private dimension = 768;

  constructor(opts: OllamaEmbedOptions = {}) {
    this.baseUrl = opts.baseUrl ?? "http://localhost:11434";
    this.model = opts.model ?? "nomic-embed-text";
    this.cacheDir = opts.cacheDir ?? ".assembler-cache/embeddings";
  }

  dim(): number {
    return this.dimension;
  }

  async embed(texts: string[]): Promise<number[][]> {
    await mkdir(this.cacheDir, { recursive: true });
    return Promise.all(texts.map((t) => this.embedOne(t)));
  }

  private async embedOne(text: string): Promise<number[]> {
    const hash = createHash("sha256").update(this.model + ":" + text).digest("hex");
    const cachePath = join(this.cacheDir, `${hash}.json`);
    try {
      const cached = await readFile(cachePath, "utf8");
      const vec = JSON.parse(cached) as number[];
      this.dimension = vec.length;
      return vec;
    } catch {
      // miss — fall through
    }

    const res = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: this.model, prompt: text }),
    });
    if (!res.ok) {
      throw new Error(`Ollama embeddings failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { embedding: number[] };
    this.dimension = data.embedding.length;
    await writeFile(cachePath, JSON.stringify(data.embedding));
    return data.embedding;
  }
}
