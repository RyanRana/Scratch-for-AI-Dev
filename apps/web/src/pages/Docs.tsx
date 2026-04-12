import React, { useEffect, useState } from "react";

// ── Types matching blocks-api.json ─────────────────────────────────────────

interface PortDoc {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

interface ParamDoc {
  id: string;
  name: string;
  type: string;
  default?: unknown;
  description?: string;
  options?: unknown[];
  min?: number;
  max?: number;
  advanced?: boolean;
}

interface BlockDoc {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  inputs: PortDoc[];
  outputs: PortDoc[];
  parameters: ParamDoc[];
  pip: string[];
  apiCall: string;
  apiExample: string;
  code: { imports: string[]; body: string };
}

interface CategoryDoc {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  blockCount: number;
}

interface DocsData {
  version: string;
  totalBlocks: number;
  categories: CategoryDoc[];
  blocks: BlockDoc[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function copyText(text: string, setCopied: (id: string) => void, id: string) {
  navigator.clipboard.writeText(text);
  setCopied(id);
  setTimeout(() => setCopied(""), 1500);
}

function buildSnippet(block: BlockDoc): string {
  const lines: string[] = [];
  if (block.pip.length > 0) {
    lines.push(`# pip install ${block.pip.join(" ")}`);
    lines.push("");
  }
  if (block.code.imports.length > 0) {
    lines.push(...block.code.imports);
    lines.push("");
  }
  // Fill in default parameter values
  let body = block.code.body;
  for (const p of block.parameters) {
    const val = p.default !== undefined && p.default !== null ? String(p.default) : "None";
    body = body.replace(new RegExp(`\\{\\{params\\.${p.id}\\}\\}`, "g"), val);
  }
  // Replace remaining template vars with placeholder names
  for (const inp of block.inputs) {
    body = body.replace(new RegExp(`\\{\\{inputs\\.${inp.id}\\}\\}`, "g"), inp.id);
  }
  for (const out of block.outputs) {
    body = body.replace(new RegExp(`\\{\\{outputs\\.${out.id}\\}\\}`, "g"), out.id);
  }
  body = body.replace(/\{\{branches\.\w+\}\}/g, "pass");
  lines.push(body);
  return lines.join("\n");
}

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="5" width="9" height="9" rx="1.5" />
    <path d="M5 11H3.5A1.5 1.5 0 012 9.5v-7A1.5 1.5 0 013.5 1h7A1.5 1.5 0 0112 2.5V5" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 8 6 11 13 4" />
  </svg>
);

// ── Styles ─────────────────────────────────────────────────────────────────

const codeBlockStyle: React.CSSProperties = {
  background: "#1e1e2e",
  color: "#e0e2e7",
  padding: 16,
  borderRadius: 8,
  fontSize: 12,
  lineHeight: 1.5,
  overflow: "auto",
  margin: 0,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
  position: "relative" as const,
};

const copyBtnStyle: React.CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 6,
  padding: "4px 8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 4,
  color: "#9094a6",
  fontSize: 11,
};

// ── Component ──────────────────────────────────────────────────────────────

const GUIDE_CATEGORY = "__guide__";

export function Docs({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<DocsData | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(GUIDE_CATEGORY);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/blocks-api.json")
      .then((r) => r.json())
      .then((d: DocsData) => setData(d));
  }, []);

  if (!data) {
    return (
      <div style={{
        width: "100%", height: "100%", background: "#f8f9fb",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        <p style={{ color: "#9094a6", fontSize: 16 }}>Loading documentation...</p>
      </div>
    );
  }

  const q = search.toLowerCase();
  const isGuide = activeCategory === GUIDE_CATEGORY;

  const filteredBlocks = isGuide ? [] : data.blocks.filter((b) => {
    const matchesCategory = !q ? b.category === activeCategory : true;
    const matchesSearch =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.tags.some((t) => t.includes(q));
    return matchesCategory && matchesSearch;
  });

  const activeCat = data.categories.find((c) => c.id === activeCategory);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "#f8f9fb",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 32px",
        borderBottom: "1px solid #e0e2e7",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexShrink: 0,
      }}>
        <button
          className="docs-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            display: "none", alignItems: "center", justifyContent: "center",
            background: "none", border: "1px solid #e0e2e7", borderRadius: 6,
            width: 36, height: 36, cursor: "pointer", flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#5c5f73" strokeWidth="1.5" strokeLinecap="round">
            <line x1="2" y1="4" x2="14" y2="4" />
            <line x1="2" y1="8" x2="14" y2="8" />
            <line x1="2" y1="12" x2="14" y2="12" />
          </svg>
        </button>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: "none", cursor: "pointer",
            fontSize: 15, fontWeight: 600, color: "#1e1e2e",
          }}
        >
          <img src="/icon.png" alt="AI Blocks" style={{ width: 28, height: 28, objectFit: "contain", background: "transparent" }} />
          AI Blocks
        </button>
        <div className="docs-divider" style={{ width: 1, height: 24, background: "#e0e2e7" }} />
        <h1 className="docs-header-title" style={{ fontSize: 20, fontWeight: 700, color: "#1e1e2e", margin: 0 }}>
          Documentation &amp; API Reference
        </h1>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: "#9094a6" }}>
          {data.totalBlocks} blocks &middot; {data.categories.length} categories &middot; v{data.version}
        </span>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div className={`docs-sidebar ${sidebarOpen ? "docs-sidebar-open" : ""}`} style={{
          width: 240,
          borderRight: "1px solid #e0e2e7",
          background: "#fff",
          overflowY: "auto",
          flexShrink: 0,
          padding: "16px 0",
        }}>
          {/* Getting Started link */}
          <button
            onClick={() => { setActiveCategory(GUIDE_CATEGORY); setExpandedBlock(null); setSidebarOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "10px 16px",
              background: isGuide ? "#F7931E10" : "transparent",
              border: "none",
              borderLeft: isGuide ? "3px solid #F7931E" : "3px solid transparent",
              cursor: "pointer", textAlign: "left", transition: "all 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={isGuide ? "#F7931E" : "#9094a6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h4l2 2h6v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: isGuide ? 600 : 500, color: isGuide ? "#F7931E" : "#5c5f73" }}>
              Getting Started
            </span>
          </button>

          <div style={{ height: 1, background: "#e0e2e7", margin: "8px 16px" }} />

          <div style={{ padding: "8px 16px 12px", fontSize: 11, fontWeight: 600, color: "#9094a6", textTransform: "uppercase", letterSpacing: 1 }}>
            Categories
          </div>
          {data.categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setExpandedBlock(null); setSidebarOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "10px 16px",
                  background: isActive ? `${cat.color}10` : "transparent",
                  border: "none",
                  borderLeft: isActive ? `3px solid ${cat.color}` : "3px solid transparent",
                  cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? "#1e1e2e" : "#5c5f73" }}>
                    {cat.name}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#9094a6", fontWeight: 500 }}>{cat.blockCount}</span>
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Search bar */}
          {!isGuide && (
            <div style={{
              padding: "12px 24px", borderBottom: "1px solid #e0e2e7", background: "#fff", flexShrink: 0,
            }}>
              <input
                type="text"
                placeholder="Search all blocks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", border: "1.5px solid #e0e2e7",
                  borderRadius: 8, fontSize: 14, outline: "none", color: "#1e1e2e", background: "#f8f9fb",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {/* Content area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>

            {/* ── Getting Started Guide ─────────────────────────────── */}
            {isGuide && (
              <div style={{ maxWidth: 720 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "#1e1e2e", margin: "0 0 8px", letterSpacing: -0.5 }}>
                  Getting Started
                </h2>
                <p style={{ fontSize: 15, color: "#5c5f73", lineHeight: 1.6, margin: "0 0 32px" }}>
                  AI Blocks is a callable Python API. Every block is a function you can import, call, and chain.
                  Install the package, call blocks, get results.
                </p>

                {/* Step 1 — Install */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e1e2e", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: "#F7931E", color: "#fff", fontSize: 13, fontWeight: 700 }}>1</span>
                    Install
                  </h3>
                  <p style={{ fontSize: 13, color: "#5c5f73", lineHeight: 1.5, margin: "0 0 12px" }}>
                    Install the core package, then add extras for what you need:
                  </p>
                  <div style={{ position: "relative" }}>
                    <pre style={codeBlockStyle}>
{`# Core (pandas + numpy)
pip install aiblocks

# With ML extras
pip install aiblocks[ml]        # scikit-learn, xgboost, lightgbm
pip install aiblocks[dl]        # torch, torchvision, torchaudio
pip install aiblocks[llm]       # transformers, openai, anthropic, langchain
pip install aiblocks[vision]    # opencv, Pillow, ultralytics
pip install aiblocks[all]       # everything`}
                    </pre>
                    <button
                      onClick={() => copyText("pip install aiblocks", setCopied, "install-base")}
                      style={copyBtnStyle}
                    >
                      {copied === "install-base" ? <CheckIcon /> : <CopyIcon />}
                      {copied === "install-base" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Step 2 — Call a Block */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e1e2e", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: "#F7931E", color: "#fff", fontSize: 13, fontWeight: 700 }}>2</span>
                    Call a Block
                  </h3>
                  <p style={{ fontSize: 13, color: "#5c5f73", lineHeight: 1.5, margin: "0 0 12px" }}>
                    Every block is a Python function under <code style={{ background: "#f0f1f3", padding: "1px 4px", borderRadius: 3, fontSize: 11 }}>aiblocks.&lt;category&gt;.&lt;block&gt;()</code>.
                    Pass parameters as keyword arguments. Outputs are returned directly.
                  </p>
                  <div style={{ position: "relative" }}>
                    <pre style={codeBlockStyle}>
{`import aiblocks

# Load a CSV file
df = aiblocks.data_io.load_csv(file_path="data.csv")

# Train a Random Forest
model = aiblocks.classical_ml.random_forest(
    X_train=X_train,
    y_train=y_train,
    n_estimators=100,
    max_depth=10
)

# Get accuracy
result = aiblocks.evaluation.accuracy(
    y_true=y_test,
    y_pred=predictions
)`}
                    </pre>
                    <button
                      onClick={() => copyText('import aiblocks\n\n# Load a CSV file\ndf = aiblocks.data_io.load_csv(file_path="data.csv")\n\n# Train a Random Forest\nmodel = aiblocks.classical_ml.random_forest(\n    X_train=X_train,\n    y_train=y_train,\n    n_estimators=100,\n    max_depth=10\n)\n\n# Get accuracy\nresult = aiblocks.evaluation.accuracy(\n    y_true=y_test,\n    y_pred=predictions\n)', setCopied, "example-api")}
                      style={copyBtnStyle}
                    >
                      {copied === "example-api" ? <CheckIcon /> : <CopyIcon />}
                      {copied === "example-api" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Step 3 — Chain Blocks */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e1e2e", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: "#F7931E", color: "#fff", fontSize: 13, fontWeight: 700 }}>3</span>
                    Chain Blocks Together
                  </h3>
                  <p style={{ fontSize: 13, color: "#5c5f73", lineHeight: 1.5, margin: "0 0 12px" }}>
                    Pass one block's output as the next block's input. Same as connecting blocks in the visual editor.
                  </p>
                  <div style={{ position: "relative" }}>
                    <pre style={codeBlockStyle}>
{`import aiblocks

# Full pipeline: load → process → train → evaluate
df = aiblocks.data_io.load_csv(file_path="data.csv")
filtered = aiblocks.data_processing.filter_rows(dataframe=df, expression="age > 18")
normalized = aiblocks.data_processing.normalize(dataframe=filtered, method="min-max")

model = aiblocks.classical_ml.random_forest(
    X_train=X_train, y_train=y_train, n_estimators=200
)

acc = aiblocks.evaluation.accuracy(y_true=y_test, y_pred=model.predict(X_test))
print(f"Accuracy: {acc}")`}
                    </pre>
                    <button
                      onClick={() => copyText('import aiblocks\n\ndf = aiblocks.data_io.load_csv(file_path="data.csv")\nfiltered = aiblocks.data_processing.filter_rows(dataframe=df, expression="age > 18")\nnormalized = aiblocks.data_processing.normalize(dataframe=filtered, method="min-max")\n\nmodel = aiblocks.classical_ml.random_forest(\n    X_train=X_train, y_train=y_train, n_estimators=200\n)\n\nacc = aiblocks.evaluation.accuracy(y_true=y_test, y_pred=model.predict(X_test))\nprint(f"Accuracy: {acc}")', setCopied, "example-chain")}
                      style={copyBtnStyle}
                    >
                      {copied === "example-chain" ? <CheckIcon /> : <CopyIcon />}
                      {copied === "example-chain" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Step 4 — Available Modules */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e1e2e", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: "#F7931E", color: "#fff", fontSize: 13, fontWeight: 700 }}>4</span>
                    Available Modules
                  </h3>
                  <p style={{ fontSize: 13, color: "#5c5f73", lineHeight: 1.5, margin: "0 0 12px" }}>
                    All {data.totalBlocks} blocks organized into {data.categories.length} modules:
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {data.categories.map((cat) => {
                      const modName = cat.id.replace(/-/g, "_");
                      return (
                        <button
                          key={cat.id}
                          onClick={() => { setActiveCategory(cat.id); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 12px", background: "#fff", border: "1px solid #e0e2e7",
                            borderRadius: 8, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                          }}
                        >
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                          <code style={{ fontSize: 12, color: "#1e1e2e", fontWeight: 500 }}>aiblocks.{modName}</code>
                          <span style={{ fontSize: 11, color: "#9094a6", marginLeft: "auto" }}>{cat.blockCount}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explore */}
                <div style={{
                  padding: 20, background: "#F7931E08", border: "1.5px solid #F7931E30",
                  borderRadius: 12, display: "flex", alignItems: "center", gap: 16,
                }}>
                  <span style={{ fontSize: 14, color: "#5c5f73", lineHeight: 1.5 }}>
                    Browse the <strong>{data.totalBlocks} blocks</strong> across <strong>{data.categories.length} categories</strong> in the sidebar.
                    Each block shows its inputs, outputs, parameters, pip dependencies, and copyable Python code.
                  </span>
                </div>
              </div>
            )}

            {/* ── Block List ────────────────────────────────────────── */}
            {!isGuide && (
              <>
                {filteredBlocks.length === 0 && (
                  <p style={{ color: "#9094a6", fontSize: 14, textAlign: "center", marginTop: 40 }}>
                    No blocks match your search.
                  </p>
                )}
                {filteredBlocks.map((block) => {
                  const isExpanded = expandedBlock === block.id;
                  const cat = data.categories.find((c) => c.id === block.category);
                  const color = cat?.color || "#6B7280";
                  const snippet = buildSnippet(block);
                  const pipCmd = block.pip.length > 0 ? `pip install ${block.pip.join(" ")}` : "";

                  return (
                    <div
                      key={block.id}
                      style={{
                        marginBottom: 12,
                        border: `1.5px solid ${isExpanded ? color : "#e0e2e7"}`,
                        borderRadius: 12,
                        background: "#fff",
                        overflow: "hidden",
                        transition: "border-color 0.15s",
                      }}
                    >
                      {/* Block header */}
                      <button
                        onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 12,
                          padding: "14px 18px", background: "none", border: "none",
                          cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <div style={{ width: 6, height: 24, borderRadius: 3, background: color, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#1e1e2e" }}>{block.name}</div>
                          <div style={{ fontSize: 12, color: "#9094a6", marginTop: 2 }}>{block.description}</div>
                        </div>
                        <code style={{ fontSize: 11, color: "#F7931E", background: "#F7931E10", padding: "3px 8px", borderRadius: 4, fontFamily: "'SF Mono', 'Fira Code', monospace", whiteSpace: "nowrap" }}>
                          {block.apiCall}()
                        </code>
                        <svg
                          width="16" height="16" viewBox="0 0 16 16" fill="none"
                          stroke="#9094a6" strokeWidth="1.5" strokeLinecap="round"
                          style={{ transition: "transform 0.15s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
                        >
                          <polyline points="4 6 8 10 12 6" />
                        </svg>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div style={{ padding: "0 18px 18px", borderTop: "1px solid #f0f1f3" }}>

                          {/* API call */}
                          <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#1e1e2e", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                              API Usage
                            </div>
                            <div style={{ position: "relative" }}>
                              <pre style={{ ...codeBlockStyle, padding: "10px 14px", fontSize: 12 }}>
                                {block.apiExample}
                              </pre>
                              <button
                                onClick={() => copyText(block.apiExample, setCopied, `api-${block.id}`)}
                                style={copyBtnStyle}
                              >
                                {copied === `api-${block.id}` ? <CheckIcon /> : <CopyIcon />}
                                {copied === `api-${block.id}` ? "Copied" : "Copy"}
                              </button>
                            </div>
                          </div>

                          {/* Install command */}
                          {pipCmd && (
                            <div style={{ marginTop: 12 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#1e1e2e", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                Install
                              </div>
                              <div style={{ position: "relative" }}>
                                <pre style={{ ...codeBlockStyle, padding: "10px 14px", fontSize: 12 }}>
                                  {pipCmd}
                                </pre>
                                <button
                                  onClick={() => copyText(pipCmd, setCopied, `pip-${block.id}`)}
                                  style={copyBtnStyle}
                                >
                                  {copied === `pip-${block.id}` ? <CheckIcon /> : <CopyIcon />}
                                  {copied === `pip-${block.id}` ? "Copied" : "Copy"}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          {block.tags.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                              {block.tags.map((tag) => (
                                <span key={tag} style={{
                                  fontSize: 11, color: color, background: `${color}12`,
                                  padding: "2px 8px", borderRadius: 4, fontWeight: 500,
                                }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Inputs */}
                          {block.inputs.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#1e1e2e", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Inputs</div>
                              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                                <thead>
                                  <tr style={{ color: "#9094a6", textAlign: "left" }}>
                                    <th style={{ padding: "4px 8px", fontWeight: 500 }}>Port</th>
                                    <th style={{ padding: "4px 8px", fontWeight: 500 }}>Type</th>
                                    <th style={{ padding: "4px 8px", fontWeight: 500 }}>Required</th>
                                    <th style={{ padding: "4px 8px", fontWeight: 500 }}>Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {block.inputs.map((inp) => (
                                    <tr key={inp.id} style={{ borderTop: "1px solid #f0f1f3" }}>
                                      <td style={{ padding: "6px 8px", fontWeight: 500, color: "#1e1e2e" }}>{inp.name}</td>
                                      <td style={{ padding: "6px 8px" }}>
                                        <code style={{ fontSize: 11, color: "#5c5f73", background: "#f0f1f3", padding: "1px 5px", borderRadius: 3 }}>{inp.type}</code>
                                      </td>
                                      <td style={{ padding: "6px 8px", color: inp.required ? "#22C55E" : "#9094a6" }}>
                                        {inp.required ? "yes" : "no"}
                                      </td>
                                      <td style={{ padding: "6px 8px", color: "#5c5f73" }}>{inp.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Outputs */}
                          {block.outputs.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#1e1e2e", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Outputs</div>
                              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                                <thead>
                                  <tr style={{ color: "#9094a6", textAlign: "left" }}>
                                    <th style={{ padding: "4px 8px", fontWeight: 500 }}>Port</th>
                                    <th style={{ padding: "4px 8px", fontWeight: 500 }}>Type</th>
                                    <th style={{ padding: "4px 8px", fontWeight: 500 }}>Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {block.outputs.map((out) => (
                                    <tr key={out.id} style={{ borderTop: "1px solid #f0f1f3" }}>
                                      <td style={{ padding: "6px 8px", fontWeight: 500, color: "#1e1e2e" }}>{out.name}</td>
                                      <td style={{ padding: "6px 8px" }}>
                                        <code style={{ fontSize: 11, color: "#5c5f73", background: "#f0f1f3", padding: "1px 5px", borderRadius: 3 }}>{out.type}</code>
                                      </td>
                                      <td style={{ padding: "6px 8px", color: "#5c5f73" }}>{out.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Parameters */}
                          {block.parameters.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#1e1e2e", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Parameters</div>
                              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                                <thead>
                                  <tr style={{ color: "#9094a6", textAlign: "left" }}>
                                    <th style={{ padding: "4px 8px", fontWeight: 500 }}>Name</th>
                                    <th style={{ padding: "4px 8px", fontWeight: 500 }}>Type</th>
                                    <th style={{ padding: "4px 8px", fontWeight: 500 }}>Default</th>
                                    <th style={{ padding: "4px 8px", fontWeight: 500 }}>Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {block.parameters.map((p) => (
                                    <tr key={p.id} style={{ borderTop: "1px solid #f0f1f3" }}>
                                      <td style={{ padding: "6px 8px", fontWeight: 500, color: "#1e1e2e" }}>
                                        {p.name}
                                        {p.advanced && <span style={{ fontSize: 10, color: "#9094a6", marginLeft: 4 }}>(adv)</span>}
                                      </td>
                                      <td style={{ padding: "6px 8px" }}>
                                        <code style={{ fontSize: 11, color: "#5c5f73", background: "#f0f1f3", padding: "1px 5px", borderRadius: 3 }}>{p.type}</code>
                                        {p.options && (
                                          <span style={{ fontSize: 10, color: "#9094a6", marginLeft: 4 }}>
                                            [{p.options.map(String).join(", ")}]
                                          </span>
                                        )}
                                      </td>
                                      <td style={{ padding: "6px 8px" }}>
                                        <code style={{ fontSize: 11, color: color, background: `${color}10`, padding: "1px 5px", borderRadius: 3 }}>
                                          {p.default !== undefined && p.default !== null ? String(p.default) : "\u2014"}
                                        </code>
                                        {p.min !== undefined && (
                                          <span style={{ fontSize: 10, color: "#9094a6", marginLeft: 4 }}>
                                            [{p.min}..{p.max ?? "\u221E"}]
                                          </span>
                                        )}
                                      </td>
                                      <td style={{ padding: "6px 8px", color: "#5c5f73" }}>{p.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Code — copy-ready snippet */}
                          {(block.code.imports.length > 0 || block.code.body) && (
                            <div style={{ marginTop: 16 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#1e1e2e", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                Python Code
                              </div>
                              <div style={{ position: "relative" }}>
                                <pre style={codeBlockStyle}>{snippet}</pre>
                                <button
                                  onClick={() => copyText(snippet, setCopied, `code-${block.id}`)}
                                  style={copyBtnStyle}
                                >
                                  {copied === `code-${block.id}` ? <CheckIcon /> : <CopyIcon />}
                                  {copied === `code-${block.id}` ? "Copied" : "Copy Code"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .docs-sidebar-toggle {
            display: flex !important;
          }
          .docs-header-title {
            font-size: 14px !important;
          }
          .docs-divider {
            display: none !important;
          }
          .docs-sidebar {
            display: none !important;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 100;
            width: 260px !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.1);
          }
          .docs-sidebar.docs-sidebar-open {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
