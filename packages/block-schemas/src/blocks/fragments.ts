import type { BlockDefinition } from "../types.js";

/**
 * Phase 3 fragment catalog. Fragment blocks contribute to named regions of
 * one or more files. Unlike pipeline blocks, fragments are not port-wired —
 * they are orchestration glue that parameterizes entire files or file slices
 * based on scaffold conventions and instance params.
 */

const FASTAPI_ROUTER_BODY = `router = APIRouter()


@router.get("/")
def {{param:name}}_index():
    return {"ok": True, "route": "{{param:name}}"}`;

const fastapiRoute: BlockDefinition = {
  id: "fragments.fastapi-route",
  name: "FastAPI route",
  category: "fragments",
  description:
    "Adds a FastAPI router under the scaffold's routesDir and wires `app.include_router` into main.py.",
  tags: ["fragment", "python", "fastapi", "route", "http"],
  inputs: [],
  outputs: [],
  parameters: [
    {
      id: "name",
      name: "Router name",
      type: "string",
      default: "items",
      description: "Route module filename stem and router variable prefix.",
    },
    {
      id: "prefix",
      name: "URL prefix",
      type: "string",
      default: "/items",
      description: "URL prefix mounted under `app.include_router`.",
    },
  ],
  kind: "fragment",
  emits: {
    kind: "fragment",
    contributions: [
      // Register the router in main.py. The import goes into main.py's
      // `imports` anchor (managed by the compiler's import set), and the
      // include_router line lands in the `routes` region.
      {
        path: "main.py",
        region: "routes",
        content:
          'app.include_router({{param:name}}_router, prefix="{{param:prefix}}")',
        imports: [
          "from routes.{{param:name}} import router as {{param:name}}_router",
        ],
      },
      // Create (or extend) routes/<name>.py with a router definition. Uses
      // the scaffold's `routesDir` convention so the path adapts to whichever
      // FastAPI-style scaffold is active.
      {
        path: {
          use: "conventions",
          key: "routesDir",
          suffix: "/{{param:name}}.py",
        },
        region: "body",
        content: FASTAPI_ROUTER_BODY,
        imports: ["from fastapi import APIRouter"],
      },
    ],
  },
};

export const fragmentsBlocks: BlockDefinition[] = [fastapiRoute];
