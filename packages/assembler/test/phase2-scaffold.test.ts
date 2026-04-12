import { describe, it, expect } from "vitest";
import { BlockRegistry, ALL_BLOCKS } from "@ai-blocks/block-schemas";
import { ProjectCompiler } from "../src/project-compiler.js";
import { Validator } from "../src/validate.js";
import { BlockLayout } from "../src/types.js";

const registry = new BlockRegistry(ALL_BLOCKS);
const compiler = new ProjectCompiler(registry);
const validator = new Validator(registry);

function scaffoldOnly(): BlockLayout {
  return {
    version: "1.0",
    stack: { blockId: "scaffolds.fastapi-basic", params: {} },
    instances: [],
    pipelines: [],
    crossEdges: [],
  };
}

describe("Phase 2: scaffold seeding", () => {
  it("seeds main.py and requirements.txt from the FastAPI scaffold", () => {
    const out = compiler.compileLayout(scaffoldOnly());
    expect(Object.keys(out.files).sort()).toEqual(["main.py", "requirements.txt"]);

    const mainPy = out.files["main.py"];
    expect(mainPy).toContain("from fastapi import FastAPI");
    expect(mainPy).toContain("app = FastAPI()");
    // All region anchors stripped, none leaked into output.
    expect(mainPy).not.toMatch(/\{\{region:[^}]+\}\}/);

    const req = out.files["requirements.txt"];
    expect(req).toContain("fastapi>=0.110.0");
    expect(req).toContain("uvicorn[standard]>=0.27.0");
  });

  it("merges scaffold pip deps into requirements", () => {
    const out = compiler.compileLayout(scaffoldOnly());
    expect(out.requirements).toContain("fastapi>=0.110.0");
    expect(out.requirements).toContain("uvicorn[standard]>=0.27.0");
  });
});

describe("Phase 2: file block application", () => {
  it("overwrites scaffold-emitted requirements.txt with a file block", () => {
    const layout: BlockLayout = {
      ...scaffoldOnly(),
      instances: [
        {
          id: "i1",
          blockId: "files.requirements-txt",
          params: {
            requirements:
              "fastapi>=0.110.0\nuvicorn[standard]>=0.27.0\npydantic>=2.0\n",
          },
        },
      ],
    };
    const out = compiler.compileLayout(layout);
    expect(out.files["requirements.txt"]).toContain("pydantic>=2.0");
    expect(out.notes?.some((n) => n.includes("overwrite: requirements.txt"))).toBe(true);
  });

  it("file block defaults apply when no param is provided", () => {
    const layout: BlockLayout = {
      version: "1.0",
      stack: { blockId: "scaffolds.fastapi-basic", params: {} },
      instances: [
        { id: "i1", blockId: "files.requirements-txt", params: {} },
      ],
      pipelines: [],
      crossEdges: [],
    };
    const out = compiler.compileLayout(layout);
    expect(out.files["requirements.txt"]).toContain("fastapi>=0.110.0");
  });
});

describe("Phase 2: pipeline contribution into scaffold region", () => {
  it("injects a pipeline block into main.py body region", () => {
    const layout: BlockLayout = {
      version: "1.0",
      stack: { blockId: "scaffolds.fastapi-basic", params: {} },
      instances: [],
      pipelines: [
        {
          id: "main",
          targetPath: "main.py",
          targetRegion: "body",
          pipeline: {
            nodes: [{ id: "n1", blockId: "control-flow.start" }],
            connections: [],
          },
        },
      ],
      crossEdges: [],
    };
    const out = compiler.compileLayout(layout);
    const mainPy = out.files["main.py"];
    // The pipeline body includes the block comment header.
    expect(mainPy).toContain("# control-flow.start (n1)");
    // Scaffold structure still intact.
    expect(mainPy).toContain("from fastapi import FastAPI");
    // Region anchor was substituted, not leaked.
    expect(mainPy).not.toContain("{{region:body}}");
  });
});

describe("Phase 2: layout validator", () => {
  it("accepts a valid FastAPI layout", () => {
    const result = validator.validateLayout(scaffoldOnly());
    expect(result.ok).toBe(true);
    expect(result.layoutErrors.unknownStack).toEqual([]);
  });

  it("flags unknown stack blocks", () => {
    const layout: BlockLayout = {
      version: "1.0",
      stack: { blockId: "scaffolds.does-not-exist", params: {} },
      instances: [],
      pipelines: [],
      crossEdges: [],
    };
    const result = validator.validateLayout(layout);
    expect(result.ok).toBe(false);
    expect(result.layoutErrors.unknownStack).toContain("scaffolds.does-not-exist");
  });

  it("records file conflicts without failing validation", () => {
    const layout: BlockLayout = {
      version: "1.0",
      stack: { blockId: "scaffolds.fastapi-basic", params: {} },
      instances: [
        { id: "i1", blockId: "files.requirements-txt", params: {} },
      ],
      pipelines: [],
      crossEdges: [],
    };
    const result = validator.validateLayout(layout);
    expect(result.ok).toBe(true); // conflicts are non-fatal
    expect(result.layoutErrors.fileConflicts).toHaveLength(1);
    expect(result.layoutErrors.fileConflicts[0]).toMatchObject({
      path: "requirements.txt",
      winnerBlockId: "files.requirements-txt",
      overwrittenCount: 1,
    });
  });

  it("rejects pipelines targeting an undeclared region in a scaffold file", () => {
    const layout: BlockLayout = {
      version: "1.0",
      stack: { blockId: "scaffolds.fastapi-basic", params: {} },
      instances: [],
      pipelines: [
        {
          id: "p1",
          targetPath: "main.py",
          targetRegion: "not-a-region",
          pipeline: {
            nodes: [{ id: "n1", blockId: "control-flow.start" }],
            connections: [],
          },
        },
      ],
      crossEdges: [],
    };
    const result = validator.validateLayout(layout);
    expect(result.ok).toBe(false);
    expect(result.layoutErrors.missingTargetRegions[0]).toMatchObject({
      path: "main.py",
      region: "not-a-region",
    });
  });
});

describe("Phase 2: legacy path unchanged", () => {
  it("compile(Pipeline) still routes through the legacy byte-identical path", () => {
    const p = {
      nodes: [{ id: "n1", blockId: "control-flow.start" }],
      connections: [],
    };
    // No stack → legacy path. Output shape matches Phase 1 expectations
    // (starts with the auto-gen header, contains the block comment).
    const out = compiler.compile(p).pythonSource;
    expect(out).toMatch(/^# Auto-generated by @ai-blocks\/assembler/);
    expect(out).toContain("# control-flow.start (n1)");
    // No region anchors leak.
    expect(out).not.toMatch(/\{\{region:/);
  });
});
