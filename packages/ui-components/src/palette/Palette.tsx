// ============================================================================
// Palette — searchable block browser with color-coded categories
// ============================================================================

import React, { useState, useMemo } from "react";
import type { BlockDefinition, BlockRegistry, CategoryDefinition } from "@ai-blocks/block-schemas";
import { colors, spacing, radii, fontSizes, CATEGORY_COLORS } from "../theme/tokens.js";

export interface PaletteProps {
  registry: BlockRegistry;
}

function CategorySection({
  category,
  blocks,
  collapsed,
  onToggle,
}: {
  category: CategoryDefinition;
  blocks: BlockDefinition[];
  collapsed: boolean;
  onToggle: () => void;
}) {
  const catColor = category.color;

  return (
    <div style={{ marginBottom: 2 }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: spacing.sm,
          padding: `7px ${spacing.md}px`,
          background: collapsed ? "none" : `${catColor}08`,
          border: "none",
          borderLeft: `3px solid ${collapsed ? "transparent" : catColor}`,
          cursor: "pointer",
          color: colors.textPrimary,
          fontSize: fontSizes.sm,
          fontWeight: 600,
          textAlign: "left",
          transition: "all 0.15s",
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            backgroundColor: catColor,
            flexShrink: 0,
          }}
        />
        <span style={{ flex: 1 }}>{category.name}</span>
        <span
          style={{
            color: colors.textMuted,
            fontSize: fontSizes.xs,
            fontWeight: 400,
            minWidth: 20,
            textAlign: "right",
          }}
        >
          {blocks.length}
        </span>
      </button>

      {!collapsed && (
        <div style={{ paddingLeft: 22, paddingBottom: spacing.xs }}>
          {blocks.map((block) => (
            <PaletteItem key={block.id} block={block} catColor={catColor} />
          ))}
        </div>
      )}
    </div>
  );
}

function PaletteItem({ block, catColor }: { block: BlockDefinition; catColor: string }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/x-block-id", block.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{
        padding: `4px 8px`,
        borderRadius: radii.sm,
        cursor: "grab",
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.1s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = `${catColor}12`;
        (e.currentTarget as HTMLDivElement).style.color = colors.textPrimary;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent";
        (e.currentTarget as HTMLDivElement).style.color = colors.textSecondary;
      }}
      title={block.description}
    >
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: radii.full,
          backgroundColor: catColor,
          opacity: 0.5,
          flexShrink: 0,
        }}
      />
      {block.name}
    </div>
  );
}

export function Palette({ registry }: PaletteProps) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const categories = registry.getCategories();

  const filteredBlocks = useMemo(() => {
    if (!search.trim()) return null;
    return registry.search(search.trim()).slice(0, 50);
  }, [search, registry]);

  return (
    <div
      style={{
        width: 260,
        height: "100%",
        backgroundColor: colors.surface0,
        borderRight: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: `${spacing.md}px ${spacing.md}px ${spacing.sm}px`,
          fontSize: fontSizes.xs,
          fontWeight: 600,
          color: colors.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        Blocks
      </div>

      {/* Search */}
      <div style={{ padding: `0 ${spacing.md}px ${spacing.md}px` }}>
        <input
          type="text"
          placeholder="Search blocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: `7px ${spacing.md}px`,
            borderRadius: radii.md,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surface1,
            color: colors.textPrimary,
            fontSize: fontSizes.sm,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = colors.accent;
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = colors.border;
          }}
        />
      </div>

      {/* Block list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: spacing.lg,
        }}
      >
        {filteredBlocks ? (
          <div style={{ padding: `0 ${spacing.md}px` }}>
            <div
              style={{
                fontSize: fontSizes.xs,
                color: colors.textMuted,
                marginBottom: spacing.sm,
              }}
            >
              {filteredBlocks.length} result{filteredBlocks.length !== 1 ? "s" : ""}
            </div>
            {filteredBlocks.map((block) => (
              <PaletteItem
                key={block.id}
                block={block}
                catColor={CATEGORY_COLORS[block.category] ?? colors.textMuted}
              />
            ))}
          </div>
        ) : (
          categories.map((cat) => {
            const blocks = registry.getByCategory(cat.id);
            if (blocks.length === 0) return null;
            return (
              <CategorySection
                key={cat.id}
                category={cat}
                blocks={blocks}
                collapsed={collapsed[cat.id] ?? true}
                onToggle={() =>
                  setCollapsed((c) => ({ ...c, [cat.id]: !c[cat.id] }))
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
