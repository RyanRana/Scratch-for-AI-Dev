export { controlFlowBlocks } from "./control-flow.js";
export { dataIoBlocks } from "./data-io.js";
export { dataProcessingBlocks } from "./data-processing.js";
export { textNlpBlocks } from "./text-nlp.js";
export { embeddingsRetrievalBlocks } from "./embeddings-retrieval.js";
export { classicalMlBlocks } from "./classical-ml.js";
export { neuralNetworkBlocks } from "./neural-networks.js";
export { transformersLlmBlocks } from "./transformers-llms.js";
export { visionBlocks } from "./vision.js";
export { audioSpeechBlocks } from "./audio-speech.js";
export { trainingBlocks } from "./training.js";
export { fineTuningBlocks } from "./fine-tuning.js";
export { distillationBlocks } from "./distillation.js";
export { evaluationBlocks } from "./evaluation.js";
export { experimentTrackingBlocks } from "./experiment-tracking.js";
export { agentsBlocks } from "./agents.js";
export { promptEngineeringBlocks } from "./prompt-engineering.js";
export { monitoringBlocks } from "./monitoring.js";
export { utilitiesBlocks } from "./utilities.js";
export { scaffoldsBlocks } from "./scaffolds.js";
export { filesBlocks } from "./files.js";
export { fragmentsBlocks } from "./fragments.js";

import type { BlockDefinition } from "../types.js";
import { controlFlowBlocks } from "./control-flow.js";
import { dataIoBlocks } from "./data-io.js";
import { dataProcessingBlocks } from "./data-processing.js";
import { textNlpBlocks } from "./text-nlp.js";
import { embeddingsRetrievalBlocks } from "./embeddings-retrieval.js";
import { classicalMlBlocks } from "./classical-ml.js";
import { neuralNetworkBlocks } from "./neural-networks.js";
import { transformersLlmBlocks } from "./transformers-llms.js";
import { visionBlocks } from "./vision.js";
import { audioSpeechBlocks } from "./audio-speech.js";
import { trainingBlocks } from "./training.js";
import { fineTuningBlocks } from "./fine-tuning.js";
import { distillationBlocks } from "./distillation.js";
import { evaluationBlocks } from "./evaluation.js";
import { experimentTrackingBlocks } from "./experiment-tracking.js";
import { agentsBlocks } from "./agents.js";
import { promptEngineeringBlocks } from "./prompt-engineering.js";
import { monitoringBlocks } from "./monitoring.js";
import { utilitiesBlocks } from "./utilities.js";
import { scaffoldsBlocks } from "./scaffolds.js";
import { filesBlocks } from "./files.js";
import { fragmentsBlocks } from "./fragments.js";

/** All block definitions from every category */
export const ALL_BLOCKS: BlockDefinition[] = [
  ...controlFlowBlocks,
  ...dataIoBlocks,
  ...dataProcessingBlocks,
  ...textNlpBlocks,
  ...embeddingsRetrievalBlocks,
  ...classicalMlBlocks,
  ...neuralNetworkBlocks,
  ...transformersLlmBlocks,
  ...visionBlocks,
  ...audioSpeechBlocks,
  ...trainingBlocks,
  ...fineTuningBlocks,
  ...distillationBlocks,
  ...evaluationBlocks,
  ...experimentTrackingBlocks,
  ...agentsBlocks,
  ...promptEngineeringBlocks,
  ...monitoringBlocks,
  ...utilitiesBlocks,
  ...scaffoldsBlocks,
  ...filesBlocks,
  ...fragmentsBlocks,
];
