import { BlockRegistry } from "@ai-blocks/block-schemas";
import { Pipeline, CompiledPipeline } from "./types.js";
import { ProjectCompiler } from "./project-compiler.js";

/**
 * Legacy entry point. Kept for session.ts + downstream consumers that still
 * operate on a single Pipeline. Delegates to ProjectCompiler using the
 * implicit `flat-python` layout, so a migration to the multi-file API is a
 * pure refactor — output is unchanged.
 */
export class Compiler {
  private inner: ProjectCompiler;

  constructor(registry: BlockRegistry) {
    this.inner = new ProjectCompiler(registry);
  }

  compile(pipeline: Pipeline): CompiledPipeline {
    return this.inner.compile(pipeline);
  }
}
