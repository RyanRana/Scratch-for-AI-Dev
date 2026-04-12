// ============================================================================
// Editor Page — Inspector (top) + Chat (bottom) in right sidebar
// ============================================================================

import React, { useCallback, useEffect, useRef } from "react";
import { Canvas, Palette, Inspector, CodePanel, Toolbar, ChatPanel } from "@ai-blocks/ui-components";
import { colors } from "@ai-blocks/ui-components";
import { useEditorStore, getRegistry } from "../stores/editor-store.js";

export function Editor({ onLogoClick }: { onLogoClick?: () => void }) {
  const store = useEditorStore();
  const registry = getRegistry();
  const importInputRef = useRef<HTMLInputElement>(null);
  const repoInputRef = useRef<HTMLInputElement>(null);
  const inRepoMap = !!store.repoMap;
  const inRepoMindMap = inRepoMap && !store.currentRepoFile;
  const canGoBackInRepo =
    inRepoMap &&
    (!!store.currentRepoFile || (store.repoMap?.currentDir ?? "") !== "");

  const selectedNode = store.selectedNodeId
    ? store.graph.nodes[store.selectedNodeId] ?? null
    : null;
  const selectedBlockDef = selectedNode
    ? registry.get(selectedNode.blockId) ?? null
    : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        store.deleteSelected();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [store]);

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const handleImportRepoClick = useCallback(() => {
    repoInputRef.current?.click();
  }, []);

  const handleImportGitHubClick = useCallback(() => {
    const url = window.prompt(
      "Public GitHub repo URL (e.g. https://github.com/owner/repo or owner/repo/tree/branch):",
    );
    if (!url) return;
    void useEditorStore.getState().importGitHubRepo(url);
  }, []);

  const handleImportRepo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    void (async () => {
      try {
        await useEditorStore.getState().importRepo(files);
      } catch (err) {
        alert((err as Error).message);
      }
      e.target.value = "";
    })();
  }, []);

  /**
   * When the repo mind-map is active, a click on a folder node drills into
   * that folder, and a click on a file node opens that file's block layout.
   * Anything else falls through to normal selection.
   */
  const handleSelectNode = useCallback(
    (nodeId: string | null) => {
      if (inRepoMindMap && nodeId && store.repoMap) {
        const folderPath = store.repoMap.folderPathByNodeId[nodeId];
        if (folderPath !== undefined) {
          useEditorStore.getState().drillIntoRepoFolder(folderPath);
          return;
        }
        const filePath = store.repoMap.pathByNodeId[nodeId];
        if (filePath) {
          void useEditorStore.getState().drillIntoRepoFile(filePath);
          return;
        }
      }
      store.selectNode(nodeId);
    },
    [inRepoMindMap, store],
  );

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      void (async () => {
        try {
          await useEditorStore.getState().importPipeline(String(reader.result ?? ""), file.name);
        } catch (err) {
          alert((err as Error).message);
        }
        e.target.value = "";
      })();
    };
    reader.onerror = () => {
      alert("Could not read the file.");
      e.target.value = "";
    };
    reader.readAsText(file);
  }, []);

  const handleClearWorkspace = useCallback(() => {
    if (window.confirm("Clear the entire canvas? Unsaved changes will be lost.")) {
      useEditorStore.getState().clearWorkspace();
    }
  }, []);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(store.generatedCode).catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = store.generatedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    });
  }, [store.generatedCode]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <input
        ref={importInputRef}
        type="file"
        accept=".json,.py,.ipynb,application/json,text/x-python,application/x-ipynb+json"
        style={{ display: "none" }}
        onChange={handleImportFile}
      />
      <input
        ref={repoInputRef}
        type="file"
        multiple
        // webkitdirectory is non-standard but supported in all major browsers;
        // React doesn't include it in its typings so we cast to unknown.
        {...({ webkitdirectory: "", directory: "" } as unknown as Record<string, string>)}
        style={{ display: "none" }}
        onChange={handleImportRepo}
      />
      {/* Toolbar */}
      <Toolbar
        pipelineName={store.graph.name}
        onNameChange={store.setName}
        onImport={handleImportClick}
        onImportRepo={handleImportRepoClick}
        onImportGitHub={handleImportGitHubClick}
        onExportCode={store.exportPython}
        onDownloadRepo={store.downloadRepoZip}
        onClearWorkspace={handleClearWorkspace}
        onDeleteSelected={store.deleteSelected}
        hasSelection={!!(store.selectedNodeId || store.selectedEdgeId)}
        onLogoClick={onLogoClick}
        repoDrilled={canGoBackInRepo}
        onBackToRepo={canGoBackInRepo ? store.backToRepoMap : undefined}
        onCloseRepo={inRepoMap ? store.closeRepoMap : undefined}
      />

      {/* Main area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Palette (left) — hidden in repo mind-map view so users don't drop
            real blocks onto the synthetic file graph. */}
        {!inRepoMindMap && <Palette registry={registry} />}

        {/* Canvas + Code panel (center) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: store.codePanelOpen ? 2 : 1, position: "relative", overflow: "hidden" }}>
            <Canvas
              graph={store.graph}
              registry={registry}
              selectedNodeId={store.selectedNodeId}
              selectedEdgeId={store.selectedEdgeId}
              suggestions={inRepoMindMap ? [] : store.suggestions}
              onSelectNode={handleSelectNode}
              onSelectEdge={store.selectEdge}
              onMoveNode={store.moveNode}
              onConnect={store.connect}
              onDropBlock={store.addBlock}
              onDeleteEdge={store.deleteEdge}
              onAcceptSuggestion={store.acceptSuggestion}
              fitViewTrigger={store.canvasFitNonce}
            />
            {store.repoLoading && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "8px 14px",
                  borderRadius: 8,
                  backgroundColor: "rgba(20,20,24,0.88)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
                  pointerEvents: "none",
                  zIndex: 50,
                }}
              >
                Mapping file to blocks with Claude…
              </div>
            )}
          </div>

          {store.codePanelOpen && (
            <div style={{ flex: 1, minHeight: 160, maxHeight: 280 }}>
              <CodePanel
                code={store.generatedCode}
                errors={store.errors.map((e) => e.message)}
                onCopy={handleCopyCode}
              />
            </div>
          )}
        </div>

        {/* Right sidebar: Inspector (top) + Chat (bottom) */}
        <div
          style={{
            width: 290,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderLeft: `1px solid ${colors.border}`,
            backgroundColor: colors.surface0,
            overflow: "hidden",
          }}
        >
          {/* Inspector — top half */}
          <div style={{ flex: 1, overflow: "hidden", borderBottom: `1px solid ${colors.border}` }}>
            <Inspector
              node={selectedNode}
              blockDef={selectedBlockDef}
              onUpdateParams={store.updateParams}
            />
          </div>

          {/* Chat — bottom half */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <ChatPanel
              messages={store.chatMessages}
              loading={store.chatLoading}
              onSend={store.sendChat}
              apiKeySet={!!store.apiKey}
              onSetApiKey={store.setApiKey}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
