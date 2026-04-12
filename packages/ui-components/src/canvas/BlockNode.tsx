// ============================================================================
// BlockNode — Scratch-style block with top + bottom notches, category color
// ============================================================================

import React, { useCallback } from "react";
import type { BlockDefinition, PortDefinition } from "@ai-blocks/block-schemas";
import type { GraphNode } from "@ai-blocks/core";
import {
  colors,
  spacing,
  radii,
  fontSizes,
  shadows,
  CATEGORY_COLORS,
  PORT_TYPE_COLORS,
} from "../theme/tokens.js";

export interface BlockNodeProps {
  node: GraphNode;
  blockDef: BlockDefinition;
  selected: boolean;
  ghost?: boolean;
  onSelect: (nodeId: string) => void;
  onDragStart: (nodeId: string, e: React.MouseEvent) => void;
  onClick?: () => void;
}

const NODE_WIDTH = 240;
const PORT_SIZE = 14;
const HEADER_HEIGHT = 38;
const PORT_ROW_HEIGHT = 28;
const NOTCH_W = 22;
const NOTCH_H = 7;
const NOTCH_INSET = 18;

function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `#${Math.round(r * (1 - amount)).toString(16).padStart(2, "0")}${Math.round(g * (1 - amount)).toString(16).padStart(2, "0")}${Math.round(b * (1 - amount)).toString(16).padStart(2, "0")}`;
}

function PortDot({
  port,
  isOutput,
  nodeId,
  ghost,
}: {
  port: PortDefinition;
  isOutput: boolean;
  nodeId: string;
  ghost?: boolean;
}) {
  const portColor = PORT_TYPE_COLORS[port.type] ?? colors.textMuted;
  return (
    <div
      // data attributes for hit-testing in Canvas
      data-port-id={port.id}
      data-port-node={nodeId}
      data-port-output={isOutput ? "true" : "false"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        height: PORT_ROW_HEIGHT,
        paddingLeft: isOutput ? 0 : 8,
        paddingRight: isOutput ? 8 : 0,
        flexDirection: isOutput ? "row-reverse" : "row",
        cursor: "crosshair",
        position: "relative",
        zIndex: 20,
        pointerEvents: "auto",
      }}
    >
      <div
        data-port-dot="true"
        data-port-id={port.id}
        data-port-node={nodeId}
        data-port-output={isOutput ? "true" : "false"}
        style={{
          width: PORT_SIZE,
          height: PORT_SIZE,
          borderRadius: radii.full,
          backgroundColor: "#fff",
          border: `2.5px solid ${portColor}`,
          flexShrink: 0,
          transition: "transform 0.1s, background-color 0.1s",
          position: "relative",
          zIndex: 2,
        }}
        title={`${port.name} (${port.type})`}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1.4)";
          (e.currentTarget as HTMLDivElement).style.backgroundColor = portColor;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLDivElement).style.backgroundColor = "#fff";
        }}
      />
      <span
        style={{
          fontSize: fontSizes.xs,
          color: ghost ? "rgba(30,41,59,0.9)" : "rgba(255,255,255,0.85)",
          userSelect: "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontWeight: 500,
        }}
      >
        {port.name}
      </span>
    </div>
  );
}

/** Generate the full block outline as a single SVG path with top + bottom notches */
function blockPath(w: number, h: number, r: number): string {
  // Top-left → top notch → top-right → down → bottom notch → bottom-left → up
  const ni = NOTCH_INSET; // notch start x
  const nw = NOTCH_W;
  const nh = NOTCH_H;

  return [
    `M ${r} 0`,
    // top edge with notch bump
    `L ${ni} 0`,
    `L ${ni + 3} ${-nh}`,
    `L ${ni + 3 + nw} ${-nh}`,
    `L ${ni + 6 + nw} 0`,
    `L ${w - r} 0`,
    // top-right corner
    `Q ${w} 0 ${w} ${r}`,
    // right edge
    `L ${w} ${h - r}`,
    // bottom-right corner
    `Q ${w} ${h} ${w - r} ${h}`,
    // bottom edge with notch bump
    `L ${ni + 6 + nw} ${h}`,
    `L ${ni + 3 + nw} ${h + nh}`,
    `L ${ni + 3} ${h + nh}`,
    `L ${ni} ${h}`,
    `L ${r} ${h}`,
    // bottom-left corner
    `Q 0 ${h} 0 ${h - r}`,
    // left edge
    `L 0 ${r}`,
    // top-left corner
    `Q 0 0 ${r} 0`,
    `Z`,
  ].join(" ");
}

export function BlockNode({
  node,
  blockDef,
  selected,
  ghost = false,
  onSelect,
  onDragStart,
  onClick,
}: BlockNodeProps) {
  const catColor = CATEGORY_COLORS[blockDef.category] ?? colors.accent;
  const borderColor = ghost ? colors.ghostBorder : darken(catColor, 0.18);
  const maxPorts = Math.max(blockDef.inputs.length, blockDef.outputs.length, 1);
  const bodyH = HEADER_HEIGHT + maxPorts * PORT_ROW_HEIGHT + spacing.sm;
  const totalSvgH = bodyH + NOTCH_H * 2; // space for top + bottom notch
  const r = 8;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Ghost previews: block canvas pan from stealing the click; ports not used for wiring
      if (ghost) {
        e.stopPropagation();
        return;
      }
      // Let port clicks bubble to the canvas so drag-to-connect wiring works
      let el: HTMLElement | null = e.target as HTMLElement;
      for (let i = 0; i < 6 && el; i++) {
        if (el.dataset.portId && el.dataset.portNode) return;
        el = el.parentElement;
      }
      e.stopPropagation();
      onSelect(node.id);
      onDragStart(node.id, e);
    },
    [node.id, onSelect, onDragStart, ghost]
  );

  const handleClick = useCallback(() => {
    if (ghost && onClick) onClick();
  }, [ghost, onClick]);

  return (
    <div
      data-node-id={node.id}
      style={{
        position: "absolute",
        left: node.position.x,
        top: node.position.y - NOTCH_H, // offset up so notch sits above position
        width: NODE_WIDTH,
        height: totalSvgH,
        opacity: ghost ? 0.92 : 1,
        cursor: ghost ? "pointer" : "grab",
        userSelect: "none",
        transition: ghost ? "opacity 0.2s, transform 0.2s" : undefined,
        zIndex: 5,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={ghost ? (e) => {
        (e.currentTarget as HTMLDivElement).style.opacity = "1";
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1.02)";
      } : undefined}
      onMouseLeave={ghost ? (e) => {
        (e.currentTarget as HTMLDivElement).style.opacity = "0.92";
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
      } : undefined}
    >
      {/* SVG outline with notches */}
      <svg
        width={NODE_WIDTH}
        height={totalSvgH}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          filter: ghost
            ? `drop-shadow(0 2px 8px ${catColor}35)`
            : selected
              ? `drop-shadow(0 0 6px ${catColor}60)`
              : "drop-shadow(0 2px 6px rgba(0,0,0,0.10))",
        }}
      >
        <g transform={`translate(0, ${NOTCH_H})`}>
          <path
            d={blockPath(NODE_WIDTH, bodyH, r)}
            fill={ghost ? catColor : catColor}
            fillOpacity={ghost ? 0.38 : 1}
            stroke={ghost ? catColor : borderColor}
            strokeOpacity={ghost ? 0.85 : 1}
            strokeWidth={ghost ? 2 : 2}
            strokeDasharray={ghost ? "7 5" : undefined}
          />
          {/* Header separator line */}
          {!ghost && (
            <line
              x1={0}
              y1={HEADER_HEIGHT}
              x2={NODE_WIDTH}
              y2={HEADER_HEIGHT}
              stroke={darken(catColor, 0.12)}
              strokeWidth={1}
            />
          )}
        </g>
      </svg>

      {/* HTML content overlay */}
      <div
        style={{
          position: "absolute",
          top: NOTCH_H,
          left: 0,
          width: NODE_WIDTH,
          height: bodyH,
        }}
      >
        {/* Header */}
        <div
          style={{
            height: HEADER_HEIGHT,
            display: "flex",
            alignItems: "center",
            paddingLeft: 14,
            paddingRight: 14,
            gap: spacing.sm,
          }}
        >
          {ghost && (
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: radii.full,
                backgroundColor: catColor,
                opacity: 0.6,
                flexShrink: 0,
              }}
            />
          )}
          <span
            style={{
              fontSize: ghost ? fontSizes.sm : fontSizes.md,
              fontWeight: 700,
              color: ghost ? "#1e293b" : "#fff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              letterSpacing: "-0.01em",
            }}
          >
            {node.label ?? blockDef.name}
          </span>
        </div>

        {/* Ports */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 2,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {blockDef.inputs.map((port) => (
              <PortDot key={port.id} port={port} isOutput={false} nodeId={node.id} ghost={ghost} />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {blockDef.outputs.map((port) => (
              <PortDot key={port.id} port={port} isOutput={true} nodeId={node.id} ghost={ghost} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Axis-aligned bounds of a block as rendered (matches BlockNode layout). */
export function getNodeRenderedBounds(
  node: GraphNode,
  blockDef: BlockDefinition
): { left: number; top: number; right: number; bottom: number } {
  const maxPorts = Math.max(blockDef.inputs.length, blockDef.outputs.length, 1);
  const bodyH = HEADER_HEIGHT + maxPorts * PORT_ROW_HEIGHT + spacing.sm;
  const totalSvgH = bodyH + NOTCH_H * 2;
  return {
    left: node.position.x,
    top: node.position.y - NOTCH_H,
    right: node.position.x + NODE_WIDTH,
    bottom: node.position.y - NOTCH_H + totalSvgH,
  };
}

/** Get the pixel position of a port dot relative to the node's top-left (before the NOTCH_H offset) */
export function getPortPosition(
  blockDef: BlockDefinition,
  portId: string,
  isOutput: boolean
): { x: number; y: number } {
  const ports = isOutput ? blockDef.outputs : blockDef.inputs;
  const idx = ports.findIndex((p) => p.id === portId);
  if (idx === -1) return { x: 0, y: 0 };

  const x = isOutput ? NODE_WIDTH : 0;
  const y = HEADER_HEIGHT + 2 + idx * PORT_ROW_HEIGHT + PORT_ROW_HEIGHT / 2;
  return { x, y };
}

export { NODE_WIDTH, PORT_SIZE, HEADER_HEIGHT, PORT_ROW_HEIGHT, NOTCH_H as NOTCH_HEIGHT };
