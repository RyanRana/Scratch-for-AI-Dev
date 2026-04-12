// ============================================================================
// Map Python statement text → block id + params + wiring hints (no comments)
// ============================================================================

import type { PortType } from "@ai-blocks/block-schemas";

export interface SymbolBinding {
  nodeId: string;
  portId: string;
  portType: PortType;
}

/** Parsed assignment: lhs name(s) and rhs expression */
export function parseAssignment(stmt: string): { names: string[]; rhs: string } | null {
  const t = stmt.trim();
  if (!t || t.startsWith("#")) return null;
  const m = /^\s*([^=#]+?)\s*=\s*([\s\S]+)$/s.exec(t);
  if (!m) return null;
  const lhs = m[1].trim();
  const rhs = m[2].trim();
  if (lhs.includes("==") || rhs.startsWith("=")) return null;
  if (lhs.includes(",")) {
    const names = lhs.split(",").map((s) => s.trim()).filter(Boolean);
    return names.length ? { names, rhs } : null;
  }
  return { names: [lhs], rhs };
}

function extractKwargNum(text: string, key: string): number | undefined {
  const re = new RegExp(`\\b${key}\\s*=\\s*([-+]?\\d*\\.?\\d+(?:[eE][-+]?\\d+)?)`);
  const m = re.exec(text);
  if (!m) return undefined;
  return Number(m[1]);
}

function extractSep(rhs: string): string | undefined {
  const m = /\bsep\s*=\s*['"]([^'"]*)['"]/.exec(rhs);
  return m?.[1];
}

function squash(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export interface ClassifiedBlock {
  blockId: string;
  params: Record<string, unknown>;
  outputNames: Partial<Record<string, string>>;
  inputWires: Partial<Record<string, string>>;
}

export type Classified = { kind: "block"; block: ClassifiedBlock } | { kind: "snippet" };

/**
 * Classify a single top-level statement into a known block or fall back to raw snippet.
 */
export function classifyStatement(stmt: string): Classified {
  const t = stmt.trim();
  if (!t || t.startsWith("#")) return { kind: "snippet" };

  const assign = parseAssignment(t);
  const rhs = assign?.rhs ?? t;
  const flat = squash(rhs);

  // ── Stratified train/test split ──────────────────────────────────────────
  if (/\btrain_test_split\s*\(/.test(rhs) && /\bstratify\s*=/.test(rhs)) {
    const dfM = /train_test_split\s*\(\s*(\w+)\s*,/.exec(flat);
    const tsM = /test_size\s*=\s*([\d.]+)/.exec(flat);
    const stM = /stratify\s*=\s*(\w+)\s*\[\s*["']([^"']+)["']\s*\]/.exec(flat);
    if (dfM && tsM && stM && stM[1] === dfM[1] && assign && assign.names.length >= 2) {
      return {
        kind: "block",
        block: {
          blockId: "data-processing.stratified-split",
          params: {
            test_size: parseFloat(tsM[1]),
            target_column: stM[2],
            random_state: extractKwargNum(flat, "random_state") ?? 42,
          },
          inputWires: { dataframe: dfM[1] },
          outputNames: { train: assign.names[0], test: assign.names[1] },
        },
      };
    }
  }

  // ── DataFrame → X, y (same df, bracket features + single target column) ──
  const xyPair = /^(\w+)\s*\[\s*\[(.*)\]\s*\]\s*\.\s*values\s*,\s*\1\s*\[\s*["']([^"']+)["']\s*\]\s*\.\s*values\s*$/.exec(flat);
  if (xyPair && assign && assign.names.length === 2) {
    const cols = xyPair[2]
      .split(",")
      .map((c) => c.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
    return {
      kind: "block",
      block: {
        blockId: "data-processing.dataframe-to-xy",
        params: {
          feature_columns: cols.join(", "),
          target_column: xyPair[3],
        },
        inputWires: { dataframe: xyPair[1] },
        outputNames: { X: assign.names[0], y: assign.names[1] },
      },
    };
  }

  // ── Load CSV ─────────────────────────────────────────────────────────────
  if (/(?:pandas\.)?read_csv\s*\(/.test(flat) && assign?.names[0]) {
    const csvPath = /(?:pandas\.)?read_csv\s*\(\s*["']([^"']+)["']/.exec(flat);
    if (csvPath) {
      return {
        kind: "block",
        block: {
          blockId: "data-io.load-csv",
          params: { file_path: csvPath[1], separator: extractSep(rhs) ?? "," },
          inputWires: {},
          outputNames: { dataframe: assign.names[0] },
        },
      };
    }
  }

  // ── Load JSON ───────────────────────────────────────────────────────────
  const jsonPath = /(?:pandas\.)?read_json\s*\(\s*["']([^"']+)["']/.exec(flat);
  if (jsonPath && assign?.names[0]) {
    return {
      kind: "block",
      block: {
        blockId: "data-io.load-json",
        params: { file_path: jsonPath[1] },
        inputWires: {},
        outputNames: { dataframe: assign.names[0] },
      },
    };
  }

  // ── Load Parquet ────────────────────────────────────────────────────────
  const pqPath = /(?:pandas\.)?read_parquet\s*\(\s*["']([^"']+)["']/.exec(flat);
  if (pqPath && assign?.names[0]) {
    return {
      kind: "block",
      block: {
        blockId: "data-io.load-parquet",
        params: { file_path: pqPath[1] },
        inputWires: {},
        outputNames: { dataframe: assign.names[0] },
      },
    };
  }

  // ── Drop nulls: x = y.dropna(...) ────────────────────────────────────────
  const dropna = /^(\w+)\s*=\s*(\w+)\.dropna\s*\(/.exec(flat);
  if (dropna && assign?.names[0] === dropna[1]) {
    return {
      kind: "block",
      block: {
        blockId: "data-processing.drop-nulls",
        params: { axis: "rows", how: "any", subset: "" },
        inputWires: { dataframe: dropna[2] },
        outputNames: { cleaned: assign.names[0] },
      },
    };
  }

  // ── Linear Regression ───────────────────────────────────────────────────
  const linFit =
    /LinearRegression\s*\([^)]*\)\s*\.\s*fit\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/.exec(flat);
  if (linFit && assign?.names[0]) {
    return {
      kind: "block",
      block: {
        blockId: "classical-ml.linear-regression",
        params: {
          fit_intercept: true,
          normalize: false,
        },
        inputWires: { X_train: linFit[1], y_train: linFit[2] },
        outputNames: { model: assign.names[0] },
      },
    };
  }

  // ── Random Forest ───────────────────────────────────────────────────────
  const rfFit =
    /RandomForest(Classifier|Regressor)\s*\([^)]*\)\s*\.\s*fit\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/.exec(flat);
  if (rfFit && assign?.names[0]) {
    const task = rfFit[1] === "Classifier" ? "classification" : "regression";
    return {
      kind: "block",
      block: {
        blockId: "classical-ml.random-forest",
        params: {
          task,
          n_estimators: extractKwargNum(flat, "n_estimators") ?? 100,
          max_depth: extractKwargNum(flat, "max_depth") ?? 10,
          min_samples_split: extractKwargNum(flat, "min_samples_split") ?? 2,
          random_state: extractKwargNum(flat, "random_state") ?? 42,
        },
        inputWires: { X_train: rfFit[2], y_train: rfFit[3] },
        outputNames: { model: assign.names[0] },
      },
    };
  }

  // ── Logistic Regression ─────────────────────────────────────────────────
  const lrFit =
    /LogisticRegression\s*\([^)]*\)\s*\.\s*fit\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/.exec(flat);
  if (lrFit && assign?.names[0]) {
    return {
      kind: "block",
      block: {
        blockId: "classical-ml.logistic-regression",
        params: {
          C: extractKwargNum(flat, "C") ?? 1.0,
          max_iter: extractKwargNum(flat, "max_iter") ?? 100,
        },
        inputWires: { X_train: lrFit[1], y_train: lrFit[2] },
        outputNames: { model: assign.names[0] },
      },
    };
  }

  // ── Gradient Boosting ───────────────────────────────────────────────────
  const gbFit =
    /GradientBoosting(Classifier|Regressor)\s*\([^)]*\)\s*\.\s*fit\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/.exec(flat);
  if (gbFit && assign?.names[0]) {
    const task = gbFit[1] === "Classifier" ? "classification" : "regression";
    return {
      kind: "block",
      block: {
        blockId: "classical-ml.gradient-boosting",
        params: {
          task,
          n_estimators: extractKwargNum(flat, "n_estimators") ?? 100,
          learning_rate: extractKwargNum(flat, "learning_rate") ?? 0.1,
          max_depth: extractKwargNum(flat, "max_depth") ?? 3,
          random_state: extractKwargNum(flat, "random_state") ?? 42,
        },
        inputWires: { X_train: gbFit[2], y_train: gbFit[3] },
        outputNames: { model: assign.names[0] },
      },
    };
  }

  // ── XGBoost ─────────────────────────────────────────────────────────────
  const xgbFit =
    /xgb\.(XGBClassifier|XGBRegressor)\s*\([^)]*\)\s*\.\s*fit\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/.exec(flat);
  if (xgbFit && assign?.names[0]) {
    const task = xgbFit[1] === "XGBClassifier" ? "classification" : "regression";
    return {
      kind: "block",
      block: {
        blockId: "classical-ml.xgboost",
        params: {
          task,
          n_estimators: extractKwargNum(flat, "n_estimators") ?? 100,
          learning_rate: extractKwargNum(flat, "learning_rate") ?? 0.1,
          max_depth: extractKwargNum(flat, "max_depth") ?? 6,
          random_state: extractKwargNum(flat, "random_state") ?? 42,
        },
        inputWires: { X_train: xgbFit[2], y_train: xgbFit[3] },
        outputNames: { model: assign.names[0] },
      },
    };
  }

  // ── sklearn predict (rhs is clf.predict(X)) ────────────────────────────
  const pred = /^(\w+)\s*\.\s*predict\s*\(\s*(\w+)\s*\)\s*$/.exec(flat);
  if (pred && assign?.names[0]) {
    return {
      kind: "block",
      block: {
        blockId: "classical-ml.sklearn-predict",
        params: {},
        inputWires: { model: pred[1], X: pred[2] },
        outputNames: { y_pred: assign.names[0] },
      },
    };
  }

  // ── Metrics ─────────────────────────────────────────────────────────────
  const acc = /accuracy_score\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/.exec(flat);
  if (acc && assign?.names[0]) {
    return {
      kind: "block",
      block: {
        blockId: "evaluation.accuracy",
        params: { normalize: true },
        inputWires: { y_true: acc[1], y_pred: acc[2] },
        outputNames: { score: assign.names[0] },
      },
    };
  }

  const prec = /precision_score\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/.exec(flat);
  if (prec && assign?.names[0]) {
    return {
      kind: "block",
      block: {
        blockId: "evaluation.precision",
        params: { average: "binary", zero_division: 0 },
        inputWires: { y_true: prec[1], y_pred: prec[2] },
        outputNames: { score: assign.names[0] },
      },
    };
  }

  const rec = /recall_score\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/.exec(flat);
  if (rec && assign?.names[0]) {
    return {
      kind: "block",
      block: {
        blockId: "evaluation.recall",
        params: { average: "binary", zero_division: 0 },
        inputWires: { y_true: rec[1], y_pred: rec[2] },
        outputNames: { score: assign.names[0] },
      },
    };
  }

  return { kind: "snippet" };
}
