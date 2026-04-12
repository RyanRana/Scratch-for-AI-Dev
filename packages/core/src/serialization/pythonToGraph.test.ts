import { describe, it, expect } from "vitest";
import { BlockRegistry, ALL_BLOCKS } from "@ai-blocks/block-schemas";
import { generatePython } from "../codegen/python.js";
import { graphFromPythonSource, splitPythonTopLevelStatements } from "./pythonToGraph.js";
import { classifyStatement } from "./pythonHeuristics.js";
import { validateGraph } from "../graph/graph.js";

const registry = new BlockRegistry(ALL_BLOCKS);

describe("splitPythonTopLevelStatements", () => {
  it("splits imports and assignments", () => {
    const src = "import os\nx = 1\n";
    expect(splitPythonTopLevelStatements(src)).toEqual(["import os", "x = 1"]);
  });

  it("keeps function bodies as one chunk", () => {
    const src = "def f():\n    return 1\n\ny = 2\n";
    const parts = splitPythonTopLevelStatements(src);
    expect(parts.length).toBe(2);
    expect(parts[0]).toContain("def f():");
    expect(parts[1].trim()).toBe("y = 2");
  });
});

describe("classifyStatement", () => {
  it("maps read_csv and RF fit", () => {
    const c1 = classifyStatement('df = pd.read_csv("data.csv")');
    expect(c1.kind).toBe("block");
    if (c1.kind === "block") {
      expect(c1.block.blockId).toBe("data-io.load-csv");
      expect(c1.block.params.file_path).toBe("data.csv");
    }
    const c2 = classifyStatement(
      "clf = RandomForestClassifier(n_estimators=50, max_depth=5).fit(X_train, y_train)"
    );
    expect(c2.kind).toBe("block");
    if (c2.kind === "block") {
      expect(c2.block.blockId).toBe("classical-ml.random-forest");
      expect(c2.block.inputWires).toEqual({ X_train: "X_train", y_train: "y_train" });
    }
  });
});

describe("graphFromPythonSource", () => {
  it("chains snippets and generates runnable code", () => {
    const src = "a = 1\nb = a + 1\n";
    const graph = graphFromPythonSource(src, registry, { name: "t" });
    expect(graph.name).toBe("t");
    const nodes = Object.values(graph.nodes);
    expect(nodes).toHaveLength(2);
    expect(nodes.every((n) => n.blockId === "utilities.python-snippet")).toBe(true);
    const code = generatePython(graph, registry);
    expect(code).toContain("a = 1");
    expect(code).toContain("b = a + 1");
    expect(validateGraph(graph, registry).filter((e) => e.type === "disconnected_required")).toHaveLength(0);
  });

  it("wires load CSV + model + predict when variable names match", () => {
    const src = [
      'df = pd.read_csv("data.csv")',
      'X_train, y_train = df[["a","b"]].values, df["label"].values',
      "clf = RandomForestClassifier().fit(X_train, y_train)",
      "y_pred = clf.predict(X_train)",
      "acc = accuracy_score(y_train, y_pred)",
    ].join("\n");
    const graph = graphFromPythonSource(src, registry);
    const nodes = Object.values(graph.nodes);
    expect(nodes.map((n) => n.blockId)).toEqual([
      "data-io.load-csv",
      "data-processing.dataframe-to-xy",
      "classical-ml.random-forest",
      "classical-ml.sklearn-predict",
      "evaluation.accuracy",
    ]);
    const edges = Object.values(graph.edges);
    expect(edges.length).toBeGreaterThanOrEqual(4);
    const code = generatePython(graph, registry);
    expect(code).toContain("read_csv");
    expect(code).toContain("RandomForest");
    expect(validateGraph(graph, registry).filter((e) => e.type === "disconnected_required")).toHaveLength(0);
  });
});
