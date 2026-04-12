import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "./pages/Editor.js";
import { Landing } from "./pages/Landing.js";
import { Docs } from "./pages/Docs.js";
import { initializeRegistry } from "./init-registry.js";
import { loadStarterPipeline, useEditorStore } from "./stores/editor-store.js";

// Load all block definitions into the registry
initializeRegistry();

// Pre-populate with a starter ML pipeline so users see something on load
loadStarterPipeline();

type Page = "landing" | "editor" | "docs";

function App() {
  const [page, setPage] = useState<Page>("landing");

  const navigate = (p: Page) => {
    console.log("[nav]", page, "→", p);
    setPage(p);
  };

  if (page === "docs") {
    return <Docs onBack={() => navigate("landing")} />;
  }

  if (page === "landing") {
    return (
      <Landing
        onEnter={() => navigate("editor")}
        onTemplate={(id, prompt) => {
          useEditorStore.getState().loadTemplate(id, prompt);
          navigate("editor");
        }}
        onDocs={() => navigate("docs")}
      />
    );
  }

  return <Editor onLogoClick={() => navigate("landing")} />;
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
