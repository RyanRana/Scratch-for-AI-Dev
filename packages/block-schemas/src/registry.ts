import { BlockDefinition, CategoryDefinition, CATEGORIES, PortType } from "./types.js";
import { formatManifestLine } from "./manifest.js";

/**
 * Phase 0 shim. Legacy blocks carry `codeTemplate` but no `kind`/`emits`.
 * Convert each one at load time into an equivalent `kind="pipeline"` block
 * with a populated `PipelineEmit` so the new block taxonomy is universal
 * across the catalog without touching any of the 505 source definitions.
 */
export function ensureEmits(block: BlockDefinition): BlockDefinition {
  // Native-kind blocks declare `emits` directly (kind=scaffold, file, ...).
  if (block.emits) {
    if (block.kind) return block;
    return { ...block, kind: block.emits.kind };
  }
  // Legacy pipeline blocks: synthesize a PipelineEmit from codeTemplate.
  if (!block.codeTemplate) {
    throw new Error(
      `block ${block.id} has neither emits nor codeTemplate — cannot register`,
    );
  }
  return {
    ...block,
    kind: block.kind ?? "pipeline",
    emits: {
      kind: "pipeline",
      file: "pipeline.py",
      region: "body",
      imports: block.codeTemplate.imports,
      pipDeps: block.codeTemplate.pipDeps,
      body: block.codeTemplate.body,
      setup: block.codeTemplate.setup,
      teardown: block.codeTemplate.teardown,
      outputBindings: block.codeTemplate.outputBindings,
    },
  };
}

export class BlockRegistry {
  private blocks: Map<string, BlockDefinition> = new Map();
  private categoryIndex: Map<string, BlockDefinition[]> = new Map();
  private tagIndex: Map<string, BlockDefinition[]> = new Map();
  private inputPortIndex: Map<PortType, BlockDefinition[]> = new Map();
  private outputPortIndex: Map<PortType, BlockDefinition[]> = new Map();
  private manifestCache: Map<string, string> = new Map();

  constructor(blocks?: BlockDefinition[]) {
    if (blocks) {
      for (const block of blocks) {
        this.register(block);
      }
    }
  }

  register(rawBlock: BlockDefinition): void {
    const block = ensureEmits(rawBlock);
    if (this.blocks.has(block.id)) {
      throw new Error(`Block "${block.id}" is already registered`);
    }
    this.blocks.set(block.id, block);

    // Index by category
    const catBlocks = this.categoryIndex.get(block.category) ?? [];
    catBlocks.push(block);
    this.categoryIndex.set(block.category, catBlocks);

    // Index by tags
    for (const tag of block.tags) {
      const tagBlocks = this.tagIndex.get(tag) ?? [];
      tagBlocks.push(block);
      this.tagIndex.set(tag, tagBlocks);
    }

    // Index by port types
    for (const port of block.inputs) {
      const arr = this.inputPortIndex.get(port.type) ?? [];
      arr.push(block);
      this.inputPortIndex.set(port.type, arr);
    }
    for (const port of block.outputs) {
      const arr = this.outputPortIndex.get(port.type) ?? [];
      arr.push(block);
      this.outputPortIndex.set(port.type, arr);
    }
  }

  getByInputPortType(type: PortType): BlockDefinition[] {
    return this.inputPortIndex.get(type) ?? [];
  }

  getByOutputPortType(type: PortType): BlockDefinition[] {
    return this.outputPortIndex.get(type) ?? [];
  }

  /** Memoized manifest lines for LLM context. */
  manifest(): { id: string; line: string }[] {
    const out: { id: string; line: string }[] = [];
    for (const block of this.blocks.values()) {
      let line = this.manifestCache.get(block.id);
      if (!line) {
        line = formatManifestLine(block);
        this.manifestCache.set(block.id, line);
      }
      out.push({ id: block.id, line });
    }
    return out;
  }

  get(id: string): BlockDefinition | undefined {
    return this.blocks.get(id);
  }

  getOrThrow(id: string): BlockDefinition {
    const block = this.blocks.get(id);
    if (!block) throw new Error(`Block "${id}" not found in registry`);
    return block;
  }

  getByCategory(categoryId: string): BlockDefinition[] {
    return this.categoryIndex.get(categoryId) ?? [];
  }

  getByTag(tag: string): BlockDefinition[] {
    return this.tagIndex.get(tag) ?? [];
  }

  search(query: string): BlockDefinition[] {
    const q = query.toLowerCase();
    const results: { block: BlockDefinition; score: number }[] = [];

    for (const block of this.blocks.values()) {
      let score = 0;
      if (block.name.toLowerCase().includes(q)) score += 10;
      if (block.id.toLowerCase().includes(q)) score += 8;
      if (block.description.toLowerCase().includes(q)) score += 5;
      for (const tag of block.tags) {
        if (tag.toLowerCase().includes(q)) score += 3;
      }
      if (score > 0) results.push({ block, score });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .map((r) => r.block);
  }

  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  getCategories(): CategoryDefinition[] {
    return CATEGORIES;
  }

  get size(): number {
    return this.blocks.size;
  }
}
