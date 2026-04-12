import type { BlockDefinition } from "../types.js";

/**
 * Phase 2 scaffold catalog. Each scaffold seeds a `ProjectTree` with a
 * starter file set plus stack metadata. Region anchors (`{{region:name}}`)
 * are the join points that fragment and pipeline blocks contribute into.
 */

const FASTAPI_MAIN_PY = `# {{region:imports}}
from fastapi import FastAPI

app = FastAPI()

# {{region:middleware}}

# {{region:routes}}

# {{region:body}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;

const FASTAPI_REQUIREMENTS_TXT = `fastapi>=0.110.0
uvicorn[standard]>=0.27.0
`;

const fastapiBasic: BlockDefinition = {
  id: "scaffolds.fastapi-basic",
  name: "FastAPI (basic)",
  category: "scaffolds",
  description:
    "Single-file FastAPI service scaffold. Seeds main.py with middleware/routes/body anchors plus requirements.txt.",
  tags: ["scaffold", "python", "fastapi", "web", "backend"],
  inputs: [],
  outputs: [],
  parameters: [],
  kind: "scaffold",
  emits: {
    kind: "scaffold",
    language: "python",
    conventions: {
      mainFile: "main.py",
      routesDir: "routes",
      testDir: "tests",
    },
    deps: {
      pip: new Set(["fastapi>=0.110.0", "uvicorn[standard]>=0.27.0"]),
    },
    files: [
      {
        path: "main.py",
        language: "python",
        body: FASTAPI_MAIN_PY,
      },
      {
        path: "requirements.txt",
        language: "text",
        body: FASTAPI_REQUIREMENTS_TXT,
      },
    ],
  },
};

export const scaffoldsBlocks: BlockDefinition[] = [fastapiBasic];
