// ============================================================================
// EdgeLine — SVG bezier curve with port-type coloring
// ============================================================================

import React from "react";
import { colors } from "../theme/tokens.js";

export interface EdgeLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  selected?: boolean;
  dashed?: boolean;
  onClick?: () => void;
}

export function EdgeLine({
  x1,
  y1,
  x2,
  y2,
  color = "#9094a6",
  selected = false,
  dashed = false,
  onClick,
}: EdgeLineProps) {
  const dx = Math.abs(x2 - x1);
  const handleOffset = Math.max(60, dx * 0.45);

  const path = `M ${x1} ${y1} C ${x1 + handleOffset} ${y1}, ${x2 - handleOffset} ${y2}, ${x2} ${y2}`;

  return (
    <>
      {/* Hit area */}
      {onClick && (
        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth={14}
          style={{ cursor: "pointer" }}
          onClick={onClick}
        />
      )}
      {/* Glow on selected */}
      {selected && (
        <path
          d={path}
          fill="none"
          stroke={colors.accent}
          strokeWidth={6}
          strokeOpacity={0.2}
          style={{ pointerEvents: "none" }}
        />
      )}
      <path
        d={path}
        fill="none"
        stroke={selected ? colors.accent : color}
        strokeWidth={selected ? 3.5 : 3}
        strokeDasharray={dashed ? "8 5" : undefined}
        strokeLinecap="round"
        style={{ pointerEvents: "none" }}
      />
    </>
  );
}
