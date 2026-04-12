"""
aiblocks.fine_tuning — Fine-Tuning

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def full_fine_tune(model=None, train_dataset=None, eval_dataset=None, lr=2e-05, epochs=3, batch_size=16, weight_decay=0.01, warmup_ratio=0.1):
    """Fine-tune all parameters of a pretrained model on a downstream task
    
    Dependencies: pip install transformers
    
    Args:
        model (model) (required): 
        train_dataset (dataset) (required): 
        eval_dataset (dataset): 
    
    Parameters:
        lr (number, default=2e-05): 
        epochs (number, default=3): 
        batch_size (number, default=16): 
        weight_decay (number, default=0.01): 
        warmup_ratio (number, default=0.1): 
    
    Returns:
        dict with keys:
            model_out (model): 
            metrics (dict): 
    """
    _imports = ['from transformers import Trainer, TrainingArguments']
    _code = '_training_args = TrainingArguments(\n    output_dir="./ft_output",\n    num_train_epochs={{params.epochs}},\n    per_device_train_batch_size={{params.batch_size}},\n    per_device_eval_batch_size={{params.batch_size}},\n    learning_rate={{params.lr}},\n    weight_decay={{params.weight_decay}},\n    warmup_ratio={{params.warmup_ratio}},\n    evaluation_strategy="epoch" if {{inputs.eval_dataset}} is not None else "no",\n    save_strategy="epoch",\n    logging_steps=50,\n    load_best_model_at_end=True if {{inputs.eval_dataset}} is not None else False,\n)\n_trainer = Trainer(\n    model={{inputs.model}},\n    args=_training_args,\n    train_dataset={{inputs.train_dataset}},\n    eval_dataset={{inputs.eval_dataset}},\n)\n{{outputs.metrics}} = _trainer.train().metrics\n{{outputs.model_out}} = _trainer.model'
    
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.epochs}}", str(epochs))
    _code = _code.replace("{{params.batch_size}}", str(batch_size))
    _code = _code.replace("{{params.weight_decay}}", str(weight_decay))
    _code = _code.replace("{{params.warmup_ratio}}", str(warmup_ratio))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.train_dataset}}", "train_dataset")
    _code = _code.replace("{{inputs.eval_dataset}}", "eval_dataset")
    _code = _code.replace("{{outputs.model_out}}", "_out_model_out")
    _code = _code.replace("{{outputs.metrics}}", "_out_metrics")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["train_dataset"] = train_dataset
    _ns["eval_dataset"] = eval_dataset
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model_out": _ns.get("_out_model_out"), "metrics": _ns.get("_out_metrics")}


def feature_extraction(model=None, freeze_pattern='base_model'):
    """Freeze all base model layers and only train the classification head
    
    Args:
        model (model) (required): 
    
    Parameters:
        freeze_pattern (string, default='base_model'): 
    
    Returns:
        dict with keys:
            model_out (model): 
            trainable_params (number): 
    """
    _imports = []
    _code = 'for _name, _param in {{inputs.model}}.named_parameters():\n    if "{{params.freeze_pattern}}" in _name:\n        _param.requires_grad = False\n{{outputs.trainable_params}} = sum(p.numel() for p in {{inputs.model}}.parameters() if p.requires_grad)\nprint(f"Trainable parameters: {{{outputs.trainable_params}}:}")\n{{outputs.model_out}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.freeze_pattern}}", str(freeze_pattern))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.model_out}}", "_out_model_out")
    _code = _code.replace("{{outputs.trainable_params}}", "_out_trainable_params")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model_out": _ns.get("_out_model_out"), "trainable_params": _ns.get("_out_trainable_params")}


def layer_wise_lr_decay(model=None, base_lr=2e-05, decay_factor=0.8, layer_key='layer'):
    """Apply discriminative learning rates that decrease for earlier (deeper) layers
    
    Args:
        model (model) (required): 
    
    Parameters:
        base_lr (number, default=2e-05): 
        decay_factor (number, default=0.8): 
        layer_key (string, default='layer'): 
    
    Returns:
        list: 
    """
    _imports = ['import re']
    _code = '_lr_map = {}\n_max_layer = 0\nfor _name, _param in {{inputs.model}}.named_parameters():\n    _match = re.search(r"{{params.layer_key}}\\\\.(\\d+)", _name)\n    if _match:\n        _layer_idx = int(_match.group(1))\n        _max_layer = max(_max_layer, _layer_idx)\n        _lr_map[_name] = _layer_idx\n "else":\n        _lr_map[_name] = _max_layer + 1\n\n{{outputs.param_groups}} = []\nfor _name, _param in {{inputs.model}}.named_parameters():\n    if not _param.requires_grad:\n        continue\n    _depth = _max_layer + 1 - _lr_map.get(_name, 0)\n    _lr = {{params.base_lr}} * ({{params.decay_factor}} ** _depth)\n    {{outputs.param_groups}}.append({"params": [_param], "lr": _lr, "name": _name})\nprint(f"Created {len({{outputs.param_groups}})} parameter groups with LR decay")'
    
    _code = _code.replace("{{params.base_lr}}", str(base_lr))
    _code = _code.replace("{{params.decay_factor}}", str(decay_factor))
    _code = _code.replace("{{params.layer_key}}", str(layer_key))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.param_groups}}", "_out_param_groups")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_param_groups")


def linear_probe(model=None, num_classes=10, hidden_dim=768):
    """Attach a linear classification head to a frozen pretrained model
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        num_classes (number, default=10): 
        hidden_dim (number, default=768): Size of backbone output features
    
    Returns:
        model: 
    """
    _imports = ['import torch.nn as nn']
    _code = 'for _param in {{inputs.model}}.parameters():\n    _param.requires_grad = False\n\nclass _LinearProbe(nn.Module):\n    def __init__(self, backbone, hidden_dim, num_classes):\n        super().__init__()\n        self.backbone = backbone\n        self.classifier = nn.Linear(hidden_dim, num_classes)\n    def forward(self, x):\n        with torch.no_grad():\n            features = self.backbone(x)\n            if hasattr(features, "last_hidden_state"):\n                features = features.last_hidden_state[:, 0]\n            elif hasattr(features, "pooler_output"):\n                features = features.pooler_output\n        return self.classifier(features)\n\nimport torch\n{{outputs.probe_model}} = _LinearProbe({{inputs.model}}, {{params.hidden_dim}}, {{params.num_classes}})'
    
    _code = _code.replace("{{params.num_classes}}", str(num_classes))
    _code = _code.replace("{{params.hidden_dim}}", str(hidden_dim))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.probe_model}}", "_out_probe_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_probe_model")


def lora(model=None, r=16, alpha=32, dropout=0.05, target_modules='q_proj,v_proj', bias='none'):
    """Apply LoRA adapters to a model for parameter-efficient fine-tuning
    
    Dependencies: pip install peft
    
    Args:
        model (model) (required): 
    
    Parameters:
        r (number, default=16): 
        alpha (number, default=32): 
        dropout (number, default=0.05): 
        target_modules (string, default='q_proj,v_proj'): 
        bias (select, default='none'): 
    
    Returns:
        dict with keys:
            peft_model (model): 
            trainable_params (number): 
    """
    _imports = ['from peft import get_peft_model, LoraConfig, TaskType']
    _code = '_lora_config = LoraConfig(\n    r={{params.r}},\n    lora_alpha={{params.alpha}},\n    lora_dropout={{params.dropout}},\n    target_modules=[m.strip() for m in "{{params.target_modules}}".split(",")],\n    bias="{{params.bias}}",\n    task_type=TaskType.CAUSAL_LM\n)\n{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _lora_config)\n{{outputs.trainable_params}} = sum(p.numel() for p in {{outputs.peft_model}}.parameters() if p.requires_grad)\n{{outputs.peft_model}}.print_trainable_parameters()'
    
    _code = _code.replace("{{params.r}}", str(r))
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{params.target_modules}}", str(target_modules))
    _code = _code.replace("{{params.bias}}", str(bias))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.peft_model}}", "_out_peft_model")
    _code = _code.replace("{{outputs.trainable_params}}", "_out_trainable_params")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"peft_model": _ns.get("_out_peft_model"), "trainable_params": _ns.get("_out_trainable_params")}


def qlora(model_id=None, r=16, alpha=32, dropout=0.05, target_modules='q_proj,k_proj,v_proj,o_proj', quant_type='nf4', double_quant=True):
    """Quantized LoRA — load model in 4-bit and apply LoRA for memory-efficient fine-tuning
    
    Dependencies: pip install peft torch transformers
    
    Args:
        model_id (text) (required): HuggingFace model ID
    
    Parameters:
        r (number, default=16): 
        alpha (number, default=32): 
        dropout (number, default=0.05): 
        target_modules (string, default='q_proj,k_proj,v_proj,o_proj'): 
        quant_type (select, default='nf4'): 
        double_quant (boolean, default=True): 
    
    Returns:
        dict with keys:
            peft_model (model): 
            tokenizer (tokenizer): 
    """
    _imports = ['import torch', 'from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig', 'from peft import get_peft_model, LoraConfig, prepare_model_for_kbit_training, TaskType']
    _code = '_bnb_config = BitsAndBytesConfig(\n    load_in_4bit=True,\n    bnb_4bit_quant_type="{{params.quant_type}}",\n    bnb_4bit_compute_dtype=torch.bfloat16,\n    bnb_4bit_use_double_quant={{params.double_quant}}\n)\n_base_model = AutoModelForCausalLM.from_pretrained(\n    {{inputs.model_id}}, quantization_config=_bnb_config, device_map="auto"\n)\n_base_model = prepare_model_for_kbit_training(_base_model)\n_qlora_config = LoraConfig(\n    r={{params.r}}, lora_alpha={{params.alpha}}, lora_dropout={{params.dropout}},\n    target_modules=[m.strip() for m in "{{params.target_modules}}".split(",")],\n    bias="none", task_type=TaskType.CAUSAL_LM\n)\n{{outputs.peft_model}} = get_peft_model(_base_model, _qlora_config)\n{{outputs.tokenizer}} = AutoTokenizer.from_pretrained({{inputs.model_id}})\n{{outputs.peft_model}}.print_trainable_parameters()'
    
    _code = _code.replace("{{params.r}}", str(r))
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{params.target_modules}}", str(target_modules))
    _code = _code.replace("{{params.quant_type}}", str(quant_type))
    _code = _code.replace("{{params.double_quant}}", str(double_quant))
    _code = _code.replace("{{inputs.model_id}}", "model_id")
    _code = _code.replace("{{outputs.peft_model}}", "_out_peft_model")
    _code = _code.replace("{{outputs.tokenizer}}", "_out_tokenizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model_id"] = model_id
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"peft_model": _ns.get("_out_peft_model"), "tokenizer": _ns.get("_out_tokenizer")}


def lora_plus(model=None, r=16, alpha=32, lr_a=0.0001, lr_b=0.001, target_modules='q_proj,v_proj'):
    """LoRA+ variant with different learning rates for A and B matrices for faster convergence
    
    Dependencies: pip install peft
    
    Args:
        model (model) (required): 
    
    Parameters:
        r (number, default=16): 
        alpha (number, default=32): 
        lr_a (number, default=0.0001): 
        lr_b (number, default=0.001): 
        target_modules (string, default='q_proj,v_proj'): 
    
    Returns:
        dict with keys:
            peft_model (model): 
            param_groups (list): 
    """
    _imports = ['from peft import get_peft_model, LoraConfig, TaskType']
    _code = '_lora_cfg = LoraConfig(\n    r={{params.r}}, lora_alpha={{params.alpha}}, lora_dropout=0.05,\n    target_modules=[m.strip() for m in "{{params.target_modules}}".split(",")],\n    bias="none", task_type=TaskType.CAUSAL_LM\n)\n{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _lora_cfg)\n_a_params, _b_params, _other_params = [], [], []\nfor _name, _param in {{outputs.peft_model}}.named_parameters():\n    if not _param.requires_grad:\n        continue\n    if "lora_A" in _name:\n        _a_params.append(_param)\n    elif "lora_B" in _name:\n        _b_params.append(_param)\n "else":\n        _other_params.append(_param)\n{{outputs.param_groups}} = [\n    {"params": _a_params, "lr": {{params.lr_a}}},\n    {"params": _b_params, "lr": {{params.lr_b}}},\n    {"params": _other_params, "lr": {{params.lr_a}}}]'
    
    _code = _code.replace("{{params.r}}", str(r))
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.lr_a}}", str(lr_a))
    _code = _code.replace("{{params.lr_b}}", str(lr_b))
    _code = _code.replace("{{params.target_modules}}", str(target_modules))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.peft_model}}", "_out_peft_model")
    _code = _code.replace("{{outputs.param_groups}}", "_out_param_groups")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"peft_model": _ns.get("_out_peft_model"), "param_groups": _ns.get("_out_param_groups")}


def dora(model=None, r=16, alpha=32, dropout=0.05, target_modules='q_proj,v_proj'):
    """Weight-Decomposed Low-Rank Adaptation — decomposes weight into magnitude and direction for better fine-tuning
    
    Dependencies: pip install peft
    
    Args:
        model (model) (required): 
    
    Parameters:
        r (number, default=16): 
        alpha (number, default=32): 
        dropout (number, default=0.05): 
        target_modules (string, default='q_proj,v_proj'): 
    
    Returns:
        model: 
    """
    _imports = ['from peft import get_peft_model, LoraConfig, TaskType']
    _code = '_dora_config = LoraConfig(\n    r={{params.r}},\n    lora_alpha={{params.alpha}},\n    lora_dropout={{params.dropout}},\n    target_modules=[m.strip() for m in "{{params.target_modules}}".split(",")],\n    use_dora=True,\n    bias="none",\n    task_type=TaskType.CAUSAL_LM\n)\n{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _dora_config)\n{{outputs.peft_model}}.print_trainable_parameters()'
    
    _code = _code.replace("{{params.r}}", str(r))
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{params.target_modules}}", str(target_modules))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.peft_model}}", "_out_peft_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_peft_model")


def ia3(model=None, target_modules='k_proj,v_proj,down_proj', feedforward_modules='down_proj'):
    """Infused Adapter by Inhibiting and Amplifying Inner Activations — extremely parameter-efficient
    
    Dependencies: pip install peft
    
    Args:
        model (model) (required): 
    
    Parameters:
        target_modules (string, default='k_proj,v_proj,down_proj'): 
        feedforward_modules (string, default='down_proj'): 
    
    Returns:
        model: 
    """
    _imports = ['from peft import get_peft_model, IA3Config, TaskType']
    _code = '_ia3_config = IA3Config(\n    target_modules=[m.strip() for m in "{{params.target_modules}}".split(",")],\n    feedforward_modules=[m.strip() for m in "{{params.feedforward_modules}}".split(",")],\n    task_type=TaskType.CAUSAL_LM\n)\n{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _ia3_config)\n{{outputs.peft_model}}.print_trainable_parameters()'
    
    _code = _code.replace("{{params.target_modules}}", str(target_modules))
    _code = _code.replace("{{params.feedforward_modules}}", str(feedforward_modules))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.peft_model}}", "_out_peft_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_peft_model")


def prefix_tuning(model=None, num_virtual_tokens=20, prefix_projection=True, encoder_hidden_size=512):
    """Prepend trainable prefix vectors to each transformer layer's key/value pairs
    
    Dependencies: pip install peft
    
    Args:
        model (model) (required): 
    
    Parameters:
        num_virtual_tokens (number, default=20): 
        prefix_projection (boolean, default=True): 
        encoder_hidden_size (number, default=512): 
    
    Returns:
        model: 
    """
    _imports = ['from peft import get_peft_model, PrefixTuningConfig, TaskType']
    _code = '_prefix_config = PrefixTuningConfig(\n    task_type=TaskType.CAUSAL_LM,\n    num_virtual_tokens={{params.num_virtual_tokens}},\n    prefix_projection={{params.prefix_projection}},\n    encoder_hidden_size={{params.encoder_hidden_size}} if {{params.prefix_projection}} else None\n)\n{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _prefix_config)\n{{outputs.peft_model}}.print_trainable_parameters()'
    
    _code = _code.replace("{{params.num_virtual_tokens}}", str(num_virtual_tokens))
    _code = _code.replace("{{params.prefix_projection}}", str(prefix_projection))
    _code = _code.replace("{{params.encoder_hidden_size}}", str(encoder_hidden_size))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.peft_model}}", "_out_peft_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_peft_model")


def prompt_tuning(model=None, num_virtual_tokens=20, init_method='TEXT', init_text='Classify the following text:'):
    """Learn soft prompt embeddings prepended to the input while freezing the model
    
    Dependencies: pip install peft
    
    Args:
        model (model) (required): 
    
    Parameters:
        num_virtual_tokens (number, default=20): 
        init_method (select, default='TEXT'): 
        init_text (string, default='Classify the following text:'): 
    
    Returns:
        model: 
    """
    _imports = ['from peft import get_peft_model, PromptTuningConfig, PromptTuningInit, TaskType']
    _code = '_pt_init = PromptTuningInit.TEXT if "{{params.init_method}}" == "TEXT" else PromptTuningInit.RANDOM\n_pt_config = PromptTuningConfig(\n    task_type=TaskType.CAUSAL_LM,\n    num_virtual_tokens={{params.num_virtual_tokens}},\n    prompt_tuning_init=_pt_init,\n    prompt_tuning_init_text="{{params.init_text}}" if _pt_init == PromptTuningInit.TEXT else None,\n    tokenizer_name_or_path={{inputs.model}}.config._name_or_path if hasattr({{inputs.model}}.config, "_name_or_path") else None\n)\n{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _pt_config)\n{{outputs.peft_model}}.print_trainable_parameters()'
    
    _code = _code.replace("{{params.num_virtual_tokens}}", str(num_virtual_tokens))
    _code = _code.replace("{{params.init_method}}", str(init_method))
    _code = _code.replace("{{params.init_text}}", str(init_text))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.peft_model}}", "_out_peft_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_peft_model")


def adapter_houlsby(model=None, bottleneck_dim=64, non_linearity='relu', scaling=1.0):
    """Insert Houlsby-style bottleneck adapter layers between transformer sublayers
    
    Dependencies: pip install peft
    
    Args:
        model (model) (required): 
    
    Parameters:
        bottleneck_dim (number, default=64): 
        non_linearity (select, default='relu'): 
        scaling (number, default=1.0): 
    
    Returns:
        model: 
    """
    _imports = ['from peft import get_peft_model', 'from peft import BottleneckConfig']
    _code = '_adapter_config = BottleneckConfig(\n    bottleneck_size={{params.bottleneck_dim}},\n    non_linearity="{{params.non_linearity}}",\n    adapter_dropout=0.1,\n    scaling={{params.scaling}},\n)\n{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _adapter_config)\n{{outputs.peft_model}}.print_trainable_parameters()'
    
    _code = _code.replace("{{params.bottleneck_dim}}", str(bottleneck_dim))
    _code = _code.replace("{{params.non_linearity}}", str(non_linearity))
    _code = _code.replace("{{params.scaling}}", str(scaling))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.peft_model}}", "_out_peft_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_peft_model")


def bitfit(model=None, include_layernorm=True):
    """Fine-tune only the bias terms of a pretrained model — extremely parameter-efficient
    
    Args:
        model (model) (required): 
    
    Parameters:
        include_layernorm (boolean, default=True): 
    
    Returns:
        dict with keys:
            model_out (model): 
            trainable_params (number): 
    """
    _imports = []
    _code = 'for _name, _param in {{inputs.model}}.named_parameters():\n    _param.requires_grad = False\n    if "bias" in _name:\n        _param.requires_grad = True\n    if {{params.include_layernorm}} and ("LayerNorm" in _name or "layernorm" in _name or "layer_norm" in _name):\n        _param.requires_grad = True\n{{outputs.trainable_params}} = sum(p.numel() for p in {{inputs.model}}.parameters() if p.requires_grad)\n_total_params = sum(p.numel() for p in {{inputs.model}}.parameters())\nprint(f"BitFit: {{{outputs.trainable_params}}:} / { "_total_params":} trainable ({100*{{outputs.trainable_params}}/_total_params:.2f}%)")\n{{outputs.model_out}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.include_layernorm}}", str(include_layernorm))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.model_out}}", "_out_model_out")
    _code = _code.replace("{{outputs.trainable_params}}", "_out_trainable_params")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model_out": _ns.get("_out_model_out"), "trainable_params": _ns.get("_out_trainable_params")}


def peft_config(method='lora', task_type='CAUSAL_LM', r=16, num_virtual_tokens=20):
    """Create a generic PEFT configuration object for flexible adapter method selection
    
    Dependencies: pip install peft
    
    Parameters:
        method (select, default='lora'): 
        task_type (select, default='CAUSAL_LM'): 
        r (number, default=16): 
        num_virtual_tokens (number, default=20): 
    
    Returns:
        config: 
    """
    _imports = ['from peft import LoraConfig, PrefixTuningConfig, PromptTuningConfig, IA3Config, TaskType']
    _code = '_task = getattr(TaskType, "{{params.task_type}}")\nif "{{params.method}}" == "lora":\n    {{outputs.peft_config}} = LoraConfig(r={{params.r}}, lora_alpha={{params.r}} * 2, task_type=_task)\nelif "{{params.method}}" == "prefix":\n    {{outputs.peft_config}} = PrefixTuningConfig(num_virtual_tokens={{params.num_virtual_tokens}}, task_type=_task)\nelif "{{params.method}}" == "prompt":\n    {{outputs.peft_config}} = PromptTuningConfig(num_virtual_tokens={{params.num_virtual_tokens}}, task_type=_task)\nelif "{{params.method}}" == "ia3":\n    {{outputs.peft_config}} = IA3Config(task_type=_task)'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.task_type}}", str(task_type))
    _code = _code.replace("{{params.r}}", str(r))
    _code = _code.replace("{{params.num_virtual_tokens}}", str(num_virtual_tokens))
    _code = _code.replace("{{outputs.peft_config}}", "_out_peft_config")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_peft_config")


def merge_lora(peft_model=None, safe_merge=True, save_path=''):
    """Merge LoRA adapter weights into the base model for deployment without adapter overhead
    
    Args:
        peft_model (model) (required): 
    
    Parameters:
        safe_merge (boolean, default=True): 
        save_path (string, default=''): 
    
    Returns:
        model: 
    """
    _imports = []
    _code = '{{outputs.merged_model}} = {{inputs.peft_model}}.merge_and_unload(safe_merge={{params.safe_merge}})\nprint("LoRA weights merged into base model.")\nif "{{params.save_path}}":\n    {{outputs.merged_model}}.save_pretrained("{{params.save_path}}")\n    print(f"Merged model saved to {{params.save_path}}")'
    
    _code = _code.replace("{{params.safe_merge}}", str(safe_merge))
    _code = _code.replace("{{params.save_path}}", str(save_path))
    _code = _code.replace("{{inputs.peft_model}}", "peft_model")
    _code = _code.replace("{{outputs.merged_model}}", "_out_merged_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["peft_model"] = peft_model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_merged_model")


def instruction_dataset(dataset=None, instruction_col='instruction', input_col='input', output_col='output', template='alpaca'):
    """Format a dataset into instruction-following format (instruction, input, output) for SFT
    
    Args:
        dataset (dataset) (required): 
    
    Parameters:
        instruction_col (string, default='instruction'): 
        input_col (string, default='input'): 
        output_col (string, default='output'): 
        template (select, default='alpaca'): 
    
    Returns:
        dataset: 
    """
    _imports = []
    _code = '_templates = {\n    "alpaca": "Below is an instruction that describes a task.\\\\n\\\\n### Instruction:\\\\n{instruction}\\\\n\\\\n### Input:\\\\n{input}\\\\n\\\\n### Response:\\\\n{output}",\n    "chatml": "<|im_start|>user\\\\n{instruction}\\\\n{input}<|im_end|>\\\\n<|im_start|>assistant\\\\n{output}<|im_end|>",\n    "vicuna": "USER: {instruction}\\\\n{input}\\\\nASSISTANT: {output}"\n}\n_tmpl = _templates["{{params.template}}"]\n\ndef _format_row(row):\n    return {"text": _tmpl.format(\n        instruction=row.get("{{params.instruction_col}}", ""),\n        input=row.get("{{params.input_col}}", ""),\n        output=row.get("{{params.output_col}}", "")\n    )}\n{{outputs.formatted_dataset}} = {{inputs.dataset}}.map(_format_row)'
    
    _code = _code.replace("{{params.instruction_col}}", str(instruction_col))
    _code = _code.replace("{{params.input_col}}", str(input_col))
    _code = _code.replace("{{params.output_col}}", str(output_col))
    _code = _code.replace("{{params.template}}", str(template))
    _code = _code.replace("{{inputs.dataset}}", "dataset")
    _code = _code.replace("{{outputs.formatted_dataset}}", "_out_formatted_dataset")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataset"] = dataset
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_formatted_dataset")


def chat_template(dataset=None, tokenizer=None, messages_col='messages', max_length=2048, add_generation_prompt=False):
    """Apply a chat template (ChatML, Llama, etc.) to conversation-format data for fine-tuning
    
    Args:
        dataset (dataset) (required): Dataset with 'messages' column
        tokenizer (tokenizer) (required): 
    
    Parameters:
        messages_col (string, default='messages'): 
        max_length (number, default=2048): 
        add_generation_prompt (boolean, default=False): 
    
    Returns:
        dataset: 
    """
    _imports = []
    _code = 'def _apply_chat_template(row):\n    _messages = row["{{params.messages_col}}"]\n    _text = {{inputs.tokenizer}}.apply_chat_template(\n        _messages,\n        tokenize=False,\n        add_generation_prompt={{params.add_generation_prompt}}\n    )\n    _tokenized = {{inputs.tokenizer}}(\n        _text,\n        truncation=True,\n        max_length={{params.max_length}},\n        padding=False,\n        return_tensors=None\n    )\n    _tokenized["labels"] = _tokenized["input_ids"].copy()\n    return _tokenized\n{{outputs.formatted_dataset}} = {{inputs.dataset}}.map(_apply_chat_template, remove_columns={{inputs.dataset}}.column_names)'
    
    _code = _code.replace("{{params.messages_col}}", str(messages_col))
    _code = _code.replace("{{params.max_length}}", str(max_length))
    _code = _code.replace("{{params.add_generation_prompt}}", str(add_generation_prompt))
    _code = _code.replace("{{inputs.dataset}}", "dataset")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{outputs.formatted_dataset}}", "_out_formatted_dataset")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataset"] = dataset
    _ns["tokenizer"] = tokenizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_formatted_dataset")


def dpo(model=None, ref_model=None, train_dataset=None, tokenizer=None, beta=0.1, lr=5e-07, epochs=1, batch_size=4, max_length=1024, loss_type='sigmoid'):
    """Train a language model using Direct Preference Optimization on preference pairs
    
    Dependencies: pip install trl
    
    Args:
        model (model) (required): 
        ref_model (model): Frozen reference model (uses model copy if not provided)
        train_dataset (dataset) (required): Must have prompt, chosen, rejected columns
        tokenizer (tokenizer) (required): 
    
    Parameters:
        beta (number, default=0.1): 
        lr (number, default=5e-07): 
        epochs (number, default=1): 
        batch_size (number, default=4): 
        max_length (number, default=1024): 
        loss_type (select, default='sigmoid'): 
    
    Returns:
        dict with keys:
            model_out (model): 
            metrics (dict): 
    """
    _imports = ['from trl import DPOTrainer, DPOConfig']
    _code = '_dpo_config = DPOConfig(\n    output_dir="./dpo_output",\n    beta={{params.beta}},\n    learning_rate={{params.lr}},\n    num_train_epochs={{params.epochs}},\n    per_device_train_batch_size={{params.batch_size}},\n    max_length={{params.max_length}},\n    loss_type="{{params.loss_type}}",\n    logging_steps=10,\n    save_strategy="epoch",\n)\n_dpo_trainer = DPOTrainer(\n    model={{inputs.model}},\n    ref_model={{inputs.ref_model}},\n    args=_dpo_config,\n    train_dataset={{inputs.train_dataset}},\n    tokenizer={{inputs.tokenizer}},\n)\n{{outputs.metrics}} = _dpo_trainer.train().metrics\n{{outputs.model_out}} = _dpo_trainer.model'
    
    _code = _code.replace("{{params.beta}}", str(beta))
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.epochs}}", str(epochs))
    _code = _code.replace("{{params.batch_size}}", str(batch_size))
    _code = _code.replace("{{params.max_length}}", str(max_length))
    _code = _code.replace("{{params.loss_type}}", str(loss_type))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.ref_model}}", "ref_model")
    _code = _code.replace("{{inputs.train_dataset}}", "train_dataset")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{outputs.model_out}}", "_out_model_out")
    _code = _code.replace("{{outputs.metrics}}", "_out_metrics")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["ref_model"] = ref_model
    _ns["train_dataset"] = train_dataset
    _ns["tokenizer"] = tokenizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model_out": _ns.get("_out_model_out"), "metrics": _ns.get("_out_metrics")}


def ppo(model=None, ref_model=None, reward_model=None, tokenizer=None, dataset=None, lr=1.41e-05, batch_size=16, mini_batch_size=4, ppo_epochs=4, kl_penalty='kl', max_new_tokens=128):
    """Proximal Policy Optimization training loop for RLHF alignment
    
    Dependencies: pip install torch trl
    
    Args:
        model (model) (required): 
        ref_model (model): 
        reward_model (model) (required): 
        tokenizer (tokenizer) (required): 
        dataset (dataset) (required): 
    
    Parameters:
        lr (number, default=1.41e-05): 
        batch_size (number, default=16): 
        mini_batch_size (number, default=4): 
        ppo_epochs (number, default=4): 
        kl_penalty (select, default='kl'): 
        max_new_tokens (number, default=128): 
    
    Returns:
        dict with keys:
            model_out (model): 
            stats (dict): 
    """
    _imports = ['from trl import PPOTrainer, PPOConfig, AutoModelForCausalLMWithValueHead', 'import torch']
    _code = '_ppo_config = PPOConfig(\n    learning_rate={{params.lr}},\n    batch_size={{params.batch_size}},\n    mini_batch_size={{params.mini_batch_size}},\n    ppo_epochs={{params.ppo_epochs}},\n    kl_penalty="{{params.kl_penalty}}",\n)\n_ppo_model = AutoModelForCausalLMWithValueHead.from_pretrained({{inputs.model}})\n_ppo_trainer = PPOTrainer(\n    config=_ppo_config,\n    model=_ppo_model,\n    ref_model={{inputs.ref_model}},\n    tokenizer={{inputs.tokenizer}},\n    dataset={{inputs.dataset}},\n)\nfor _batch in _ppo_trainer.dataloader:\n    _query_tensors = [{{inputs.tokenizer}}.encode(q, return_tensors="pt").squeeze() for q in _batch["query"]]\n    _response_tensors = [_ppo_trainer.generate(qt, max_new_tokens={{params.max_new_tokens}}).squeeze() for qt in _query_tensors]\n    _texts = [{{inputs.tokenizer}}.decode(r) for r in _response_tensors]\n    with torch.no_grad():\n        _rewards = [{{inputs.reward_model}}(t) for t in _texts]\n    {{outputs.stats}} = _ppo_trainer.step(_query_tensors, _response_tensors, _rewards)\n{{outputs.model_out}} = _ppo_trainer.model'
    
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.batch_size}}", str(batch_size))
    _code = _code.replace("{{params.mini_batch_size}}", str(mini_batch_size))
    _code = _code.replace("{{params.ppo_epochs}}", str(ppo_epochs))
    _code = _code.replace("{{params.kl_penalty}}", str(kl_penalty))
    _code = _code.replace("{{params.max_new_tokens}}", str(max_new_tokens))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.ref_model}}", "ref_model")
    _code = _code.replace("{{inputs.reward_model}}", "reward_model")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{inputs.dataset}}", "dataset")
    _code = _code.replace("{{outputs.model_out}}", "_out_model_out")
    _code = _code.replace("{{outputs.stats}}", "_out_stats")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["ref_model"] = ref_model
    _ns["reward_model"] = reward_model
    _ns["tokenizer"] = tokenizer
    _ns["dataset"] = dataset
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model_out": _ns.get("_out_model_out"), "stats": _ns.get("_out_stats")}


def grpo(model=None, tokenizer=None, train_dataset=None, lr=5e-07, epochs=1, batch_size=4, num_generations=4, max_completion_length=256, beta=0.04):
    """Group Relative Policy Optimization — reward-model-free alignment using group scoring
    
    Dependencies: pip install trl
    
    Args:
        model (model) (required): 
        tokenizer (tokenizer) (required): 
        train_dataset (dataset) (required): 
    
    Parameters:
        lr (number, default=5e-07): 
        epochs (number, default=1): 
        batch_size (number, default=4): 
        num_generations (number, default=4): 
        max_completion_length (number, default=256): 
        beta (number, default=0.04): 
    
    Returns:
        dict with keys:
            model_out (model): 
            metrics (dict): 
    """
    _imports = ['from trl import GRPOTrainer, GRPOConfig']
    _code = '_grpo_config = GRPOConfig(\n    output_dir="./grpo_output",\n    learning_rate={{params.lr}},\n    num_train_epochs={{params.epochs}},\n    per_device_train_batch_size={{params.batch_size}},\n    num_generations={{params.num_generations}},\n    max_completion_length={{params.max_completion_length}},\n    beta={{params.beta}},\n    logging_steps=10,\n)\n_grpo_trainer = GRPOTrainer(\n    model={{inputs.model}},\n    args=_grpo_config,\n    train_dataset={{inputs.train_dataset}},\n    processing_class={{inputs.tokenizer}},\n)\n{{outputs.metrics}} = _grpo_trainer.train().metrics\n{{outputs.model_out}} = _grpo_trainer.model'
    
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.epochs}}", str(epochs))
    _code = _code.replace("{{params.batch_size}}", str(batch_size))
    _code = _code.replace("{{params.num_generations}}", str(num_generations))
    _code = _code.replace("{{params.max_completion_length}}", str(max_completion_length))
    _code = _code.replace("{{params.beta}}", str(beta))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{inputs.train_dataset}}", "train_dataset")
    _code = _code.replace("{{outputs.model_out}}", "_out_model_out")
    _code = _code.replace("{{outputs.metrics}}", "_out_metrics")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["tokenizer"] = tokenizer
    _ns["train_dataset"] = train_dataset
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model_out": _ns.get("_out_model_out"), "metrics": _ns.get("_out_metrics")}


def orpo(model=None, train_dataset=None, tokenizer=None, lr=5e-06, beta=0.1, epochs=1, batch_size=4, max_length=1024):
    """Odds Ratio Preference Optimization — combines SFT and preference alignment in one step
    
    Dependencies: pip install trl
    
    Args:
        model (model) (required): 
        train_dataset (dataset) (required): Must have prompt, chosen, rejected columns
        tokenizer (tokenizer) (required): 
    
    Parameters:
        lr (number, default=5e-06): 
        beta (number, default=0.1): 
        epochs (number, default=1): 
        batch_size (number, default=4): 
        max_length (number, default=1024): 
    
    Returns:
        dict with keys:
            model_out (model): 
            metrics (dict): 
    """
    _imports = ['from trl import ORPOTrainer, ORPOConfig']
    _code = '_orpo_config = ORPOConfig(\n    output_dir="./orpo_output",\n    learning_rate={{params.lr}},\n    beta={{params.beta}},\n    num_train_epochs={{params.epochs}},\n    per_device_train_batch_size={{params.batch_size}},\n    max_length={{params.max_length}},\n    logging_steps=10,\n    save_strategy="epoch",\n)\n_orpo_trainer = ORPOTrainer(\n    model={{inputs.model}},\n    args=_orpo_config,\n    train_dataset={{inputs.train_dataset}},\n    tokenizer={{inputs.tokenizer}},\n)\n{{outputs.metrics}} = _orpo_trainer.train().metrics\n{{outputs.model_out}} = _orpo_trainer.model'
    
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.beta}}", str(beta))
    _code = _code.replace("{{params.epochs}}", str(epochs))
    _code = _code.replace("{{params.batch_size}}", str(batch_size))
    _code = _code.replace("{{params.max_length}}", str(max_length))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.train_dataset}}", "train_dataset")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{outputs.model_out}}", "_out_model_out")
    _code = _code.replace("{{outputs.metrics}}", "_out_metrics")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["train_dataset"] = train_dataset
    _ns["tokenizer"] = tokenizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model_out": _ns.get("_out_model_out"), "metrics": _ns.get("_out_metrics")}


def sft_trainer(model=None, train_dataset=None, eval_dataset=None, tokenizer=None, lr=2e-05, epochs=3, batch_size=8, max_seq_length=2048, packing=False, dataset_text_field='text'):
    """Supervised Fine-Tuning trainer from TRL for instruction-following models
    
    Dependencies: pip install trl
    
    Args:
        model (model) (required): 
        train_dataset (dataset) (required): 
        eval_dataset (dataset): 
        tokenizer (tokenizer) (required): 
    
    Parameters:
        lr (number, default=2e-05): 
        epochs (number, default=3): 
        batch_size (number, default=8): 
        max_seq_length (number, default=2048): 
        packing (boolean, default=False): Pack multiple examples into one sequence
        dataset_text_field (string, default='text'): 
    
    Returns:
        dict with keys:
            model_out (model): 
            metrics (dict): 
    """
    _imports = ['from trl import SFTTrainer, SFTConfig']
    _code = '_sft_config = SFTConfig(\n    output_dir="./sft_output",\n    learning_rate={{params.lr}},\n    num_train_epochs={{params.epochs}},\n    per_device_train_batch_size={{params.batch_size}},\n    max_seq_length={{params.max_seq_length}},\n    packing={{params.packing}},\n    dataset_text_field="{{params.dataset_text_field}}",\n    logging_steps=25,\n    save_strategy="epoch",\n    evaluation_strategy="epoch" if {{inputs.eval_dataset}} is not None else "no",\n)\n_sft_trainer = SFTTrainer(\n    model={{inputs.model}},\n    args=_sft_config,\n    train_dataset={{inputs.train_dataset}},\n    eval_dataset={{inputs.eval_dataset}},\n    tokenizer={{inputs.tokenizer}},\n)\n{{outputs.metrics}} = _sft_trainer.train().metrics\n{{outputs.model_out}} = _sft_trainer.model'
    
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.epochs}}", str(epochs))
    _code = _code.replace("{{params.batch_size}}", str(batch_size))
    _code = _code.replace("{{params.max_seq_length}}", str(max_seq_length))
    _code = _code.replace("{{params.packing}}", str(packing))
    _code = _code.replace("{{params.dataset_text_field}}", str(dataset_text_field))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.train_dataset}}", "train_dataset")
    _code = _code.replace("{{inputs.eval_dataset}}", "eval_dataset")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{outputs.model_out}}", "_out_model_out")
    _code = _code.replace("{{outputs.metrics}}", "_out_metrics")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["train_dataset"] = train_dataset
    _ns["eval_dataset"] = eval_dataset
    _ns["tokenizer"] = tokenizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model_out": _ns.get("_out_model_out"), "metrics": _ns.get("_out_metrics")}


def reward_model_train(model=None, train_dataset=None, eval_dataset=None, tokenizer=None, lr=1e-05, epochs=1, batch_size=8, max_length=512):
    """Train a reward model on human preference data for RLHF
    
    Dependencies: pip install transformers trl
    
    Args:
        model (model) (required): 
        train_dataset (dataset) (required): Must have chosen and rejected columns
        eval_dataset (dataset): 
        tokenizer (tokenizer) (required): 
    
    Parameters:
        lr (number, default=1e-05): 
        epochs (number, default=1): 
        batch_size (number, default=8): 
        max_length (number, default=512): 
    
    Returns:
        dict with keys:
            reward_model (model): 
            metrics (dict): 
    """
    _imports = ['from trl import RewardTrainer, RewardConfig', 'from transformers import AutoModelForSequenceClassification']
    _code = '_reward_base = AutoModelForSequenceClassification.from_pretrained(\n    {{inputs.model}}.config._name_or_path,\n    num_labels=1,\n    torch_dtype={{inputs.model}}.dtype\n)\n_reward_config = RewardConfig(\n    output_dir="./reward_model_output",\n    learning_rate={{params.lr}},\n    num_train_epochs={{params.epochs}},\n    per_device_train_batch_size={{params.batch_size}},\n    max_length={{params.max_length}},\n    logging_steps=25,\n    evaluation_strategy="epoch" if {{inputs.eval_dataset}} is not None else "no",\n    save_strategy="epoch",\n)\n_reward_trainer = RewardTrainer(\n    model=_reward_base,\n    args=_reward_config,\n    train_dataset={{inputs.train_dataset}},\n    eval_dataset={{inputs.eval_dataset}},\n    tokenizer={{inputs.tokenizer}},\n)\n{{outputs.metrics}} = _reward_trainer.train().metrics\n{{outputs.reward_model}} = _reward_trainer.model'
    
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.epochs}}", str(epochs))
    _code = _code.replace("{{params.batch_size}}", str(batch_size))
    _code = _code.replace("{{params.max_length}}", str(max_length))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.train_dataset}}", "train_dataset")
    _code = _code.replace("{{inputs.eval_dataset}}", "eval_dataset")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{outputs.reward_model}}", "_out_reward_model")
    _code = _code.replace("{{outputs.metrics}}", "_out_metrics")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["train_dataset"] = train_dataset
    _ns["eval_dataset"] = eval_dataset
    _ns["tokenizer"] = tokenizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"reward_model": _ns.get("_out_reward_model"), "metrics": _ns.get("_out_metrics")}


def constitutional_ai_filter(model=None, tokenizer=None, dataset=None, principles='[\n  "Please choose the response that is most helpful, honest, and harmless.",\n  "Please choose the response that is least toxic or offensive.",\n  "Please choose the response that best refuses to engage in harmful activities."\n]', prompt_col='prompt', response_col='response', max_new_tokens=256):
    """Apply Constitutional AI principles to filter and revise model outputs for safety
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        tokenizer (tokenizer) (required): 
        dataset (dataset) (required): Dataset with prompt/response columns
    
    Parameters:
        principles (code, default='[\n  "Please choose the response that is most helpful, honest, and harmless.",\n  "Please choose the response that is least toxic or offensive.",\n  "Please choose the response that best refuses to engage in harmful activities."\n]'): JSON list of constitutional principles
        prompt_col (string, default='prompt'): 
        response_col (string, default='response'): 
        max_new_tokens (number, default=256): 
    
    Returns:
        dataset: 
    """
    _imports = ['import json', 'import torch']
    _code = '_principles = json.loads("""{{params.principles}}""")\n\ndef _critique_and_revise(row):\n    _prompt = row["{{params.prompt_col}}"]\n    _response = row["{{params.response_col}}"]\n    _revised = _response\n    for _principle in _principles:\n        _critique_prompt = f"Human: {_prompt}\\\\n\\\\nAssistant: {_revised}\\\\n\\\\nCritique Request: {_principle}\\\\n\\\\nCritique:"\n        _inputs = {{inputs.tokenizer}}(_critique_prompt, return_tensors="pt", truncation=True, max_length=1024)\n        with torch.no_grad():\n            _out = {{inputs.model}}.generate(**_inputs, max_new_tokens={{params.max_new_tokens}}, do_sample=False)\n        _critique = {{inputs.tokenizer}}.decode(_out[0][_inputs["input_ids"].shape[1]:], skip_special_tokens=True)\n        _revise_prompt = f"{_critique_prompt}{_critique}\\\\n\\\\nRevision Request: Based on the critique, rewrite the response.\\\\n\\\\nRevision:"\n        _rev_inputs = {{inputs.tokenizer}}(_revise_prompt, return_tensors="pt", truncation=True, max_length=1024)\n        with torch.no_grad():\n            _rev_out = {{inputs.model}}.generate(**_rev_inputs, max_new_tokens={{params.max_new_tokens}}, do_sample=False)\n        _revised = {{inputs.tokenizer}}.decode(_rev_out[0][_rev_inputs["input_ids"].shape[1]:], skip_special_tokens=True)\n    return {"{{params.prompt_col}}": _prompt, "{{params.response_col}}": _revised, "original_response": _response}\n\n{{outputs.filtered_dataset}} = {{inputs.dataset}}.map(_critique_and_revise)'
    
    _code = _code.replace("{{params.principles}}", str(principles))
    _code = _code.replace("{{params.prompt_col}}", str(prompt_col))
    _code = _code.replace("{{params.response_col}}", str(response_col))
    _code = _code.replace("{{params.max_new_tokens}}", str(max_new_tokens))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{inputs.dataset}}", "dataset")
    _code = _code.replace("{{outputs.filtered_dataset}}", "_out_filtered_dataset")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["tokenizer"] = tokenizer
    _ns["dataset"] = dataset
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_filtered_dataset")


def rlaif(judge_model=None, judge_tokenizer=None, dataset=None, prompt_col='prompt', response_a_col='response_a', response_b_col='response_b', judge_prompt="You are a helpful assistant that evaluates responses. Given a prompt and two responses A and B, output 'A' if response A is better, or 'B' if response B is better.", max_new_tokens=8, batch_size=4):
    """Reinforcement Learning from AI Feedback — use an LLM to generate preference labels for training
    
    Dependencies: pip install torch
    
    Args:
        judge_model (model) (required): 
        judge_tokenizer (tokenizer) (required): 
        dataset (dataset) (required): Must have prompt, response_a, response_b columns
    
    Parameters:
        prompt_col (string, default='prompt'): 
        response_a_col (string, default='response_a'): 
        response_b_col (string, default='response_b'): 
        judge_prompt (code, default="You are a helpful assistant that evaluates responses. Given a prompt and two responses A and B, output 'A' if response A is better, or 'B' if response B is better."): 
        max_new_tokens (number, default=8): 
        batch_size (number, default=4): 
    
    Returns:
        dataset: 
    """
    _imports = ['import torch']
    _code = 'def _judge_preference(batch):\n    _results = {"prompt": [], "chosen": [], "rejected": []}\n    for _i in range(len(batch["{{params.prompt_col}}"])):\n        _p = batch["{{params.prompt_col}}"][_i]\n        _ra = batch["{{params.response_a_col}}"][_i]\n        _rb = batch["{{params.response_b_col}}"][_i]\n        _judge_input = f"{{params.judge_prompt}}\\\\n\\\\nPrompt: {_p}\\\\n\\\\nResponse A: {_ra}\\\\n\\\\nResponse B: {_rb}\\\\n\\\\nWhich is better (A or B)?"\n        _inputs = {{inputs.judge_tokenizer}}(_judge_input, return_tensors="pt", truncation=True, max_length=2048)\n        with torch.no_grad():\n            _out = {{inputs.judge_model}}.generate(**_inputs, max_new_tokens={{params.max_new_tokens}}, do_sample=False)\n        _verdict = {{inputs.judge_tokenizer}}.decode(_out[0][_inputs["input_ids"].shape[1]:], skip_special_tokens=True).strip()\n        _results["prompt"].append(_p)\n        if "A" in _verdict.upper()[:3]:\n            _results["chosen"].append(_ra)\n            _results["rejected"].append(_rb)\n "else":\n            _results["chosen"].append(_rb)\n            _results["rejected"].append(_ra)\n    return _results\n\n{{outputs.preference_dataset}} = {{inputs.dataset}}.map(\n    _judge_preference, batched=True, batch_size={{params.batch_size}},\n    remove_columns={{inputs.dataset}}.column_names\n)\nprint(f"Generated {len({{outputs.preference_dataset}})} preference pairs via RLAIF")'
    
    _code = _code.replace("{{params.prompt_col}}", str(prompt_col))
    _code = _code.replace("{{params.response_a_col}}", str(response_a_col))
    _code = _code.replace("{{params.response_b_col}}", str(response_b_col))
    _code = _code.replace("{{params.judge_prompt}}", str(judge_prompt))
    _code = _code.replace("{{params.max_new_tokens}}", str(max_new_tokens))
    _code = _code.replace("{{params.batch_size}}", str(batch_size))
    _code = _code.replace("{{inputs.judge_model}}", "judge_model")
    _code = _code.replace("{{inputs.judge_tokenizer}}", "judge_tokenizer")
    _code = _code.replace("{{inputs.dataset}}", "dataset")
    _code = _code.replace("{{outputs.preference_dataset}}", "_out_preference_dataset")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["judge_model"] = judge_model
    _ns["judge_tokenizer"] = judge_tokenizer
    _ns["dataset"] = dataset
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_preference_dataset")

