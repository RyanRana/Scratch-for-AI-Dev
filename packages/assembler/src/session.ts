import { BlockRegistry } from "@ai-blocks/block-schemas";
import { Decomposer } from "./decompose.js";
import { DirectGenerator } from "./direct.js";
import { Retriever, RetrievalHit } from "./retrieve.js";
import { Router, RouterOptions } from "./router.js";
import { Validator } from "./validate.js";
import { Compiler } from "./compile.js";
import { LLMClient } from "./llm.js";
import { EmbeddingClient } from "./embed.js";
import {
  AssembleOutcome,
  AssemblerOutcome,
  DirectOutcome,
  Pipeline,
  Session,
  ValidationErrors,
} from "./types.js";

const MAX_RETRIES = 2;
const DIFF_FALLBACK_RATIO = 0.4;

export interface AssemblerOptions {
  registry: BlockRegistry;
  llm: LLMClient;
  embedder: EmbeddingClient;
  router?: RouterOptions;
}

export class Assembler {
  private retriever: Retriever;
  private decomposer: Decomposer;
  private direct: DirectGenerator;
  private validator: Validator;
  private compiler: Compiler;
  private router: Router;

  constructor(opts: AssemblerOptions) {
    this.retriever = new Retriever(opts.registry, opts.embedder);
    this.decomposer = new Decomposer(opts.llm);
    this.direct = new DirectGenerator(opts.llm);
    this.validator = new Validator(opts.registry);
    this.compiler = new Compiler(opts.registry);
    this.router = new Router(this.retriever, opts.router);
  }

  static newSession(): Session {
    return { graph: null, history: [] };
  }

  /**
   * Primary entry point. Routes based on retrieval confidence:
   *   - high confidence → validated block pipeline + compiled Python
   *   - low confidence  → direct Python from the LLM (no catalog grounding)
   */
  async assemble(goal: string, session?: Session): Promise<AssembleOutcome> {
    const sess = session ?? Assembler.newSession();
    const route = await this.router.route(goal);
    if (route.decision === "assembler") {
      return this.runAssembler(goal, sess, route.hits, route.confidence);
    }
    return this.runDirect(goal, sess, route.confidence);
  }

  /** Force the assembler path, skipping the router. */
  async assembleFresh(goal: string, session?: Session): Promise<AssemblerOutcome> {
    const sess = session ?? Assembler.newSession();
    const hits = await this.retriever.retrieve(goal);
    return this.runAssembler(goal, sess, hits, -1);
  }

  /** Incremental edit on an existing graph. Always stays in the assembler path. */
  async assembleDiff(session: Session, edit: string): Promise<AssemblerOutcome> {
    if (!session.graph) {
      return this.assembleFresh(edit, session);
    }
    const hits = await this.retriever.retrieve(edit);
    const response = await this.decomposer.decomposeDiff({
      currentGraph: session.graph,
      edit,
      hits,
    });
    const result = this.validator.validate(response.pipeline);
    if (!result.ok) {
      return this.assembleFresh(edit, session);
    }
    const changedRatio = estimateChangeRatio(session.graph, result.pipeline);
    if (changedRatio > DIFF_FALLBACK_RATIO) {
      return this.assembleFresh(edit, session);
    }
    const compiled = this.compiler.compile(result.pipeline);
    const nextSession: Session = {
      graph: result.pipeline,
      history: [
        ...session.history,
        { role: "user", content: edit },
        { role: "assistant", content: response.reasoning },
      ],
    };
    return {
      mode: "assembler",
      session: nextSession,
      pipeline: result.pipeline,
      compiled,
      reasoning: response.reasoning,
      corrections: result.corrections,
      retries: 0,
      routerConfidence: -1,
    };
  }

  // ---- internals ----

  private async runAssembler(
    goal: string,
    session: Session,
    hits: RetrievalHit[],
    routerConfidence: number,
  ): Promise<AssemblerOutcome> {
    let lastErrors: ValidationErrors | undefined;
    let retries = 0;
    let response = null as Awaited<ReturnType<Decomposer["decompose"]>> | null;
    let validated: Pipeline | null = null;
    let corrections: AssemblerOutcome["corrections"] = [];

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      response = await this.decomposer.decompose({
        goal,
        hits,
        history: session.history,
        priorErrors: lastErrors,
      });
      const result = this.validator.validate(response.pipeline);
      if (result.ok) {
        validated = result.pipeline;
        corrections = result.corrections;
        break;
      }
      lastErrors = result.errors;
      retries = attempt + 1;
    }

    if (!validated || !response) {
      throw new AssemblerError("validation failed after retries", lastErrors);
    }

    const compiled = this.compiler.compile(validated);
    const nextSession: Session = {
      graph: validated,
      history: [
        ...session.history,
        { role: "user", content: goal },
        { role: "assistant", content: response.reasoning },
      ],
    };
    return {
      mode: "assembler",
      session: nextSession,
      pipeline: validated,
      compiled,
      reasoning: response.reasoning,
      corrections,
      retries,
      routerConfidence,
    };
  }

  private async runDirect(
    goal: string,
    session: Session,
    routerConfidence: number,
  ): Promise<DirectOutcome> {
    const result = await this.direct.generate(goal, session.history);
    const nextSession: Session = {
      graph: session.graph, // direct runs don't touch the graph
      history: [
        ...session.history,
        { role: "user", content: goal },
        { role: "assistant", content: "(direct code generation)" },
      ],
    };
    return {
      mode: "direct",
      session: nextSession,
      pythonSource: result.pythonSource,
      raw: result.raw,
      routerConfidence,
    };
  }
}

function estimateChangeRatio(before: Pipeline, after: Pipeline): number {
  const beforeIds = new Set(before.nodes.map((n) => `${n.id}:${n.blockId}`));
  const afterIds = new Set(after.nodes.map((n) => `${n.id}:${n.blockId}`));
  let diff = 0;
  for (const id of afterIds) if (!beforeIds.has(id)) diff++;
  for (const id of beforeIds) if (!afterIds.has(id)) diff++;
  const denom = Math.max(beforeIds.size, 1);
  return diff / denom;
}

export class AssemblerError extends Error {
  constructor(message: string, public errors?: ValidationErrors) {
    super(message);
    this.name = "AssemblerError";
  }
}
