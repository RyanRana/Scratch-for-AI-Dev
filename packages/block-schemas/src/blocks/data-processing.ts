import type { BlockDefinition } from "../types.js";

export const dataProcessingBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Filter Rows
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.filter-rows",
    name: "Filter Rows",
    category: "data-processing",
    description: "Filter DataFrame rows using a boolean expression or query string",
    tags: ["filter", "query", "where", "select", "rows", "condition", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "filtered", name: "Filtered DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "expression", name: "Query Expression", type: "string", default: "", placeholder: "age > 30 and salary >= 50000", description: "Pandas query expression for filtering rows" },
      { id: "drop_index", name: "Reset Index", type: "boolean", default: true, description: "Reset the index after filtering" },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `{{outputs.filtered}} = {{inputs.dataframe}}.query("{{params.expression}}")
if {{params.drop_index}}:
    {{outputs.filtered}} = {{outputs.filtered}}.reset_index(drop=True)`,
      outputBindings: { filtered: "df_filtered" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Select Columns
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.select-columns",
    name: "Select Columns",
    category: "data-processing",
    description: "Select a subset of columns from a DataFrame",
    tags: ["select", "columns", "subset", "project", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "selected", name: "Selected DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2, col3", description: "Comma-separated column names to keep" },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()]
{{outputs.selected}} = {{inputs.dataframe}}[_cols]`,
      outputBindings: { selected: "df_selected" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Rename Column
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.rename-column",
    name: "Rename Column",
    category: "data-processing",
    description: "Rename one or more DataFrame columns using a mapping",
    tags: ["rename", "column", "alias", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "renamed", name: "Renamed DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "mapping", name: "Rename Mapping (JSON)", type: "json", default: {}, placeholder: '{"old_name": "new_name"}', description: "JSON object mapping old column names to new names" },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "import json"],
      body: `_mapping = json.loads('''{{params.mapping}}''')
{{outputs.renamed}} = {{inputs.dataframe}}.rename(columns=_mapping)`,
      outputBindings: { renamed: "df_renamed" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Drop Nulls
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.drop-nulls",
    name: "Drop Nulls",
    category: "data-processing",
    description: "Remove rows or columns that contain null / NaN values",
    tags: ["null", "nan", "missing", "drop", "dropna", "clean", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "cleaned", name: "Cleaned DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "axis", name: "Axis", type: "select", default: "rows", options: [{ label: "Rows", value: "rows" }, { label: "Columns", value: "columns" }], description: "Drop rows or columns with nulls" },
      { id: "how", name: "How", type: "select", default: "any", options: [{ label: "Any null", value: "any" }, { label: "All null", value: "all" }] },
      { id: "subset", name: "Subset Columns", type: "string", default: "", placeholder: "col1, col2", description: "Only consider these columns (comma-separated, empty = all)", advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `_axis = 0 if "{{params.axis}}" == "rows" else 1
_subset = [c.strip() for c in "{{params.subset}}".split(",") if c.strip()] or None
{{outputs.cleaned}} = {{inputs.dataframe}}.dropna(axis=_axis, how="{{params.how}}", subset=_subset).reset_index(drop=True)`,
      outputBindings: { cleaned: "df_cleaned" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Fill Nulls
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.fill-nulls",
    name: "Fill Nulls",
    category: "data-processing",
    description: "Replace null / NaN values using a chosen strategy (constant, mean, median, ffill, bfill)",
    tags: ["null", "nan", "fillna", "impute", "missing", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "filled", name: "Filled DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "strategy", name: "Strategy", type: "select", default: "mean", options: [{ label: "Constant", value: "constant" }, { label: "Mean", value: "mean" }, { label: "Median", value: "median" }, { label: "Mode", value: "mode" }, { label: "Forward fill", value: "ffill" }, { label: "Backward fill", value: "bfill" }] },
      { id: "fill_value", name: "Fill Value", type: "string", default: "0", description: "Value used when strategy is 'constant'" },
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Columns to fill (empty = all)", advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "import numpy as np"],
      body: `_strategy = "{{params.strategy}}"
_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.columns.tolist()
{{outputs.filled}} = {{inputs.dataframe}}.copy()
for _col in _cols:
    if _strategy == "constant":
        {{outputs.filled}}[_col] = {{outputs.filled}}[_col].fillna({{params.fill_value}})
    elif _strategy == "mean":
        {{outputs.filled}}[_col] = {{outputs.filled}}[_col].fillna({{outputs.filled}}[_col].mean())
    elif _strategy == "median":
        {{outputs.filled}}[_col] = {{outputs.filled}}[_col].fillna({{outputs.filled}}[_col].median())
    elif _strategy == "mode":
        {{outputs.filled}}[_col] = {{outputs.filled}}[_col].fillna({{outputs.filled}}[_col].mode().iloc[0])
    elif _strategy == "ffill":
        {{outputs.filled}}[_col] = {{outputs.filled}}[_col].ffill()
    elif _strategy == "bfill":
        {{outputs.filled}}[_col] = {{outputs.filled}}[_col].bfill()`,
      outputBindings: { filled: "df_filled" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Deduplicate
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.deduplicate",
    name: "Deduplicate",
    category: "data-processing",
    description: "Remove duplicate rows from a DataFrame",
    tags: ["deduplicate", "duplicates", "unique", "distinct", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "deduped", name: "Deduplicated DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "subset", name: "Subset Columns", type: "string", default: "", placeholder: "col1, col2", description: "Columns to consider for identifying duplicates (empty = all)" },
      { id: "keep", name: "Keep", type: "select", default: "first", options: [{ label: "First", value: "first" }, { label: "Last", value: "last" }, { label: "None (drop all)", value: "False" }] },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `_subset = [c.strip() for c in "{{params.subset}}".split(",") if c.strip()] or None
_keep = False if "{{params.keep}}" == "False" else "{{params.keep}}"
{{outputs.deduped}} = {{inputs.dataframe}}.drop_duplicates(subset=_subset, keep=_keep).reset_index(drop=True)`,
      outputBindings: { deduped: "df_deduped" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Sort
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.sort",
    name: "Sort",
    category: "data-processing",
    description: "Sort a DataFrame by one or more columns",
    tags: ["sort", "order", "ascending", "descending", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "sorted", name: "Sorted DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "by", name: "Sort By", type: "string", default: "", placeholder: "col1, col2", description: "Comma-separated column names to sort by" },
      { id: "ascending", name: "Ascending", type: "boolean", default: true },
      { id: "na_position", name: "NaN Position", type: "select", default: "last", options: [{ label: "Last", value: "last" }, { label: "First", value: "first" }], advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `_by = [c.strip() for c in "{{params.by}}".split(",") if c.strip()]
{{outputs.sorted}} = {{inputs.dataframe}}.sort_values(by=_by, ascending={{params.ascending}}, na_position="{{params.na_position}}").reset_index(drop=True)`,
      outputBindings: { sorted: "df_sorted" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Group By
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.group-by",
    name: "Group By",
    category: "data-processing",
    description: "Group a DataFrame by one or more columns and apply an aggregation function",
    tags: ["group", "groupby", "aggregate", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "grouped", name: "Grouped DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "by", name: "Group By Columns", type: "string", default: "", placeholder: "col1, col2" },
      { id: "agg_func", name: "Aggregation", type: "select", default: "mean", options: [{ label: "Mean", value: "mean" }, { label: "Sum", value: "sum" }, { label: "Count", value: "count" }, { label: "Min", value: "min" }, { label: "Max", value: "max" }, { label: "Median", value: "median" }, { label: "Std", value: "std" }, { label: "First", value: "first" }, { label: "Last", value: "last" }] },
      { id: "as_index", name: "Group as Index", type: "boolean", default: false, advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `_by = [c.strip() for c in "{{params.by}}".split(",") if c.strip()]
{{outputs.grouped}} = {{inputs.dataframe}}.groupby(_by, as_index={{params.as_index}}).agg("{{params.agg_func}}").reset_index()`,
      outputBindings: { grouped: "df_grouped" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Aggregate
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.aggregate",
    name: "Aggregate",
    category: "data-processing",
    description: "Apply multiple aggregation functions to different columns using a JSON spec",
    tags: ["aggregate", "agg", "summary", "statistics", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "aggregated", name: "Aggregated DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "agg_spec", name: "Aggregation Spec (JSON)", type: "json", default: {}, placeholder: '{"price": ["mean", "max"], "quantity": "sum"}', description: "JSON mapping of column names to aggregation function(s)" },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "import json"],
      body: `_spec = json.loads('''{{params.agg_spec}}''')
{{outputs.aggregated}} = {{inputs.dataframe}}.agg(_spec)
if isinstance({{outputs.aggregated}}, pd.Series):
    {{outputs.aggregated}} = {{outputs.aggregated}}.to_frame().T
{{outputs.aggregated}} = {{outputs.aggregated}}.reset_index()`,
      outputBindings: { aggregated: "df_agg" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Join / Merge
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.join-merge",
    name: "Join/Merge",
    category: "data-processing",
    description: "Join two DataFrames on one or more key columns (SQL-style merge)",
    tags: ["join", "merge", "concat", "left", "inner", "outer", "pandas"],
    inputs: [
      { id: "left", name: "Left DataFrame", type: "dataframe", required: true },
      { id: "right", name: "Right DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "merged", name: "Merged DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "on", name: "Join Key(s)", type: "string", default: "", placeholder: "key_col", description: "Comma-separated column names to join on" },
      { id: "how", name: "Join Type", type: "select", default: "inner", options: [{ label: "Inner", value: "inner" }, { label: "Left", value: "left" }, { label: "Right", value: "right" }, { label: "Outer", value: "outer" }, { label: "Cross", value: "cross" }] },
      { id: "suffixes_left", name: "Left Suffix", type: "string", default: "_x", advanced: true },
      { id: "suffixes_right", name: "Right Suffix", type: "string", default: "_y", advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `_on = [c.strip() for c in "{{params.on}}".split(",") if c.strip()] or None
{{outputs.merged}} = pd.merge({{inputs.left}}, {{inputs.right}}, on=_on, how="{{params.how}}", suffixes=("{{params.suffixes_left}}", "{{params.suffixes_right}}"))`,
      outputBindings: { merged: "df_merged" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Pivot
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.pivot",
    name: "Pivot",
    category: "data-processing",
    description: "Reshape a DataFrame from long to wide format using pivot or pivot_table",
    tags: ["pivot", "reshape", "wide", "crosstab", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "pivoted", name: "Pivoted DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "index", name: "Index Column", type: "string", default: "", placeholder: "row_key" },
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col_key", description: "Column whose unique values become new columns" },
      { id: "values", name: "Values", type: "string", default: "", placeholder: "value_col" },
      { id: "agg_func", name: "Aggregation", type: "select", default: "mean", options: [{ label: "Mean", value: "mean" }, { label: "Sum", value: "sum" }, { label: "Count", value: "count" }, { label: "Min", value: "min" }, { label: "Max", value: "max" }, { label: "First", value: "first" }], description: "Aggregation when duplicates exist" },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `{{outputs.pivoted}} = {{inputs.dataframe}}.pivot_table(
    index="{{params.index}}",
    columns="{{params.columns}}",
    values="{{params.values}}",
    aggfunc="{{params.agg_func}}"
).reset_index()
{{outputs.pivoted}}.columns = [str(c) for c in {{outputs.pivoted}}.columns]`,
      outputBindings: { pivoted: "df_pivoted" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Melt / Unpivot
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.melt-unpivot",
    name: "Melt/Unpivot",
    category: "data-processing",
    description: "Reshape a DataFrame from wide to long format (unpivot)",
    tags: ["melt", "unpivot", "reshape", "long", "tidy", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "melted", name: "Melted DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "id_vars", name: "ID Columns", type: "string", default: "", placeholder: "id_col1, id_col2", description: "Columns to keep as identifiers" },
      { id: "value_vars", name: "Value Columns", type: "string", default: "", placeholder: "val_col1, val_col2", description: "Columns to unpivot (empty = all non-id columns)" },
      { id: "var_name", name: "Variable Name", type: "string", default: "variable" },
      { id: "value_name", name: "Value Name", type: "string", default: "value" },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `_id_vars = [c.strip() for c in "{{params.id_vars}}".split(",") if c.strip()] or None
_value_vars = [c.strip() for c in "{{params.value_vars}}".split(",") if c.strip()] or None
{{outputs.melted}} = {{inputs.dataframe}}.melt(id_vars=_id_vars, value_vars=_value_vars, var_name="{{params.var_name}}", value_name="{{params.value_name}}")`,
      outputBindings: { melted: "df_melted" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. Sample
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.sample",
    name: "Sample",
    category: "data-processing",
    description: "Randomly sample rows from a DataFrame by count or fraction",
    tags: ["sample", "random", "subset", "downsample", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "sampled", name: "Sampled DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "mode", name: "Mode", type: "select", default: "n", options: [{ label: "Number of rows", value: "n" }, { label: "Fraction", value: "frac" }] },
      { id: "n", name: "Number of Rows", type: "number", default: 100, min: 1 },
      { id: "frac", name: "Fraction", type: "number", default: 0.1, min: 0.0, max: 1.0, step: 0.01 },
      { id: "random_state", name: "Random Seed", type: "number", default: 42, advanced: true },
      { id: "replace", name: "With Replacement", type: "boolean", default: false, advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `if "{{params.mode}}" == "n":
    {{outputs.sampled}} = {{inputs.dataframe}}.sample(n={{params.n}}, random_state={{params.random_state}}, replace={{params.replace}}).reset_index(drop=True)
else:
    {{outputs.sampled}} = {{inputs.dataframe}}.sample(frac={{params.frac}}, random_state={{params.random_state}}, replace={{params.replace}}).reset_index(drop=True)`,
      outputBindings: { sampled: "df_sampled" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Train / Val / Test Split
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.train-val-test-split",
    name: "Train/Val/Test Split",
    category: "data-processing",
    description: "Split a DataFrame into train, validation, and test sets",
    tags: ["split", "train", "validation", "test", "sklearn", "holdout"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "train", name: "Train Set", type: "dataframe", required: true },
      { id: "val", name: "Validation Set", type: "dataframe", required: true },
      { id: "test", name: "Test Set", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "train_ratio", name: "Train Ratio", type: "number", default: 0.7, min: 0.0, max: 1.0, step: 0.05 },
      { id: "val_ratio", name: "Validation Ratio", type: "number", default: 0.15, min: 0.0, max: 1.0, step: 0.05 },
      { id: "test_ratio", name: "Test Ratio", type: "number", default: 0.15, min: 0.0, max: 1.0, step: 0.05 },
      { id: "random_state", name: "Random Seed", type: "number", default: 42 },
      { id: "shuffle", name: "Shuffle", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "from sklearn.model_selection import train_test_split"],
      body: `_train_ratio = {{params.train_ratio}}
_val_ratio = {{params.val_ratio}}
_test_ratio = {{params.test_ratio}}
{{outputs.train}}, _temp = train_test_split({{inputs.dataframe}}, test_size=1 - _train_ratio, random_state={{params.random_state}}, shuffle={{params.shuffle}})
_relative_val = _val_ratio / (_val_ratio + _test_ratio)
{{outputs.val}}, {{outputs.test}} = train_test_split(_temp, test_size=1 - _relative_val, random_state={{params.random_state}}, shuffle={{params.shuffle}})
{{outputs.train}} = {{outputs.train}}.reset_index(drop=True)
{{outputs.val}} = {{outputs.val}}.reset_index(drop=True)
{{outputs.test}} = {{outputs.test}}.reset_index(drop=True)`,
      outputBindings: { train: "df_train", val: "df_val", test: "df_test" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. K-Fold Split
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.k-fold-split",
    name: "K-Fold Split",
    category: "data-processing",
    description: "Generate K-Fold cross-validation train/test index splits",
    tags: ["kfold", "cross-validation", "cv", "split", "sklearn"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "folds", name: "Fold Indices", type: "list", required: true, description: "List of (train_idx, test_idx) tuples" },
    ],
    parameters: [
      { id: "n_splits", name: "Number of Folds", type: "number", default: 5, min: 2, max: 50 },
      { id: "shuffle", name: "Shuffle", type: "boolean", default: true },
      { id: "random_state", name: "Random Seed", type: "number", default: 42 },
    ],
    codeTemplate: {
      imports: ["from sklearn.model_selection import KFold"],
      body: `_kf = KFold(n_splits={{params.n_splits}}, shuffle={{params.shuffle}}, random_state={{params.random_state}} if {{params.shuffle}} else None)
{{outputs.folds}} = list(_kf.split({{inputs.dataframe}}))`,
      outputBindings: { folds: "folds" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. Stratified Split
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.stratified-split",
    name: "Stratified Split",
    category: "data-processing",
    description: "Split data while preserving the class distribution of a target column",
    tags: ["stratified", "split", "balanced", "classification", "sklearn"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "train", name: "Train Set", type: "dataframe", required: true },
      { id: "test", name: "Test Set", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "target_column", name: "Target Column", type: "string", default: "", placeholder: "label" },
      { id: "test_size", name: "Test Size", type: "number", default: 0.2, min: 0.0, max: 1.0, step: 0.05 },
      { id: "random_state", name: "Random Seed", type: "number", default: 42 },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "from sklearn.model_selection import train_test_split"],
      body: `{{outputs.train}}, {{outputs.test}} = train_test_split(
    {{inputs.dataframe}},
    test_size={{params.test_size}},
    stratify={{inputs.dataframe}}["{{params.target_column}}"],
    random_state={{params.random_state}}
)
{{outputs.train}} = {{outputs.train}}.reset_index(drop=True)
{{outputs.test}} = {{outputs.test}}.reset_index(drop=True)`,
      outputBindings: { train: "df_train", test: "df_test" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. Shuffle
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.shuffle",
    name: "Shuffle",
    category: "data-processing",
    description: "Randomly shuffle the rows of a DataFrame",
    tags: ["shuffle", "random", "permutation", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "shuffled", name: "Shuffled DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "random_state", name: "Random Seed", type: "number", default: 42 },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `{{outputs.shuffled}} = {{inputs.dataframe}}.sample(frac=1.0, random_state={{params.random_state}}).reset_index(drop=True)`,
      outputBindings: { shuffled: "df_shuffled" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. Batch
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.batch",
    name: "Batch",
    category: "data-processing",
    description: "Split a DataFrame into fixed-size batches (chunks)",
    tags: ["batch", "chunk", "split", "mini-batch", "iterate"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "batches", name: "Batches", type: "list", required: true, description: "List of DataFrame chunks" },
    ],
    parameters: [
      { id: "batch_size", name: "Batch Size", type: "number", default: 32, min: 1 },
      { id: "drop_last", name: "Drop Last Incomplete", type: "boolean", default: false, description: "Drop the last batch if it is smaller than batch_size" },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "import math"],
      body: `_n = len({{inputs.dataframe}})
_bs = {{params.batch_size}}
{{outputs.batches}} = [{{inputs.dataframe}}.iloc[i:i+_bs].reset_index(drop=True) for i in range(0, _n, _bs)]
if {{params.drop_last}} and len({{outputs.batches}}) > 0 and len({{outputs.batches}}[-1]) < _bs:
    {{outputs.batches}} = {{outputs.batches}}[:-1]`,
      outputBindings: { batches: "batches" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. Window Slide
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.window-slide",
    name: "Window Slide",
    category: "data-processing",
    description: "Create sliding window views over a DataFrame or array for time-series / sequence tasks",
    tags: ["window", "sliding", "rolling", "timeseries", "sequence"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "windows", name: "Windows", type: "list", required: true, description: "List of windowed DataFrames" },
    ],
    parameters: [
      { id: "window_size", name: "Window Size", type: "number", default: 10, min: 1 },
      { id: "stride", name: "Stride", type: "number", default: 1, min: 1 },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `_ws = {{params.window_size}}
_stride = {{params.stride}}
_n = len({{inputs.dataframe}})
{{outputs.windows}} = [{{inputs.dataframe}}.iloc[i:i+_ws].reset_index(drop=True) for i in range(0, _n - _ws + 1, _stride)]`,
      outputBindings: { windows: "windows" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. Normalize
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.normalize",
    name: "Normalize",
    category: "data-processing",
    description: "Normalize rows to unit norm (L1 or L2) using sklearn Normalizer",
    tags: ["normalize", "unit", "l2", "l1", "sklearn", "preprocessing"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "normalized", name: "Normalized DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "norm", name: "Norm", type: "select", default: "l2", options: [{ label: "L1", value: "l1" }, { label: "L2", value: "l2" }, { label: "Max", value: "max" }] },
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Numeric columns to normalize (empty = all numeric)" },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "from sklearn.preprocessing import Normalizer"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()
_normalizer = Normalizer(norm="{{params.norm}}")
{{outputs.normalized}} = {{inputs.dataframe}}.copy()
{{outputs.normalized}}[_cols] = _normalizer.fit_transform({{outputs.normalized}}[_cols])`,
      outputBindings: { normalized: "df_normalized" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. Standardize
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.standardize",
    name: "Standardize",
    category: "data-processing",
    description: "Standardize features by removing the mean and scaling to unit variance (z-score)",
    tags: ["standardize", "zscore", "standard-scaler", "sklearn", "preprocessing"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "standardized", name: "Standardized DataFrame", type: "dataframe", required: true },
      { id: "scaler", name: "Fitted Scaler", type: "any", required: true },
    ],
    parameters: [
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Numeric columns to standardize (empty = all numeric)" },
      { id: "with_mean", name: "Center (subtract mean)", type: "boolean", default: true },
      { id: "with_std", name: "Scale (divide by std)", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "from sklearn.preprocessing import StandardScaler"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()
{{outputs.scaler}} = StandardScaler(with_mean={{params.with_mean}}, with_std={{params.with_std}})
{{outputs.standardized}} = {{inputs.dataframe}}.copy()
{{outputs.standardized}}[_cols] = {{outputs.scaler}}.fit_transform({{outputs.standardized}}[_cols])`,
      outputBindings: { standardized: "df_standardized", scaler: "scaler" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. Min-Max Scale
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.min-max-scale",
    name: "Min-Max Scale",
    category: "data-processing",
    description: "Scale features to a given range (default 0-1) using MinMaxScaler",
    tags: ["minmax", "scale", "range", "sklearn", "preprocessing"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "scaled", name: "Scaled DataFrame", type: "dataframe", required: true },
      { id: "scaler", name: "Fitted Scaler", type: "any", required: true },
    ],
    parameters: [
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Numeric columns to scale (empty = all numeric)" },
      { id: "feature_min", name: "Range Min", type: "number", default: 0, step: 0.1 },
      { id: "feature_max", name: "Range Max", type: "number", default: 1, step: 0.1 },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "from sklearn.preprocessing import MinMaxScaler"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()
{{outputs.scaler}} = MinMaxScaler(feature_range=({{params.feature_min}}, {{params.feature_max}}))
{{outputs.scaled}} = {{inputs.dataframe}}.copy()
{{outputs.scaled}}[_cols] = {{outputs.scaler}}.fit_transform({{outputs.scaled}}[_cols])`,
      outputBindings: { scaled: "df_scaled", scaler: "scaler" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 23. Clip Values
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.clip-values",
    name: "Clip Values",
    category: "data-processing",
    description: "Clip (limit) values in a DataFrame to a specified min and max range",
    tags: ["clip", "clamp", "limit", "threshold", "outlier", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "clipped", name: "Clipped DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "lower", name: "Lower Bound", type: "number", default: 0 },
      { id: "upper", name: "Upper Bound", type: "number", default: 1 },
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Columns to clip (empty = all numeric)", advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()
{{outputs.clipped}} = {{inputs.dataframe}}.copy()
{{outputs.clipped}}[_cols] = {{outputs.clipped}}[_cols].clip(lower={{params.lower}}, upper={{params.upper}})`,
      outputBindings: { clipped: "df_clipped" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 24. Cast Type
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.cast-type",
    name: "Cast Type",
    category: "data-processing",
    description: "Cast one or more DataFrame columns to a specified data type",
    tags: ["cast", "astype", "convert", "dtype", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "casted", name: "Casted DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Comma-separated columns to cast" },
      { id: "dtype", name: "Target Type", type: "select", default: "float64", options: [{ label: "float64", value: "float64" }, { label: "float32", value: "float32" }, { label: "int64", value: "int64" }, { label: "int32", value: "int32" }, { label: "str", value: "str" }, { label: "bool", value: "bool" }, { label: "category", value: "category" }, { label: "datetime64", value: "datetime64[ns]" }] },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()]
{{outputs.casted}} = {{inputs.dataframe}}.copy()
for _col in _cols:
    {{outputs.casted}}[_col] = {{outputs.casted}}[_col].astype("{{params.dtype}}")`,
      outputBindings: { casted: "df_casted" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 25. One-Hot Encode
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.one-hot-encode",
    name: "One-Hot Encode",
    category: "data-processing",
    description: "One-hot encode categorical columns into binary indicator columns",
    tags: ["one-hot", "encode", "dummy", "categorical", "sklearn", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "encoded", name: "Encoded DataFrame", type: "dataframe", required: true },
      { id: "encoder", name: "Fitted Encoder", type: "any", required: true },
    ],
    parameters: [
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "cat_col1, cat_col2", description: "Categorical columns to encode (empty = all object/category)" },
      { id: "drop_first", name: "Drop First", type: "boolean", default: false, description: "Drop the first category to avoid multicollinearity" },
      { id: "sparse_output", name: "Sparse Output", type: "boolean", default: false, advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "from sklearn.preprocessing import OneHotEncoder"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include=["object", "category"]).columns.tolist()
{{outputs.encoder}} = OneHotEncoder(drop="first" if {{params.drop_first}} else None, sparse_output={{params.sparse_output}}, handle_unknown="ignore")
_encoded_arr = {{outputs.encoder}}.fit_transform({{inputs.dataframe}}[_cols])
if {{params.sparse_output}}:
    _encoded_arr = _encoded_arr.toarray()
_encoded_cols = {{outputs.encoder}}.get_feature_names_out(_cols)
_df_enc = pd.DataFrame(_encoded_arr, columns=_encoded_cols, index={{inputs.dataframe}}.index)
{{outputs.encoded}} = pd.concat([{{inputs.dataframe}}.drop(columns=_cols), _df_enc], axis=1)`,
      outputBindings: { encoded: "df_encoded", encoder: "ohe_encoder" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 26. Label Encode
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.label-encode",
    name: "Label Encode",
    category: "data-processing",
    description: "Encode categorical labels as integer indices using LabelEncoder",
    tags: ["label", "encode", "integer", "categorical", "sklearn"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "encoded", name: "Encoded DataFrame", type: "dataframe", required: true },
      { id: "encoders", name: "Fitted Encoders", type: "dict", required: true, description: "Dict mapping column name to fitted LabelEncoder" },
    ],
    parameters: [
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "cat_col1, cat_col2", description: "Columns to label encode (empty = all object/category)" },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "from sklearn.preprocessing import LabelEncoder"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include=["object", "category"]).columns.tolist()
{{outputs.encoded}} = {{inputs.dataframe}}.copy()
{{outputs.encoders}} = {}
for _col in _cols:
    _le = LabelEncoder()
    {{outputs.encoded}}[_col] = _le.fit_transform({{outputs.encoded}}[_col].astype(str))
    {{outputs.encoders}}[_col] = _le`,
      outputBindings: { encoded: "df_label_encoded", encoders: "label_encoders" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 27. Ordinal Encode
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.ordinal-encode",
    name: "Ordinal Encode",
    category: "data-processing",
    description: "Encode categorical features as ordinal integers with a specified order",
    tags: ["ordinal", "encode", "order", "categorical", "sklearn"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "encoded", name: "Encoded DataFrame", type: "dataframe", required: true },
      { id: "encoder", name: "Fitted Encoder", type: "any", required: true },
    ],
    parameters: [
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "cat_col1, cat_col2", description: "Columns to ordinal encode (empty = all object/category)" },
      { id: "handle_unknown", name: "Handle Unknown", type: "select", default: "use_encoded_value", options: [{ label: "Use encoded value", value: "use_encoded_value" }, { label: "Error", value: "error" }], advanced: true },
      { id: "unknown_value", name: "Unknown Value", type: "number", default: -1, description: "Value to assign to unknown categories", advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "from sklearn.preprocessing import OrdinalEncoder"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include=["object", "category"]).columns.tolist()
{{outputs.encoder}} = OrdinalEncoder(handle_unknown="{{params.handle_unknown}}", unknown_value={{params.unknown_value}})
{{outputs.encoded}} = {{inputs.dataframe}}.copy()
{{outputs.encoded}}[_cols] = {{outputs.encoder}}.fit_transform({{outputs.encoded}}[_cols])`,
      outputBindings: { encoded: "df_ordinal_encoded", encoder: "ordinal_encoder" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 28. Target Encode
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.target-encode",
    name: "Target Encode",
    category: "data-processing",
    description: "Encode categorical features using the mean of the target variable (target encoding)",
    tags: ["target", "encode", "mean", "categorical", "sklearn"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
      { id: "target", name: "Target Series", type: "series", required: true },
    ],
    outputs: [
      { id: "encoded", name: "Encoded DataFrame", type: "dataframe", required: true },
      { id: "encoder", name: "Fitted Encoder", type: "any", required: true },
    ],
    parameters: [
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "cat_col1, cat_col2", description: "Columns to target encode (empty = all object/category)" },
      { id: "smooth", name: "Smoothing", type: "select", default: "auto", options: [{ label: "Auto", value: "auto" }, { label: "None", value: "none" }], description: "Smoothing strategy to reduce overfitting" },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "from sklearn.preprocessing import TargetEncoder"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include=["object", "category"]).columns.tolist()
_smooth = "auto" if "{{params.smooth}}" == "auto" else None
{{outputs.encoder}} = TargetEncoder(smooth=_smooth)
{{outputs.encoded}} = {{inputs.dataframe}}.copy()
{{outputs.encoded}}[_cols] = {{outputs.encoder}}.fit_transform({{outputs.encoded}}[_cols], {{inputs.target}})`,
      outputBindings: { encoded: "df_target_encoded", encoder: "target_encoder" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 29. Bin / Discretize
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.bin-discretize",
    name: "Bin/Discretize",
    category: "data-processing",
    description: "Bin continuous values into discrete intervals (equal-width, quantile, or custom edges)",
    tags: ["bin", "discretize", "bucket", "cut", "quantile", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "binned", name: "Binned DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "column", name: "Column", type: "string", default: "", placeholder: "numeric_col" },
      { id: "strategy", name: "Strategy", type: "select", default: "uniform", options: [{ label: "Equal Width (uniform)", value: "uniform" }, { label: "Quantile", value: "quantile" }, { label: "Custom Edges", value: "custom" }] },
      { id: "n_bins", name: "Number of Bins", type: "number", default: 5, min: 2 },
      { id: "custom_edges", name: "Custom Bin Edges", type: "string", default: "", placeholder: "0, 10, 20, 50, 100", description: "Comma-separated bin edges (only for custom strategy)", advanced: true },
      { id: "labels", name: "Labels", type: "string", default: "", placeholder: "low, mid, high", description: "Comma-separated labels (empty = default intervals)", advanced: true },
      { id: "output_column", name: "Output Column", type: "string", default: "", placeholder: "col_binned", description: "Name for the binned column (default: column + '_bin')" },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "import numpy as np"],
      body: `_col = "{{params.column}}"
_out_col = "{{params.output_column}}" or f"{_col}_bin"
_labels = [l.strip() for l in "{{params.labels}}".split(",") if l.strip()] or False
{{outputs.binned}} = {{inputs.dataframe}}.copy()
if "{{params.strategy}}" == "uniform":
    {{outputs.binned}}[_out_col] = pd.cut({{outputs.binned}}[_col], bins={{params.n_bins}}, labels=_labels if _labels else None)
elif "{{params.strategy}}" == "quantile":
    {{outputs.binned}}[_out_col] = pd.qcut({{outputs.binned}}[_col], q={{params.n_bins}}, labels=_labels if _labels else None, duplicates="drop")
else:
    _edges = [float(e.strip()) for e in "{{params.custom_edges}}".split(",") if e.strip()]
    {{outputs.binned}}[_out_col] = pd.cut({{outputs.binned}}[_col], bins=_edges, labels=_labels if _labels else None)`,
      outputBindings: { binned: "df_binned" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 30. PCA
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.pca",
    name: "PCA",
    category: "data-processing",
    description: "Reduce dimensionality using Principal Component Analysis",
    tags: ["pca", "dimensionality", "reduction", "components", "sklearn", "decomposition"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "transformed", name: "Transformed DataFrame", type: "dataframe", required: true },
      { id: "model", name: "Fitted PCA", type: "any", required: true },
    ],
    parameters: [
      { id: "n_components", name: "Number of Components", type: "number", default: 2, min: 1 },
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2, col3", description: "Numeric columns (empty = all numeric)" },
      { id: "whiten", name: "Whiten", type: "boolean", default: false, advanced: true },
      { id: "random_state", name: "Random Seed", type: "number", default: 42, advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "import numpy as np", "from sklearn.decomposition import PCA"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()
{{outputs.model}} = PCA(n_components={{params.n_components}}, whiten={{params.whiten}}, random_state={{params.random_state}})
_components = {{outputs.model}}.fit_transform({{inputs.dataframe}}[_cols])
_comp_names = [f"PC{i+1}" for i in range({{params.n_components}})]
{{outputs.transformed}} = pd.DataFrame(_components, columns=_comp_names, index={{inputs.dataframe}}.index)`,
      outputBindings: { transformed: "df_pca", model: "pca_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 31. UMAP
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.umap",
    name: "UMAP",
    category: "data-processing",
    description: "Reduce dimensionality using Uniform Manifold Approximation and Projection",
    tags: ["umap", "dimensionality", "reduction", "manifold", "embedding", "visualization"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "transformed", name: "Transformed DataFrame", type: "dataframe", required: true },
      { id: "model", name: "Fitted UMAP", type: "any", required: true },
    ],
    parameters: [
      { id: "n_components", name: "Number of Components", type: "number", default: 2, min: 1 },
      { id: "n_neighbors", name: "Number of Neighbors", type: "number", default: 15, min: 2, max: 200 },
      { id: "min_dist", name: "Min Distance", type: "number", default: 0.1, min: 0.0, max: 1.0, step: 0.01 },
      { id: "metric", name: "Metric", type: "select", default: "euclidean", options: [{ label: "Euclidean", value: "euclidean" }, { label: "Cosine", value: "cosine" }, { label: "Manhattan", value: "manhattan" }, { label: "Correlation", value: "correlation" }] },
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Numeric columns (empty = all numeric)", advanced: true },
      { id: "random_state", name: "Random Seed", type: "number", default: 42, advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "import numpy as np", "import umap"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()
{{outputs.model}} = umap.UMAP(
    n_components={{params.n_components}},
    n_neighbors={{params.n_neighbors}},
    min_dist={{params.min_dist}},
    metric="{{params.metric}}",
    random_state={{params.random_state}}
)
_embedding = {{outputs.model}}.fit_transform({{inputs.dataframe}}[_cols].values)
_comp_names = [f"UMAP{i+1}" for i in range({{params.n_components}})]
{{outputs.transformed}} = pd.DataFrame(_embedding, columns=_comp_names, index={{inputs.dataframe}}.index)`,
      outputBindings: { transformed: "df_umap", model: "umap_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 32. t-SNE
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.t-sne",
    name: "t-SNE",
    category: "data-processing",
    description: "Reduce dimensionality using t-Distributed Stochastic Neighbor Embedding for visualization",
    tags: ["tsne", "t-sne", "dimensionality", "reduction", "visualization", "sklearn", "manifold"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "transformed", name: "Transformed DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "n_components", name: "Number of Components", type: "number", default: 2, min: 1, max: 3 },
      { id: "perplexity", name: "Perplexity", type: "number", default: 30, min: 5, max: 100 },
      { id: "learning_rate", name: "Learning Rate", type: "number", default: 200, min: 10, max: 1000, step: 10 },
      { id: "n_iter", name: "Iterations", type: "number", default: 1000, min: 250, max: 10000 },
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Numeric columns (empty = all numeric)", advanced: true },
      { id: "random_state", name: "Random Seed", type: "number", default: 42, advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "import numpy as np", "from sklearn.manifold import TSNE"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()
_tsne = TSNE(
    n_components={{params.n_components}},
    perplexity={{params.perplexity}},
    learning_rate={{params.learning_rate}},
    n_iter={{params.n_iter}},
    random_state={{params.random_state}}
)
_embedding = _tsne.fit_transform({{inputs.dataframe}}[_cols].values)
_comp_names = [f"tSNE{i+1}" for i in range({{params.n_components}})]
{{outputs.transformed}} = pd.DataFrame(_embedding, columns=_comp_names, index={{inputs.dataframe}}.index)`,
      outputBindings: { transformed: "df_tsne" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 33. ICA
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.ica",
    name: "ICA",
    category: "data-processing",
    description: "Independent Component Analysis for signal separation and dimensionality reduction",
    tags: ["ica", "independent", "component", "signal", "decomposition", "sklearn"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "transformed", name: "Transformed DataFrame", type: "dataframe", required: true },
      { id: "model", name: "Fitted ICA", type: "any", required: true },
    ],
    parameters: [
      { id: "n_components", name: "Number of Components", type: "number", default: 2, min: 1 },
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Numeric columns (empty = all numeric)" },
      { id: "max_iter", name: "Max Iterations", type: "number", default: 200, min: 50, advanced: true },
      { id: "random_state", name: "Random Seed", type: "number", default: 42, advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "import numpy as np", "from sklearn.decomposition import FastICA"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()
{{outputs.model}} = FastICA(n_components={{params.n_components}}, max_iter={{params.max_iter}}, random_state={{params.random_state}})
_components = {{outputs.model}}.fit_transform({{inputs.dataframe}}[_cols].values)
_comp_names = [f"IC{i+1}" for i in range({{params.n_components}})]
{{outputs.transformed}} = pd.DataFrame(_components, columns=_comp_names, index={{inputs.dataframe}}.index)`,
      outputBindings: { transformed: "df_ica", model: "ica_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 34. SVD
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.svd",
    name: "SVD",
    category: "data-processing",
    description: "Truncated Singular Value Decomposition for dimensionality reduction (works with sparse data)",
    tags: ["svd", "singular", "value", "decomposition", "truncated", "sklearn", "sparse"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "transformed", name: "Transformed DataFrame", type: "dataframe", required: true },
      { id: "model", name: "Fitted SVD", type: "any", required: true },
    ],
    parameters: [
      { id: "n_components", name: "Number of Components", type: "number", default: 2, min: 1 },
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Numeric columns (empty = all numeric)" },
      { id: "random_state", name: "Random Seed", type: "number", default: 42, advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "import numpy as np", "from sklearn.decomposition import TruncatedSVD"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()
{{outputs.model}} = TruncatedSVD(n_components={{params.n_components}}, random_state={{params.random_state}})
_components = {{outputs.model}}.fit_transform({{inputs.dataframe}}[_cols].values)
_comp_names = [f"SVD{i+1}" for i in range({{params.n_components}})]
{{outputs.transformed}} = pd.DataFrame(_components, columns=_comp_names, index={{inputs.dataframe}}.index)`,
      outputBindings: { transformed: "df_svd", model: "svd_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 35. Feature Selection
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.feature-selection",
    name: "Feature Selection",
    category: "data-processing",
    description: "Select the top-K features using a scoring function (chi2, f_classif, f_regression)",
    tags: ["feature", "selection", "selectkbest", "chi2", "f_classif", "sklearn"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
      { id: "target", name: "Target Series", type: "series", required: true },
    ],
    outputs: [
      { id: "selected", name: "Selected DataFrame", type: "dataframe", required: true },
      { id: "selector", name: "Fitted Selector", type: "any", required: true },
      { id: "scores", name: "Feature Scores", type: "series", required: true },
    ],
    parameters: [
      { id: "k", name: "Number of Features (K)", type: "number", default: 10, min: 1 },
      { id: "score_func", name: "Score Function", type: "select", default: "f_classif", options: [{ label: "F-test (classification)", value: "f_classif" }, { label: "F-test (regression)", value: "f_regression" }, { label: "Chi-squared", value: "chi2" }, { label: "Mutual Information (classification)", value: "mutual_info_classif" }, { label: "Mutual Information (regression)", value: "mutual_info_regression" }] },
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Numeric feature columns (empty = all numeric)", advanced: true },
    ],
    codeTemplate: {
      imports: [
        "import pandas as pd",
        "import numpy as np",
        "from sklearn.feature_selection import SelectKBest, f_classif, f_regression, chi2, mutual_info_classif, mutual_info_regression",
      ],
      body: `_score_funcs = {"f_classif": f_classif, "f_regression": f_regression, "chi2": chi2, "mutual_info_classif": mutual_info_classif, "mutual_info_regression": mutual_info_regression}
_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()
{{outputs.selector}} = SelectKBest(score_func=_score_funcs["{{params.score_func}}"], k={{params.k}})
_X_selected = {{outputs.selector}}.fit_transform({{inputs.dataframe}}[_cols], {{inputs.target}})
_mask = {{outputs.selector}}.get_support()
_selected_cols = [c for c, m in zip(_cols, _mask) if m]
{{outputs.selected}} = pd.DataFrame(_X_selected, columns=_selected_cols, index={{inputs.dataframe}}.index)
{{outputs.scores}} = pd.Series({{outputs.selector}}.scores_, index=_cols, name="score").sort_values(ascending=False)`,
      outputBindings: { selected: "df_selected", selector: "selector", scores: "feature_scores" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 36. Correlation Filter
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.correlation-filter",
    name: "Correlation Filter",
    category: "data-processing",
    description: "Remove features that are highly correlated with each other above a threshold",
    tags: ["correlation", "filter", "multicollinearity", "feature", "selection", "pandas"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "filtered", name: "Filtered DataFrame", type: "dataframe", required: true },
      { id: "dropped_cols", name: "Dropped Columns", type: "list", required: true },
    ],
    parameters: [
      { id: "threshold", name: "Correlation Threshold", type: "number", default: 0.95, min: 0.0, max: 1.0, step: 0.01 },
      { id: "method", name: "Method", type: "select", default: "pearson", options: [{ label: "Pearson", value: "pearson" }, { label: "Spearman", value: "spearman" }, { label: "Kendall", value: "kendall" }] },
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Numeric columns to check (empty = all numeric)", advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "import numpy as np"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()
_corr = {{inputs.dataframe}}[_cols].corr(method="{{params.method}}").abs()
_upper = _corr.where(np.triu(np.ones(_corr.shape), k=1).astype(bool))
{{outputs.dropped_cols}} = [col for col in _upper.columns if any(_upper[col] > {{params.threshold}})]
{{outputs.filtered}} = {{inputs.dataframe}}.drop(columns={{outputs.dropped_cols}})`,
      outputBindings: { filtered: "df_corr_filtered", dropped_cols: "dropped_corr_cols" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 37. Variance Threshold
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.variance-threshold",
    name: "Variance Threshold",
    category: "data-processing",
    description: "Remove features with variance below a specified threshold",
    tags: ["variance", "threshold", "low-variance", "feature", "selection", "sklearn"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "filtered", name: "Filtered DataFrame", type: "dataframe", required: true },
      { id: "selector", name: "Fitted Selector", type: "any", required: true },
    ],
    parameters: [
      { id: "threshold", name: "Variance Threshold", type: "number", default: 0.0, min: 0.0, step: 0.01, description: "Features with variance <= this value are removed" },
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Numeric columns to check (empty = all numeric)", advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "from sklearn.feature_selection import VarianceThreshold"],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()
{{outputs.selector}} = VarianceThreshold(threshold={{params.threshold}})
_X_filtered = {{outputs.selector}}.fit_transform({{inputs.dataframe}}[_cols])
_mask = {{outputs.selector}}.get_support()
_kept_cols = [c for c, m in zip(_cols, _mask) if m]
_non_numeric = [c for c in {{inputs.dataframe}}.columns if c not in _cols]
{{outputs.filtered}} = pd.concat([
    {{inputs.dataframe}}[_non_numeric].reset_index(drop=True),
    pd.DataFrame(_X_filtered, columns=_kept_cols)
], axis=1)`,
      outputBindings: { filtered: "df_var_filtered", selector: "var_selector" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 38. Mutual Info Filter
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.mutual-info-filter",
    name: "Mutual Info Filter",
    category: "data-processing",
    description: "Select features based on mutual information scores with the target variable",
    tags: ["mutual-information", "filter", "feature", "selection", "information-gain", "sklearn"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
      { id: "target", name: "Target Series", type: "series", required: true },
    ],
    outputs: [
      { id: "filtered", name: "Filtered DataFrame", type: "dataframe", required: true },
      { id: "scores", name: "MI Scores", type: "series", required: true },
    ],
    parameters: [
      { id: "task", name: "Task Type", type: "select", default: "classification", options: [{ label: "Classification", value: "classification" }, { label: "Regression", value: "regression" }] },
      { id: "k", name: "Top-K Features", type: "number", default: 10, min: 1 },
      { id: "columns", name: "Columns", type: "string", default: "", placeholder: "col1, col2", description: "Numeric columns (empty = all numeric)", advanced: true },
      { id: "random_state", name: "Random Seed", type: "number", default: 42, advanced: true },
    ],
    codeTemplate: {
      imports: [
        "import pandas as pd",
        "import numpy as np",
        "from sklearn.feature_selection import mutual_info_classif, mutual_info_regression",
      ],
      body: `_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()
_mi_func = mutual_info_classif if "{{params.task}}" == "classification" else mutual_info_regression
_mi_scores = _mi_func({{inputs.dataframe}}[_cols], {{inputs.target}}, random_state={{params.random_state}})
{{outputs.scores}} = pd.Series(_mi_scores, index=_cols, name="mutual_info").sort_values(ascending=False)
_top_k = {{outputs.scores}}.head({{params.k}}).index.tolist()
{{outputs.filtered}} = {{inputs.dataframe}}[_top_k]`,
      outputBindings: { filtered: "df_mi_filtered", scores: "mi_scores" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 39. DataFrame → X & y (tabular features for sklearn)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-processing.dataframe-to-xy",
    name: "DataFrame → X & y",
    category: "data-processing",
    description:
      "Split a DataFrame into a feature matrix X and target vector y using column names (for classical ML blocks)",
    tags: ["tabular", "features", "target", "sklearn", "pandas", "supervised"],
    inputs: [{ id: "dataframe", name: "DataFrame", type: "dataframe", required: true }],
    outputs: [
      { id: "X", name: "X (features)", type: "array", required: true },
      { id: "y", name: "y (target)", type: "array", required: true },
    ],
    parameters: [
      {
        id: "feature_columns",
        name: "Feature columns",
        type: "string",
        default: "",
        placeholder: "col_a, col_b, col_c",
        description: "Comma-separated feature column names (numeric/categorical encoded)",
      },
      {
        id: "target_column",
        name: "Target column",
        type: "string",
        default: "target",
        placeholder: "label",
        description: "Name of the target / label column",
      },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `_fc = [c.strip() for c in "{{params.feature_columns}}".split(",") if c.strip()]
_tc = "{{params.target_column}}".strip()
if not _fc or not _tc:
    raise ValueError("Set feature_columns (comma-separated) and target_column on the DataFrame → X & y block")
{{outputs.X}} = {{inputs.dataframe}}[_fc].values
{{outputs.y}} = {{inputs.dataframe}}[_tc].values`,
      outputBindings: { X: "X_arr", y: "y_arr" },
    },
  },
];
