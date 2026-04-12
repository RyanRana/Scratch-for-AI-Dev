// ============================================================================
// CodePanel — live Python code preview, clean white theme
// ============================================================================

import React from "react";
import { colors, spacing, radii, fontSizes } from "../theme/tokens.js";

export interface CodePanelProps {
  code: string;
  errors: string[];
  onCopy: () => void;
}

export function CodePanel({ code, errors, onCopy }: CodePanelProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: colors.surface0,
        borderTop: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `6px ${spacing.md}px`,
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.surface1,
        }}
      >
        <span
          style={{
            fontSize: fontSizes.xs,
            fontWeight: 600,
            color: colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Generated Python
        </span>
        <button
          onClick={onCopy}
          style={{
            padding: `3px 10px`,
            borderRadius: radii.sm,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface0,
            color: colors.textSecondary,
            fontSize: fontSizes.xs,
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.15s",
          }}
        >
          Copy
        </button>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div
          style={{
            padding: `${spacing.xs}px ${spacing.md}px`,
            backgroundColor: `${colors.error}08`,
            borderBottom: `1px solid ${colors.error}20`,
          }}
        >
          {errors.map((err, i) => (
            <div
              key={i}
              style={{
                fontSize: fontSizes.xs,
                color: colors.error,
                marginBottom: 1,
              }}
            >
              {err}
            </div>
          ))}
        </div>
      )}

      {/* Code */}
      <pre
        style={{
          flex: 1,
          margin: 0,
          padding: spacing.md,
          overflowY: "auto",
          fontSize: fontSizes.sm,
          lineHeight: 1.7,
          color: colors.textPrimary,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
          tabSize: 4,
          backgroundColor: colors.surface0,
        }}
      >
        {code || "# Drop blocks onto the canvas to generate code"}
      </pre>
    </div>
  );
}
