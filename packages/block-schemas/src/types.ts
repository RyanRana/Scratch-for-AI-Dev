// ============================================================================
// Block Definition Types
// The canonical type system for all AI Blocks definitions
// ============================================================================

/** Semantic port types that govern block connectivity */
export type PortType =
  | "any"
  | "tensor"
  | "dataframe"
  | "series"
  | "array"
  | "model"
  | "model_params"
  | "optimizer"
  | "scheduler"
  | "loss_fn"
  | "metric"
  | "text"
  | "text_list"
  | "embedding"
  | "embedding_list"
  | "image"
  | "image_batch"
  | "audio"
  | "tokenizer"
  | "config"
  | "dict"
  | "list"
  | "number"
  | "boolean"
  | "path"
  | "dataset"
  | "dataloader"
  | "agent"
  | "tool"
  | "prompt"
  | "chain"
  | "index"
  | "callback"
  | "void";

/** Parameter types for block configuration */
export type ParameterType =
  | "number"
  | "string"
  | "boolean"
  | "select"
  | "multiselect"
  | "code"
  | "json"
  | "file";

/** A typed input or output port on a block */
export interface PortDefinition {
  id: string;
  name: string;
  type: PortType;
  required: boolean;
  multiple?: boolean;
  description?: string;
}

/** A configurable parameter on a block */
export interface ParameterDefinition {
  id: string;
  name: string;
  type: ParameterType;
  default: unknown;
  options?: { label: string; value: unknown }[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  advanced?: boolean;
  placeholder?: string;
  validation?: string;
}

/** Code template that defines how a block generates Python code */
export interface CodeTemplate {
  imports: string[];
  pipDeps?: string[];
  setup?: string;
  body: string;
  teardown?: string;
  outputBindings: Record<string, string>;
}

/** Scope definition for control flow blocks (if/else, loops, try/catch) */
export interface ScopeBranch {
  id: string;
  label: string;
  accepts: PortType;
}

/** Category metadata */
export interface CategoryDefinition {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

/** Complete block definition — the fundamental unit of AI Blocks */
export interface BlockDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  icon?: string;
  color?: string;
  tags: string[];
  docUrl?: string;
  deprecated?: boolean;

  inputs: PortDefinition[];
  outputs: PortDefinition[];
  parameters: ParameterDefinition[];

  /**
   * Phase 0 required for all 505 legacy pipeline blocks. Phase 2 relaxed:
   * native scaffold / file / fragment / mcp / tool blocks declare `emits`
   * directly and omit `codeTemplate`.
   */
  codeTemplate?: CodeTemplate;

  /**
   * Phase 0: optional — ensureEmits() populates this at registry load time
   * for legacy pipeline blocks. New native-kind blocks declare it directly.
   */
  kind?: BlockKind;
  emits?: EmitSpec;

  /** For control flow blocks that contain child blocks */
  scopeType?: "branch" | "loop" | "error";
  branches?: ScopeBranch[];
}

// ============================================================================
// Phase 0: ProjectTree / BlockLayout substrate
// New types introduced alongside the existing pipeline model. Nothing in the
// current forward path consumes them yet; the ensureEmits shim makes all 505
// existing blocks valid under the new taxonomy without source edits.
// ============================================================================

/** Target language for a generated file. */
export type Language =
  | "python"
  | "typescript"
  | "javascript"
  | "jsx"
  | "tsx"
  | "yaml"
  | "json"
  | "toml"
  | "dockerfile"
  | "shell"
  | "markdown"
  | "sql"
  | "css"
  | "html"
  | "text";

/** Aggregated dependency requirements for a file or project. */
export interface DepsManifest {
  pip: Set<string>;
  npm: Set<string>;
  system: Set<string>;
  dockerBase?: string;
}

/** Discriminator for a block's contribution type. */
export type BlockKind =
  | "pipeline"
  | "scaffold"
  | "file"
  | "fragment"
  | "mcp"
  | "tool";

/** How a scaffold or fragment resolves a destination path at compile time. */
export type PathResolver =
  | { use: "conventions"; key: keyof ScaffoldConventions; suffix?: string }
  | { use: "param"; paramId: string };

/** Project-wide conventions a scaffold advertises. */
export interface ScaffoldConventions {
  mainFile?: string;
  routesDir?: string;
  modelsFile?: string;
  componentsDir?: string;
  configDir?: string;
  migrationsDir?: string;
  testDir?: string;
}

/** A templated file seeded by a scaffold. Body may contain `{{region:name}}` anchors. */
export interface FileTemplate {
  path: string;
  language: Language;
  body: string;
  deps?: Partial<DepsManifest>;
}

/** A contribution a fragment block makes to a named region of one file. */
export interface FileContribution {
  path: string | PathResolver;
  region: string;
  content: string;
  imports?: string[];
  deps?: Partial<DepsManifest>;
}

/** Opaque MCP server config blob; validated per-server in later phases. */
export type McpServerConfig = Record<string, unknown>;

export interface PipelineEmit {
  kind: "pipeline";
  file?: string;
  region?: string;
  imports: string[];
  pipDeps?: string[];
  body: string;
  setup?: string;
  teardown?: string;
  outputBindings: Record<string, string>;
}

export interface ScaffoldEmit {
  kind: "scaffold";
  language: Language;
  files: FileTemplate[];
  deps: Partial<DepsManifest>;
  conventions: ScaffoldConventions;
}

export interface FileEmit {
  kind: "file";
  path: string;
  language: Language;
  content: string;
  deps?: Partial<DepsManifest>;
}

export interface FragmentEmit {
  kind: "fragment";
  contributions: FileContribution[];
}

export interface McpEmit {
  kind: "mcp";
  serverId: string;
  configPath: string;
  serverConfig: McpServerConfig;
  toolsProvided: string[];
}

export interface ToolEmit {
  kind: "tool";
  toolName: string;
  jsonSchema: Record<string, unknown>;
  implementation?: FileContribution;
}

export type EmitSpec =
  | PipelineEmit
  | ScaffoldEmit
  | FileEmit
  | FragmentEmit
  | McpEmit
  | ToolEmit;

/** Port type compatibility rules */
export const PORT_COMPATIBILITY: Record<PortType, PortType[]> = {
  any: [], // any connects to everything (handled in logic)
  tensor: ["array", "any"],
  dataframe: ["dict", "any"],
  series: ["array", "any"],
  array: ["list", "tensor", "any"],
  model: ["any"],
  model_params: ["any"],
  optimizer: ["any"],
  scheduler: ["any"],
  loss_fn: ["any"],
  metric: ["any"],
  text: ["any"],
  text_list: ["list", "any"],
  embedding: ["array", "tensor", "any"],
  embedding_list: ["list", "any"],
  image: ["tensor", "array", "any"],
  image_batch: ["tensor", "any"],
  audio: ["tensor", "array", "any"],
  tokenizer: ["any"],
  config: ["dict", "any"],
  dict: ["any"],
  list: ["any"],
  number: ["any"],
  boolean: ["any"],
  path: ["text", "any"],
  dataset: ["any"],
  dataloader: ["any"],
  agent: ["any"],
  tool: ["any"],
  prompt: ["text", "any"],
  chain: ["any"],
  index: ["any"],
  callback: ["any"],
  void: [],
};

/** Check if an output type can connect to an input type */
export function arePortsCompatible(
  outputType: PortType,
  inputType: PortType
): boolean {
  if (outputType === "any" || inputType === "any") return true;
  if (outputType === inputType) return true;
  return PORT_COMPATIBILITY[outputType]?.includes(inputType) ?? false;
}

/** All category definitions with colors */
export const CATEGORIES: CategoryDefinition[] = [
  { id: "control-flow", name: "Control Flow", description: "Logic & program structure", color: "#6B7280", icon: "workflow" },
  { id: "data-io", name: "Data I/O", description: "Load, save, stream data", color: "#3B82F6", icon: "database" },
  { id: "data-processing", name: "Data Processing", description: "Transform, clean, reshape", color: "#22C55E", icon: "filter" },
  { id: "text-nlp", name: "Text & NLP", description: "Tokenize, embed, parse", color: "#8B5CF6", icon: "type" },
  { id: "embeddings-retrieval", name: "Embeddings & Retrieval", description: "Vector search & RAG", color: "#7C3AED", icon: "search" },
  { id: "classical-ml", name: "Classical ML", description: "Linear regression to ensembles", color: "#16A34A", icon: "trending-up" },
  { id: "neural-networks", name: "Neural Networks", description: "Layers, activations, architectures", color: "#F59E0B", icon: "cpu" },
  { id: "transformers-llms", name: "Transformers & LLMs", description: "Attention, heads, modern architectures", color: "#A855F7", icon: "brain" },
  { id: "vision", name: "Vision Models", description: "CNNs, detectors, segmenters", color: "#F87171", icon: "eye" },
  { id: "audio-speech", name: "Audio & Speech", description: "ASR, TTS, audio features", color: "#14B8A6", icon: "music" },
  { id: "training", name: "Training", description: "Optimizers, losses, schedulers", color: "#2563EB", icon: "zap" },
  { id: "fine-tuning", name: "Fine-Tuning", description: "Adapt pretrained models", color: "#EC4899", icon: "sliders" },
  { id: "distillation", name: "Distillation & Compression", description: "Make models smaller and faster", color: "#D97706", icon: "minimize" },
  { id: "evaluation", name: "Evaluation & Metrics", description: "Measure model performance", color: "#EF4444", icon: "bar-chart" },
  { id: "experiment-tracking", name: "Experiment Tracking", description: "Log, compare, reproduce", color: "#059669", icon: "clipboard" },
  { id: "agents", name: "Agents & Orchestration", description: "LLM agents, tools, workflows", color: "#6D28D9", icon: "bot" },
  { id: "prompt-engineering", name: "Prompt Engineering", description: "Build & optimize prompts", color: "#9333EA", icon: "message-square" },
  { id: "deployment", name: "Deployment & Serving", description: "Package, serve, scale", color: "#1D4ED8", icon: "cloud" },
  { id: "monitoring", name: "Monitoring & Observability", description: "Track production quality & drift", color: "#DB2777", icon: "activity" },
  { id: "utilities", name: "Utilities & Variables", description: "General programming helpers", color: "#4B5563", icon: "wrench" },
  { id: "scaffolds", name: "Scaffolds", description: "Project templates that seed a file tree", color: "#0EA5E9", icon: "layout-template" },
  { id: "files", name: "Files", description: "Whole-file contributions (configs, manifests, infra)", color: "#64748B", icon: "file" },
  { id: "fragments", name: "Fragments", description: "Contributions into named regions across one or more files", color: "#0891B2", icon: "puzzle" },
];
