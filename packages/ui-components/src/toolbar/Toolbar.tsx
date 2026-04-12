// ============================================================================
// Toolbar — clean minimal top bar with icons
// ============================================================================

import React from "react";
import { colors, spacing, radii, fontSizes, shadows } from "../theme/tokens.js";

export interface ToolbarProps {
  pipelineName: string;
  onNameChange: (name: string) => void;
  /** Opens file picker for .json or AI Blocks .py (with embedded graph) */
  onImport: () => void;
  /** Opens a directory picker that ingests every .py file into a repo mind map */
  onImportRepo: () => void;
  /** Prompts for a github.com URL and imports the repo via the GitHub API */
  onImportGitHub: () => void;
  /** Clean Python only (no embedded canvas) */
  onExportCode: () => void;
  /** Zip every file in the currently-loaded repo and download it */
  onDownloadRepo: () => void;
  onClearWorkspace: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  /** Navigate back to landing page */
  onLogoClick?: () => void;
  /** True when viewing a drilled-in file inside a repo mind map. */
  repoDrilled?: boolean;
  /** Back to the repo mind-map graph. */
  onBackToRepo?: () => void;
  /** Exit repo mode completely. */
  onCloseRepo?: () => void;
}

// ── SVG Icons (16x16) ──────────────────────────────────────────────────────

const IconImport = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 10v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3" />
    <polyline points="8 10 8 2" />
    <polyline points="5 5 8 2 11 5" />
  </svg>
);

const IconExport = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 10v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3" />
    <polyline points="8 2 8 10" />
    <polyline points="5 7 8 10 11 7" />
  </svg>
);

const IconZip = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" />
    <line x1="8" y1="2" x2="8" y2="5" />
    <line x1="8" y1="6" x2="8" y2="7" />
    <line x1="8" y1="8" x2="8" y2="9" />
    <line x1="8" y1="10" x2="8" y2="11" />
  </svg>
);

const IconClear = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="12" height="12" rx="2" />
    <line x1="6" y1="6" x2="10" y2="10" />
    <line x1="10" y1="6" x2="6" y2="10" />
  </svg>
);

const IconDelete = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 4 4 4 13 4" />
    <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
    <path d="M12 4v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4" />
    <line x1="7" y1="7" x2="7" y2="11" />
    <line x1="9" y1="7" x2="9" y2="11" />
  </svg>
);

const IconRepo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3a1 1 0 011-1h4l1 2h5a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" />
    <circle cx="8" cy="9" r="1.5" />
    <line x1="8" y1="7.5" x2="8" y2="6" />
    <line x1="8" y1="10.5" x2="8" y2="12" />
  </svg>
);

const IconGitHub = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 .2a8 8 0 00-2.53 15.59c.4.07.55-.17.55-.38v-1.34c-2.23.49-2.7-1.08-2.7-1.08-.36-.92-.89-1.17-.89-1.17-.72-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.88 2.34.67.07-.52.28-.88.51-1.08-1.78-.2-3.65-.89-3.65-3.96 0-.88.31-1.6.82-2.16-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.28.82 2.16 0 3.08-1.87 3.76-3.66 3.96.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 008 .2z"/>
  </svg>
);

const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="10 3 5 8 10 13" />
  </svg>
);

// ── Orange accent for Export .py ────────────────────────────────────────────
const ORANGE = "#F7931E";
const ORANGE_HOVER = "#E8820D";

function ToolbarButton({
  label,
  icon,
  onClick,
  accent,
  danger,
  disabled,
  title,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  accent?: boolean;
  danger?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  const bg = accent ? ORANGE : danger ? `${colors.error}10` : colors.surface1;
  const fg = accent ? "#fff" : danger ? colors.error : disabled ? colors.textMuted : colors.textSecondary;
  const border = accent ? ORANGE : danger ? `${colors.error}30` : colors.border;

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: `5px 10px`,
        borderRadius: radii.sm,
        border: `1px solid ${border}`,
        backgroundColor: bg,
        color: fg,
        fontSize: fontSizes.sm,
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 500,
        transition: "all 0.15s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export function Toolbar({
  pipelineName,
  onNameChange,
  onImport,
  onImportRepo,
  onImportGitHub,
  onExportCode,
  onDownloadRepo,
  onClearWorkspace,
  onDeleteSelected,
  hasSelection,
  onLogoClick,
  repoDrilled,
  onBackToRepo,
  onCloseRepo,
}: ToolbarProps) {
  return (
    <div
      style={{
        height: 50,
        backgroundColor: colors.surface0,
        borderBottom: `1px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        padding: `0 ${spacing.lg}px`,
        gap: spacing.md,
        boxShadow: shadows.sm,
        zIndex: 100,
        position: "relative",
      }}
    >
      {/* Logo — icon.png + AI Blocks (click to go back to landing) */}
      <button
        type="button"
        onClick={() => { if (onLogoClick) onLogoClick(); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginRight: spacing.lg,
          cursor: onLogoClick ? "pointer" : "default",
          background: "none",
          border: "none",
          padding: 0,
          zIndex: 20,
          position: "relative",
        }}
        title="Back to home"
      >
        <img src="/icon.png" alt="AI Blocks" style={{ width: 28, height: 28, objectFit: "contain" }} />
        <span style={{ fontSize: fontSizes.xl, fontWeight: 800, color: colors.textPrimary, letterSpacing: "-0.02em" }}>
          AI Blocks
        </span>
      </button>

      <div style={{ width: 1, height: 24, backgroundColor: colors.border }} />

      <input
        type="text"
        value={pipelineName}
        onChange={(e) => onNameChange(e.target.value)}
        style={{
          background: "none",
          border: "none",
          color: colors.textPrimary,
          fontSize: fontSizes.md,
          fontWeight: 500,
          outline: "none",
          width: 180,
          padding: `4px 8px`,
          borderRadius: radii.sm,
          transition: "background-color 0.15s",
        }}
        onFocus={(e) => { (e.target as HTMLInputElement).style.backgroundColor = colors.surface1; }}
        onBlur={(e) => { (e.target as HTMLInputElement).style.backgroundColor = "transparent"; }}
      />

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap", alignItems: "center" }}>
        {repoDrilled && onBackToRepo && (
          <ToolbarButton
            icon={<IconBack />}
            label="Back to repo"
            onClick={onBackToRepo}
            title="Return to the repository mind map"
          />
        )}
        {onCloseRepo && !repoDrilled && (
          <ToolbarButton
            icon={<IconBack />}
            label="Exit repo"
            onClick={onCloseRepo}
            title="Close the repo mind map"
          />
        )}
        <ToolbarButton
          icon={<IconImport />}
          label="Import File"
          onClick={onImport}
          title="Load any .py or .ipynb (ML scripts, tutorials). No footer required."
        />
        <ToolbarButton
          icon={<IconRepo />}
          label="Import Repo"
          onClick={onImportRepo}
          title="Pick a folder — build a mind map of every .py file and how they import each other"
        />
        <ToolbarButton
          icon={<IconGitHub />}
          label="Import GitHub"
          onClick={onImportGitHub}
          title="Paste a public github.com URL — pulls the repo via the GitHub API into the same mind map"
        />
        <ToolbarButton
          icon={<IconExport />}
          label="Export .py"
          onClick={onExportCode}
          accent
          title="Download generated Python only — clean file for sharing or learning"
        />
        <ToolbarButton
          icon={<IconZip />}
          label="Download Repo"
          onClick={onDownloadRepo}
          title="Zip every file in the loaded repo and download it"
        />
        <ToolbarButton icon={<IconClear />} label="Clear" onClick={onClearWorkspace} danger title="Remove all blocks and edges" />
        <ToolbarButton icon={<IconDelete />} label="Delete" onClick={onDeleteSelected} danger disabled={!hasSelection} />
      </div>
    </div>
  );
}
