import type { BlockDefinition } from "../types.js";

/**
 * Phase 2 file-block catalog. Each file block emits one whole file at a
 * known path. `FileEmit.content` supports `{{param:<id>}}` substitution so
 * a single file block can be parameterized by the user.
 *
 * File blocks run after scaffolds in the compile apply order — emitting
 * the same path as a scaffold file is a legal last-write-wins overwrite.
 */

const requirementsTxt: BlockDefinition = {
  id: "files.requirements-txt",
  name: "requirements.txt",
  category: "files",
  description:
    "Python requirements.txt with a user-provided dependency list. Overwrites any existing requirements.txt emitted by a scaffold.",
  tags: ["file", "python", "pip", "requirements"],
  inputs: [],
  outputs: [],
  parameters: [
    {
      id: "requirements",
      name: "Requirements",
      type: "code",
      default:
        "fastapi>=0.110.0\nuvicorn[standard]>=0.27.0\n",
      description: "Newline-separated pip requirement lines.",
    },
  ],
  kind: "file",
  emits: {
    kind: "file",
    path: "requirements.txt",
    language: "text",
    content: "{{param:requirements}}",
  },
};

export const filesBlocks: BlockDefinition[] = [requirementsTxt];
