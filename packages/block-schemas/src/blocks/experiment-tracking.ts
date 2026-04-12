import type { BlockDefinition } from "../types.js";

export const experimentTrackingBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Init Run (MLflow)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.init-run-mlflow",
    name: "Init Run (MLflow)",
    category: "experiment-tracking",
    description: "Initialize an MLflow experiment run for logging metrics, parameters, and artifacts",
    tags: ["experiment-tracking", "mlflow", "init", "run"],
    inputs: [],
    outputs: [
      { id: "run", name: "MLflow Run", type: "any", required: true },
      { id: "run_id", name: "Run ID", type: "text", required: true },
    ],
    parameters: [
      { id: "experiment_name", name: "Experiment Name", type: "string", default: "default" },
      { id: "run_name", name: "Run Name", type: "string", default: "", placeholder: "Optional run name" },
      { id: "tracking_uri", name: "Tracking URI", type: "string", default: "", placeholder: "e.g. http://localhost:5000" },
      { id: "tags", name: "Tags (JSON)", type: "json", default: "{}" },
    ],
    codeTemplate: {
      imports: ["import mlflow", "import json"],
      body: `if "{{params.tracking_uri}}":
    mlflow.set_tracking_uri("{{params.tracking_uri}}")
mlflow.set_experiment("{{params.experiment_name}}")
_tags = json.loads('{{params.tags}}')
_run_name = "{{params.run_name}}" or None
{{outputs.run}} = mlflow.start_run(run_name=_run_name, tags=_tags)
{{outputs.run_id}} = {{outputs.run}}.info.run_id`,
      outputBindings: { run: "mlflow_run", run_id: "mlflow_run_id" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Init Run (W&B)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.init-run-wandb",
    name: "Init Run (W&B)",
    category: "experiment-tracking",
    description: "Initialize a Weights & Biases run for experiment tracking and visualization",
    tags: ["experiment-tracking", "wandb", "weights-and-biases", "init"],
    inputs: [],
    outputs: [
      { id: "run", name: "W&B Run", type: "any", required: true },
      { id: "run_id", name: "Run ID", type: "text", required: true },
    ],
    parameters: [
      { id: "project", name: "Project Name", type: "string", default: "my-project" },
      { id: "run_name", name: "Run Name", type: "string", default: "", placeholder: "Optional run name" },
      { id: "entity", name: "Entity (Team)", type: "string", default: "", placeholder: "Optional team name" },
      { id: "tags", name: "Tags", type: "json", default: "[]" },
      { id: "config", name: "Config (JSON)", type: "json", default: "{}" },
    ],
    codeTemplate: {
      imports: ["import wandb", "import json"],
      body: `_entity = "{{params.entity}}" or None
_run_name = "{{params.run_name}}" or None
_tags = json.loads('{{params.tags}}')
_config = json.loads('{{params.config}}')
{{outputs.run}} = wandb.init(project="{{params.project}}", name=_run_name, entity=_entity, tags=_tags, config=_config)
{{outputs.run_id}} = {{outputs.run}}.id`,
      outputBindings: { run: "wandb_run", run_id: "wandb_run_id" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Init Run (Comet)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.init-run-comet",
    name: "Init Run (Comet)",
    category: "experiment-tracking",
    description: "Initialize a Comet ML experiment for tracking metrics, code, and system info",
    tags: ["experiment-tracking", "comet", "comet-ml", "init"],
    inputs: [],
    outputs: [
      { id: "experiment", name: "Comet Experiment", type: "any", required: true },
      { id: "experiment_key", name: "Experiment Key", type: "text", required: true },
    ],
    parameters: [
      { id: "project_name", name: "Project Name", type: "string", default: "my-project" },
      { id: "workspace", name: "Workspace", type: "string", default: "", placeholder: "Comet workspace" },
      { id: "api_key_env", name: "API Key Env Var", type: "string", default: "COMET_API_KEY" },
      { id: "auto_log", name: "Auto-Log Metrics", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import comet_ml", "import os"],
      body: `_workspace = "{{params.workspace}}" or None
{{outputs.experiment}} = comet_ml.Experiment(
    api_key=os.environ.get("{{params.api_key_env}}"),
    project_name="{{params.project_name}}",
    workspace=_workspace,
    auto_metric_logging={{params.auto_log}},
)
{{outputs.experiment_key}} = {{outputs.experiment}}.get_key()`,
      outputBindings: { experiment: "comet_experiment", experiment_key: "comet_key" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Log Metric
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.log-metric",
    name: "Log Metric",
    category: "experiment-tracking",
    description: "Log a scalar metric value to the active experiment tracker",
    tags: ["experiment-tracking", "logging", "metric", "mlflow", "wandb"],
    inputs: [
      { id: "value", name: "Metric Value", type: "number", required: true },
    ],
    outputs: [],
    parameters: [
      { id: "key", name: "Metric Name", type: "string", default: "loss" },
      { id: "step", name: "Step", type: "number", default: 0, min: 0, step: 1 },
      { id: "backend", name: "Backend", type: "select", default: "mlflow", options: [{ label: "MLflow", value: "mlflow" }, { label: "W&B", value: "wandb" }, { label: "Comet", value: "comet" }] },
    ],
    codeTemplate: {
      imports: [],
      body: `if "{{params.backend}}" == "mlflow":
    import mlflow
    mlflow.log_metric("{{params.key}}", {{inputs.value}}, step={{params.step}})
elif "{{params.backend}}" == "wandb":
    import wandb
    wandb.log({"{{params.key}}": {{inputs.value}}}, step={{params.step}})
else:
    import comet_ml
    comet_ml.get_global_experiment().log_metric("{{params.key}}", {{inputs.value}}, step={{params.step}})`,
      outputBindings: {},
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Log Artifact
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.log-artifact",
    name: "Log Artifact",
    category: "experiment-tracking",
    description: "Log a file or directory as an artifact to the experiment tracker",
    tags: ["experiment-tracking", "logging", "artifact", "mlflow", "wandb"],
    inputs: [
      { id: "artifact_path", name: "Artifact Path", type: "path", required: true },
    ],
    outputs: [],
    parameters: [
      { id: "name", name: "Artifact Name", type: "string", default: "artifact" },
      { id: "artifact_type", name: "Artifact Type", type: "string", default: "file", placeholder: "e.g. model, dataset, file" },
      { id: "backend", name: "Backend", type: "select", default: "mlflow", options: [{ label: "MLflow", value: "mlflow" }, { label: "W&B", value: "wandb" }, { label: "Comet", value: "comet" }] },
    ],
    codeTemplate: {
      imports: ["import os"],
      body: `if "{{params.backend}}" == "mlflow":
    import mlflow
    if os.path.isdir({{inputs.artifact_path}}):
        mlflow.log_artifacts({{inputs.artifact_path}}, artifact_path="{{params.name}}")
    else:
        mlflow.log_artifact({{inputs.artifact_path}})
elif "{{params.backend}}" == "wandb":
    import wandb
    _art = wandb.Artifact("{{params.name}}", type="{{params.artifact_type}}")
    if os.path.isdir({{inputs.artifact_path}}):
        _art.add_dir({{inputs.artifact_path}})
    else:
        _art.add_file({{inputs.artifact_path}})
    wandb.log_artifact(_art)
else:
    import comet_ml
    _exp = comet_ml.get_global_experiment()
    if os.path.isdir({{inputs.artifact_path}}):
        _exp.log_asset_folder({{inputs.artifact_path}}, log_file_name="{{params.name}}")
    else:
        _exp.log_asset({{inputs.artifact_path}}, file_name="{{params.name}}")`,
      outputBindings: {},
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Log Config
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.log-config",
    name: "Log Config",
    category: "experiment-tracking",
    description: "Log hyperparameters and configuration to the experiment tracker",
    tags: ["experiment-tracking", "logging", "config", "hyperparameters"],
    inputs: [
      { id: "config", name: "Configuration Dict", type: "dict", required: true },
    ],
    outputs: [],
    parameters: [
      { id: "backend", name: "Backend", type: "select", default: "mlflow", options: [{ label: "MLflow", value: "mlflow" }, { label: "W&B", value: "wandb" }, { label: "Comet", value: "comet" }] },
    ],
    codeTemplate: {
      imports: [],
      body: `if "{{params.backend}}" == "mlflow":
    import mlflow
    mlflow.log_params({{inputs.config}})
elif "{{params.backend}}" == "wandb":
    import wandb
    wandb.config.update({{inputs.config}})
else:
    import comet_ml
    comet_ml.get_global_experiment().log_parameters({{inputs.config}})`,
      outputBindings: {},
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Log Model
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.log-model",
    name: "Log Model",
    category: "experiment-tracking",
    description: "Log a trained model to the experiment tracker for versioning and deployment",
    tags: ["experiment-tracking", "logging", "model", "registry"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "model_uri", name: "Model URI", type: "text", required: true },
    ],
    parameters: [
      { id: "name", name: "Model Name", type: "string", default: "model" },
      { id: "backend", name: "Backend", type: "select", default: "mlflow", options: [{ label: "MLflow (PyTorch)", value: "mlflow" }, { label: "W&B", value: "wandb" }] },
    ],
    codeTemplate: {
      imports: [],
      body: `if "{{params.backend}}" == "mlflow":
    import mlflow.pytorch
    _info = mlflow.pytorch.log_model({{inputs.model}}, artifact_path="{{params.name}}")
    {{outputs.model_uri}} = _info.model_uri
else:
    import wandb
    import torch, tempfile, os
    _tmp = os.path.join(tempfile.mkdtemp(), "{{params.name}}.pt")
    torch.save({{inputs.model}}.state_dict(), _tmp)
    _art = wandb.Artifact("{{params.name}}", type="model")
    _art.add_file(_tmp)
    wandb.log_artifact(_art)
    {{outputs.model_uri}} = _art.name`,
      outputBindings: { model_uri: "logged_model_uri" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Log Dataset
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.log-dataset",
    name: "Log Dataset",
    category: "experiment-tracking",
    description: "Log dataset metadata and a reference to the experiment tracker for reproducibility",
    tags: ["experiment-tracking", "logging", "dataset", "provenance"],
    inputs: [
      { id: "dataset_path", name: "Dataset Path", type: "path", required: true },
    ],
    outputs: [],
    parameters: [
      { id: "name", name: "Dataset Name", type: "string", default: "dataset" },
      { id: "description", name: "Description", type: "string", default: "" },
      { id: "backend", name: "Backend", type: "select", default: "mlflow", options: [{ label: "MLflow", value: "mlflow" }, { label: "W&B", value: "wandb" }] },
    ],
    codeTemplate: {
      imports: [],
      body: `if "{{params.backend}}" == "mlflow":
    import mlflow
    _ds = mlflow.data.from_pandas(
        __import__("pandas").read_csv({{inputs.dataset_path}}) if {{inputs.dataset_path}}.endswith(".csv")
        else __import__("pandas").read_parquet({{inputs.dataset_path}}),
        name="{{params.name}}"
    )
    mlflow.log_input(_ds, context="training")
else:
    import wandb
    _art = wandb.Artifact("{{params.name}}", type="dataset", description="{{params.description}}")
    _art.add_reference({{inputs.dataset_path}})
    wandb.log_artifact(_art)`,
      outputBindings: {},
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Log Media
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.log-media",
    name: "Log Media",
    category: "experiment-tracking",
    description: "Log images, audio, or video media to the experiment tracker for visualization",
    tags: ["experiment-tracking", "logging", "media", "images", "wandb"],
    inputs: [
      { id: "media", name: "Media Data", type: "any", required: true },
    ],
    outputs: [],
    parameters: [
      { id: "key", name: "Media Key", type: "string", default: "media" },
      { id: "media_type", name: "Media Type", type: "select", default: "image", options: [{ label: "Image", value: "image" }, { label: "Audio", value: "audio" }, { label: "Video", value: "video" }, { label: "Table", value: "table" }] },
      { id: "caption", name: "Caption", type: "string", default: "" },
      { id: "backend", name: "Backend", type: "select", default: "wandb", options: [{ label: "W&B", value: "wandb" }, { label: "MLflow", value: "mlflow" }] },
    ],
    codeTemplate: {
      imports: [],
      body: `if "{{params.backend}}" == "wandb":
    import wandb
    if "{{params.media_type}}" == "image":
        _media = wandb.Image({{inputs.media}}, caption="{{params.caption}}")
    elif "{{params.media_type}}" == "audio":
        _media = wandb.Audio({{inputs.media}}, caption="{{params.caption}}")
    elif "{{params.media_type}}" == "video":
        _media = wandb.Video({{inputs.media}}, caption="{{params.caption}}")
    else:
        _media = wandb.Table(data={{inputs.media}})
    wandb.log({"{{params.key}}": _media})
else:
    import mlflow
    import tempfile, os
    _tmp = os.path.join(tempfile.mkdtemp(), "{{params.key}}.png")
    if hasattr({{inputs.media}}, "save"):
        {{inputs.media}}.save(_tmp)
    else:
        import matplotlib.pyplot as plt
        plt.imsave(_tmp, {{inputs.media}})
    mlflow.log_artifact(_tmp)`,
      outputBindings: {},
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Compare Runs
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.compare-runs",
    name: "Compare Runs",
    category: "experiment-tracking",
    description: "Compare metrics and parameters across multiple experiment runs",
    tags: ["experiment-tracking", "comparison", "runs", "mlflow", "wandb"],
    inputs: [
      { id: "run_ids", name: "Run IDs", type: "list", required: true },
    ],
    outputs: [
      { id: "comparison", name: "Comparison Table", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "metrics", name: "Metrics to Compare", type: "string", default: "loss,accuracy", placeholder: "Comma-separated metric names" },
      { id: "backend", name: "Backend", type: "select", default: "mlflow", options: [{ label: "MLflow", value: "mlflow" }, { label: "W&B", value: "wandb" }] },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `_metrics_list = [m.strip() for m in "{{params.metrics}}".split(",")]
_rows = []
if "{{params.backend}}" == "mlflow":
    import mlflow
    for _rid in {{inputs.run_ids}}:
        _run = mlflow.get_run(_rid)
        _row = {"run_id": _rid, **{m: _run.data.metrics.get(m) for m in _metrics_list}, **_run.data.params}
        _rows.append(_row)
else:
    import wandb
    _api = wandb.Api()
    for _rid in {{inputs.run_ids}}:
        _run = _api.run(_rid)
        _row = {"run_id": _rid, **{m: _run.summary.get(m) for m in _metrics_list}, **dict(_run.config)}
        _rows.append(_row)
{{outputs.comparison}} = pd.DataFrame(_rows)`,
      outputBindings: { comparison: "run_comparison_df" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Hyperparameter Sweep (Grid)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.sweep-grid",
    name: "Hyperparameter Sweep (Grid)",
    category: "experiment-tracking",
    description: "Perform a grid search over all combinations of hyperparameter values",
    tags: ["experiment-tracking", "hyperparameter", "grid-search", "sweep"],
    inputs: [
      { id: "train_fn", name: "Training Function", type: "any", required: true, description: "Callable(config) -> metric" },
    ],
    outputs: [
      { id: "results", name: "Sweep Results", type: "list", required: true },
      { id: "best_config", name: "Best Config", type: "dict", required: true },
    ],
    parameters: [
      { id: "param_grid", name: "Parameter Grid (JSON)", type: "json", default: "{\"lr\": [0.001, 0.01, 0.1], \"batch_size\": [16, 32]}" },
      { id: "metric_name", name: "Metric to Optimize", type: "string", default: "loss" },
      { id: "direction", name: "Direction", type: "select", default: "minimize", options: [{ label: "Minimize", value: "minimize" }, { label: "Maximize", value: "maximize" }] },
    ],
    codeTemplate: {
      imports: ["import itertools", "import json"],
      body: `_grid = json.loads('{{params.param_grid}}')
_keys = list(_grid.keys())
_results = []
_best_val = float("inf") if "{{params.direction}}" == "minimize" else float("-inf")
_best_cfg = None
for _vals in itertools.product(*[_grid[k] for k in _keys]):
    _cfg = dict(zip(_keys, _vals))
    _metric = {{inputs.train_fn}}(_cfg)
    _results.append({**_cfg, "{{params.metric_name}}": _metric})
    if ("{{params.direction}}" == "minimize" and _metric < _best_val) or ("{{params.direction}}" == "maximize" and _metric > _best_val):
        _best_val = _metric
        _best_cfg = _cfg
{{outputs.results}} = _results
{{outputs.best_config}} = _best_cfg`,
      outputBindings: { results: "grid_sweep_results", best_config: "grid_best_config" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Hyperparameter Sweep (Random)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.sweep-random",
    name: "Hyperparameter Sweep (Random)",
    category: "experiment-tracking",
    description: "Perform random search over hyperparameter distributions",
    tags: ["experiment-tracking", "hyperparameter", "random-search", "sweep"],
    inputs: [
      { id: "train_fn", name: "Training Function", type: "any", required: true, description: "Callable(config) -> metric" },
    ],
    outputs: [
      { id: "results", name: "Sweep Results", type: "list", required: true },
      { id: "best_config", name: "Best Config", type: "dict", required: true },
    ],
    parameters: [
      { id: "param_distributions", name: "Distributions (JSON)", type: "json", default: "{\"lr\": {\"low\": 0.0001, \"high\": 0.1, \"log\": true}, \"batch_size\": {\"choices\": [16, 32, 64]}}" },
      { id: "n_trials", name: "Number of Trials", type: "number", default: 20, min: 1, max: 1000, step: 1 },
      { id: "metric_name", name: "Metric to Optimize", type: "string", default: "loss" },
      { id: "direction", name: "Direction", type: "select", default: "minimize", options: [{ label: "Minimize", value: "minimize" }, { label: "Maximize", value: "maximize" }] },
      { id: "seed", name: "Random Seed", type: "number", default: 42, min: 0, step: 1 },
    ],
    codeTemplate: {
      imports: ["import random", "import math", "import json"],
      body: `random.seed({{params.seed}})
_dists = json.loads('{{params.param_distributions}}')
def _sample(spec):
    if "choices" in spec:
        return random.choice(spec["choices"])
    _low, _high = spec["low"], spec["high"]
    if spec.get("log"):
        return math.exp(random.uniform(math.log(_low), math.log(_high)))
    return random.uniform(_low, _high)
_results = []
_best_val = float("inf") if "{{params.direction}}" == "minimize" else float("-inf")
_best_cfg = None
for _ in range({{params.n_trials}}):
    _cfg = {k: _sample(v) for k, v in _dists.items()}
    _metric = {{inputs.train_fn}}(_cfg)
    _results.append({**_cfg, "{{params.metric_name}}": _metric})
    if ("{{params.direction}}" == "minimize" and _metric < _best_val) or ("{{params.direction}}" == "maximize" and _metric > _best_val):
        _best_val = _metric
        _best_cfg = _cfg
{{outputs.results}} = _results
{{outputs.best_config}} = _best_cfg`,
      outputBindings: { results: "random_sweep_results", best_config: "random_best_config" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. Hyperparameter Sweep (Bayesian)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.sweep-bayesian",
    name: "Hyperparameter Sweep (Bayesian)",
    category: "experiment-tracking",
    description: "Perform Bayesian hyperparameter optimization using Optuna's TPE sampler",
    tags: ["experiment-tracking", "hyperparameter", "bayesian", "optuna"],
    inputs: [
      { id: "train_fn", name: "Training Function", type: "any", required: true, description: "Callable(trial) -> metric" },
    ],
    outputs: [
      { id: "study", name: "Optuna Study", type: "any", required: true },
      { id: "best_params", name: "Best Parameters", type: "dict", required: true },
      { id: "best_value", name: "Best Value", type: "number", required: true },
    ],
    parameters: [
      { id: "n_trials", name: "Number of Trials", type: "number", default: 50, min: 1, max: 5000, step: 1 },
      { id: "direction", name: "Direction", type: "select", default: "minimize", options: [{ label: "Minimize", value: "minimize" }, { label: "Maximize", value: "maximize" }] },
      { id: "study_name", name: "Study Name", type: "string", default: "bayesian-sweep" },
      { id: "seed", name: "Random Seed", type: "number", default: 42, min: 0, step: 1 },
    ],
    codeTemplate: {
      imports: ["import optuna"],
      body: `_sampler = optuna.samplers.TPESampler(seed={{params.seed}})
{{outputs.study}} = optuna.create_study(study_name="{{params.study_name}}", direction="{{params.direction}}", sampler=_sampler)
{{outputs.study}}.optimize({{inputs.train_fn}}, n_trials={{params.n_trials}})
{{outputs.best_params}} = {{outputs.study}}.best_params
{{outputs.best_value}} = {{outputs.study}}.best_value`,
      outputBindings: { study: "optuna_study", best_params: "bayesian_best_params", best_value: "bayesian_best_value" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Optuna Suggest
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.optuna-suggest",
    name: "Optuna Suggest",
    category: "experiment-tracking",
    description: "Define hyperparameter search spaces using Optuna's suggest API for use inside objectives",
    tags: ["experiment-tracking", "optuna", "suggest", "search-space"],
    inputs: [
      { id: "trial", name: "Optuna Trial", type: "any", required: true },
    ],
    outputs: [
      { id: "config", name: "Suggested Config", type: "dict", required: true },
    ],
    parameters: [
      { id: "search_space", name: "Search Space (JSON)", type: "json", default: "[{\"name\": \"lr\", \"type\": \"float\", \"low\": 1e-5, \"high\": 1e-1, \"log\": true}, {\"name\": \"batch_size\", \"type\": \"categorical\", \"choices\": [16, 32, 64]}]" },
    ],
    codeTemplate: {
      imports: ["import json"],
      body: `_space = json.loads('{{params.search_space}}')
_config = {}
for _p in _space:
    if _p["type"] == "float":
        _config[_p["name"]] = {{inputs.trial}}.suggest_float(_p["name"], _p["low"], _p["high"], log=_p.get("log", False))
    elif _p["type"] == "int":
        _config[_p["name"]] = {{inputs.trial}}.suggest_int(_p["name"], _p["low"], _p["high"], step=_p.get("step", 1))
    elif _p["type"] == "categorical":
        _config[_p["name"]] = {{inputs.trial}}.suggest_categorical(_p["name"], _p["choices"])
{{outputs.config}} = _config`,
      outputBindings: { config: "optuna_suggested_config" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Ray Tune Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.ray-tune",
    name: "Ray Tune Block",
    category: "experiment-tracking",
    description: "Run distributed hyperparameter tuning using Ray Tune with configurable schedulers",
    tags: ["experiment-tracking", "ray", "tune", "distributed", "hyperparameter"],
    inputs: [
      { id: "train_fn", name: "Training Function", type: "any", required: true, description: "Callable(config) that reports metrics via ray.tune.report" },
    ],
    outputs: [
      { id: "results", name: "Tune Results", type: "any", required: true },
      { id: "best_config", name: "Best Config", type: "dict", required: true },
    ],
    parameters: [
      { id: "search_space", name: "Search Space (JSON)", type: "json", default: "{\"lr\": {\"type\": \"loguniform\", \"low\": 1e-5, \"high\": 1e-1}, \"batch_size\": {\"type\": \"choice\", \"values\": [16, 32, 64]}}" },
      { id: "num_samples", name: "Number of Samples", type: "number", default: 20, min: 1, max: 1000, step: 1 },
      { id: "metric", name: "Metric", type: "string", default: "loss" },
      { id: "mode", name: "Mode", type: "select", default: "min", options: [{ label: "Minimize", value: "min" }, { label: "Maximize", value: "max" }] },
      { id: "scheduler", name: "Scheduler", type: "select", default: "asha", options: [{ label: "ASHA", value: "asha" }, { label: "HyperBand", value: "hyperband" }, { label: "None", value: "none" }] },
      { id: "cpus_per_trial", name: "CPUs per Trial", type: "number", default: 1, min: 1, max: 32, step: 1 },
      { id: "gpus_per_trial", name: "GPUs per Trial", type: "number", default: 0, min: 0, max: 8, step: 1 },
    ],
    codeTemplate: {
      imports: ["from ray import tune", "from ray.tune.schedulers import ASHAScheduler, HyperBandScheduler", "import json"],
      body: `_raw_space = json.loads('{{params.search_space}}')
_space = {}
for _k, _v in _raw_space.items():
    if _v["type"] == "loguniform":
        _space[_k] = tune.loguniform(_v["low"], _v["high"])
    elif _v["type"] == "uniform":
        _space[_k] = tune.uniform(_v["low"], _v["high"])
    elif _v["type"] == "choice":
        _space[_k] = tune.choice(_v["values"])
    elif _v["type"] == "randint":
        _space[_k] = tune.randint(_v["low"], _v["high"])
_scheduler = None
if "{{params.scheduler}}" == "asha":
    _scheduler = ASHAScheduler(metric="{{params.metric}}", mode="{{params.mode}}")
elif "{{params.scheduler}}" == "hyperband":
    _scheduler = HyperBandScheduler(metric="{{params.metric}}", mode="{{params.mode}}")
{{outputs.results}} = tune.run(
    {{inputs.train_fn}},
    config=_space,
    num_samples={{params.num_samples}},
    scheduler=_scheduler,
    resources_per_trial={"cpu": {{params.cpus_per_trial}}, "gpu": {{params.gpus_per_trial}}},
)
{{outputs.best_config}} = {{outputs.results}}.get_best_config(metric="{{params.metric}}", mode="{{params.mode}}")`,
      outputBindings: { results: "ray_tune_results", best_config: "ray_best_config" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. A/B Experiment Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "experiment-tracking.ab-experiment",
    name: "A/B Experiment Block",
    category: "experiment-tracking",
    description: "Run a statistical A/B test comparing two model variants with significance testing",
    tags: ["experiment-tracking", "ab-test", "statistics", "significance"],
    inputs: [
      { id: "metrics_a", name: "Metrics A", type: "array", required: true, description: "Array of metric values for variant A" },
      { id: "metrics_b", name: "Metrics B", type: "array", required: true, description: "Array of metric values for variant B" },
    ],
    outputs: [
      { id: "report", name: "A/B Test Report", type: "dict", required: true },
      { id: "significant", name: "Is Significant", type: "boolean", required: true },
    ],
    parameters: [
      { id: "test", name: "Statistical Test", type: "select", default: "t-test", options: [{ label: "Two-Sample t-Test", value: "t-test" }, { label: "Mann-Whitney U", value: "mann-whitney" }, { label: "Bootstrap", value: "bootstrap" }] },
      { id: "alpha", name: "Significance Level", type: "number", default: 0.05, min: 0.001, max: 0.5, step: 0.005 },
      { id: "n_bootstrap", name: "Bootstrap Samples (if bootstrap)", type: "number", default: 10000, min: 100, max: 100000, step: 100 },
    ],
    codeTemplate: {
      imports: ["import numpy as np", "from scipy import stats"],
      body: `_a = np.array({{inputs.metrics_a}})
_b = np.array({{inputs.metrics_b}})
_mean_a, _mean_b = _a.mean(), _b.mean()
_diff = _mean_b - _mean_a
if "{{params.test}}" == "t-test":
    _stat, _pval = stats.ttest_ind(_a, _b)
elif "{{params.test}}" == "mann-whitney":
    _stat, _pval = stats.mannwhitneyu(_a, _b, alternative="two-sided")
else:
    _combined = np.concatenate([_a, _b])
    _n_a = len(_a)
    _diffs = []
    for _ in range({{params.n_bootstrap}}):
        np.random.shuffle(_combined)
        _diffs.append(_combined[:_n_a].mean() - _combined[_n_a:].mean())
    _diffs = np.array(_diffs)
    _pval = (np.abs(_diffs) >= np.abs(_diff)).mean()
    _stat = _diff
{{outputs.significant}} = float(_pval) < {{params.alpha}}
{{outputs.report}} = {"mean_a": float(_mean_a), "mean_b": float(_mean_b), "diff": float(_diff), "statistic": float(_stat), "p_value": float(_pval), "alpha": {{params.alpha}}, "significant": {{outputs.significant}}, "test": "{{params.test}}"}`,
      outputBindings: { report: "ab_test_report", significant: "ab_is_significant" },
    },
  },
];
