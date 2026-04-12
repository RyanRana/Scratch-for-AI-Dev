// ============================================================================
// Design Tokens — minimalistic white theme
// Blocks are the main color; everything else is clean and quiet
// ============================================================================

export const colors = {
  // Canvas
  canvasBg: "#f8f9fb",
  canvasGrid: "#e8eaef",
  canvasGridAccent: "#d0d4dd",

  // Surfaces
  surface0: "#ffffff",
  surface1: "#f4f5f7",
  surface2: "#ecedf0",
  surface3: "#e2e4e8",

  // Borders
  border: "#e0e2e7",
  borderHover: "#c4c8d0",
  borderActive: "#6366f1",

  // Text
  textPrimary: "#1e1e2e",
  textSecondary: "#5c5f73",
  textMuted: "#9094a6",
  textOnBlock: "#ffffff",

  // Accent
  accent: "#6366f1",
  accentHover: "#818cf8",
  accentMuted: "#6366f118",

  // Semantic
  success: "#16a34a",
  warning: "#d97706",
  error: "#dc2626",
  info: "#2563eb",

  // Ghost / suggestion
  ghostBg: "#6366f10a",
  ghostBorder: "#6366f130",
  ghostText: "#6366f180",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
} as const;

export const fontSizes = {
  xs: "10px",
  sm: "12px",
  md: "13px",
  lg: "15px",
  xl: "18px",
  xxl: "24px",
} as const;

export const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  md: "0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
  lg: "0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
  block: "0 2px 8px rgba(0,0,0,0.08)",
  blockHover: "0 4px 16px rgba(0,0,0,0.12)",
  blockSelected: "0 0 0 3px #6366f140, 0 4px 16px rgba(0,0,0,0.12)",
} as const;

/** Category colors — looked up by category id */
export const CATEGORY_COLORS: Record<string, string> = {
  "control-flow": "#6B7280",
  "data-io": "#3B82F6",
  "data-processing": "#22C55E",
  "text-nlp": "#8B5CF6",
  "embeddings-retrieval": "#7C3AED",
  "classical-ml": "#16A34A",
  "neural-networks": "#F59E0B",
  "transformers-llms": "#A855F7",
  "vision": "#F87171",
  "audio-speech": "#14B8A6",
  "training": "#2563EB",
  "fine-tuning": "#EC4899",
  "distillation": "#D97706",
  "evaluation": "#EF4444",
  "experiment-tracking": "#059669",
  "agents": "#6D28D9",
  "prompt-engineering": "#9333EA",
  "deployment": "#1D4ED8",
  "monitoring": "#DB2777",
  "utilities": "#4B5563",
};

/** Port type colors — for dots and wires */
export const PORT_TYPE_COLORS: Record<string, string> = {
  tensor: "#F59E0B",
  dataframe: "#22C55E",
  series: "#22C55E",
  text: "#8B5CF6",
  text_list: "#8B5CF6",
  model: "#EF4444",
  model_params: "#EF4444",
  number: "#3B82F6",
  boolean: "#14B8A6",
  any: "#9094a6",
  image: "#F97316",
  image_batch: "#F97316",
  audio: "#14B8A6",
  list: "#A855F7",
  dict: "#22C55E",
  embedding: "#7C3AED",
  embedding_list: "#7C3AED",
  array: "#F59E0B",
  void: "#9094a6",
  optimizer: "#2563EB",
  scheduler: "#2563EB",
  loss_fn: "#EF4444",
  metric: "#EF4444",
  tokenizer: "#8B5CF6",
  config: "#6B7280",
  path: "#6B7280",
  dataset: "#3B82F6",
  dataloader: "#3B82F6",
  agent: "#6D28D9",
  tool: "#6D28D9",
  prompt: "#9333EA",
  chain: "#9333EA",
  index: "#7C3AED",
  callback: "#6B7280",
};
