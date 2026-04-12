// ============================================================================
// Assembler types — the contract between LLM output and the compiler.
// ============================================================================

/** A node in the assembled pipeline. */
export interface PipelineNode {
  /** Unique per-pipeline instance id (LLM-generated, e.g. "n1", "n2"). */
  id: string;
  /** Must match a BlockDefinition.id in the registry. */
  blockId: string;
  /** Only params that differ from defaults. */
  params?: Record<string, unknown>;
}

/** A directed edge between two node ports. */
export interface PipelineConnection {
  from: string;
  fromPort: string;
  to: string;
  toPort: string;
}

/** Fully-validated pipeline ready for compilation. */
export interface Pipeline {
  nodes: PipelineNode[];
  connections: PipelineConnection[];
}

/** Raw LLM response shape. */
export interface AssemblyResponse {
  reasoning: string;
  pipeline: Pipeline;
}

/** A patch emitted by assembleDiff. */
export interface PipelinePatch {
  addNodes?: PipelineNode[];
  removeNodes?: string[];
  addConnections?: PipelineConnection[];
  removeConnections?: { from: string; fromPort: string; to: string; toPort: string }[];
  updateParams?: { id: string; params: Record<string, unknown> }[];
}

/** Compiled output ready for disk. */
export interface CompiledPipeline {
  pythonSource: string;
  requirements: string[];
}

// ============================================================================
// BlockLayout — generalized Pipeline that spans multiple files.
// Phase 1 only uses it for the implicit `flat-python` case (single pipeline,
// single file). Phase 2+ populates `instances` with scaffold / file / fragment
// blocks and `pipelines` with multi-file pipeline content.
// ============================================================================

/** A registered block instance within a layout (non-pipeline kinds). */
export interface BlockInstance {
  id: string;
  blockId: string;
  params: Record<string, unknown>;
  targetPath?: string;
}

/** A pipeline bound to a specific file within a layout. */
export interface LayoutPipeline {
  id: string;
  targetPath: string;
  /** Defaults to "body" when a scaffold is present. Ignored by the legacy path. */
  targetRegion?: string;
  pipeline: Pipeline;
}

/** A typed edge between two pipelines in different files. */
export interface CrossPipelineConnection {
  fromPipeline: string;
  fromNode: string;
  fromPort: string;
  toPipeline: string;
  toNode: string;
  toPort: string;
}

/** The top-level serializable artifact. One layout ↔ one project. */
export interface BlockLayout {
  version: "1.0";
  stack: { blockId: string; params: Record<string, unknown> } | null;
  instances: BlockInstance[];
  pipelines: LayoutPipeline[];
  crossEdges: CrossPipelineConnection[];
}

/** Multi-file compile output. */
export interface CompiledProject {
  files: Record<string, string>;
  requirements: string[];
  /** Compiler notes: overwrites, dropped contributions, unresolved paths. */
  notes?: string[];
}

/** Structured validation errors fed back to the LLM on retry. */
export interface ValidationErrors {
  unknownIds: { nodeId: string; blockId: string; suggestions: string[] }[];
  portMismatches: {
    connection: PipelineConnection;
    reason: string;
  }[];
  badParams: { nodeId: string; key: string; reason: string }[];
  cycles: string[][];
}

export function hasErrors(e: ValidationErrors): boolean {
  return (
    e.unknownIds.length > 0 ||
    e.portMismatches.length > 0 ||
    e.badParams.length > 0 ||
    e.cycles.length > 0
  );
}

/** Layout-scope errors that are not attributable to a single pipeline. */
export interface LayoutValidationErrors {
  duplicateTargetPaths: string[];
  unresolvedCrossEdges: { edge: CrossPipelineConnection; reason: string }[];
  crossEdgePortMismatches: { edge: CrossPipelineConnection; reason: string }[];
  crossPipelineCycles: string[][];
  /**
   * Info-level notices: two file/scaffold sources collided at the same path.
   * Never a hard error — last-write-wins per the resolved architecture
   * decision. Surfaced so callers can log, warn, or surface in a UI.
   */
  fileConflicts: { path: string; winnerBlockId: string; overwrittenCount: number }[];
  /** Pipeline targets a region that doesn't exist in any scaffold file. */
  missingTargetRegions: { pipelineId: string; path: string; region: string }[];
  /** Unknown scaffold referenced by layout.stack. */
  unknownStack: string[];
  /** Unknown file/fragment/scaffold block referenced by a BlockInstance. */
  unknownInstanceBlocks: { instanceId: string; blockId: string }[];
  /**
   * Fragment contribution could not be placed: path resolver returned no
   * path (missing convention key / empty param), or the target region is
   * not declared on a scaffold-backed file.
   */
  unresolvableFragments: {
    instanceId: string;
    blockId: string;
    reason: string;
  }[];
}

export function hasLayoutErrors(e: LayoutValidationErrors): boolean {
  return (
    e.duplicateTargetPaths.length > 0 ||
    e.unresolvedCrossEdges.length > 0 ||
    e.crossEdgePortMismatches.length > 0 ||
    e.crossPipelineCycles.length > 0 ||
    e.missingTargetRegions.length > 0 ||
    e.unknownStack.length > 0 ||
    e.unknownInstanceBlocks.length > 0 ||
    e.unresolvableFragments.length > 0
  );
}

/** Shared session state regardless of which path ran. */
export interface Session {
  graph: Pipeline | null;
  history: { role: "user" | "assistant"; content: string }[];
}

/** Outcome when the router picked the assembler path. */
export interface AssemblerOutcome {
  mode: "assembler";
  session: Session;
  pipeline: Pipeline;
  compiled: CompiledPipeline;
  reasoning: string;
  corrections: { nodeId: string; from: string; to: string }[];
  retries: number;
  routerConfidence: number;
}

/** Outcome when the router fell back to direct code generation. */
export interface DirectOutcome {
  mode: "direct";
  session: Session;
  pythonSource: string;
  raw: string;
  routerConfidence: number;
}

export type AssembleOutcome = AssemblerOutcome | DirectOutcome;
