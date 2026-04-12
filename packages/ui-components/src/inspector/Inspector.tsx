// ============================================================================
// Inspector — parameter editor, white theme
// ============================================================================

import React from "react";
import type { BlockDefinition, ParameterDefinition } from "@ai-blocks/block-schemas";
import type { GraphNode } from "@ai-blocks/core";
import { colors, spacing, radii, fontSizes, CATEGORY_COLORS, PORT_TYPE_COLORS } from "../theme/tokens.js";

export interface InspectorProps {
  node: GraphNode | null;
  blockDef: BlockDefinition | null;
  onUpdateParams: (nodeId: string, params: Record<string, unknown>) => void;
}

function ParamField({
  param,
  value,
  onChange,
}: {
  param: ParameterDefinition;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: `6px 10px`,
    borderRadius: radii.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface1,
    color: colors.textPrimary,
    fontSize: fontSizes.sm,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: param.type === "code" ? "'JetBrains Mono', monospace" : "inherit",
    transition: "border-color 0.15s",
  };

  switch (param.type) {
    case "number":
      return (
        <input
          type="number"
          value={(value as number) ?? param.default}
          min={param.min}
          max={param.max}
          step={param.step ?? 1}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={fieldStyle}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = colors.accent; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = colors.border; }}
        />
      );
    case "boolean":
      return (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
            cursor: "pointer",
            fontSize: fontSizes.sm,
            color: colors.textSecondary,
          }}
        >
          <input
            type="checkbox"
            checked={(value as boolean) ?? (param.default as boolean)}
            onChange={(e) => onChange(e.target.checked)}
            style={{ accentColor: colors.accent }}
          />
          {param.description ?? param.name}
        </label>
      );
    case "select":
      return (
        <select
          value={String(value ?? param.default)}
          onChange={(e) => onChange(e.target.value)}
          style={fieldStyle}
        >
          {param.options?.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case "code":
      return (
        <textarea
          value={String(value ?? param.default)}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.5 }}
          onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = colors.accent; }}
          onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = colors.border; }}
        />
      );
    case "json":
      return (
        <textarea
          value={
            typeof value === "string"
              ? value
              : JSON.stringify(value ?? param.default, null, 2)
          }
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              onChange(e.target.value);
            }
          }}
          rows={3}
          style={{ ...fieldStyle, resize: "vertical", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5 }}
          onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = colors.accent; }}
          onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = colors.border; }}
        />
      );
    default:
      return (
        <input
          type="text"
          value={String(value ?? param.default ?? "")}
          placeholder={param.placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={fieldStyle}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = colors.accent; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = colors.border; }}
        />
      );
  }
}

export function Inspector({ node, blockDef, onUpdateParams }: InspectorProps) {
  if (!node || !blockDef) {
    return (
      <div
        style={{
          height: "100%",
          backgroundColor: colors.surface0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.textMuted,
          fontSize: fontSizes.sm,
          padding: spacing.xl,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Select a block to edit its parameters
      </div>
    );
  }

  const catColor = CATEGORY_COLORS[blockDef.category] ?? colors.accent;
  const visibleParams = blockDef.parameters.filter((p) => !p.advanced);
  const advancedParams = blockDef.parameters.filter((p) => p.advanced);

  return (
    <div
      style={{
        height: "100%",
        backgroundColor: colors.surface0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header with category color bar */}
      <div
        style={{
          borderBottom: `1px solid ${colors.border}`,
          borderTop: `3px solid ${catColor}`,
        }}
      >
        <div style={{ padding: `${spacing.md}px ${spacing.lg}px` }}>
          <div
            style={{
              fontSize: fontSizes.lg,
              fontWeight: 700,
              color: colors.textPrimary,
              marginBottom: 2,
            }}
          >
            {node.label ?? blockDef.name}
          </div>
          <div
            style={{
              fontSize: fontSizes.xs,
              color: catColor,
              fontWeight: 500,
            }}
          >
            {blockDef.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </div>
          <div
            style={{
              fontSize: fontSizes.xs,
              color: colors.textMuted,
              marginTop: spacing.xs,
              lineHeight: 1.4,
            }}
          >
            {blockDef.description}
          </div>
        </div>
      </div>

      {/* Parameters */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: `${spacing.md}px ${spacing.lg}px`,
        }}
      >
        {visibleParams.map((param) => (
          <div key={param.id} style={{ marginBottom: spacing.lg }}>
            <label
              style={{
                display: "block",
                fontSize: fontSizes.xs,
                color: colors.textSecondary,
                marginBottom: spacing.xs,
                fontWeight: 600,
              }}
            >
              {param.name}
            </label>
            <ParamField
              param={param}
              value={node.parameters[param.id]}
              onChange={(val) =>
                onUpdateParams(node.id, { [param.id]: val })
              }
            />
          </div>
        ))}

        {advancedParams.length > 0 && (
          <details style={{ marginTop: spacing.sm }}>
            <summary
              style={{
                fontSize: fontSizes.xs,
                color: colors.textMuted,
                cursor: "pointer",
                marginBottom: spacing.md,
                fontWeight: 500,
              }}
            >
              Advanced ({advancedParams.length})
            </summary>
            {advancedParams.map((param) => (
              <div key={param.id} style={{ marginBottom: spacing.lg }}>
                <label
                  style={{
                    display: "block",
                    fontSize: fontSizes.xs,
                    color: colors.textSecondary,
                    marginBottom: spacing.xs,
                    fontWeight: 600,
                  }}
                >
                  {param.name}
                </label>
                <ParamField
                  param={param}
                  value={node.parameters[param.id]}
                  onChange={(val) =>
                    onUpdateParams(node.id, { [param.id]: val })
                  }
                />
              </div>
            ))}
          </details>
        )}

        {/* Port info */}
        {(blockDef.inputs.length > 0 || blockDef.outputs.length > 0) && (
          <div style={{ marginTop: spacing.lg, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
            <div
              style={{
                fontSize: fontSizes.xs,
                color: colors.textMuted,
                marginBottom: spacing.sm,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Ports
            </div>
            {blockDef.inputs.map((p) => {
              const pc = PORT_TYPE_COLORS[p.type] ?? colors.textMuted;
              return (
                <div
                  key={p.id}
                  style={{
                    fontSize: fontSizes.xs,
                    color: colors.textSecondary,
                    marginBottom: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: radii.full, backgroundColor: pc, flexShrink: 0 }} />
                  <span>← {p.name}</span>
                  <span style={{ color: colors.textMuted, marginLeft: "auto" }}>{p.type}</span>
                  {p.required && <span style={{ color: colors.error, fontWeight: 700 }}>*</span>}
                </div>
              );
            })}
            {blockDef.outputs.map((p) => {
              const pc = PORT_TYPE_COLORS[p.type] ?? colors.textMuted;
              return (
                <div
                  key={p.id}
                  style={{
                    fontSize: fontSizes.xs,
                    color: colors.textSecondary,
                    marginBottom: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: radii.full, backgroundColor: pc, flexShrink: 0 }} />
                  <span>→ {p.name}</span>
                  <span style={{ color: colors.textMuted, marginLeft: "auto" }}>{p.type}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
