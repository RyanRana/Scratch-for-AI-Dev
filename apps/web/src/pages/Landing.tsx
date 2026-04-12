import React, { useState } from "react";

export interface StarterTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

const TEMPLATES: StarterTemplate[] = [
  {
    id: "auto-research",
    title: "Auto Research Agent",
    description: "Andrej Karpathy-style autonomous research pipeline",
    prompt:
      "Build an autonomous research agent pipeline inspired by Andrej Karpathy. It should: 1) Take a research topic as input text, 2) Use an LLM to generate search queries, 3) Fetch and summarize web results, 4) Synthesize findings into a structured report. Use Claude as the LLM backbone.",
  },
  {
    id: "gpt4-chat",
    title: "GPT-4o Chat App",
    description: "Multi-turn conversational AI with GPT-4o",
    prompt:
      "Build a GPT-4o style chat application pipeline. It should: 1) Accept user text input, 2) Maintain conversation history, 3) Send messages to an LLM (Claude) with system prompt configuration, 4) Return formatted assistant responses. Include a system prompt parameter for customization.",
  },
  {
    id: "march-madness-ml",
    title: "March Madness (Classical ML)",
    description: "Predict tournament outcomes with classical ML models",
    prompt:
      "Build a March Madness basketball tournament predictor using classical ML. It should: 1) Load a CSV of team stats, 2) Split into train/test sets, 3) Extract features like win rate, strength of schedule, and scoring margin, 4) Train a Random Forest classifier, 5) Make predictions and evaluate accuracy. Use standard tabular ML blocks.",
  },
  {
    id: "march-madness-sentiment",
    title: "March Madness (Sentiment)",
    description: "Predict games from Twitter/social media sentiment",
    prompt:
      "Build a March Madness predictor that uses social media sentiment analysis. It should: 1) Load tweet/post text data from CSV, 2) Use an LLM to classify sentiment (positive/negative/neutral) for each team, 3) Aggregate sentiment scores per team, 4) Feed sentiment features into a logistic regression model, 5) Predict game outcomes and evaluate accuracy.",
  },
  {
    id: "openclaw",
    title: "Robotic Claw",
    description: "Claw machine controller with ML vision",
    prompt:
      "Build an OpenClaw-style ML vision pipeline for a robotic claw machine. It should: 1) Load an image input (simulated camera feed), 2) Run object detection to identify target items, 3) Use an LLM to decide the best grab strategy based on detected objects, 4) Output movement commands (x, y, z coordinates) as structured data. Include image preprocessing and coordinate extraction.",
  },
  {
    id: "polymarket-arb",
    title: "Polymarket Arbitrage Trader",
    description: "Find and exploit prediction market arbitrage opportunities",
    prompt:
      "Build a Polymarket arbitrage trading bot. It should: 1) Fetch active markets from the Polymarket CLOB API, 2) Fetch odds from a second source for comparison, 3) Compute YES/NO price spreads and identify arbitrage where YES+NO < 1.0, 4) Use an LLM agent to evaluate risk and decide trades, 5) Execute trade orders via API and log signals.",
  },
  {
    id: "pushup-pose",
    title: "Pushup Pose Detection",
    description: "Count reps and check form with pose estimation",
    prompt:
      "Build a pushup pose detection pipeline. It should: 1) Load a camera frame image, 2) Resize for the model, 3) Run keypoint/pose detection to find body joints, 4) Calculate elbow and hip angles to determine up/down position and form quality, 5) Use an LLM to give coaching feedback on form. Output joint angles and coaching tips.",
  },
  {
    id: "elevenlabs-translator",
    title: "ElevenLabs AI Translator",
    description: "Translate speech to another language with voice cloning",
    prompt:
      "Build an ElevenLabs-style AI translator pipeline. It should: 1) Load input audio, 2) Transcribe speech using Whisper ASR, 3) Extract speaker voice embedding for voice cloning, 4) Translate the transcribed text to the target language, 5) Synthesize the translated text back to speech using TTS with the cloned voice. Output both translated text and audio.",
  },
  {
    id: "alphago",
    title: "AlphaGo Go Player",
    description: "Neural network Go player with policy & value heads",
    prompt:
      "Build an AlphaGo-style Go player pipeline. It should: 1) Take a 19x19 board state encoded as a tensor (17 planes: 8 black history, 8 white history, 1 current player), 2) Run through convolutional neural network layers, 3) Split into a policy head (move probabilities over 362 positions) and a value head (win probability), 4) Use Monte Carlo Tree Search to select the best move. Output the chosen move coordinates and win probability.",
  },
];

export function Landing({ onEnter, onTemplate, onDocs }: {
  onEnter: () => void;
  onTemplate: (templateId: string, prompt: string) => void;
  onDocs?: () => void;
}) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [iconHover, setIconHover] = useState(false);
  const [icon2Hover, setIcon2Hover] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [docsBtnHover, setDocsBtnHover] = useState(false);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "#f8f9fb",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "auto",
    }}>
      {/* Hero Section */}
      <div className="hero-section" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 64,
        marginBottom: 72,
        flexWrap: "wrap",
        padding: "0 32px",
      }}>
        {/* Icons side by side */}
        <div className="hero-icons" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div
            onMouseEnter={() => setIconHover(true)}
            onMouseLeave={() => setIconHover(false)}
            className="hero-icon"
            style={{
              width: 200,
              height: 200,
              cursor: "pointer",
              transition: "transform 0.3s ease",
              transform: iconHover ? "rotate(-8deg) scale(1.05)" : "rotate(0deg) scale(1)",
              animation: iconHover ? "waggle 0.5s ease-in-out infinite" : "none",
            }}
          >
            <img
              src="/icon.png"
              alt="AI Blocks mascot"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <div
            onMouseEnter={() => setIcon2Hover(true)}
            onMouseLeave={() => setIcon2Hover(false)}
            className="hero-icon"
            style={{
              width: 200,
              height: 200,
              cursor: "pointer",
              transition: "transform 0.3s ease",
              transform: icon2Hover ? "rotate(8deg) scale(1.05)" : "rotate(0deg) scale(1)",
              animation: icon2Hover ? "waggle2 0.5s ease-in-out infinite" : "none",
            }}
          >
            <img
              src="/icon2.png"
              alt="AI Blocks mascot with coffee"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Title + CTA */}
        <div className="hero-text" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 16,
        }}>
          <h1 className="hero-title" style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#1e1e2e",
            lineHeight: 1.1,
            letterSpacing: -1.5,
            margin: 0,
          }}>
            AI Blocks
          </h1>
          <p style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#F7931E",
            textTransform: "uppercase",
            letterSpacing: 1.2,
            margin: 0,
          }}>
            Build faster while learning deeper
          </p>
          <p style={{
            fontSize: 18,
            color: "#5c5f73",
            maxWidth: 400,
            lineHeight: 1.5,
            margin: 0,
          }}>
            Have an idea, refine with drag &amp; drop, and receive functional
            code immediately.
          </p>
          <p style={{
            fontSize: 14,
            color: "#9094a6",
            maxWidth: 400,
            lineHeight: 1.5,
            margin: 0,
          }}>
            Made for anyone to understand, inspect, trust, and build with AI.
          </p>
          <div className="hero-cta" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <button
              onClick={onEnter}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                padding: "14px 36px",
                fontSize: 16,
                fontWeight: 600,
                color: "#fff",
                background: btnHover
                  ? "linear-gradient(135deg, #FBAB36, #F7931E)"
                  : "linear-gradient(135deg, #F7931E, #E8820D)",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: btnHover ? "translateY(-2px)" : "translateY(0)",
                boxShadow: btnHover
                  ? "0 8px 24px rgba(247, 147, 30, 0.35)"
                  : "0 4px 12px rgba(247, 147, 30, 0.2)",
                letterSpacing: 0.3,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="5 4 1 8 5 12" />
                <polyline points="11 4 15 8 11 12" />
                <line x1="9" y1="3" x2="7" y2="13" />
              </svg>
              Open Editor
            </button>
            <button
              onClick={onDocs}
              onMouseEnter={() => setDocsBtnHover(true)}
              onMouseLeave={() => setDocsBtnHover(false)}
              style={{
                padding: "14px 24px",
                fontSize: 16,
                fontWeight: 600,
                color: docsBtnHover ? "#1e1e2e" : "#5c5f73",
                background: docsBtnHover ? "#f0f1f3" : "#fff",
                border: "1.5px solid #e0e2e7",
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: docsBtnHover ? "translateY(-2px)" : "translateY(0)",
                boxShadow: docsBtnHover
                  ? "0 4px 12px rgba(0,0,0,0.08)"
                  : "0 2px 6px rgba(0,0,0,0.03)",
                letterSpacing: 0.3,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 2h4l2 2h6v10H2V2z" />
              </svg>
              Docs
            </button>
            <a
              href="https://github.com/aiblocksproject/ai-blocks"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 12,
                border: "none",
                background: "#1e1e2e",
                cursor: "pointer",
                transition: "all 0.2s ease",
                color: "#fff",
              }}
              title="View on GitHub"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="templates-section" style={{
        width: "100%",
        maxWidth: 960,
        padding: "0 32px",
        boxSizing: "border-box",
      }}>
        <h2 style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#9094a6",
          textTransform: "uppercase",
          letterSpacing: 1.5,
          marginBottom: 20,
          textAlign: "center",
        }}>
          Start with a Template
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260, 1fr))",
          gap: 16,
        }}>
          {/* First row: 3 cards. Second row: 2 cards centered */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 16,
          }}>
            {TEMPLATES.map((t) => {
              const isHovered = hoveredTemplate === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onTemplate(t.id, t.prompt)}
                  onMouseEnter={() => setHoveredTemplate(t.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  className="template-card"
                  style={{
                    width: 280,
                    padding: "20px 20px 18px",
                    background: isHovered ? "#ffffff" : "#ffffffcc",
                    backdropFilter: "blur(8px)",
                    border: `1.5px solid ${isHovered ? "#F7931E" : "#e0e2e7"}`,
                    borderRadius: 14,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                    boxShadow: isHovered
                      ? "0 8px 24px rgba(247, 147, 30, 0.12)"
                      : "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#1e1e2e",
                    marginBottom: 6,
                  }}>
                    {t.title}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: "#5c5f73",
                    lineHeight: 1.45,
                  }}>
                    {t.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Animations + responsive */}
      <style>{`
        @keyframes waggle {
          0% { transform: rotate(-8deg) scale(1.05); }
          25% { transform: rotate(6deg) scale(1.05); }
          50% { transform: rotate(-6deg) scale(1.05); }
          75% { transform: rotate(4deg) scale(1.05); }
          100% { transform: rotate(-8deg) scale(1.05); }
        }
        @keyframes waggle2 {
          0% { transform: rotate(8deg) scale(1.05); }
          25% { transform: rotate(-6deg) scale(1.05); }
          50% { transform: rotate(6deg) scale(1.05); }
          75% { transform: rotate(-4deg) scale(1.05); }
          100% { transform: rotate(8deg) scale(1.05); }
        }

        @media (max-width: 768px) {
          .hero-section {
            flex-direction: column !important;
            gap: 32px !important;
            margin-bottom: 40px !important;
            padding: 0 20px !important;
            text-align: center;
          }
          .hero-icons {
            gap: 4px !important;
          }
          .hero-icon {
            width: 120px !important;
            height: 120px !important;
          }
          .hero-text {
            align-items: center !important;
          }
          .hero-title {
            font-size: 40px !important;
          }
          .templates-section {
            padding: 0 16px !important;
          }
          .template-card {
            width: 100% !important;
            max-width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .hero-icon {
            width: 90px !important;
            height: 90px !important;
          }
          .hero-title {
            font-size: 32px !important;
          }
          .template-card {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
