import { describe, it, expect } from "vitest";
import { BlockRegistry, ALL_BLOCKS } from "@ai-blocks/block-schemas";
import { ProjectCompiler } from "../src/project-compiler.js";
import { Validator } from "../src/validate.js";
import { BlockLayout } from "../src/types.js";

const registry = new BlockRegistry(ALL_BLOCKS);
const compiler = new ProjectCompiler(registry);
const validator = new Validator(registry);

function baseLayout(): BlockLayout {
  return {
    version: "1.0",
    stack: { blockId: "scaffolds.fastapi-basic", params: {} },
    instances: [],
    pipelines: [],
    crossEdges: [],
  };
}

describe("Phase 3: FastAPI route fragment", () => {
  it("wires include_router into main.py and synthesizes routes/<name>.py with defaults", () => {
    const layout: BlockLayout = {
      ...baseLayout(),
      instances: [
        { id: "f1", blockId: "fragments.fastapi-route", params: {} },
      ],
    };
    const out = compiler.compileLayout(layout);

    const mainPy = out.files["main.py"];
    expect(mainPy).toContain("from fastapi import FastAPI");
    // Fragment's routes-region contribution substituted into main.py.
    expect(mainPy).toContain(
      'app.include_router(items_router, prefix="/items")',
    );
    // Fragment's import merged into main.py's imports block.
    expect(mainPy).toContain(
      "from routes.items import router as items_router",
    );
    // No anchors leaked.
    expect(mainPy).not.toMatch(/\{\{region:[^}]+\}\}/);
    expect(mainPy).not.toMatch(/\{\{param:[^}]+\}\}/);

    // Synthetic routes/items.py file materialized via the routesDir
    // convention + "/{{param:name}}.py" suffix.
    const routeFile = out.files["routes/items.py"];
    expect(routeFile).toBeDefined();
    expect(routeFile).toContain("from fastapi import APIRouter");
    expect(routeFile).toContain("router = APIRouter()");
    expect(routeFile).toContain("def items_index():");
    expect(routeFile).toContain('"route": "items"');
  });

  it("honors a custom name param in both the synthesized file path and its contents", () => {
    const layout: BlockLayout = {
      ...baseLayout(),
      instances: [
        {
          id: "f1",
          blockId: "fragments.fastapi-route",
          params: { name: "users", prefix: "/api/users" },
        },
      ],
    };
    const out = compiler.compileLayout(layout);

    expect(out.files["routes/users.py"]).toBeDefined();
    expect(out.files["routes/items.py"]).toBeUndefined();

    const mainPy = out.files["main.py"];
    expect(mainPy).toContain(
      'app.include_router(users_router, prefix="/api/users")',
    );
    expect(mainPy).toContain(
      "from routes.users import router as users_router",
    );

    const routeFile = out.files["routes/users.py"];
    expect(routeFile).toContain("def users_index():");
    expect(routeFile).toContain('"route": "users"');
  });

  it("two fragment instances concatenate into main.py routes region", () => {
    const layout: BlockLayout = {
      ...baseLayout(),
      instances: [
        {
          id: "f1",
          blockId: "fragments.fastapi-route",
          params: { name: "items", prefix: "/items" },
        },
        {
          id: "f2",
          blockId: "fragments.fastapi-route",
          params: { name: "users", prefix: "/users" },
        },
      ],
    };
    const out = compiler.compileLayout(layout);
    const mainPy = out.files["main.py"];
    expect(mainPy).toContain(
      'app.include_router(items_router, prefix="/items")',
    );
    expect(mainPy).toContain(
      'app.include_router(users_router, prefix="/users")',
    );
    expect(out.files["routes/items.py"]).toBeDefined();
    expect(out.files["routes/users.py"]).toBeDefined();
  });
});

describe("Phase 3: validator fragment gate", () => {
  it("accepts a valid fragment layout", () => {
    const layout: BlockLayout = {
      ...baseLayout(),
      instances: [
        { id: "f1", blockId: "fragments.fastapi-route", params: {} },
      ],
    };
    const result = validator.validateLayout(layout);
    expect(result.ok).toBe(true);
    expect(result.layoutErrors.unresolvableFragments).toEqual([]);
  });

  it("flags fragments that target a region not declared on a scaffold file", () => {
    // Hand-craft a one-off block that contributes to a bogus region on
    // main.py — can't use the real fastapi-route block because it contributes
    // to the declared `routes` region. Register via a disposable registry.
    const ALL_PLUS_BOGUS = [
      ...ALL_BLOCKS,
      {
        id: "fragments.bogus-region",
        name: "Bogus region fragment",
        category: "fragments",
        description: "Test-only: contributes to a region that main.py lacks.",
        tags: ["test"],
        inputs: [],
        outputs: [],
        parameters: [],
        kind: "fragment" as const,
        emits: {
          kind: "fragment" as const,
          contributions: [
            {
              path: "main.py",
              region: "not-a-region",
              content: "# ignored",
            },
          ],
        },
      },
    ];
    const reg = new BlockRegistry(ALL_PLUS_BOGUS);
    const v = new Validator(reg);
    const layout: BlockLayout = {
      version: "1.0",
      stack: { blockId: "scaffolds.fastapi-basic", params: {} },
      instances: [
        { id: "f1", blockId: "fragments.bogus-region", params: {} },
      ],
      pipelines: [],
      crossEdges: [],
    };
    const result = v.validateLayout(layout);
    expect(result.ok).toBe(false);
    expect(result.layoutErrors.unresolvableFragments).toHaveLength(1);
    expect(result.layoutErrors.unresolvableFragments[0]).toMatchObject({
      instanceId: "f1",
      blockId: "fragments.bogus-region",
    });
    expect(result.layoutErrors.unresolvableFragments[0].reason).toContain(
      "not-a-region",
    );
  });

  it("flags fragments whose path resolver references a missing convention key", () => {
    const ALL_PLUS_UNRESOLVABLE = [
      ...ALL_BLOCKS,
      {
        id: "fragments.missing-convention",
        name: "Missing convention fragment",
        category: "fragments",
        description: "Test-only: resolves a convention key the scaffold doesn't set.",
        tags: ["test"],
        inputs: [],
        outputs: [],
        parameters: [],
        kind: "fragment" as const,
        emits: {
          kind: "fragment" as const,
          contributions: [
            {
              path: {
                use: "conventions" as const,
                key: "migrationsDir" as const,
                suffix: "/x.py",
              },
              region: "body",
              content: "# ignored",
            },
          ],
        },
      },
    ];
    const reg = new BlockRegistry(ALL_PLUS_UNRESOLVABLE);
    const v = new Validator(reg);
    const layout: BlockLayout = {
      version: "1.0",
      stack: { blockId: "scaffolds.fastapi-basic", params: {} },
      instances: [
        { id: "f1", blockId: "fragments.missing-convention", params: {} },
      ],
      pipelines: [],
      crossEdges: [],
    };
    const result = v.validateLayout(layout);
    expect(result.ok).toBe(false);
    expect(result.layoutErrors.unresolvableFragments).toHaveLength(1);
    expect(result.layoutErrors.unresolvableFragments[0].reason).toContain(
      "conventions.migrationsDir",
    );
  });
});
