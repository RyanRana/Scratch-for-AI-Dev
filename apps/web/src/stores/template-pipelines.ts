// ============================================================================
// Pre-built starter template pipelines
// ============================================================================

import type { BlockRegistry } from "@ai-blocks/block-schemas";
import { createGraph, addNode, addEdge, type Graph } from "@ai-blocks/core";

// ── 1. Auto Research Agent (Karpathy-style) ─────────────────────────────────

export function createAutoResearchPipeline(registry: BlockRegistry): Graph | null {
  const graph = createGraph("Auto Research Agent");

  const varDef = registry.get("utilities.variable");
  const sysDef = registry.get("prompt-engineering.system-prompt");
  const cotDef = registry.get("prompt-engineering.chain-of-thought");
  const agentDef = registry.get("agents.llm-agent");
  const httpDef = registry.get("utilities.http-request");
  const jsonDef = registry.get("utilities.json-parse");
  const sumDef = registry.get("text-nlp.summarize-text");
  const logDef = registry.get("control-flow.log-print");

  if (!varDef || !sysDef || !cotDef || !agentDef || !httpDef || !jsonDef || !sumDef || !logDef) return null;

  const nTopic = addNode(graph, varDef, { x: 80, y: 300 }, {
    parameters: { name: "research_topic", default_value: '"Transformer architectures 2024"' },
  });
  const nSys = addNode(graph, sysDef, { x: 400, y: 120 }, {
    parameters: { content: "You are a research assistant. Given a topic, generate 3 focused search queries to find recent papers and articles. Return each query on a new line." },
  });
  const nCot = addNode(graph, cotDef, { x: 400, y: 420 }, {
    parameters: { instruction: "Let's think step by step about what aspects of this topic to research." },
  });
  const nAgent = addNode(graph, agentDef, { x: 740, y: 300 }, {
    parameters: { model: "claude-sonnet-4-20250514", temperature: 0.2, max_tokens: 4096 },
  });
  const nHttp = addNode(graph, httpDef, { x: 1060, y: 180 }, {
    parameters: { url: "https://api.semanticscholar.org/graph/v1/paper/search", method: "GET" },
  });
  const nJson = addNode(graph, jsonDef, { x: 1380, y: 180 });
  const nSum = addNode(graph, sumDef, { x: 1380, y: 420 }, {
    parameters: { max_length: 300, min_length: 50 },
  });
  const nLog = addNode(graph, logDef, { x: 1700, y: 300 }, {
    parameters: { prefix: "[Research Report]" },
  });

  addEdge(graph, nTopic.id, "value", nCot.id, "query");
  addEdge(graph, nTopic.id, "value", nAgent.id, "goal");
  addEdge(graph, nAgent.id, "result", nHttp.id, "body");
  addEdge(graph, nHttp.id, "response", nJson.id, "text");
  addEdge(graph, nAgent.id, "result", nSum.id, "text");
  addEdge(graph, nSum.id, "summary", nLog.id, "value");

  return graph;
}

// ── 2. GPT-4o Chat App ──────────────────────────────────────────────────────

export function createGPT4oChatPipeline(registry: BlockRegistry): Graph | null {
  const graph = createGraph("GPT-4o Chat App");

  const varDef = registry.get("utilities.variable");
  const sysDef = registry.get("prompt-engineering.system-prompt");
  const fewDef = registry.get("prompt-engineering.few-shot-examples");
  const agentDef = registry.get("agents.llm-agent");
  const memDef = registry.get("agents.memory-long-term");
  const logDef = registry.get("control-flow.log-print");

  if (!varDef || !sysDef || !fewDef || !agentDef || !memDef || !logDef) return null;

  const nInput = addNode(graph, varDef, { x: 80, y: 300 }, {
    parameters: { name: "user_message", default_value: '"Hello, explain quantum computing simply."' },
  });
  const nSys = addNode(graph, sysDef, { x: 400, y: 100 }, {
    parameters: { content: "You are a helpful, friendly AI assistant modeled after GPT-4o. Be concise, accurate, and conversational. Use markdown formatting when helpful." },
  });
  const nFew = addNode(graph, fewDef, { x: 400, y: 500 }, {
    parameters: {
      examples: [
        { input: "What is 2+2?", output: "2 + 2 = **4**." },
        { input: "Summarize photosynthesis", output: "Plants convert sunlight, water, and CO2 into glucose and oxygen using chlorophyll." },
      ],
      prefix: "Here are example interactions:",
    },
  });
  const nMem = addNode(graph, memDef, { x: 740, y: 500 }, {
    parameters: { collection: "chat_history", top_k: 5 },
  });
  const nAgent = addNode(graph, agentDef, { x: 1060, y: 300 }, {
    parameters: { model: "claude-sonnet-4-20250514", temperature: 0.7, max_tokens: 2048 },
  });
  const nLog = addNode(graph, logDef, { x: 1380, y: 300 }, {
    parameters: { prefix: "[Assistant]" },
  });

  addEdge(graph, nInput.id, "value", nFew.id, "query");
  addEdge(graph, nInput.id, "value", nAgent.id, "goal");
  addEdge(graph, nMem.id, "memories", nAgent.id, "memory");
  addEdge(graph, nAgent.id, "result", nLog.id, "value");

  return graph;
}

// ── 3. March Madness — Classical ML ─────────────────────────────────────────

export function createMarchMadnessMLPipeline(registry: BlockRegistry): Graph | null {
  const graph = createGraph("March Madness Predictor (Classical ML)");

  const loadDef = registry.get("data-io.load-csv");
  const normDef = registry.get("data-processing.normalize");
  const splitDef = registry.get("data-processing.train-val-test-split");
  const xyTrainDef = registry.get("data-processing.dataframe-to-xy");
  const xyTestDef = registry.get("data-processing.dataframe-to-xy");
  const rfDef = registry.get("classical-ml.random-forest");
  const xgbDef = registry.get("classical-ml.xgboost");
  const predRfDef = registry.get("classical-ml.sklearn-predict");
  const predXgbDef = registry.get("classical-ml.sklearn-predict");
  const accDef = registry.get("evaluation.accuracy");
  const f1Def = registry.get("evaluation.f1-score");
  const cmDef = registry.get("evaluation.confusion-matrix");

  if (!loadDef || !normDef || !splitDef || !xyTrainDef || !rfDef || !xgbDef || !predRfDef || !accDef || !f1Def || !cmDef) return null;

  const teamParams = { feature_columns: "win_rate, sos, scoring_margin, turnover_ratio, rebound_rate", target_column: "won_tournament_game" };

  const nLoad = addNode(graph, loadDef, { x: 80, y: 320 }, {
    parameters: { file_path: "march_madness_team_stats.csv" },
  });
  const nNorm = addNode(graph, normDef, { x: 400, y: 320 });
  const nSplit = addNode(graph, splitDef, { x: 720, y: 320 }, {
    parameters: { train_ratio: 0.8, val_ratio: 0.0, test_ratio: 0.2 },
  });
  const nTrainXY = addNode(graph, xyTrainDef!, { x: 1040, y: 140 }, { parameters: teamParams });
  const nTestXY = addNode(graph, xyTrainDef!, { x: 1040, y: 500 }, { parameters: teamParams });

  // Two models: RF top branch, XGB bottom branch
  const nRF = addNode(graph, rfDef, { x: 1360, y: 60 }, {
    parameters: { n_estimators: 200, max_depth: 12 },
  });
  const nXGB = addNode(graph, xgbDef, { x: 1360, y: 220 }, {
    parameters: { n_estimators: 150, learning_rate: 0.05, max_depth: 8 },
  });
  const nPredRF = addNode(graph, predRfDef!, { x: 1680, y: 60 });
  const nPredXGB = addNode(graph, predRfDef!, { x: 1680, y: 220 });

  const nAcc = addNode(graph, accDef, { x: 2000, y: 60 });
  const nF1 = addNode(graph, f1Def, { x: 2000, y: 220 }, {
    parameters: { average: "weighted" },
  });
  const nCM = addNode(graph, cmDef, { x: 2000, y: 420 });

  // Wiring
  addEdge(graph, nLoad.id, "dataframe", nNorm.id, "dataframe");
  addEdge(graph, nNorm.id, "normalized", nSplit.id, "dataframe");
  addEdge(graph, nSplit.id, "train", nTrainXY.id, "dataframe");
  addEdge(graph, nSplit.id, "test", nTestXY.id, "dataframe");

  addEdge(graph, nTrainXY.id, "X", nRF.id, "X_train");
  addEdge(graph, nTrainXY.id, "y", nRF.id, "y_train");
  addEdge(graph, nTrainXY.id, "X", nXGB.id, "X_train");
  addEdge(graph, nTrainXY.id, "y", nXGB.id, "y_train");

  addEdge(graph, nRF.id, "model", nPredRF.id, "model");
  addEdge(graph, nTestXY.id, "X", nPredRF.id, "X");
  addEdge(graph, nXGB.id, "model", nPredXGB.id, "model");
  addEdge(graph, nTestXY.id, "X", nPredXGB.id, "X");

  addEdge(graph, nTestXY.id, "y", nAcc.id, "y_true");
  addEdge(graph, nPredRF.id, "y_pred", nAcc.id, "y_pred");
  addEdge(graph, nTestXY.id, "y", nF1.id, "y_true");
  addEdge(graph, nPredXGB.id, "y_pred", nF1.id, "y_pred");
  addEdge(graph, nTestXY.id, "y", nCM.id, "y_true");
  addEdge(graph, nPredRF.id, "y_pred", nCM.id, "y_pred");

  return graph;
}

// ── 4. March Madness — Sentiment Analysis ───────────────────────────────────

export function createMarchMadnessSentimentPipeline(registry: BlockRegistry): Graph | null {
  const graph = createGraph("March Madness Predictor (Sentiment)");

  const loadTweetsDef = registry.get("data-io.load-csv");
  const loadStatsDef = registry.get("data-io.load-csv");
  const sentDef = registry.get("text-nlp.sentiment-score");
  const groupDef = registry.get("data-processing.group-by");
  const joinDef = registry.get("data-processing.join-merge");
  const splitDef = registry.get("data-processing.train-val-test-split");
  const xyTrainDef = registry.get("data-processing.dataframe-to-xy");
  const xyTestDef = registry.get("data-processing.dataframe-to-xy");
  const lrDef = registry.get("classical-ml.logistic-regression");
  const predDef = registry.get("classical-ml.sklearn-predict");
  const accDef = registry.get("evaluation.accuracy");
  const reportDef = registry.get("evaluation.classification-report");

  if (!loadTweetsDef || !loadStatsDef || !sentDef || !groupDef || !joinDef || !splitDef || !xyTrainDef || !lrDef || !predDef || !accDef || !reportDef) return null;

  const sentimentParams = { feature_columns: "avg_sentiment, tweet_volume, positive_ratio", target_column: "won" };

  // Load tweets
  const nTweets = addNode(graph, loadTweetsDef, { x: 80, y: 160 }, {
    parameters: { file_path: "march_madness_tweets.csv" },
  });
  // Sentiment analysis
  const nSent = addNode(graph, sentDef, { x: 400, y: 160 }, {
    parameters: { method: "vader" },
  });
  // Group by team
  const nGroup = addNode(graph, groupDef, { x: 720, y: 160 }, {
    parameters: { by: "team_name", agg_func: "mean" },
  });

  // Load game stats
  const nStats = addNode(graph, loadStatsDef, { x: 80, y: 480 }, {
    parameters: { file_path: "march_madness_games.csv" },
  });

  // Join sentiment + game results
  const nJoin = addNode(graph, joinDef, { x: 1040, y: 320 }, {
    parameters: { on: "team_name", how: "inner" },
  });

  const nSplit = addNode(graph, splitDef, { x: 1360, y: 320 }, {
    parameters: { train_ratio: 0.8, val_ratio: 0.0, test_ratio: 0.2 },
  });

  const nTrainXY = addNode(graph, xyTrainDef, { x: 1680, y: 160 }, { parameters: sentimentParams });
  const nTestXY = addNode(graph, xyTrainDef, { x: 1680, y: 480 }, { parameters: sentimentParams });

  const nLR = addNode(graph, lrDef, { x: 2000, y: 160 }, {
    parameters: { C: 1.0, max_iter: 200 },
  });
  const nPred = addNode(graph, predDef, { x: 2320, y: 320 });

  const nAcc = addNode(graph, accDef, { x: 2640, y: 200 });
  const nReport = addNode(graph, reportDef, { x: 2640, y: 440 }, {
    parameters: { target_names: "Loss, Win" },
  });

  // Wire it up
  addEdge(graph, nTweets.id, "dataframe", nSent.id, "text");
  addEdge(graph, nSent.id, "score", nGroup.id, "dataframe");
  addEdge(graph, nGroup.id, "grouped", nJoin.id, "left");
  addEdge(graph, nStats.id, "dataframe", nJoin.id, "right");
  addEdge(graph, nJoin.id, "merged", nSplit.id, "dataframe");

  addEdge(graph, nSplit.id, "train", nTrainXY.id, "dataframe");
  addEdge(graph, nSplit.id, "test", nTestXY.id, "dataframe");

  addEdge(graph, nTrainXY.id, "X", nLR.id, "X_train");
  addEdge(graph, nTrainXY.id, "y", nLR.id, "y_train");

  addEdge(graph, nLR.id, "model", nPred.id, "model");
  addEdge(graph, nTestXY.id, "X", nPred.id, "X");

  addEdge(graph, nTestXY.id, "y", nAcc.id, "y_true");
  addEdge(graph, nPred.id, "y_pred", nAcc.id, "y_pred");
  addEdge(graph, nTestXY.id, "y", nReport.id, "y_true");
  addEdge(graph, nPred.id, "y_pred", nReport.id, "y_pred");

  return graph;
}

// ── 5. OpenClaw — ML Vision Pipeline ────────────────────────────────────────

export function createOpenClawPipeline(registry: BlockRegistry): Graph | null {
  const graph = createGraph("OpenClaw Vision Controller");

  const imgDef = registry.get("data-io.load-image");
  const resizeDef = registry.get("vision.image-resize");
  const yoloDef = registry.get("vision.object-detector-yolo");
  const jsonDef = registry.get("utilities.json-parse");
  const agentDef = registry.get("agents.llm-agent");
  const dictDef = registry.get("utilities.dict");
  const logDef = registry.get("control-flow.log-print");

  if (!imgDef || !resizeDef || !yoloDef || !agentDef || !dictDef || !logDef || !jsonDef) return null;

  const nImg = addNode(graph, imgDef, { x: 80, y: 300 }, {
    parameters: { file_path: "claw_camera_feed.png", mode: "RGB" },
  });
  const nResize = addNode(graph, resizeDef, { x: 400, y: 300 }, {
    parameters: { width: 640, height: 640 },
  });
  const nYolo = addNode(graph, yoloDef, { x: 720, y: 300 }, {
    parameters: { model_size: "yolov8n.pt", conf_threshold: 0.3 },
  });
  const nAgent = addNode(graph, agentDef, { x: 1060, y: 300 }, {
    parameters: {
      model: "claude-sonnet-4-20250514",
      temperature: 0.0,
      max_tokens: 1024,
    },
  });
  const nJson = addNode(graph, jsonDef, { x: 1380, y: 180 });
  const nDict = addNode(graph, dictDef, { x: 1380, y: 420 }, {
    parameters: { initial: { x: 0, y: 0, z: 0, action: "grab" }, operation: "create" },
  });
  const nLog = addNode(graph, logDef, { x: 1700, y: 300 }, {
    parameters: { prefix: "[Claw Command]" },
  });

  addEdge(graph, nImg.id, "image", nResize.id, "image");
  addEdge(graph, nResize.id, "image_out", nYolo.id, "image");
  addEdge(graph, nYolo.id, "results", nAgent.id, "goal");
  addEdge(graph, nAgent.id, "result", nJson.id, "text");
  addEdge(graph, nJson.id, "data", nLog.id, "value");

  return graph;
}

// ── 6. Polymarket Arbitrage Trader ──────────────────────────────────────────

export function createPolymarketArbitragePipeline(registry: BlockRegistry): Graph | null {
  const graph = createGraph("Polymarket Arbitrage Trader");

  const apiDef = registry.get("data-io.load-from-api");
  const jsonDef = registry.get("utilities.json-parse");
  const snippetDef = registry.get("utilities.python-snippet");
  const agentDef = registry.get("agents.llm-agent");
  const httpDef = registry.get("utilities.http-request");
  const logDef = registry.get("control-flow.log-print");
  const varDef = registry.get("utilities.variable");

  if (!apiDef || !jsonDef || !snippetDef || !agentDef || !httpDef || !logDef || !varDef) return null;

  // Fetch markets from Polymarket API
  const nFetchMarkets = addNode(graph, apiDef, { x: 80, y: 180 }, {
    parameters: { url: "https://clob.polymarket.com/markets", method: "GET" },
  });
  // Fetch odds from second source for comparison
  const nFetchOdds = addNode(graph, apiDef, { x: 80, y: 480 }, {
    parameters: { url: "https://gamma-api.polymarket.com/events?active=true", method: "GET" },
  });

  const nParseMarkets = addNode(graph, jsonDef, { x: 400, y: 180 });
  const nParseOdds = addNode(graph, jsonDef, { x: 400, y: 480 });

  // Compute spreads & find arbitrage opportunities
  const nFindArb = addNode(graph, snippetDef, { x: 720, y: 320 }, {
    parameters: {
      source: `# Compare YES/NO prices across markets for arbitrage
# If YES_price + NO_price < 1.0, arbitrage exists
import json

opportunities = []
for market in markets:
    yes_price = market.get("yes_price", 0)
    no_price = market.get("no_price", 0)
    spread = 1.0 - (yes_price + no_price)
    if spread > 0.02:  # 2% threshold
        opportunities.append({
            "market": market.get("question", ""),
            "yes": yes_price, "no": no_price,
            "spread": round(spread * 100, 2)
        })
opportunities.sort(key=lambda x: x["spread"], reverse=True)`,
    },
  });

  // LLM agent to evaluate risk & decide trades
  const nAgent = addNode(graph, agentDef, { x: 1060, y: 320 }, {
    parameters: {
      model: "claude-sonnet-4-20250514",
      temperature: 0.0,
      max_tokens: 2048,
    },
  });

  // Execute trade via API
  const nTrade = addNode(graph, httpDef, { x: 1380, y: 180 }, {
    parameters: { url: "https://clob.polymarket.com/order", method: "POST" },
  });

  const nLog = addNode(graph, logDef, { x: 1380, y: 480 }, {
    parameters: { prefix: "[Arbitrage Signal]" },
  });

  addEdge(graph, nFetchMarkets.id, "response_data", nParseMarkets.id, "text");
  addEdge(graph, nFetchOdds.id, "response_data", nParseOdds.id, "text");
  addEdge(graph, nParseMarkets.id, "data", nFindArb.id, "order_in");
  addEdge(graph, nFindArb.id, "order_out", nAgent.id, "goal");
  addEdge(graph, nAgent.id, "result", nTrade.id, "body");
  addEdge(graph, nAgent.id, "result", nLog.id, "value");

  return graph;
}

// ── 7. Pushup Pose Detection ────────────────────────────────────────────────

export function createPushupPoseDetectionPipeline(registry: BlockRegistry): Graph | null {
  const graph = createGraph("Pushup Pose Detection");

  const imgDef = registry.get("data-io.load-image");
  const resizeDef = registry.get("vision.image-resize");
  const keypointDef = registry.get("vision.keypoint-detector");
  const snippetDef = registry.get("utilities.python-snippet");
  const agentDef = registry.get("agents.llm-agent");
  const logDef = registry.get("control-flow.log-print");

  if (!imgDef || !resizeDef || !keypointDef || !snippetDef || !agentDef || !logDef) return null;

  const nImg = addNode(graph, imgDef, { x: 80, y: 300 }, {
    parameters: { file_path: "pushup_frame.png", mode: "RGB" },
  });
  const nResize = addNode(graph, resizeDef, { x: 400, y: 300 }, {
    parameters: { width: 640, height: 480 },
  });
  const nPose = addNode(graph, keypointDef, { x: 720, y: 300 });

  // Analyze joint angles to count reps & check form
  const nAnalyze = addNode(graph, snippetDef, { x: 1060, y: 140 }, {
    parameters: {
      source: `import numpy as np

# Extract key joints: shoulders, elbows, wrists, hips
# Keypoint indices (COCO): 5=L_shoulder, 7=L_elbow, 9=L_wrist, 11=L_hip
def angle(a, b, c):
    ba = np.array(a) - np.array(b)
    bc = np.array(c) - np.array(b)
    cos = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    return np.degrees(np.arccos(np.clip(cos, -1, 1)))

elbow_angle = angle(keypoints[5], keypoints[7], keypoints[9])
hip_angle = angle(keypoints[5], keypoints[11], keypoints[13])

is_down = elbow_angle < 90
form_ok = hip_angle > 160  # back should be straight
result = {"elbow_angle": round(elbow_angle, 1), "hip_angle": round(hip_angle, 1), "position": "down" if is_down else "up", "good_form": form_ok}`,
    },
  });

  // LLM gives coaching feedback
  const nCoach = addNode(graph, agentDef, { x: 1060, y: 460 }, {
    parameters: {
      model: "claude-sonnet-4-20250514",
      temperature: 0.3,
      max_tokens: 512,
    },
  });

  const nLogAngles = addNode(graph, logDef, { x: 1380, y: 140 }, {
    parameters: { prefix: "[Pose]" },
  });
  const nLogCoach = addNode(graph, logDef, { x: 1380, y: 460 }, {
    parameters: { prefix: "[Coach]" },
  });

  addEdge(graph, nImg.id, "image", nResize.id, "image");
  addEdge(graph, nResize.id, "image_out", nPose.id, "image_batch");
  addEdge(graph, nPose.id, "keypoints", nAnalyze.id, "order_in");
  addEdge(graph, nAnalyze.id, "order_out", nLogAngles.id, "value");
  addEdge(graph, nAnalyze.id, "order_out", nCoach.id, "goal");
  addEdge(graph, nCoach.id, "result", nLogCoach.id, "value");

  return graph;
}

// ── 8. ElevenLabs AI Translator ─────────────────────────────────────────────

export function createElevenLabsTranslatorPipeline(registry: BlockRegistry): Graph | null {
  const graph = createGraph("ElevenLabs AI Translator");

  const audioDef = registry.get("audio-speech.load-audio");
  const asrDef = registry.get("audio-speech.asr-whisper");
  const translateDef = registry.get("text-nlp.translate");
  const ttsDef = registry.get("audio-speech.tts");
  const speakerDef = registry.get("audio-speech.speaker-embed");
  const logDef = registry.get("control-flow.log-print");
  const varDef = registry.get("utilities.variable");

  if (!audioDef || !asrDef || !translateDef || !ttsDef || !speakerDef || !logDef || !varDef) return null;

  // Input audio
  const nAudio = addNode(graph, audioDef, { x: 80, y: 300 });

  // Branch 1: Transcribe speech
  const nASR = addNode(graph, asrDef, { x: 400, y: 180 });

  // Branch 2: Extract speaker voice embedding for cloning
  const nSpeaker = addNode(graph, speakerDef, { x: 400, y: 480 });

  // Translate text
  const nTranslate = addNode(graph, translateDef, { x: 720, y: 180 });

  // Log translated text
  const nLogText = addNode(graph, logDef, { x: 1060, y: 100 }, {
    parameters: { prefix: "[Translation]" },
  });

  // TTS with cloned voice
  const nTTS = addNode(graph, ttsDef, { x: 1060, y: 320 });

  // Log output
  const nLogAudio = addNode(graph, logDef, { x: 1380, y: 320 }, {
    parameters: { prefix: "[Output Audio]" },
  });

  addEdge(graph, nAudio.id, "waveform", nASR.id, "waveform");
  addEdge(graph, nAudio.id, "waveform", nSpeaker.id, "waveform");
  addEdge(graph, nASR.id, "transcription", nTranslate.id, "text");
  addEdge(graph, nTranslate.id, "translated", nLogText.id, "value");
  addEdge(graph, nTranslate.id, "translated", nTTS.id, "text");
  addEdge(graph, nTTS.id, "waveform", nLogAudio.id, "value");

  return graph;
}

// ── 9. AlphaGo Go Player ────────────────────────────────────────────────────

export function createAlphaGoPipeline(registry: BlockRegistry): Graph | null {
  const graph = createGraph("AlphaGo Go Player");

  const varDef = registry.get("utilities.variable");
  const snippetDef = registry.get("utilities.python-snippet");
  const conv2dDef = registry.get("neural-networks.conv2d");
  const denseDef = registry.get("neural-networks.dense-layer");
  const agentDef = registry.get("agents.llm-agent");
  const logDef = registry.get("control-flow.log-print");

  if (!varDef || !snippetDef || !conv2dDef || !denseDef || !agentDef || !logDef) return null;

  // Board state input (19x19 grid encoded as tensor)
  const nBoard = addNode(graph, varDef, { x: 80, y: 300 }, {
    parameters: { name: "board_state", default_value: "np.zeros((1, 17, 19, 19))" },
  });

  // Encode board features
  const nEncode = addNode(graph, snippetDef, { x: 400, y: 300 }, {
    parameters: {
      source: `import numpy as np
import torch

# Encode board: 8 planes for black history, 8 for white, 1 for current player
# Input shape: (batch, 17, 19, 19)
board_tensor = torch.tensor(board_state, dtype=torch.float32)`,
    },
  });

  // Policy network (conv layers)
  const nConv1 = addNode(graph, conv2dDef, { x: 720, y: 160 }, {
    parameters: { in_channels: 17, out_channels: 256, kernel_size: 3, padding: 1 },
  });
  const nConv2 = addNode(graph, conv2dDef, { x: 1040, y: 160 }, {
    parameters: { in_channels: 256, out_channels: 256, kernel_size: 3, padding: 1 },
  });

  // Value head — evaluates board position
  const nValueConv = addNode(graph, conv2dDef, { x: 1040, y: 460 }, {
    parameters: { in_channels: 256, out_channels: 1, kernel_size: 1 },
  });
  const nValueDense = addNode(graph, denseDef, { x: 1360, y: 460 }, {
    parameters: { in_features: 361, out_features: 1, activation: "tanh" },
  });

  // Policy head — picks the move
  const nPolicyDense = addNode(graph, denseDef, { x: 1360, y: 160 }, {
    parameters: { in_features: 256, out_features: 362, activation: "none" },
  });

  // MCTS + move selection
  const nMCTS = addNode(graph, snippetDef, { x: 1680, y: 300 }, {
    parameters: {
      source: `import torch.nn.functional as F

# Monte Carlo Tree Search simulation
policy_probs = F.softmax(policy_logits.view(-1), dim=0)
value_score = value_out.item()

# Select best move: combine policy prior + MCTS visit counts
best_move_idx = policy_probs.argmax().item()
row, col = best_move_idx // 19, best_move_idx % 19
is_pass = best_move_idx == 361

move = {"row": row, "col": col, "pass": is_pass, "win_prob": round((value_score + 1) / 2, 3)}`,
    },
  });

  const nLog = addNode(graph, logDef, { x: 2000, y: 300 }, {
    parameters: { prefix: "[AlphaGo Move]" },
  });

  addEdge(graph, nBoard.id, "value", nEncode.id, "order_in");
  addEdge(graph, nEncode.id, "order_out", nConv1.id, "tensor_in");
  addEdge(graph, nConv1.id, "tensor_out", nConv2.id, "tensor_in");
  addEdge(graph, nConv2.id, "tensor_out", nPolicyDense.id, "tensor_in");
  addEdge(graph, nConv1.id, "tensor_out", nValueConv.id, "tensor_in");
  addEdge(graph, nValueConv.id, "tensor_out", nValueDense.id, "tensor_in");
  addEdge(graph, nPolicyDense.id, "tensor_out", nMCTS.id, "order_in");
  addEdge(graph, nMCTS.id, "order_out", nLog.id, "value");

  return graph;
}
