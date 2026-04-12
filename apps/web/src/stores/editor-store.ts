// ============================================================================
// Editor Store — with suggestions, chat, and starter skeleton pipeline
// ============================================================================

import { create } from "zustand";
import {
  BlockRegistry,
  type BlockDefinition,
  type PortDefinition,
  type PortType,
  arePortsCompatible,
} from "@ai-blocks/block-schemas";
import {
  type Graph,
  type GraphNode,
  createGraph,
  addNode,
  removeNode,
  moveNode,
  updateNodeParams,
  addEdge,
  removeEdge,
  validateGraph,
  type GraphError,
  generatePython,
  serializeGraph,
  deserializeGraph,
  appendGraphToPythonSource,
  extractGraphJsonFromPythonSource,
  graphFromPythonSource,
  graphFromImportPlan,
  extractCodeFromNotebook,
  autoWireRequiredInputs,
  resolveAssistantConnection,
} from "@ai-blocks/core";
import { fetchClaudeImportPlan, fetchClaudeImportPlanChunked } from "../claude-import.js";
import {
  createAutoResearchPipeline,
  createGPT4oChatPipeline,
  createMarchMadnessMLPipeline,
  createMarchMadnessSentimentPipeline,
  createOpenClawPipeline,
  createPolymarketArbitragePipeline,
  createPushupPoseDetectionPipeline,
  createElevenLabsTranslatorPipeline,
  createAlphaGoPipeline,
} from "./template-pipelines.js";
import { runAssistantTurn } from "../assistant/claudeAssistant.js";
import type { SuggestedBlock, ChatMessage } from "@ai-blocks/ui-components";
import { NODE_WIDTH } from "@ai-blocks/ui-components";
import { buildRepoMap, rebuildRepoMapForDir, readRepoFiles, type RepoMap } from "../repo/repo-map.js";
import { fetchGitHubRepo } from "../repo/github-import.js";

let _registry: BlockRegistry | null = null;

export function getRegistry(): BlockRegistry {
  if (!_registry) {
    _registry = new BlockRegistry();
  }
  return _registry;
}

export function setRegistry(r: BlockRegistry) {
  _registry = r;
}

export interface EditorState {
  graph: Graph;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  generatedCode: string;
  errors: GraphError[];
  codePanelOpen: boolean;
  suggestions: SuggestedBlock[];
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  apiKey: string;
  /** Bumped to re-center the canvas on the graph (import, load, clear, AI graph edits). */
  canvasFitNonce: number;

  /**
   * Populated when the user imports a repository via the folder picker.
   * When non-null AND `currentRepoFile` is null, the canvas renders the
   * repo mind-map view. When `currentRepoFile` is set, the canvas renders
   * that file's own block layout (via graphFromPythonSource).
   */
  repoMap: RepoMap | null;
  currentRepoFile: string | null;
  /** Per-file cache of Claude-mapped graphs so re-drilling is instant. */
  repoFileCache: Record<string, Graph>;
  /** True while drillIntoRepoFile is awaiting Claude for a fresh file. */
  repoLoading: boolean;

  addBlock: (blockId: string, x: number, y: number) => void;
  deleteSelected: () => void;
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
  moveNode: (nodeId: string, x: number, y: number) => void;
  updateParams: (nodeId: string, params: Record<string, unknown>) => void;
  connect: (srcNodeId: string, srcPortId: string, tgtNodeId: string, tgtPortId: string) => void;
  deleteEdge: (edgeId: string) => void;
  setName: (name: string) => void;
  toggleCodePanel: () => void;
  setApiKey: (key: string) => void;
  sendChat: (message: string) => void;
  acceptSuggestion: (suggestion: SuggestedBlock) => void;
  regenerateCode: () => void;
  save: () => void;
  load: () => void;
  /** Import .json / .py / .ipynb; with API key + Claude, maps code to registry blocks when possible */
  importPipeline: (fileText: string, filename: string) => Promise<void>;
  /** Remove all nodes and edges */
  clearWorkspace: () => void;
  /** Download generated Python only (clean — for tutorials / any ML script) */
  exportPython: () => void;
  /** Zip every file in the currently-loaded repo and download it. */
  downloadRepoZip: () => Promise<void>;
  /** Load a pre-built template pipeline and show the prompt in chat */
  loadTemplate: (templateId: string, prompt: string) => void;

  /** Walk a picked directory, build the mind-map graph, and show it. */
  importRepo: (files: FileList) => Promise<void>;
  /** Same mind map, but sourced from a public github.com URL. */
  importGitHubRepo: (url: string) => Promise<void>;
  /** Load a repo file's own block layout into the canvas. */
  drillIntoRepoFile: (filePath: string) => Promise<void>;
  /** Navigate into a subfolder in the repo mind map. */
  drillIntoRepoFolder: (dirPath: string) => void;
  /** Go up one step: file → its folder, subfolder → parent, root → no-op. */
  backToRepoMap: () => void;
  /** Exit repo mode entirely (clear the repoMap). */
  closeRepoMap: () => void;
}

function regenerate(graph: Graph): { code: string; errors: GraphError[] } {
  const registry = getRegistry();
  const errors = validateGraph(graph, registry);
  let code = "";
  try {
    code = generatePython(graph, registry);
  } catch (e) {
    code = `# Error: ${(e as Error).message}`;
  }
  return { code, errors };
}

// ── Suggestion Engine (scored, contextual — not first-match from registry order) ─

const SUGGEST_GAP = 280;
/** Vertical spacing between ghost suggestion blocks (stacked per port) */
const SUGGEST_ROW_GAP = 148;

/** Typical “what comes next” affinity: source category → bonus for candidate category */
const CATEGORY_FLOW_DOWN: Record<string, Partial<Record<string, number>>> = {
  "data-io": { "data-processing": 28, "utilities": 4 },
  "data-processing": { "classical-ml": 32, "neural-networks": 22, "training": 18, "evaluation": 14 },
  "classical-ml": { "evaluation": 38, "classical-ml": 12, "monitoring": 10, "deployment": 8 },
  "neural-networks": { "training": 28, "evaluation": 24, "monitoring": 8 },
  "transformers-llms": { "prompt-engineering": 22, "evaluation": 18, "training": 14 },
  "training": { "evaluation": 26, "neural-networks": 12 },
  "prompt-engineering": { "transformers-llms": 20, "agents": 16 },
  "agents": { "evaluation": 14, "monitoring": 12 },
  "vision": { "training": 20, "evaluation": 22 },
  "audio-speech": { "evaluation": 16, "neural-networks": 12 },
};

const CATEGORY_FLOW_UP: Record<string, Partial<Record<string, number>>> = {
  "data-processing": { "data-io": 32 },
  "classical-ml": { "data-processing": 28, "data-io": 12 },
  "neural-networks": { "data-processing": 14, "training": 22 },
  "evaluation": { "classical-ml": 24, "neural-networks": 18, "transformers-llms": 14, "data-processing": 10 },
  "training": { "neural-networks": 20, "data-processing": 12 },
  "transformers-llms": { "prompt-engineering": 18, "data-io": 10 },
};

type BonusRule = { prefix: string; outTypes: PortType[] | "*"; bonus: number };

/** High-signal block IDs for common pipeline steps (downstream of this output type) */
const DOWNSTREAM_ID_BONUSES: BonusRule[] = [
  { prefix: "data-processing.dataframe-to-xy", outTypes: ["dataframe"], bonus: 52 },
  { prefix: "data-processing.train-val-test-split", outTypes: ["dataframe"], bonus: 48 },
  { prefix: "data-processing.stratified-split", outTypes: ["dataframe"], bonus: 28 },
  { prefix: "data-processing.filter-rows", outTypes: ["dataframe"], bonus: 22 },
  { prefix: "data-processing.select-columns", outTypes: ["dataframe"], bonus: 18 },
  { prefix: "classical-ml.sklearn-predict", outTypes: ["model"], bonus: 55 },
  { prefix: "classical-ml.random-forest", outTypes: ["array"], bonus: 28 },
  { prefix: "classical-ml.logistic-regression", outTypes: ["array"], bonus: 26 },
  { prefix: "evaluation.accuracy", outTypes: ["tensor", "array"], bonus: 35 },
  { prefix: "evaluation.", outTypes: ["tensor", "array"], bonus: 22 },
  { prefix: "neural-networks.", outTypes: ["tensor"], bonus: 18 },
  { prefix: "transformers-llms.", outTypes: ["text", "text_list"], bonus: 26 },
  { prefix: "prompt-engineering.", outTypes: ["text", "prompt"], bonus: 24 },
];

/** Upstream blocks that usually feed this input type */
const UPSTREAM_ID_BONUSES: BonusRule[] = [
  { prefix: "data-io.load-csv", outTypes: ["dataframe"], bonus: 52 },
  { prefix: "data-io.load-parquet", outTypes: ["dataframe"], bonus: 48 },
  { prefix: "data-io.load-json", outTypes: ["dataframe"], bonus: 38 },
  { prefix: "data-processing.dataframe-to-xy", outTypes: ["array"], bonus: 45 },
  { prefix: "data-processing.train-val-test-split", outTypes: ["dataframe"], bonus: 30 },
  { prefix: "classical-ml.", outTypes: ["model"], bonus: 22 },
  { prefix: "transformers-llms.", outTypes: ["model", "tokenizer"], bonus: 20 },
];

function matchesOutTypes(rule: BonusRule, outType: PortType): boolean {
  if (rule.outTypes === "*") return true;
  return rule.outTypes.includes(outType);
}

function idPrefixBonus(id: string, rules: BonusRule[], outType: PortType): number {
  let best = 0;
  for (const r of rules) {
    if (!matchesOutTypes(r, outType)) continue;
    if (id.startsWith(r.prefix)) best = Math.max(best, r.bonus);
  }
  return best;
}

function scoreDownstream(
  source: BlockDefinition,
  outPort: PortDefinition,
  candidate: BlockDefinition,
  inPort: PortDefinition
): number {
  let s = 0;
  const ot = outPort.type;
  const it = inPort.type;

  if (ot === it) s += 45;
  else if (arePortsCompatible(ot, it)) s += 18;

  if (it === "any" && ot !== "any") s -= 18;
  if (ot === "any") s -= 6;

  const flow = CATEGORY_FLOW_DOWN[source.category]?.[candidate.category];
  if (flow !== undefined) s += flow;

  s += idPrefixBonus(candidate.id, DOWNSTREAM_ID_BONUSES, ot);

  if (candidate.inputs.length === 1) s += 8;
  if (candidate.deprecated) s -= 40;

  if (candidate.id === "control-flow.start") s -= 28;
  if (candidate.id.startsWith("utilities.constant")) s -= 12;

  const tags = candidate.tags.join(" ").toLowerCase();
  if (ot === "dataframe" && (tags.includes("pandas") || tags.includes("tabular"))) s += 10;
  if ((ot === "array" || ot === "tensor") && tags.includes("sklearn")) s += 8;

  return s;
}

function scoreUpstream(
  target: BlockDefinition,
  needIn: PortDefinition,
  candidate: BlockDefinition,
  outPort: PortDefinition
): number {
  let s = 0;
  const nt = needIn.type;
  const ct = outPort.type;

  if (ct === nt) s += 45;
  else if (arePortsCompatible(ct, nt)) s += 18;

  if (nt !== "any" && ct === "any") s -= 18;

  const flow = CATEGORY_FLOW_UP[target.category]?.[candidate.category];
  if (flow !== undefined) s += flow;

  s += idPrefixBonus(candidate.id, UPSTREAM_ID_BONUSES, nt);

  if (candidate.outputs.length === 1) s += 6;
  if (candidate.deprecated) s -= 40;
  if (candidate.id.startsWith("control-flow.")) s -= 22;

  return s;
}

interface ScoredPair {
  score: number;
  candidate: BlockDefinition;
  selectedPortId: string;
  newBlockPortId: string;
}

/** Keep the highest-scoring port pair per candidate block, then take top N by score */
function pickTopSuggestions(pairs: ScoredPair[], limit: number): ScoredPair[] {
  const bestById = new Map<string, ScoredPair>();
  for (const p of pairs) {
    const prev = bestById.get(p.candidate.id);
    if (!prev || p.score > prev.score) bestById.set(p.candidate.id, p);
  }
  return Array.from(bestById.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.candidate.name.localeCompare(b.candidate.name);
    })
    .slice(0, limit);
}

function computeSuggestions(
  graph: Graph,
  selectedNodeId: string | null,
  registry: BlockRegistry
): SuggestedBlock[] {
  if (!selectedNodeId) return [];
  const node = graph.nodes[selectedNodeId];
  if (!node) return [];

  const blockDef = registry.get(node.blockId);
  if (!blockDef) return [];

  const suggestions: SuggestedBlock[] = [];

  // RIGHT: one ranked suggestion per unwired output (covers every connector you still need downstream)
  let rightRow = 0;
  for (const outPort of blockDef.outputs) {
    const alreadyConnected = Object.values(graph.edges).some(
      (e) => e.sourceNodeId === selectedNodeId && e.sourcePortId === outPort.id
    );
    if (alreadyConnected) continue;

    const pairs: ScoredPair[] = [];
    for (const candidate of registry.getAll()) {
      if (candidate.id === blockDef.id) continue;
      for (const inPort of candidate.inputs) {
        if (!arePortsCompatible(outPort.type, inPort.type)) continue;
        pairs.push({
          score: scoreDownstream(blockDef, outPort, candidate, inPort),
          candidate,
          selectedPortId: outPort.id,
          newBlockPortId: inPort.id,
        });
      }
    }
    const best = pickTopSuggestions(pairs, 1)[0];
    if (!best) continue;
    suggestions.push({
      blockDef: best.candidate,
      position: {
        x: node.position.x + NODE_WIDTH + SUGGEST_GAP,
        y: node.position.y + rightRow * SUGGEST_ROW_GAP,
      },
      selectedNodeId,
      side: "right",
      selectedPortId: best.selectedPortId,
      newBlockPortId: best.newBlockPortId,
    });
    rightRow++;
  }

  // LEFT: one ranked suggestion per missing required input
  let leftRow = 0;
  for (const inPort of blockDef.inputs) {
    if (!inPort.required) continue;
    const connected = Object.values(graph.edges).some(
      (e) => e.targetNodeId === selectedNodeId && e.targetPortId === inPort.id
    );
    if (connected) continue;

    const pairs: ScoredPair[] = [];
    for (const candidate of registry.getAll()) {
      if (candidate.id === blockDef.id) continue;
      for (const outPort of candidate.outputs) {
        if (!arePortsCompatible(outPort.type, inPort.type)) continue;
        pairs.push({
          score: scoreUpstream(blockDef, inPort, candidate, outPort),
          candidate,
          selectedPortId: inPort.id,
          newBlockPortId: outPort.id,
        });
      }
    }
    const best = pickTopSuggestions(pairs, 1)[0];
    if (!best) continue;
    suggestions.push({
      blockDef: best.candidate,
      position: {
        x: node.position.x - NODE_WIDTH - SUGGEST_GAP,
        y: node.position.y + leftRow * SUGGEST_ROW_GAP,
      },
      selectedNodeId,
      side: "left",
      selectedPortId: best.selectedPortId,
      newBlockPortId: best.newBlockPortId,
    });
    leftRow++;
  }

  return suggestions;
}

// ── Starter Pipeline ─────────────────────────────────────────

function createStarterPipeline(registry: BlockRegistry): Graph {
  const graph = createGraph("My ML Pipeline");

  const loadDef = registry.get("data-io.load-csv");
  const splitDef = registry.get("data-processing.train-val-test-split");
  const dfxyDef = registry.get("data-processing.dataframe-to-xy");
  const rfDef = registry.get("classical-ml.random-forest");
  const predDef = registry.get("classical-ml.sklearn-predict");
  const accDef = registry.get("evaluation.accuracy");

  if (!loadDef || !splitDef || !dfxyDef || !rfDef || !predDef || !accDef) {
    return graph;
  }

  const tabularParams = {
    feature_columns: "feature_1, feature_2",
    target_column: "label",
  };

  // Fork–merge layout: train path arcs upward, test path downward, merge at predict → accuracy
  const nLoad = addNode(graph, loadDef, { x: 100, y: 320 });
  const nSplit = addNode(graph, splitDef, { x: 400, y: 320 });
  const nTrainXY = addNode(graph, dfxyDef, { x: 720, y: 130 }, { parameters: tabularParams });
  const nRF = addNode(graph, rfDef, { x: 1060, y: 110 });
  const nTestXY = addNode(graph, dfxyDef, { x: 720, y: 510 }, { parameters: tabularParams });
  const nPred = addNode(graph, predDef, { x: 1340, y: 300 });
  const nAcc = addNode(graph, accDef, { x: 1660, y: 360 });

  addEdge(graph, nLoad.id, loadDef.outputs[0].id, nSplit.id, splitDef.inputs[0].id);
  addEdge(graph, nSplit.id, "train", nTrainXY.id, "dataframe");
  addEdge(graph, nTrainXY.id, "X", nRF.id, "X_train");
  addEdge(graph, nTrainXY.id, "y", nRF.id, "y_train");
  addEdge(graph, nSplit.id, "test", nTestXY.id, "dataframe");
  addEdge(graph, nTestXY.id, "X", nPred.id, "X");
  addEdge(graph, nRF.id, "model", nPred.id, "model");
  addEdge(graph, nTestXY.id, "y", nAcc.id, "y_true");
  addEdge(graph, nPred.id, "y_pred", nAcc.id, "y_pred");

  return graph;
}

// ── Store ────────────────────────────────────────────────────

export const useEditorStore = create<EditorState>((set, get) => ({
  graph: createGraph(),
  selectedNodeId: null,
  selectedEdgeId: null,
  generatedCode: "",
  errors: [],
  codePanelOpen: true,
  suggestions: [],
  chatMessages: [],
  chatLoading: false,
  apiKey:
    import.meta.env.VITE_ANTHROPIC_API_KEY ??
    localStorage.getItem("ai-blocks-api-key") ??
    "",
  canvasFitNonce: 0,
  repoMap: null,
  currentRepoFile: null,
  repoFileCache: {},
  repoLoading: false,

  addBlock(blockId, x, y) {
    const registry = getRegistry();
    const blockDef = registry.get(blockId);
    if (!blockDef) return;

    const graph = { ...get().graph, nodes: { ...get().graph.nodes }, edges: { ...get().graph.edges } };
    const node = addNode(graph, blockDef, { x, y });

    const { code, errors } = regenerate(graph);
    const suggestions = computeSuggestions(graph, node.id, registry);
    set({ graph, selectedNodeId: node.id, selectedEdgeId: null, generatedCode: code, errors, suggestions });
  },

  deleteSelected() {
    const { selectedNodeId, selectedEdgeId, graph: prevGraph } = get();
    const graph = { ...prevGraph, nodes: { ...prevGraph.nodes }, edges: { ...prevGraph.edges } };

    if (selectedNodeId) removeNode(graph, selectedNodeId);
    else if (selectedEdgeId) removeEdge(graph, selectedEdgeId);
    else return;

    const { code, errors } = regenerate(graph);
    set({ graph, selectedNodeId: null, selectedEdgeId: null, generatedCode: code, errors, suggestions: [] });
  },

  selectNode(nodeId) {
    const registry = getRegistry();
    const suggestions = nodeId ? computeSuggestions(get().graph, nodeId, registry) : [];
    set({ selectedNodeId: nodeId, selectedEdgeId: nodeId ? null : get().selectedEdgeId, suggestions });
  },

  selectEdge(edgeId) {
    set({ selectedEdgeId: edgeId, selectedNodeId: edgeId ? null : get().selectedNodeId, suggestions: [] });
  },

  moveNode(nodeId, x, y) {
    const graph = { ...get().graph, nodes: { ...get().graph.nodes } };
    moveNode(graph, nodeId, { x, y });
    set({ graph, suggestions: [] });
  },

  updateParams(nodeId, params) {
    const graph = { ...get().graph, nodes: { ...get().graph.nodes } };
    updateNodeParams(graph, nodeId, params);
    const { code, errors } = regenerate(graph);
    set({ graph, generatedCode: code, errors });
  },

  connect(srcNodeId, srcPortId, tgtNodeId, tgtPortId) {
    const graph = { ...get().graph, nodes: { ...get().graph.nodes }, edges: { ...get().graph.edges } };
    const edge = addEdge(graph, srcNodeId, srcPortId, tgtNodeId, tgtPortId);
    if (!edge) return;

    const { code, errors } = regenerate(graph);
    const registry = getRegistry();
    const suggestions = computeSuggestions(graph, tgtNodeId, registry);
    set({ graph, generatedCode: code, errors, suggestions });
  },

  deleteEdge(edgeId) {
    const graph = { ...get().graph, edges: { ...get().graph.edges } };
    removeEdge(graph, edgeId);
    const { code, errors } = regenerate(graph);
    set({ graph, selectedEdgeId: null, generatedCode: code, errors });
  },

  setName(name) {
    set({ graph: { ...get().graph, name } });
  },

  toggleCodePanel() {
    set({ codePanelOpen: !get().codePanelOpen });
  },

  setApiKey(key) {
    localStorage.setItem("ai-blocks-api-key", key);
    set({ apiKey: key });
  },

  async sendChat(message) {
    const { chatMessages, apiKey, graph, selectedNodeId } = get();
    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: message }];
    set({ chatMessages: newMessages, chatLoading: true });

    try {
      const registry = getRegistry();
      const result = await runAssistantTurn(newMessages, apiKey, graph, registry);
      const nextGraph = result.nextGraph ?? graph;
      const { code, errors } = regenerate(nextGraph);
      const suggestions = computeSuggestions(nextGraph, selectedNodeId, registry);
      set({
        graph: nextGraph,
        chatMessages: [...newMessages, { role: "assistant", content: result.message }],
        chatLoading: false,
        generatedCode: code,
        errors,
        suggestions,
        ...(result.nextGraph ? { canvasFitNonce: get().canvasFitNonce + 1 } : {}),
      });
    } catch (e) {
      set({
        chatMessages: [...newMessages, { role: "assistant", content: `Error: ${(e as Error).message}` }],
        chatLoading: false,
      });
    }
  },

  acceptSuggestion(suggestion) {
    const registry = getRegistry();
    const graph = { ...get().graph, nodes: { ...get().graph.nodes }, edges: { ...get().graph.edges } };
    const node = addNode(graph, suggestion.blockDef, suggestion.position);
    if (suggestion.side === "right") {
      const r = resolveAssistantConnection(
        registry,
        graph,
        suggestion.selectedNodeId,
        suggestion.selectedPortId,
        node.id,
        suggestion.newBlockPortId
      );
      if (r) {
        addEdge(graph, r.sourceNodeId, r.sourcePortId, r.targetNodeId, r.targetPortId);
      } else {
        addEdge(
          graph,
          suggestion.selectedNodeId,
          suggestion.selectedPortId,
          node.id,
          suggestion.newBlockPortId
        );
      }
    } else {
      const r = resolveAssistantConnection(
        registry,
        graph,
        node.id,
        suggestion.newBlockPortId,
        suggestion.selectedNodeId,
        suggestion.selectedPortId
      );
      if (r) {
        addEdge(graph, r.sourceNodeId, r.sourcePortId, r.targetNodeId, r.targetPortId);
      } else {
        addEdge(
          graph,
          node.id,
          suggestion.newBlockPortId,
          suggestion.selectedNodeId,
          suggestion.selectedPortId
        );
      }
    }

    autoWireRequiredInputs(graph, registry);

    const { code, errors } = regenerate(graph);
    const newSuggestions = computeSuggestions(graph, node.id, registry);
    set({ graph, selectedNodeId: node.id, selectedEdgeId: null, generatedCode: code, errors, suggestions: newSuggestions });
  },

  regenerateCode() {
    const { code, errors } = regenerate(get().graph);
    set({ generatedCode: code, errors });
  },

  save() {
    const json = serializeGraph(get().graph);
    localStorage.setItem("ai-blocks-graph", json);
  },

  load() {
    const json = localStorage.getItem("ai-blocks-graph");
    if (!json) return;
    try {
      const graph = deserializeGraph(json);
      const { code, errors } = regenerate(graph);
      set({
        graph,
        generatedCode: code,
        errors,
        selectedNodeId: null,
        selectedEdgeId: null,
        suggestions: [],
        canvasFitNonce: get().canvasFitNonce + 1,
      });
    } catch (e) {
      console.error("Failed to load graph:", e);
    }
  },

  async importPipeline(fileText, filename) {
    const lower = filename.toLowerCase();
    const baseName =
      filename.replace(/^.*[/\\]/, "").replace(/\.(json|py|ipynb)$/i, "") || "Imported Pipeline";

    const registry = getRegistry();
    const { apiKey } = get();

    let graph: Graph;
    if (lower.endsWith(".json")) {
      graph = deserializeGraph(fileText);
    } else if (lower.endsWith(".py")) {
      const extracted = extractGraphJsonFromPythonSource(fileText);
      if (extracted) {
        try {
          graph = deserializeGraph(extracted);
        } catch {
          if (apiKey) {
            try {
              const plan = await fetchClaudeImportPlan(fileText, registry, apiKey);
              graph =
                plan.nodes.length > 0
                  ? graphFromImportPlan(plan, registry, { name: baseName })
                  : graphFromPythonSource(fileText, registry, { name: baseName });
            } catch {
              graph = graphFromPythonSource(fileText, registry, { name: baseName });
            }
          } else {
            graph = graphFromPythonSource(fileText, registry, { name: baseName });
          }
        }
      } else if (apiKey) {
        try {
          const plan = await fetchClaudeImportPlan(fileText, registry, apiKey);
          graph =
            plan.nodes.length > 0
              ? graphFromImportPlan(plan, registry, { name: baseName })
              : graphFromPythonSource(fileText, registry, { name: baseName });
        } catch {
          graph = graphFromPythonSource(fileText, registry, { name: baseName });
        }
      } else {
        graph = graphFromPythonSource(fileText, registry, { name: baseName });
      }
    } else if (lower.endsWith(".ipynb")) {
      const code = extractCodeFromNotebook(fileText);
      if (!code.trim()) {
        throw new Error("No code cells found in this notebook.");
      }
      if (apiKey) {
        try {
          const plan = await fetchClaudeImportPlan(code, registry, apiKey);
          graph =
            plan.nodes.length > 0
              ? graphFromImportPlan(plan, registry, { name: baseName })
              : graphFromPythonSource(code, registry, { name: baseName });
        } catch {
          graph = graphFromPythonSource(code, registry, { name: baseName });
        }
      } else {
        graph = graphFromPythonSource(code, registry, { name: baseName });
      }
    } else {
      throw new Error("Use a .json, .py, or .ipynb file.");
    }
    const { code, errors } = regenerate(graph);
    set({
      graph,
      generatedCode: code,
      errors,
      selectedNodeId: null,
      selectedEdgeId: null,
      suggestions: [],
      canvasFitNonce: get().canvasFitNonce + 1,
    });
    try {
      localStorage.setItem("ai-blocks-graph", serializeGraph(graph));
    } catch {
      /* ignore quota */
    }
  },

  clearWorkspace() {
    const graph = createGraph("Untitled Pipeline");
    const { code, errors } = regenerate(graph);
    set({
      graph,
      generatedCode: code,
      errors,
      selectedNodeId: null,
      selectedEdgeId: null,
      suggestions: [],
      canvasFitNonce: get().canvasFitNonce + 1,
    });
    try {
      localStorage.removeItem("ai-blocks-graph");
    } catch {
      /* ignore */
    }
  },

  exportPython() {
    const graph = get().graph;
    const code = get().generatedCode;
    const blob = new Blob([code.endsWith("\n") ? code : `${code}\n`], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${graph.name.replace(/\s+/g, "_").toLowerCase()}.py`;
    a.click();
    URL.revokeObjectURL(url);
  },

  loadTemplate(templateId, prompt) {
    const registry = getRegistry();
    const builders: Record<string, (r: BlockRegistry) => Graph | null> = {
      "auto-research": createAutoResearchPipeline,
      "gpt4-chat": createGPT4oChatPipeline,
      "march-madness-ml": createMarchMadnessMLPipeline,
      "march-madness-sentiment": createMarchMadnessSentimentPipeline,
      "openclaw": createOpenClawPipeline,
      "polymarket-arb": createPolymarketArbitragePipeline,
      "pushup-pose": createPushupPoseDetectionPipeline,
      "elevenlabs-translator": createElevenLabsTranslatorPipeline,
      "alphago": createAlphaGoPipeline,
    };
    const builder = builders[templateId];
    if (!builder) return;
    const graph = builder(registry);
    if (!graph) return;
    const { code, errors } = regenerate(graph);
    const chatMessages: ChatMessage[] = [
      { role: "user", content: prompt },
      { role: "assistant", content: `I've built the **${graph.name}** pipeline for you! The canvas shows the complete workflow. You can click any block to inspect or modify its parameters.\n\nHit the **Code** panel to see the generated Python.` },
    ];
    set({
      graph,
      generatedCode: code,
      errors,
      chatMessages,
      chatLoading: false,
      selectedNodeId: null,
      selectedEdgeId: null,
      suggestions: [],
      canvasFitNonce: get().canvasFitNonce + 1,
    });
  },

  async importGitHubRepo(url) {
    set({ repoLoading: true });
    let result;
    try {
      result = await fetchGitHubRepo(url);
    } catch (err) {
      set({ repoLoading: false });
      alert((err as Error).message);
      return;
    }
    const { files, truncated, capped, ref } = result;
    if (files.length === 0) {
      set({ repoLoading: false });
      alert("Repo had no importable files.");
      return;
    }
    const repoMap = buildRepoMap(files, "");
    const pyCount = files.filter((f) => f.kind === "python").length;
    const jsCount = files.filter((f) => f.kind === "js").length;
    const otherCount = files.length - pyCount - jsCount;
    const notes: string[] = [];
    if (capped) notes.push("capped at 500 files");
    if (truncated) notes.push("tree truncated by GitHub");
    const tail = notes.length > 0 ? ` (${notes.join(", ")})` : "";
    set({
      repoMap,
      currentRepoFile: null,
      repoFileCache: {},
      graph: repoMap.graph,
      generatedCode:
        `# GitHub repo @ ${ref} — ${files.length} files ` +
        `(${pyCount} Python, ${jsCount} JS/TS, ${otherCount} other)${tail}.\n` +
        `# Click a folder to drill in, or a Python file to see its block layout.`,
      errors: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      suggestions: [],
      repoLoading: false,
      canvasFitNonce: get().canvasFitNonce + 1,
    });
  },

  async importRepo(fileList) {
    const files = await readRepoFiles(fileList);
    if (files.length === 0) {
      alert("No readable files found in that folder.");
      return;
    }
    const repoMap = buildRepoMap(files, "");
    const pyCount = files.filter((f) => f.kind === "python").length;
    const jsCount = files.filter((f) => f.kind === "js").length;
    const otherCount = files.length - pyCount - jsCount;
    set({
      repoMap,
      currentRepoFile: null,
      repoFileCache: {},
      graph: repoMap.graph,
      generatedCode:
        `# Repo mind map — ${files.length} files ` +
        `(${pyCount} Python, ${jsCount} JS/TS, ${otherCount} other).\n` +
        `# Click a folder to drill in, or a Python file to see its block layout.`,
      errors: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      suggestions: [],
      canvasFitNonce: get().canvasFitNonce + 1,
    });
  },

  async drillIntoRepoFile(filePath) {
    const { repoMap, apiKey, repoFileCache } = get();
    if (!repoMap) return;
    const kind = repoMap.kinds[filePath];
    if (kind !== "python") {
      alert(
        `Block-layout view is Python-only right now. "${filePath}" is ${kind ?? "unknown"}.`,
      );
      return;
    }
    const source = repoMap.files[filePath];
    if (!source) return;
    const registry = getRegistry();

    // Fast path: already mapped this file in this session.
    const cached = repoFileCache[filePath];
    if (cached) {
      const { code, errors } = regenerate(cached);
      set({
        graph: cached,
        currentRepoFile: filePath,
        generatedCode: code,
        errors,
        selectedNodeId: null,
        selectedEdgeId: null,
        suggestions: [],
        repoLoading: false,
        canvasFitNonce: get().canvasFitNonce + 1,
      });
      return;
    }

    // Slow path: ask Claude (when a key is set) to map the file onto real
    // registry blocks. Keep the existing mind-map graph on screen during
    // the fetch so there's no grey-blocks flash in the middle.
    set({ repoLoading: true });
    let graph: Graph;
    let drillNote = "";
    if (apiKey) {
      try {
        const plan = await fetchClaudeImportPlanChunked(source, registry, apiKey);
        if (plan.nodes.length > 0) {
          graph = graphFromImportPlan(plan, registry, { name: filePath });
        } else {
          drillNote = "# Claude returned an empty plan — showing raw-line fallback.";
          console.warn("[drillIntoRepoFile] empty plan for", filePath);
          graph = graphFromPythonSource(source, registry, { name: filePath });
        }
      } catch (err) {
        const msg = (err as Error).message ?? String(err);
        drillNote = `# Claude mapping failed: ${msg}\n# Showing raw-line fallback.`;
        console.warn("[drillIntoRepoFile] claude failed for", filePath, err);
        graph = graphFromPythonSource(source, registry, { name: filePath });
      }
    } else {
      drillNote = "# No VITE_ANTHROPIC_API_KEY set — showing raw-line fallback.";
      graph = graphFromPythonSource(source, registry, { name: filePath });
    }

    // Claude's plan often names blocks but doesn't wire every required input.
    // Run the same auto-wire pass that addBlock/assistant use so the generated
    // Python comes back clean instead of a wall of "Required input not connected".
    autoWireRequiredInputs(graph, registry);

    const { code, errors } = regenerate(graph);
    const finalCode = drillNote ? `${drillNote}\n${code}` : code;
    set({
      graph,
      currentRepoFile: filePath,
      generatedCode: finalCode,
      errors,
      selectedNodeId: null,
      selectedEdgeId: null,
      suggestions: [],
      repoLoading: false,
      // Only cache *successful* Claude mappings — don't pin a bad fallback.
      repoFileCache: drillNote
        ? get().repoFileCache
        : { ...get().repoFileCache, [filePath]: graph },
      canvasFitNonce: get().canvasFitNonce + 1,
    });
  },

  drillIntoRepoFolder(dirPath) {
    const { repoMap } = get();
    if (!repoMap) return;
    const next = rebuildRepoMapForDir(repoMap, dirPath);
    set({
      repoMap: next,
      graph: next.graph,
      currentRepoFile: null,
      generatedCode: `# ${dirPath || "/"} — ${Object.keys(next.graph.nodes).length} items.`,
      errors: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      suggestions: [],
      canvasFitNonce: get().canvasFitNonce + 1,
    });
  },

  backToRepoMap() {
    const { repoMap, currentRepoFile } = get();
    if (!repoMap) return;
    // From a drilled file → its containing folder view.
    if (currentRepoFile) {
      const slash = currentRepoFile.lastIndexOf("/");
      const parentDir = slash >= 0 ? currentRepoFile.slice(0, slash) : "";
      const view = rebuildRepoMapForDir(repoMap, parentDir);
      set({
        repoMap: view,
        graph: view.graph,
        currentRepoFile: null,
        generatedCode: `# ${parentDir || "/"} — ${Object.keys(view.graph.nodes).length} items.`,
        errors: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        suggestions: [],
        canvasFitNonce: get().canvasFitNonce + 1,
      });
      return;
    }
    // From a nested folder view → its parent. Root view is a no-op.
    if (repoMap.currentDir === "") return;
    const slash = repoMap.currentDir.lastIndexOf("/");
    const parentDir = slash >= 0 ? repoMap.currentDir.slice(0, slash) : "";
    const view = rebuildRepoMapForDir(repoMap, parentDir);
    set({
      repoMap: view,
      graph: view.graph,
      currentRepoFile: null,
      generatedCode: `# ${parentDir || "/"} — ${Object.keys(view.graph.nodes).length} items.`,
      errors: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      suggestions: [],
      canvasFitNonce: get().canvasFitNonce + 1,
    });
  },

  closeRepoMap() {
    const graph = createGraph("Untitled Pipeline");
    const { code, errors } = regenerate(graph);
    set({
      repoMap: null,
      currentRepoFile: null,
      repoFileCache: {},
      graph,
      generatedCode: code,
      errors,
      selectedNodeId: null,
      selectedEdgeId: null,
      suggestions: [],
      canvasFitNonce: get().canvasFitNonce + 1,
    });
  },

  async downloadRepoZip() {
    const { repoMap } = get();
    if (!repoMap) {
      alert("No repo loaded. Import a folder or a GitHub repo first.");
      return;
    }
    const paths = Object.keys(repoMap.files);
    if (paths.length === 0) {
      alert("Repo has no files to download.");
      return;
    }
    // Dynamic import so jszip only loads when someone actually clicks
    // download — saves ~30kB from the initial bundle.
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    for (const path of paths) {
      zip.file(path, repoMap.files[path] ?? "");
    }
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(repoMap.graph.name || "repo").replace(/\s+/g, "_").toLowerCase()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  },
}));

/** Call after registry is initialized to set up the starter pipeline */
export function loadStarterPipeline() {
  const registry = getRegistry();
  const graph = createStarterPipeline(registry);
  const errors = validateGraph(graph, registry);
  let code = "";
  try {
    code = generatePython(graph, registry);
  } catch (e) {
    code = `# Error: ${(e as Error).message}`;
  }
  useEditorStore.setState((s) => ({
    graph,
    generatedCode: code,
    errors,
    canvasFitNonce: s.canvasFitNonce + 1,
  }));
}
