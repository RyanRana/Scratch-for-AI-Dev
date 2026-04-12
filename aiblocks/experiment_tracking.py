"""
aiblocks.experiment_tracking — Experiment Tracking

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def init_run_mlflow(experiment_name='default', run_name='', tracking_uri='', tags='{}'):
    """Initialize an MLflow experiment run for logging metrics, parameters, and artifacts
    
    Dependencies: pip install mlflow
    
    Parameters:
        experiment_name (string, default='default'): 
        run_name (string, default=''): 
        tracking_uri (string, default=''): 
        tags (json, default='{}'): 
    
    Returns:
        dict with keys:
            run (any): 
            run_id (text): 
    """
    _imports = ['import mlflow', 'import json']
    _code = 'if "{{params.tracking_uri}}":\n    mlflow.set_tracking_uri("{{params.tracking_uri}}")\nmlflow.set_experiment("{{params.experiment_name}}")\n_tags = json.loads(\'{{params.tags}}\')\n_run_name = "{{params.run_name}}" or None\n{{outputs.run}} = mlflow.start_run(run_name=_run_name, tags=_tags)\n{{outputs.run_id}} = {{outputs.run}}.info.run_id'
    
    _code = _code.replace("{{params.experiment_name}}", str(experiment_name))
    _code = _code.replace("{{params.run_name}}", str(run_name))
    _code = _code.replace("{{params.tracking_uri}}", str(tracking_uri))
    _code = _code.replace("{{params.tags}}", str(tags))
    _code = _code.replace("{{outputs.run}}", "_out_run")
    _code = _code.replace("{{outputs.run_id}}", "_out_run_id")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"run": _ns.get("_out_run"), "run_id": _ns.get("_out_run_id")}


def init_run_wandb(project='my-project', run_name='', entity='', tags='[]', config='{}'):
    """Initialize a Weights & Biases run for experiment tracking and visualization
    
    Dependencies: pip install wandb
    
    Parameters:
        project (string, default='my-project'): 
        run_name (string, default=''): 
        entity (string, default=''): 
        tags (json, default='[]'): 
        config (json, default='{}'): 
    
    Returns:
        dict with keys:
            run (any): 
            run_id (text): 
    """
    _imports = ['import wandb', 'import json']
    _code = '_entity = "{{params.entity}}" or None\n_run_name = "{{params.run_name}}" or None\n_tags = json.loads(\'{{params.tags}}\')\n_config = json.loads(\'{{params.config}}\')\n{{outputs.run}} = wandb.init(project="{{params.project}}", name=_run_name, entity=_entity, tags=_tags, config=_config)\n{{outputs.run_id}} = {{outputs.run}}.id'
    
    _code = _code.replace("{{params.project}}", str(project))
    _code = _code.replace("{{params.run_name}}", str(run_name))
    _code = _code.replace("{{params.entity}}", str(entity))
    _code = _code.replace("{{params.tags}}", str(tags))
    _code = _code.replace("{{params.config}}", str(config))
    _code = _code.replace("{{outputs.run}}", "_out_run")
    _code = _code.replace("{{outputs.run_id}}", "_out_run_id")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"run": _ns.get("_out_run"), "run_id": _ns.get("_out_run_id")}


def init_run_comet(project_name='my-project', workspace='', api_key_env='COMET_API_KEY', auto_log=True):
    """Initialize a Comet ML experiment for tracking metrics, code, and system info
    
    Dependencies: pip install comet-ml
    
    Parameters:
        project_name (string, default='my-project'): 
        workspace (string, default=''): 
        api_key_env (string, default='COMET_API_KEY'): 
        auto_log (boolean, default=True): 
    
    Returns:
        dict with keys:
            experiment (any): 
            experiment_key (text): 
    """
    _imports = ['import comet_ml', 'import os']
    _code = '_workspace = "{{params.workspace}}" or None\n{{outputs.experiment}} = comet_ml.Experiment(\n    api_key=os.environ.get("{{params.api_key_env}}"),\n    project_name="{{params.project_name}}",\n    workspace=_workspace,\n    auto_metric_logging={{params.auto_log}},\n)\n{{outputs.experiment_key}} = {{outputs.experiment}}.get_key()'
    
    _code = _code.replace("{{params.project_name}}", str(project_name))
    _code = _code.replace("{{params.workspace}}", str(workspace))
    _code = _code.replace("{{params.api_key_env}}", str(api_key_env))
    _code = _code.replace("{{params.auto_log}}", str(auto_log))
    _code = _code.replace("{{outputs.experiment}}", "_out_experiment")
    _code = _code.replace("{{outputs.experiment_key}}", "_out_experiment_key")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"experiment": _ns.get("_out_experiment"), "experiment_key": _ns.get("_out_experiment_key")}


def log_metric(value=None, key='loss', step=0, backend='mlflow'):
    """Log a scalar metric value to the active experiment tracker
    
    Args:
        value (number) (required): 
    
    Parameters:
        key (string, default='loss'): 
        step (number, default=0): 
        backend (select, default='mlflow'): 
    """
    _imports = []
    _code = 'if "{{params.backend}}" == "mlflow":\n    import mlflow\n    mlflow.log_metric("{{params.key}}", {{inputs.value}}, step={{params.step}})\nelif "{{params.backend}}" == "wandb":\n    import wandb\n    wandb.log({"{{params.key}}": {{inputs.value}}}, step={{params.step}})\n "else":\n    import comet_ml\n    comet_ml.get_global_experiment().log_metric("{{params.key}}", {{inputs.value}}, step={{params.step}})'
    
    _code = _code.replace("{{params.key}}", str(key))
    _code = _code.replace("{{params.step}}", str(step))
    _code = _code.replace("{{params.backend}}", str(backend))
    _code = _code.replace("{{inputs.value}}", "value")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["value"] = value
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def log_artifact(artifact_path=None, name='artifact', artifact_type='file', backend='mlflow'):
    """Log a file or directory as an artifact to the experiment tracker
    
    Args:
        artifact_path (path) (required): 
    
    Parameters:
        name (string, default='artifact'): 
        artifact_type (string, default='file'): 
        backend (select, default='mlflow'): 
    """
    _imports = ['import os']
    _code = 'if "{{params.backend}}" == "mlflow":\n    import mlflow\n    if os.path.isdir({{inputs.artifact_path}}):\n        mlflow.log_artifacts({{inputs.artifact_path}}, artifact_path="{{params.name}}")\n "else":\n        mlflow.log_artifact({{inputs.artifact_path}})\nelif "{{params.backend}}" == "wandb":\n    import wandb\n    _art = wandb.Artifact("{{params.name}}", type="{{params.artifact_type}}")\n    if os.path.isdir({{inputs.artifact_path}}):\n        _art.add_dir({{inputs.artifact_path}})\n "else":\n        _art.add_file({{inputs.artifact_path}})\n    wandb.log_artifact(_art)\n "else":\n    import comet_ml\n    _exp = comet_ml.get_global_experiment()\n    if os.path.isdir({{inputs.artifact_path}}):\n        _exp.log_asset_folder({{inputs.artifact_path}}, log_file_name="{{params.name}}")\n "else":\n        _exp.log_asset({{inputs.artifact_path}}, file_name="{{params.name}}")'
    
    _code = _code.replace("{{params.name}}", str(name))
    _code = _code.replace("{{params.artifact_type}}", str(artifact_type))
    _code = _code.replace("{{params.backend}}", str(backend))
    _code = _code.replace("{{inputs.artifact_path}}", "artifact_path")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["artifact_path"] = artifact_path
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def log_config(config=None, backend='mlflow'):
    """Log hyperparameters and configuration to the experiment tracker
    
    Args:
        config (dict) (required): 
    
    Parameters:
        backend (select, default='mlflow'): 
    """
    _imports = []
    _code = 'if "{{params.backend}}" == "mlflow":\n    import mlflow\n    mlflow.log_params({{inputs.config}})\nelif "{{params.backend}}" == "wandb":\n    import wandb\n    wandb.config.update({{inputs.config}})\n "else":\n    import comet_ml\n    comet_ml.get_global_experiment().log_parameters({{inputs.config}})'
    
    _code = _code.replace("{{params.backend}}", str(backend))
    _code = _code.replace("{{inputs.config}}", "config")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["config"] = config
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def log_model(model=None, name='model', backend='mlflow'):
    """Log a trained model to the experiment tracker for versioning and deployment
    
    Args:
        model (model) (required): 
    
    Parameters:
        name (string, default='model'): 
        backend (select, default='mlflow'): 
    
    Returns:
        text: 
    """
    _imports = []
    _code = 'if "{{params.backend}}" == "mlflow":\n    import mlflow.pytorch\n    _info = mlflow.pytorch.log_model({{inputs.model}}, artifact_path="{{params.name}}")\n    {{outputs.model_uri}} = _info.model_uri\n "else":\n    import wandb\n    import torch, tempfile, os\n    _tmp = os.path.join(tempfile.mkdtemp(), "{{params.name}}.pt")\n    torch.save({{inputs.model}}.state_dict(), _tmp)\n    _art = wandb.Artifact("{{params.name}}", type="model")\n    _art.add_file(_tmp)\n    wandb.log_artifact(_art)\n    {{outputs.model_uri}} = _art.name'
    
    _code = _code.replace("{{params.name}}", str(name))
    _code = _code.replace("{{params.backend}}", str(backend))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.model_uri}}", "_out_model_uri")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model_uri")


def log_dataset(dataset_path=None, name='dataset', description='', backend='mlflow'):
    """Log dataset metadata and a reference to the experiment tracker for reproducibility
    
    Args:
        dataset_path (path) (required): 
    
    Parameters:
        name (string, default='dataset'): 
        description (string, default=''): 
        backend (select, default='mlflow'): 
    """
    _imports = []
    _code = 'if "{{params.backend}}" == "mlflow":\n    import mlflow\n    _ds = mlflow.data.from_pandas(\n        __import__("pandas").read_csv({{inputs.dataset_path}}) if {{inputs.dataset_path}}.endswith(".csv")\n        else __import__("pandas").read_parquet({{inputs.dataset_path}}),\n        name="{{params.name}}"\n    )\n    mlflow.log_input(_ds, context="training")\n "else":\n    import wandb\n    _art = wandb.Artifact("{{params.name}}", type="dataset", description="{{params.description}}")\n    _art.add_reference({{inputs.dataset_path}})\n    wandb.log_artifact(_art)'
    
    _code = _code.replace("{{params.name}}", str(name))
    _code = _code.replace("{{params.description}}", str(description))
    _code = _code.replace("{{params.backend}}", str(backend))
    _code = _code.replace("{{inputs.dataset_path}}", "dataset_path")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataset_path"] = dataset_path
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def log_media(media=None, key='media', media_type='image', caption='', backend='wandb'):
    """Log images, audio, or video media to the experiment tracker for visualization
    
    Args:
        media (any) (required): 
    
    Parameters:
        key (string, default='media'): 
        media_type (select, default='image'): 
        caption (string, default=''): 
        backend (select, default='wandb'): 
    """
    _imports = []
    _code = 'if "{{params.backend}}" == "wandb":\n    import wandb\n    if "{{params.media_type}}" == "image":\n        _media = wandb.Image({{inputs.media}}, caption="{{params.caption}}")\n    elif "{{params.media_type}}" == "audio":\n        _media = wandb.Audio({{inputs.media}}, caption="{{params.caption}}")\n    elif "{{params.media_type}}" == "video":\n        _media = wandb.Video({{inputs.media}}, caption="{{params.caption}}")\n "else":\n        _media = wandb.Table(data={{inputs.media}})\n    wandb.log({"{{params.key}}": _media})\n "else":\n    import mlflow\n    import tempfile, os\n    _tmp = os.path.join(tempfile.mkdtemp(), "{{params.key}}.png")\n    if hasattr({{inputs.media}}, "save"):\n        {{inputs.media}}.save(_tmp)\n "else":\n        import matplotlib.pyplot as plt\n        plt.imsave(_tmp, {{inputs.media}})\n    mlflow.log_artifact(_tmp)'
    
    _code = _code.replace("{{params.key}}", str(key))
    _code = _code.replace("{{params.media_type}}", str(media_type))
    _code = _code.replace("{{params.caption}}", str(caption))
    _code = _code.replace("{{params.backend}}", str(backend))
    _code = _code.replace("{{inputs.media}}", "media")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["media"] = media
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def compare_runs(run_ids=None, metrics='loss,accuracy', backend='mlflow'):
    """Compare metrics and parameters across multiple experiment runs
    
    Dependencies: pip install pandas
    
    Args:
        run_ids (list) (required): 
    
    Parameters:
        metrics (string, default='loss,accuracy'): 
        backend (select, default='mlflow'): 
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '_metrics_list = [m.strip() for m in "{{params.metrics}}".split(",")]\n_rows = []\nif "{{params.backend}}" == "mlflow":\n    import mlflow\n    for _rid in {{inputs.run_ids}}:\n        _run = mlflow.get_run(_rid)\n        _row = {"run_id": _rid, **{ "m": _run.data.metrics.get(m) for m in _metrics_list}, **_run.data.params}\n        _rows.append(_row)\n "else":\n    import wandb\n    _api = wandb.Api()\n    for _rid in {{inputs.run_ids}}:\n        _run = _api.run(_rid)\n        _row = {"run_id": _rid, **{ "m": _run.summary.get(m) for m in _metrics_list}, **dict(_run.config)}\n        _rows.append(_row)\n{{outputs.comparison}} = pd.DataFrame(_rows)'
    
    _code = _code.replace("{{params.metrics}}", str(metrics))
    _code = _code.replace("{{params.backend}}", str(backend))
    _code = _code.replace("{{inputs.run_ids}}", "run_ids")
    _code = _code.replace("{{outputs.comparison}}", "_out_comparison")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["run_ids"] = run_ids
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_comparison")


def sweep_grid(train_fn=None, param_grid='{"lr": [0.001, 0.01, 0.1], "batch_size": [16, 32]}', metric_name='loss', direction='minimize'):
    """Perform a grid search over all combinations of hyperparameter values
    
    Args:
        train_fn (any) (required): Callable(config) -> metric
    
    Parameters:
        param_grid (json, default='{"lr": [0.001, 0.01, 0.1], "batch_size": [16, 32]}'): 
        metric_name (string, default='loss'): 
        direction (select, default='minimize'): 
    
    Returns:
        dict with keys:
            results (list): 
            best_config (dict): 
    """
    _imports = ['import itertools', 'import json']
    _code = '_grid = json.loads(\'{{params.param_grid}}\')\n_keys = list(_grid.keys())\n_results = []\n_best_val = float("inf") if "{{params.direction}}" == "minimize" else float("-inf")\n_best_cfg = None\nfor _vals in itertools.product(*[_grid[k] for k in _keys]):\n    _cfg = dict(zip(_keys, _vals))\n    _metric = {{inputs.train_fn}}(_cfg)\n    _results.append({**_cfg, "{{params.metric_name}}": _metric})\n    if ("{{params.direction}}" == "minimize" and _metric < _best_val) or ("{{params.direction}}" == "maximize" and _metric > _best_val):\n        _best_val = _metric\n        _best_cfg = _cfg\n{{outputs.results}} = _results\n{{outputs.best_config}} = _best_cfg'
    
    _code = _code.replace("{{params.param_grid}}", str(param_grid))
    _code = _code.replace("{{params.metric_name}}", str(metric_name))
    _code = _code.replace("{{params.direction}}", str(direction))
    _code = _code.replace("{{inputs.train_fn}}", "train_fn")
    _code = _code.replace("{{outputs.results}}", "_out_results")
    _code = _code.replace("{{outputs.best_config}}", "_out_best_config")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["train_fn"] = train_fn
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"results": _ns.get("_out_results"), "best_config": _ns.get("_out_best_config")}


def sweep_random(train_fn=None, param_distributions='{"lr": {"low": 0.0001, "high": 0.1, "log": true}, "batch_size": {"choices": [16, 32, 64]}}', n_trials=20, metric_name='loss', direction='minimize', seed=42):
    """Perform random search over hyperparameter distributions
    
    Args:
        train_fn (any) (required): Callable(config) -> metric
    
    Parameters:
        param_distributions (json, default='{"lr": {"low": 0.0001, "high": 0.1, "log": true}, "batch_size": {"choices": [16, 32, 64]}}'): 
        n_trials (number, default=20): 
        metric_name (string, default='loss'): 
        direction (select, default='minimize'): 
        seed (number, default=42): 
    
    Returns:
        dict with keys:
            results (list): 
            best_config (dict): 
    """
    _imports = ['import random', 'import math', 'import json']
    _code = 'random.seed({{params.seed}})\n_dists = json.loads(\'{{params.param_distributions}}\')\ndef _sample(spec):\n    if "choices" in spec:\n        return random.choice(spec["choices"])\n    _low, _high = spec["low"], spec["high"]\n    if spec.get("log"):\n        return math.exp(random.uniform(math.log(_low), math.log(_high)))\n    return random.uniform(_low, _high)\n_results = []\n_best_val = float("inf") if "{{params.direction}}" == "minimize" else float("-inf")\n_best_cfg = None\nfor _ in range({{params.n_trials}}):\n    _cfg = { "k": _sample(v) for k, v in _dists.items()}\n    _metric = {{inputs.train_fn}}(_cfg)\n    _results.append({**_cfg, "{{params.metric_name}}": _metric})\n    if ("{{params.direction}}" == "minimize" and _metric < _best_val) or ("{{params.direction}}" == "maximize" and _metric > _best_val):\n        _best_val = _metric\n        _best_cfg = _cfg\n{{outputs.results}} = _results\n{{outputs.best_config}} = _best_cfg'
    
    _code = _code.replace("{{params.param_distributions}}", str(param_distributions))
    _code = _code.replace("{{params.n_trials}}", str(n_trials))
    _code = _code.replace("{{params.metric_name}}", str(metric_name))
    _code = _code.replace("{{params.direction}}", str(direction))
    _code = _code.replace("{{params.seed}}", str(seed))
    _code = _code.replace("{{inputs.train_fn}}", "train_fn")
    _code = _code.replace("{{outputs.results}}", "_out_results")
    _code = _code.replace("{{outputs.best_config}}", "_out_best_config")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["train_fn"] = train_fn
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"results": _ns.get("_out_results"), "best_config": _ns.get("_out_best_config")}


def sweep_bayesian(train_fn=None, n_trials=50, direction='minimize', study_name='bayesian-sweep', seed=42):
    """Perform Bayesian hyperparameter optimization using Optuna's TPE sampler
    
    Dependencies: pip install optuna
    
    Args:
        train_fn (any) (required): Callable(trial) -> metric
    
    Parameters:
        n_trials (number, default=50): 
        direction (select, default='minimize'): 
        study_name (string, default='bayesian-sweep'): 
        seed (number, default=42): 
    
    Returns:
        dict with keys:
            study (any): 
            best_params (dict): 
            best_value (number): 
    """
    _imports = ['import optuna']
    _code = '_sampler = optuna.samplers.TPESampler(seed={{params.seed}})\n{{outputs.study}} = optuna.create_study(study_name="{{params.study_name}}", direction="{{params.direction}}", sampler=_sampler)\n{{outputs.study}}.optimize({{inputs.train_fn}}, n_trials={{params.n_trials}})\n{{outputs.best_params}} = {{outputs.study}}.best_params\n{{outputs.best_value}} = {{outputs.study}}.best_value'
    
    _code = _code.replace("{{params.n_trials}}", str(n_trials))
    _code = _code.replace("{{params.direction}}", str(direction))
    _code = _code.replace("{{params.study_name}}", str(study_name))
    _code = _code.replace("{{params.seed}}", str(seed))
    _code = _code.replace("{{inputs.train_fn}}", "train_fn")
    _code = _code.replace("{{outputs.study}}", "_out_study")
    _code = _code.replace("{{outputs.best_params}}", "_out_best_params")
    _code = _code.replace("{{outputs.best_value}}", "_out_best_value")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["train_fn"] = train_fn
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"study": _ns.get("_out_study"), "best_params": _ns.get("_out_best_params"), "best_value": _ns.get("_out_best_value")}


def optuna_suggest(trial=None, search_space='[{"name": "lr", "type": "float", "low": 1e-5, "high": 1e-1, "log": true}, {"name": "batch_size", "type": "categorical", "choices": [16, 32, 64]}]'):
    """Define hyperparameter search spaces using Optuna's suggest API for use inside objectives
    
    Args:
        trial (any) (required): 
    
    Parameters:
        search_space (json, default='[{"name": "lr", "type": "float", "low": 1e-5, "high": 1e-1, "log": true}, {"name": "batch_size", "type": "categorical", "choices": [16, 32, 64]}]'): 
    
    Returns:
        dict: 
    """
    _imports = ['import json']
    _code = '_space = json.loads(\'{{params.search_space}}\')\n_config = {}\nfor _p in _space:\n    if _p["type"] == "float":\n        _config[_p["name"]] = {{inputs.trial}}.suggest_float(_p["name"], _p["low"], _p["high"], log=_p.get("log", False))\n    elif _p["type"] == "int":\n        _config[_p["name"]] = {{inputs.trial}}.suggest_int(_p["name"], _p["low"], _p["high"], step=_p.get("step", 1))\n    elif _p["type"] == "categorical":\n        _config[_p["name"]] = {{inputs.trial}}.suggest_categorical(_p["name"], _p["choices"])\n{{outputs.config}} = _config'
    
    _code = _code.replace("{{params.search_space}}", str(search_space))
    _code = _code.replace("{{inputs.trial}}", "trial")
    _code = _code.replace("{{outputs.config}}", "_out_config")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["trial"] = trial
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_config")


def ray_tune(train_fn=None, search_space='{"lr": {"type": "loguniform", "low": 1e-5, "high": 1e-1}, "batch_size": {"type": "choice", "values": [16, 32, 64]}}', num_samples=20, metric='loss', mode='min', scheduler='asha', cpus_per_trial=1, gpus_per_trial=0):
    """Run distributed hyperparameter tuning using Ray Tune with configurable schedulers
    
    Dependencies: pip install ray[tune]
    
    Args:
        train_fn (any) (required): Callable(config) that reports metrics via ray.tune.report
    
    Parameters:
        search_space (json, default='{"lr": {"type": "loguniform", "low": 1e-5, "high": 1e-1}, "batch_size": {"type": "choice", "values": [16, 32, 64]}}'): 
        num_samples (number, default=20): 
        metric (string, default='loss'): 
        mode (select, default='min'): 
        scheduler (select, default='asha'): 
        cpus_per_trial (number, default=1): 
        gpus_per_trial (number, default=0): 
    
    Returns:
        dict with keys:
            results (any): 
            best_config (dict): 
    """
    _imports = ['from ray import tune', 'from ray.tune.schedulers import ASHAScheduler, HyperBandScheduler', 'import json']
    _code = '_raw_space = json.loads(\'{{params.search_space}}\')\n_space = {}\nfor _k, _v in _raw_space.items():\n    if _v["type"] == "loguniform":\n        _space[_k] = tune.loguniform(_v["low"], _v["high"])\n    elif _v["type"] == "uniform":\n        _space[_k] = tune.uniform(_v["low"], _v["high"])\n    elif _v["type"] == "choice":\n        _space[_k] = tune.choice(_v["values"])\n    elif _v["type"] == "randint":\n        _space[_k] = tune.randint(_v["low"], _v["high"])\n_scheduler = None\nif "{{params.scheduler}}" == "asha":\n    _scheduler = ASHAScheduler(metric="{{params.metric}}", mode="{{params.mode}}")\nelif "{{params.scheduler}}" == "hyperband":\n    _scheduler = HyperBandScheduler(metric="{{params.metric}}", mode="{{params.mode}}")\n{{outputs.results}} = tune.run(\n    {{inputs.train_fn}},\n    config=_space,\n    num_samples={{params.num_samples}},\n    scheduler=_scheduler,\n    resources_per_trial={"cpu": {{params.cpus_per_trial}}, "gpu": {{params.gpus_per_trial}}},\n)\n{{outputs.best_config}} = {{outputs.results}}.get_best_config(metric="{{params.metric}}", mode="{{params.mode}}")'
    
    _code = _code.replace("{{params.search_space}}", str(search_space))
    _code = _code.replace("{{params.num_samples}}", str(num_samples))
    _code = _code.replace("{{params.metric}}", str(metric))
    _code = _code.replace("{{params.mode}}", str(mode))
    _code = _code.replace("{{params.scheduler}}", str(scheduler))
    _code = _code.replace("{{params.cpus_per_trial}}", str(cpus_per_trial))
    _code = _code.replace("{{params.gpus_per_trial}}", str(gpus_per_trial))
    _code = _code.replace("{{inputs.train_fn}}", "train_fn")
    _code = _code.replace("{{outputs.results}}", "_out_results")
    _code = _code.replace("{{outputs.best_config}}", "_out_best_config")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["train_fn"] = train_fn
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"results": _ns.get("_out_results"), "best_config": _ns.get("_out_best_config")}


def ab_experiment(metrics_a=None, metrics_b=None, test='t-test', alpha=0.05, n_bootstrap=10000):
    """Run a statistical A/B test comparing two model variants with significance testing
    
    Dependencies: pip install numpy scipy
    
    Args:
        metrics_a (array) (required): Array of metric values for variant A
        metrics_b (array) (required): Array of metric values for variant B
    
    Parameters:
        test (select, default='t-test'): 
        alpha (number, default=0.05): 
        n_bootstrap (number, default=10000): 
    
    Returns:
        dict with keys:
            report (dict): 
            significant (boolean): 
    """
    _imports = ['import numpy as np', 'from scipy import stats']
    _code = '_a = np.array({{inputs.metrics_a}})\n_b = np.array({{inputs.metrics_b}})\n_mean_a, _mean_b = _a.mean(), _b.mean()\n_diff = _mean_b - _mean_a\nif "{{params.test}}" == "t-test":\n    _stat, _pval = stats.ttest_ind(_a, _b)\nelif "{{params.test}}" == "mann-whitney":\n    _stat, _pval = stats.mannwhitneyu(_a, _b, alternative="two-sided")\n "else":\n    _combined = np.concatenate([_a, _b])\n    _n_a = len(_a)\n    _diffs = []\n    for _ in range({{params.n_bootstrap}}):\n        np.random.shuffle(_combined)\n        _diffs.append(_combined[:_n_a].mean() - _combined[_n_a:].mean())\n    _diffs = np.array(_diffs)\n    _pval = (np.abs(_diffs) >= np.abs(_diff)).mean()\n    _stat = _diff\n{{outputs.significant}} = float(_pval) < {{params.alpha}}\n{{outputs.report}} = {"mean_a": float(_mean_a), "mean_b": float(_mean_b), "diff": float(_diff), "statistic": float(_stat), "p_value": float(_pval), "alpha": {{params.alpha}}, "significant": {{outputs.significant}}, "test": "{{params.test}}"}'
    
    _code = _code.replace("{{params.test}}", str(test))
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.n_bootstrap}}", str(n_bootstrap))
    _code = _code.replace("{{inputs.metrics_a}}", "metrics_a")
    _code = _code.replace("{{inputs.metrics_b}}", "metrics_b")
    _code = _code.replace("{{outputs.report}}", "_out_report")
    _code = _code.replace("{{outputs.significant}}", "_out_significant")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["metrics_a"] = metrics_a
    _ns["metrics_b"] = metrics_b
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"report": _ns.get("_out_report"), "significant": _ns.get("_out_significant")}

