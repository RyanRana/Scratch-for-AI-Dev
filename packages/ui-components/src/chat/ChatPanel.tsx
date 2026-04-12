// ============================================================================
// ChatPanel — AI assistant (always visible in bottom of right sidebar)
// ============================================================================

import React, { useState, useRef, useEffect } from "react";
import { colors, spacing, radii, fontSizes } from "../theme/tokens.js";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatPanelProps {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string) => void;
  apiKeySet: boolean;
  onSetApiKey: (key: string) => void;
}

export function ChatPanel({ messages, loading, onSend, apiKeySet, onSetApiKey }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    if (!apiKeySet) {
      setShowKeyInput(true);
      return;
    }
    onSend(trimmed);
    setInput("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `7px ${spacing.md}px`,
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.surface1,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: radii.full, backgroundColor: apiKeySet ? "#14B8A6" : colors.textMuted }} />
          <span style={{ fontSize: fontSizes.xs, fontWeight: 700, color: colors.textPrimary }}>
            AI Assistant
          </span>
          <span style={{ fontSize: "9px", color: colors.textMuted }}>Haiku</span>
        </div>
        {!apiKeySet && (
          <button
            onClick={() => setShowKeyInput(true)}
            style={{
              fontSize: fontSizes.xs,
              color: colors.accent,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Set API Key
          </button>
        )}
      </div>

      {/* API key inline input */}
      {showKeyInput && (
        <div style={{ padding: spacing.sm, borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.surface1, flexShrink: 0 }}>
          <div style={{ fontSize: fontSizes.xs, color: colors.textMuted, marginBottom: 4 }}>
            Anthropic API key (stored locally):
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="sk-ant-..."
              style={{
                flex: 1,
                padding: `4px 8px`,
                borderRadius: radii.sm,
                border: `1px solid ${colors.border}`,
                fontSize: fontSizes.xs,
                fontFamily: "monospace",
                outline: "none",
                backgroundColor: colors.surface0,
                color: colors.textPrimary,
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && keyDraft.trim()) {
                  onSetApiKey(keyDraft.trim());
                  setShowKeyInput(false);
                }
              }}
              autoFocus
            />
            <button
              onClick={() => { if (keyDraft.trim()) { onSetApiKey(keyDraft.trim()); setShowKeyInput(false); } }}
              style={{
                padding: `4px 8px`,
                borderRadius: radii.sm,
                border: "none",
                backgroundColor: colors.accent,
                color: "#fff",
                fontSize: fontSizes.xs,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: spacing.sm,
          display: "flex",
          flexDirection: "column",
          gap: spacing.sm,
        }}
      >
        {messages.length === 0 && !showKeyInput && (
          <div
            style={{
              textAlign: "center",
              color: colors.textMuted,
              fontSize: fontSizes.xs,
              padding: `${spacing.lg}px ${spacing.sm}px`,
              lineHeight: 1.6,
            }}
          >
            {apiKeySet
              ? 'Ask about your pipeline, e.g. "How do I build an image classifier?"'
              : "Set your API key above to start chatting with the AI assistant."}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
          >
            <div
              style={{
                maxWidth: "88%",
                padding: `5px 10px`,
                borderRadius: msg.role === "user"
                  ? `${radii.md}px ${radii.md}px 3px ${radii.md}px`
                  : `${radii.md}px ${radii.md}px ${radii.md}px 3px`,
                backgroundColor: msg.role === "user" ? colors.accent : colors.surface1,
                color: msg.role === "user" ? "#fff" : colors.textPrimary,
                fontSize: fontSizes.xs,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 3, padding: `5px 10px`, backgroundColor: colors.surface1, borderRadius: radii.md, width: "fit-content" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 5, height: 5, borderRadius: radii.full, backgroundColor: colors.textMuted, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: `${spacing.sm}px`,
          borderTop: `1px solid ${colors.border}`,
          display: "flex",
          gap: 4,
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={apiKeySet ? "Ask about your pipeline..." : "Set API key first..."}
          disabled={loading}
          style={{
            flex: 1,
            padding: `6px 10px`,
            borderRadius: radii.md,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface1,
            color: colors.textPrimary,
            fontSize: fontSizes.xs,
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = colors.accent; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = colors.border; }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: `6px 10px`,
            borderRadius: radii.md,
            border: "none",
            backgroundColor: colors.accent,
            color: "#fff",
            fontSize: fontSizes.xs,
            fontWeight: 600,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
