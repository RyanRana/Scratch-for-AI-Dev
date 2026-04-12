// ============================================================================
// Initialize the block registry with all block definitions
// ============================================================================

import { BlockRegistry, ALL_BLOCKS, type BlockDefinition } from "@ai-blocks/block-schemas";
import { setRegistry } from "./stores/editor-store.js";
import { REPO_FILE_BLOCK_ID, REPO_FOLDER_BLOCK_ID } from "./repo/repo-map.js";

/**
 * Synthetic blocks used by the repo mind-map view. Never compiled — their
 * bodies stay empty — but being in the registry lets the existing Canvas
 * render file + folder nodes with ports for import/export edges.
 */
const repoFileBlock: BlockDefinition = {
  id: REPO_FILE_BLOCK_ID,
  name: "File",
  category: "utilities",
  description: "A source file in the imported repository. Python files open their block layout on click.",
  tags: ["meta", "repo", "file"],
  inputs: [
    { id: "imports", name: "Imported by", type: "any", required: false, multiple: true },
  ],
  outputs: [
    { id: "exports", name: "Exports", type: "any", required: false, multiple: true },
  ],
  parameters: [],
  codeTemplate: {
    imports: [],
    body: "",
    outputBindings: { exports: "exports" },
  },
};

const repoFolderBlock: BlockDefinition = {
  id: REPO_FOLDER_BLOCK_ID,
  name: "Folder",
  category: "data-io",
  description: "A directory in the imported repository. Visual grouping only — clicks are no-ops.",
  tags: ["meta", "repo", "folder"],
  inputs: [],
  outputs: [],
  parameters: [],
  codeTemplate: {
    imports: [],
    body: "",
    outputBindings: {},
  },
};

export function initializeRegistry(): void {
  const registry = new BlockRegistry([...ALL_BLOCKS, repoFileBlock, repoFolderBlock]);
  setRegistry(registry);
  console.log(`AI Blocks registry loaded: ${registry.size} blocks`);
}
