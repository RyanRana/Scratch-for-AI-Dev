// ============================================================================
// Canvas — editing surface with grid, wiring via data-attribute hit detection
// ============================================================================

import React, { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import type { BlockDefinition, BlockRegistry } from "@ai-blocks/block-schemas";
import type { Graph, GraphEdge, GraphNode } from "@ai-blocks/core";
import { colors, PORT_TYPE_COLORS } from "../theme/tokens.js";
import { BlockNode, getNodeRenderedBounds, getPortPosition, NODE_WIDTH } from "./BlockNode.js";
import { EdgeLine } from "./EdgeLine.js";

export interface SuggestedBlock {
  blockDef: BlockDefinition;
  position: { x: number; y: number };
  /** Node the suggestions are anchored to */
  selectedNodeId: string;
  /** Right: connect selected output → new block input. Left: new block output → selected input */
  side: "left" | "right";
  /** On the selected block: an output port id if side==right, an input port id if side==left */
  selectedPortId: string;
  /** On the new block: an input port id if side==right, an output port id if side==left */
  newBlockPortId: string;
}

export interface CanvasProps {
  graph: Graph;
  registry: BlockRegistry;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  suggestions: SuggestedBlock[];
  onSelectNode: (nodeId: string | null) => void;
  onSelectEdge: (edgeId: string | null) => void;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
  onConnect: (
    srcNodeId: string,
    srcPortId: string,
    tgtNodeId: string,
    tgtPortId: string
  ) => void;
  onDropBlock: (blockId: string, x: number, y: number) => void;
  onDeleteEdge: (edgeId: string) => void;
  onAcceptSuggestion: (suggestion: SuggestedBlock) => void;
  /** Increment when the graph should be re-centered (import, load, AI replace, clear). Omit for mount-only fit. */
  fitViewTrigger?: number;
}

interface DragState {
  nodeId: string;
  startMouseX: number;
  startMouseY: number;
  startNodeX: number;
  startNodeY: number;
}

interface WiringState {
  sourceNodeId: string;
  sourcePortId: string;
  isOutput: boolean;
  mouseX: number;
  mouseY: number;
}

const GRID_SIZE = 24;
const GRID_SIZE_LARGE = GRID_SIZE * 5;

/** Walk up the DOM to find a port element with data-port-id */
function findPortElement(target: HTMLElement | null): HTMLElement | null {
  let el: HTMLElement | null = target;
  for (let i = 0; i < 8 && el; i++) {
    if (el.dataset.portId && el.dataset.portNode) return el;
    el = el.parentElement;
  }
  return null;
}

/** Resolve port under cursor (works when SVG/wires are painted above blocks with pointer-events: none) */
function findPortElementAtScreen(clientX: number, clientY: number): HTMLElement | null {
  const stack = document.elementsFromPoint(clientX, clientY);
  for (const el of stack) {
    if (el instanceof HTMLElement) {
      const port = findPortElement(el);
      if (port) return port;
    }
  }
  return null;
}

export function Canvas({
  graph,
  registry,
  selectedNodeId,
  selectedEdgeId,
  suggestions,
  onSelectNode,
  onSelectEdge,
  onMoveNode,
  onConnect,
  onDropBlock,
  onDeleteEdge,
  onAcceptSuggestion,
  fitViewTrigger = 0,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef(graph);
  graphRef.current = graph;
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [wiring, setWiring] = useState<WiringState | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const wiringRef = useRef<WiringState | null>(null);

  // Keep ref in sync so global handlers see latest wiring
  wiringRef.current = wiring;

  const fitViewToGraph = useCallback(() => {
    const el = canvasRef.current;
    const g = graphRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 16 || rect.height < 16) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const node of Object.values(g.nodes)) {
      const def = registry.get(node.blockId);
      if (!def) continue;
      const b = getNodeRenderedBounds(node, def);
      minX = Math.min(minX, b.left);
      minY = Math.min(minY, b.top);
      maxX = Math.max(maxX, b.right);
      maxY = Math.max(maxY, b.bottom);
    }

    if (!Number.isFinite(minX)) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const width = Math.max(maxX - minX, 1);
    const height = Math.max(maxY - minY, 1);
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    const pad = 56;
    const zx = (rect.width - pad * 2) / width;
    const zy = (rect.height - pad * 2) / height;
    const nextZoom = Math.min(1.25, Math.max(0.22, Math.min(zx, zy)));
    setZoom(nextZoom);
    setPan({
      x: rect.width / 2 - centerX * nextZoom,
      y: rect.height / 2 - centerY * nextZoom,
    });
  }, [registry]);

  useLayoutEffect(() => {
    fitViewToGraph();
  }, [fitViewTrigger, fitViewToGraph]);

  const screenToCanvas = useCallback(
    (sx: number, sy: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: sx, y: sy };
      return {
        x: (sx - rect.left - pan.x) / zoom,
        y: (sy - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // ── Node dragging ──────────────────────────────────────────

  const handleNodeDragStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      const node = graph.nodes[nodeId];
      if (!node) return;
      setDrag({
        nodeId,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startNodeX: node.position.x,
        startNodeY: node.position.y,
      });
    },
    [graph.nodes]
  );

  // ── Wiring — start on port mouseDown ───────────────────────

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if clicking a port
      const portEl = findPortElement(target);
      if (portEl) {
        e.stopPropagation();
        e.preventDefault();
        const portId = portEl.dataset.portId!;
        const nodeId = portEl.dataset.portNode!;
        const isOutput = portEl.dataset.portOutput === "true";
        const rect = canvasRef.current?.getBoundingClientRect();
        const mx = rect ? (e.clientX - rect.left - pan.x) / zoom : 0;
        const my = rect ? (e.clientY - rect.top - pan.y) / zoom : 0;
        setWiring({
          sourceNodeId: nodeId,
          sourcePortId: portId,
          isOutput,
          mouseX: mx,
          mouseY: my,
        });
        return;
      }

      // Check if on canvas background (not a block)
      if (
        target === canvasRef.current ||
        target.dataset?.canvas ||
        target.tagName === "svg" ||
        target.tagName === "line" ||
        target.tagName === "path"
      ) {
        onSelectNode(null);
        onSelectEdge(null);
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      }
    },
    [onSelectNode, onSelectEdge, pan]
  );

  // ── Global mouse handlers ──────────────────────────────────

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (drag) {
        const dx = (e.clientX - drag.startMouseX) / zoom;
        const dy = (e.clientY - drag.startMouseY) / zoom;
        onMoveNode(drag.nodeId, drag.startNodeX + dx, drag.startNodeY + dy);
      }
      if (wiringRef.current) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const mx = (e.clientX - rect.left - pan.x) / zoom;
          const my = (e.clientY - rect.top - pan.y) / zoom;
          setWiring((prev) => (prev ? { ...prev, mouseX: mx, mouseY: my } : null));
        }
      }
      if (isPanning) {
        setPan({
          x: panStart.current.panX + (e.clientX - panStart.current.x),
          y: panStart.current.panY + (e.clientY - panStart.current.y),
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // If wiring, check if mouse is over a port to complete connection
      if (wiringRef.current) {
        const portEl = findPortElementAtScreen(e.clientX, e.clientY);
        if (portEl) {
          const tgtPortId = portEl.dataset.portId!;
          const tgtNodeId = portEl.dataset.portNode!;
          const tgtIsOutput = portEl.dataset.portOutput === "true";
          const w = wiringRef.current;

          // Must connect output→input
          if (w.isOutput && !tgtIsOutput && w.sourceNodeId !== tgtNodeId) {
            onConnect(w.sourceNodeId, w.sourcePortId, tgtNodeId, tgtPortId);
          } else if (!w.isOutput && tgtIsOutput && w.sourceNodeId !== tgtNodeId) {
            onConnect(tgtNodeId, tgtPortId, w.sourceNodeId, w.sourcePortId);
          }
        }
        setWiring(null);
      }
      setDrag(null);
      setIsPanning(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [drag, isPanning, zoom, pan, onMoveNode, onConnect]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.95 : 1.05;
    setZoom((z) => Math.min(2, Math.max(0.2, z * scaleFactor)));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const blockId = e.dataTransfer.getData("application/x-block-id");
      if (!blockId) return;
      const pos = screenToCanvas(e.clientX, e.clientY);
      onDropBlock(blockId, pos.x, pos.y);
    },
    [screenToCanvas, onDropBlock]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  // ── Edge positions ─────────────────────────────────────────

  function getEdgeCoords(edge: GraphEdge) {
    const srcNode = graph.nodes[edge.sourceNodeId];
    const tgtNode = graph.nodes[edge.targetNodeId];
    if (!srcNode || !tgtNode) return null;

    const srcBlock = registry.get(srcNode.blockId);
    const tgtBlock = registry.get(tgtNode.blockId);
    if (!srcBlock || !tgtBlock) return null;

    const srcPortPos = getPortPosition(srcBlock, edge.sourcePortId, true);
    const tgtPortPos = getPortPosition(tgtBlock, edge.targetPortId, false);

    const srcPortDef = srcBlock.outputs.find((p: { id: string }) => p.id === edge.sourcePortId);
    const edgeColor = srcPortDef ? (PORT_TYPE_COLORS[srcPortDef.type] ?? "#9094a6") : "#9094a6";

    return {
      x1: srcNode.position.x + srcPortPos.x,
      y1: srcNode.position.y + srcPortPos.y,
      x2: tgtNode.position.x + tgtPortPos.x,
      y2: tgtNode.position.y + tgtPortPos.y,
      color: edgeColor,
    };
  }

  // ── Grid ───────────────────────────────────────────────────

  const gridSmall = GRID_SIZE * zoom;
  const gridLarge = GRID_SIZE_LARGE * zoom;

  return (
    <div
      ref={canvasRef}
      data-canvas="true"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: colors.canvasBg,
        backgroundImage: [
          `linear-gradient(${colors.canvasGrid} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${colors.canvasGrid} 1px, transparent 1px)`,
          `linear-gradient(${colors.canvasGridAccent} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${colors.canvasGridAccent} 1px, transparent 1px)`,
        ].join(", "),
        backgroundSize: `${gridSmall}px ${gridSmall}px, ${gridSmall}px ${gridSmall}px, ${gridLarge}px ${gridLarge}px, ${gridLarge}px ${gridLarge}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
        cursor: isPanning ? "grabbing" : wiring ? "crosshair" : "default",
      }}
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div
        data-canvas="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Blocks first in DOM; edges SVG is painted on top so wires are visible over block bodies */}
        {Object.values(graph.nodes).map((node) => {
          const blockDef = registry.get(node.blockId);
          if (!blockDef) return null;
          return (
            <BlockNode
              key={node.id}
              node={node}
              blockDef={blockDef}
              selected={node.id === selectedNodeId}
              onSelect={onSelectNode}
              onDragStart={handleNodeDragStart}
            />
          );
        })}

        {suggestions.map((sug, i) => {
          const ghostNode: GraphNode = {
            id: `ghost_${i}`,
            blockId: sug.blockDef.id,
            position: sug.position,
            parameters: {},
          };
          return (
            <BlockNode
              key={`ghost_${sug.side}_${i}`}
              node={ghostNode}
              blockDef={sug.blockDef}
              selected={false}
              ghost
              onSelect={() => {}}
              onDragStart={() => {}}
              onClick={() => onAcceptSuggestion(sug)}
            />
          );
        })}

        <svg
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
            pointerEvents: "none",
            zIndex: 10,
          }}
          aria-hidden
        >
          <g>
            {Object.values(graph.edges).map((edge) => {
              const coords = getEdgeCoords(edge);
              if (!coords) return null;
              return (
                <EdgeLine
                  key={edge.id}
                  {...coords}
                  selected={edge.id === selectedEdgeId}
                />
              );
            })}

            {wiring && (
              <EdgeLine
                x1={(() => {
                  const n = graph.nodes[wiring.sourceNodeId];
                  const b = registry.get(n?.blockId ?? "");
                  if (!n || !b) return 0;
                  return n.position.x + getPortPosition(b, wiring.sourcePortId, wiring.isOutput).x;
                })()}
                y1={(() => {
                  const n = graph.nodes[wiring.sourceNodeId];
                  const b = registry.get(n?.blockId ?? "");
                  if (!n || !b) return 0;
                  return n.position.y + getPortPosition(b, wiring.sourcePortId, wiring.isOutput).y;
                })()}
                x2={wiring.mouseX}
                y2={wiring.mouseY}
                dashed
                color={colors.accent}
              />
            )}

            {suggestions.map((sug, i) => {
              const selNode = graph.nodes[sug.selectedNodeId];
              if (!selNode) return null;
              const selBlock = registry.get(selNode.blockId);
              const ghostBlock = sug.blockDef;
              if (!selBlock || !ghostBlock) return null;

              let x1: number;
              let y1: number;
              let x2: number;
              let y2: number;
              let edgeColor: string;

              if (sug.side === "right") {
                const srcPos = getPortPosition(selBlock, sug.selectedPortId, true);
                const tgtPos = getPortPosition(ghostBlock, sug.newBlockPortId, false);
                x1 = selNode.position.x + srcPos.x;
                y1 = selNode.position.y + srcPos.y;
                x2 = sug.position.x + tgtPos.x;
                y2 = sug.position.y + tgtPos.y;
                const srcPortDef = selBlock.outputs.find((p) => p.id === sug.selectedPortId);
                edgeColor = srcPortDef ? (PORT_TYPE_COLORS[srcPortDef.type] ?? "#9094a6") : "#9094a6";
              } else {
                const srcPos = getPortPosition(ghostBlock, sug.newBlockPortId, true);
                const tgtPos = getPortPosition(selBlock, sug.selectedPortId, false);
                x1 = sug.position.x + srcPos.x;
                y1 = sug.position.y + srcPos.y;
                x2 = selNode.position.x + tgtPos.x;
                y2 = selNode.position.y + tgtPos.y;
                const srcPortDef = ghostBlock.outputs.find((p) => p.id === sug.newBlockPortId);
                edgeColor = srcPortDef ? (PORT_TYPE_COLORS[srcPortDef.type] ?? "#9094a6") : "#9094a6";
              }

              return (
                <EdgeLine
                  key={`suggest_edge_${sug.side}_${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  dashed
                  color={edgeColor}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
