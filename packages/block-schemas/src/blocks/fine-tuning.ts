import type { BlockDefinition } from "../types.js";

export const fineTuningBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Full Fine-Tune
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.full-fine-tune",
    name: "Full Fine-Tune",
    category: "fine-tuning",
    description: "Fine-tune all parameters of a pretrained model on a downstream task",
    tags: ["fine-tuning", "full", "all-parameters", "transfer-learning", "transformers"],
    inputs: [
      { id: "model", name: "Pretrained Model", type: "model", required: true },
      { id: "train_dataset", name: "Training Dataset", type: "dataset", required: true },
      { id: "eval_dataset", name: "Eval Dataset", type: "dataset", required: false },
    ],
    outputs: [
      { id: "model_out", name: "Fine-Tuned Model", type: "model", required: true },
      { id: "metrics", name: "Training Metrics", type: "dict", required: true },
    ],
    parameters: [
      { id: "lr", name: "Learning Rate", type: "number", default: 2e-5, min: 0, max: 0.01, step: 1e-6 },
      { id: "epochs", name: "Epochs", type: "number", default: 3, min: 1, max: 100, step: 1 },
      { id: "batch_size", name: "Batch Size", type: "number", default: 16, min: 1, step: 1 },
      { id: "weight_decay", name: "Weight Decay", type: "number", default: 0.01, min: 0, max: 1, step: 0.001 },
      { id: "warmup_ratio", name: "Warmup Ratio", type: "number", default: 0.1, min: 0, max: 1, step: 0.01 },
    ],
    codeTemplate: {
      imports: ["from transformers import Trainer, TrainingArguments"],
      body: `_training_args = TrainingArguments(
    output_dir="./ft_output",
    num_train_epochs={{params.epochs}},
    per_device_train_batch_size={{params.batch_size}},
    per_device_eval_batch_size={{params.batch_size}},
    learning_rate={{params.lr}},
    weight_decay={{params.weight_decay}},
    warmup_ratio={{params.warmup_ratio}},
    evaluation_strategy="epoch" if {{inputs.eval_dataset}} is not None else "no",
    save_strategy="epoch",
    logging_steps=50,
    load_best_model_at_end=True if {{inputs.eval_dataset}} is not None else False,
)
_trainer = Trainer(
    model={{inputs.model}},
    args=_training_args,
    train_dataset={{inputs.train_dataset}},
    eval_dataset={{inputs.eval_dataset}},
)
{{outputs.metrics}} = _trainer.train().metrics
{{outputs.model_out}} = _trainer.model`,
      outputBindings: { model_out: "fine_tuned_model", metrics: "ft_metrics" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Feature Extraction (Freeze Base)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.feature-extraction",
    name: "Feature Extraction (Freeze Base)",
    category: "fine-tuning",
    description: "Freeze all base model layers and only train the classification head",
    tags: ["fine-tuning", "feature-extraction", "freeze", "transfer-learning"],
    inputs: [
      { id: "model", name: "Pretrained Model", type: "model", required: true },
    ],
    outputs: [
      { id: "model_out", name: "Frozen Model", type: "model", required: true },
      { id: "trainable_params", name: "Trainable Parameters", type: "number", required: true },
    ],
    parameters: [
      { id: "freeze_pattern", name: "Freeze Pattern", type: "string", default: "base_model", placeholder: "Substring to match layers to freeze" },
    ],
    codeTemplate: {
      imports: [],
      body: `for _name, _param in {{inputs.model}}.named_parameters():
    if "{{params.freeze_pattern}}" in _name:
        _param.requires_grad = False
{{outputs.trainable_params}} = sum(p.numel() for p in {{inputs.model}}.parameters() if p.requires_grad)
print(f"Trainable parameters: {{{outputs.trainable_params}}:,}")
{{outputs.model_out}} = {{inputs.model}}`,
      outputBindings: { model_out: "frozen_model", trainable_params: "trainable_count" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Layer-wise LR Decay
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.layer-wise-lr-decay",
    name: "Layer-wise LR Decay",
    category: "fine-tuning",
    description: "Apply discriminative learning rates that decrease for earlier (deeper) layers",
    tags: ["fine-tuning", "learning-rate", "discriminative", "layer-wise", "decay"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "param_groups", name: "Parameter Groups", type: "list", required: true },
    ],
    parameters: [
      { id: "base_lr", name: "Base Learning Rate", type: "number", default: 2e-5, min: 0, max: 0.01, step: 1e-6 },
      { id: "decay_factor", name: "Decay Factor", type: "number", default: 0.8, min: 0.1, max: 1.0, step: 0.05 },
      { id: "layer_key", name: "Layer Name Key", type: "string", default: "layer", placeholder: "Key to detect layer index" },
    ],
    codeTemplate: {
      imports: ["import re"],
      body: `_lr_map = {}
_max_layer = 0
for _name, _param in {{inputs.model}}.named_parameters():
    _match = re.search(r"{{params.layer_key}}\\.(\d+)", _name)
    if _match:
        _layer_idx = int(_match.group(1))
        _max_layer = max(_max_layer, _layer_idx)
        _lr_map[_name] = _layer_idx
    else:
        _lr_map[_name] = _max_layer + 1

{{outputs.param_groups}} = []
for _name, _param in {{inputs.model}}.named_parameters():
    if not _param.requires_grad:
        continue
    _depth = _max_layer + 1 - _lr_map.get(_name, 0)
    _lr = {{params.base_lr}} * ({{params.decay_factor}} ** _depth)
    {{outputs.param_groups}}.append({"params": [_param], "lr": _lr, "name": _name})
print(f"Created {len({{outputs.param_groups}})} parameter groups with LR decay")`,
      outputBindings: { param_groups: "layerwise_param_groups" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Linear Probe
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.linear-probe",
    name: "Linear Probe",
    category: "fine-tuning",
    description: "Attach a linear classification head to a frozen pretrained model",
    tags: ["fine-tuning", "linear-probe", "classification", "frozen", "evaluation"],
    inputs: [
      { id: "model", name: "Pretrained Backbone", type: "model", required: true },
    ],
    outputs: [
      { id: "probe_model", name: "Model with Linear Probe", type: "model", required: true },
    ],
    parameters: [
      { id: "num_classes", name: "Number of Classes", type: "number", default: 10, min: 2, step: 1 },
      { id: "hidden_dim", name: "Hidden Dimension", type: "number", default: 768, min: 1, step: 1, description: "Size of backbone output features" },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `for _param in {{inputs.model}}.parameters():
    _param.requires_grad = False

class _LinearProbe(nn.Module):
    def __init__(self, backbone, hidden_dim, num_classes):
        super().__init__()
        self.backbone = backbone
        self.classifier = nn.Linear(hidden_dim, num_classes)
    def forward(self, x):
        with torch.no_grad():
            features = self.backbone(x)
            if hasattr(features, "last_hidden_state"):
                features = features.last_hidden_state[:, 0]
            elif hasattr(features, "pooler_output"):
                features = features.pooler_output
        return self.classifier(features)

import torch
{{outputs.probe_model}} = _LinearProbe({{inputs.model}}, {{params.hidden_dim}}, {{params.num_classes}})`,
      outputBindings: { probe_model: "linear_probe_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. LoRA (Low-Rank Adaptation)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.lora",
    name: "LoRA (Low-Rank Adaptation)",
    category: "fine-tuning",
    description: "Apply LoRA adapters to a model for parameter-efficient fine-tuning",
    tags: ["fine-tuning", "lora", "peft", "parameter-efficient", "adapters"],
    inputs: [
      { id: "model", name: "Base Model", type: "model", required: true },
    ],
    outputs: [
      { id: "peft_model", name: "LoRA Model", type: "model", required: true },
      { id: "trainable_params", name: "Trainable Parameters", type: "number", required: true },
    ],
    parameters: [
      { id: "r", name: "LoRA Rank (r)", type: "number", default: 16, min: 1, max: 256, step: 1 },
      { id: "alpha", name: "LoRA Alpha", type: "number", default: 32, min: 1, max: 512, step: 1 },
      { id: "dropout", name: "LoRA Dropout", type: "number", default: 0.05, min: 0, max: 0.5, step: 0.01 },
      { id: "target_modules", name: "Target Modules", type: "string", default: "q_proj,v_proj", placeholder: "Comma-separated module names" },
      { id: "bias", name: "Bias", type: "select", default: "none", options: [{ label: "None", value: "none" }, { label: "All", value: "all" }, { label: "LoRA Only", value: "lora_only" }] },
    ],
    codeTemplate: {
      imports: ["from peft import get_peft_model, LoraConfig, TaskType"],
      body: `_lora_config = LoraConfig(
    r={{params.r}},
    lora_alpha={{params.alpha}},
    lora_dropout={{params.dropout}},
    target_modules=[m.strip() for m in "{{params.target_modules}}".split(",")],
    bias="{{params.bias}}",
    task_type=TaskType.CAUSAL_LM
)
{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _lora_config)
{{outputs.trainable_params}} = sum(p.numel() for p in {{outputs.peft_model}}.parameters() if p.requires_grad)
{{outputs.peft_model}}.print_trainable_parameters()`,
      outputBindings: { peft_model: "lora_model", trainable_params: "lora_trainable" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. QLoRA
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.qlora",
    name: "QLoRA",
    category: "fine-tuning",
    description: "Quantized LoRA — load model in 4-bit and apply LoRA for memory-efficient fine-tuning",
    tags: ["fine-tuning", "qlora", "quantization", "4bit", "peft", "bitsandbytes"],
    inputs: [
      { id: "model_id", name: "Model ID", type: "text", required: true, description: "HuggingFace model ID" },
    ],
    outputs: [
      { id: "peft_model", name: "QLoRA Model", type: "model", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    parameters: [
      { id: "r", name: "LoRA Rank (r)", type: "number", default: 16, min: 1, max: 256, step: 1 },
      { id: "alpha", name: "LoRA Alpha", type: "number", default: 32, min: 1, max: 512, step: 1 },
      { id: "dropout", name: "LoRA Dropout", type: "number", default: 0.05, min: 0, max: 0.5, step: 0.01 },
      { id: "target_modules", name: "Target Modules", type: "string", default: "q_proj,k_proj,v_proj,o_proj", placeholder: "Comma-separated" },
      { id: "quant_type", name: "Quantization Type", type: "select", default: "nf4", options: [{ label: "NF4", value: "nf4" }, { label: "FP4", value: "fp4" }] },
      { id: "double_quant", name: "Double Quantization", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import torch", "from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig", "from peft import get_peft_model, LoraConfig, prepare_model_for_kbit_training, TaskType"],
      body: `_bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="{{params.quant_type}}",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant={{params.double_quant}}
)
_base_model = AutoModelForCausalLM.from_pretrained(
    {{inputs.model_id}}, quantization_config=_bnb_config, device_map="auto"
)
_base_model = prepare_model_for_kbit_training(_base_model)
_qlora_config = LoraConfig(
    r={{params.r}}, lora_alpha={{params.alpha}}, lora_dropout={{params.dropout}},
    target_modules=[m.strip() for m in "{{params.target_modules}}".split(",")],
    bias="none", task_type=TaskType.CAUSAL_LM
)
{{outputs.peft_model}} = get_peft_model(_base_model, _qlora_config)
{{outputs.tokenizer}} = AutoTokenizer.from_pretrained({{inputs.model_id}})
{{outputs.peft_model}}.print_trainable_parameters()`,
      outputBindings: { peft_model: "qlora_model", tokenizer: "qlora_tokenizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. LoRA+ Config
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.lora-plus",
    name: "LoRA+ Config",
    category: "fine-tuning",
    description: "LoRA+ variant with different learning rates for A and B matrices for faster convergence",
    tags: ["fine-tuning", "lora-plus", "peft", "parameter-efficient"],
    inputs: [
      { id: "model", name: "Base Model", type: "model", required: true },
    ],
    outputs: [
      { id: "peft_model", name: "LoRA+ Model", type: "model", required: true },
      { id: "param_groups", name: "Parameter Groups", type: "list", required: true },
    ],
    parameters: [
      { id: "r", name: "LoRA Rank (r)", type: "number", default: 16, min: 1, max: 256, step: 1 },
      { id: "alpha", name: "LoRA Alpha", type: "number", default: 32, min: 1, max: 512, step: 1 },
      { id: "lr_a", name: "LR for Matrix A", type: "number", default: 1e-4, min: 0, max: 0.01, step: 1e-5 },
      { id: "lr_b", name: "LR for Matrix B", type: "number", default: 1e-3, min: 0, max: 0.1, step: 1e-4 },
      { id: "target_modules", name: "Target Modules", type: "string", default: "q_proj,v_proj", placeholder: "Comma-separated" },
    ],
    codeTemplate: {
      imports: ["from peft import get_peft_model, LoraConfig, TaskType"],
      body: `_lora_cfg = LoraConfig(
    r={{params.r}}, lora_alpha={{params.alpha}}, lora_dropout=0.05,
    target_modules=[m.strip() for m in "{{params.target_modules}}".split(",")],
    bias="none", task_type=TaskType.CAUSAL_LM
)
{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _lora_cfg)
_a_params, _b_params, _other_params = [], [], []
for _name, _param in {{outputs.peft_model}}.named_parameters():
    if not _param.requires_grad:
        continue
    if "lora_A" in _name:
        _a_params.append(_param)
    elif "lora_B" in _name:
        _b_params.append(_param)
    else:
        _other_params.append(_param)
{{outputs.param_groups}} = [
    {"params": _a_params, "lr": {{params.lr_a}}},
    {"params": _b_params, "lr": {{params.lr_b}}},
    {"params": _other_params, "lr": {{params.lr_a}}},
]`,
      outputBindings: { peft_model: "lora_plus_model", param_groups: "lora_plus_groups" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. DoRA
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.dora",
    name: "DoRA",
    category: "fine-tuning",
    description: "Weight-Decomposed Low-Rank Adaptation — decomposes weight into magnitude and direction for better fine-tuning",
    tags: ["fine-tuning", "dora", "peft", "parameter-efficient", "weight-decomposition"],
    inputs: [
      { id: "model", name: "Base Model", type: "model", required: true },
    ],
    outputs: [
      { id: "peft_model", name: "DoRA Model", type: "model", required: true },
    ],
    parameters: [
      { id: "r", name: "LoRA Rank (r)", type: "number", default: 16, min: 1, max: 256, step: 1 },
      { id: "alpha", name: "LoRA Alpha", type: "number", default: 32, min: 1, max: 512, step: 1 },
      { id: "dropout", name: "Dropout", type: "number", default: 0.05, min: 0, max: 0.5, step: 0.01 },
      { id: "target_modules", name: "Target Modules", type: "string", default: "q_proj,v_proj", placeholder: "Comma-separated" },
    ],
    codeTemplate: {
      imports: ["from peft import get_peft_model, LoraConfig, TaskType"],
      body: `_dora_config = LoraConfig(
    r={{params.r}},
    lora_alpha={{params.alpha}},
    lora_dropout={{params.dropout}},
    target_modules=[m.strip() for m in "{{params.target_modules}}".split(",")],
    use_dora=True,
    bias="none",
    task_type=TaskType.CAUSAL_LM
)
{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _dora_config)
{{outputs.peft_model}}.print_trainable_parameters()`,
      outputBindings: { peft_model: "dora_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. IA3 Adapter
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.ia3",
    name: "IA3 Adapter",
    category: "fine-tuning",
    description: "Infused Adapter by Inhibiting and Amplifying Inner Activations — extremely parameter-efficient",
    tags: ["fine-tuning", "ia3", "peft", "parameter-efficient", "few-shot"],
    inputs: [
      { id: "model", name: "Base Model", type: "model", required: true },
    ],
    outputs: [
      { id: "peft_model", name: "IA3 Model", type: "model", required: true },
    ],
    parameters: [
      { id: "target_modules", name: "Target Modules", type: "string", default: "k_proj,v_proj,down_proj", placeholder: "Comma-separated" },
      { id: "feedforward_modules", name: "Feedforward Modules", type: "string", default: "down_proj", placeholder: "Comma-separated feedforward module names" },
    ],
    codeTemplate: {
      imports: ["from peft import get_peft_model, IA3Config, TaskType"],
      body: `_ia3_config = IA3Config(
    target_modules=[m.strip() for m in "{{params.target_modules}}".split(",")],
    feedforward_modules=[m.strip() for m in "{{params.feedforward_modules}}".split(",")],
    task_type=TaskType.CAUSAL_LM
)
{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _ia3_config)
{{outputs.peft_model}}.print_trainable_parameters()`,
      outputBindings: { peft_model: "ia3_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Prefix Tuning
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.prefix-tuning",
    name: "Prefix Tuning",
    category: "fine-tuning",
    description: "Prepend trainable prefix vectors to each transformer layer's key/value pairs",
    tags: ["fine-tuning", "prefix-tuning", "peft", "soft-prompt"],
    inputs: [
      { id: "model", name: "Base Model", type: "model", required: true },
    ],
    outputs: [
      { id: "peft_model", name: "Prefix-Tuned Model", type: "model", required: true },
    ],
    parameters: [
      { id: "num_virtual_tokens", name: "Number of Virtual Tokens", type: "number", default: 20, min: 1, max: 200, step: 1 },
      { id: "prefix_projection", name: "Use Prefix Projection (MLP)", type: "boolean", default: true },
      { id: "encoder_hidden_size", name: "Encoder Hidden Size", type: "number", default: 512, min: 32, step: 32, advanced: true },
    ],
    codeTemplate: {
      imports: ["from peft import get_peft_model, PrefixTuningConfig, TaskType"],
      body: `_prefix_config = PrefixTuningConfig(
    task_type=TaskType.CAUSAL_LM,
    num_virtual_tokens={{params.num_virtual_tokens}},
    prefix_projection={{params.prefix_projection}},
    encoder_hidden_size={{params.encoder_hidden_size}} if {{params.prefix_projection}} else None
)
{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _prefix_config)
{{outputs.peft_model}}.print_trainable_parameters()`,
      outputBindings: { peft_model: "prefix_tuned_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Prompt Tuning
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.prompt-tuning",
    name: "Prompt Tuning",
    category: "fine-tuning",
    description: "Learn soft prompt embeddings prepended to the input while freezing the model",
    tags: ["fine-tuning", "prompt-tuning", "peft", "soft-prompt"],
    inputs: [
      { id: "model", name: "Base Model", type: "model", required: true },
    ],
    outputs: [
      { id: "peft_model", name: "Prompt-Tuned Model", type: "model", required: true },
    ],
    parameters: [
      { id: "num_virtual_tokens", name: "Number of Virtual Tokens", type: "number", default: 20, min: 1, max: 200, step: 1 },
      { id: "init_method", name: "Initialization", type: "select", default: "TEXT", options: [{ label: "From Text", value: "TEXT" }, { label: "Random", value: "RANDOM" }] },
      { id: "init_text", name: "Init Text (if TEXT)", type: "string", default: "Classify the following text:", placeholder: "Initialization text" },
    ],
    codeTemplate: {
      imports: ["from peft import get_peft_model, PromptTuningConfig, PromptTuningInit, TaskType"],
      body: `_pt_init = PromptTuningInit.TEXT if "{{params.init_method}}" == "TEXT" else PromptTuningInit.RANDOM
_pt_config = PromptTuningConfig(
    task_type=TaskType.CAUSAL_LM,
    num_virtual_tokens={{params.num_virtual_tokens}},
    prompt_tuning_init=_pt_init,
    prompt_tuning_init_text="{{params.init_text}}" if _pt_init == PromptTuningInit.TEXT else None,
    tokenizer_name_or_path={{inputs.model}}.config._name_or_path if hasattr({{inputs.model}}.config, "_name_or_path") else None
)
{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _pt_config)
{{outputs.peft_model}}.print_trainable_parameters()`,
      outputBindings: { peft_model: "prompt_tuned_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Adapter Layer (Houlsby)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.adapter-houlsby",
    name: "Adapter Layer (Houlsby)",
    category: "fine-tuning",
    description: "Insert Houlsby-style bottleneck adapter layers between transformer sublayers",
    tags: ["fine-tuning", "adapter", "houlsby", "bottleneck", "peft"],
    inputs: [
      { id: "model", name: "Base Model", type: "model", required: true },
    ],
    outputs: [
      { id: "peft_model", name: "Adapter Model", type: "model", required: true },
    ],
    parameters: [
      { id: "bottleneck_dim", name: "Bottleneck Dimension", type: "number", default: 64, min: 8, max: 1024, step: 8 },
      { id: "non_linearity", name: "Non-linearity", type: "select", default: "relu", options: [{ label: "ReLU", value: "relu" }, { label: "GELU", value: "gelu" }, { label: "Tanh", value: "tanh" }] },
      { id: "scaling", name: "Adapter Scaling", type: "number", default: 1.0, min: 0.01, max: 10, step: 0.1 },
    ],
    codeTemplate: {
      imports: ["from peft import get_peft_model", "from peft import BottleneckConfig"],
      body: `_adapter_config = BottleneckConfig(
    bottleneck_size={{params.bottleneck_dim}},
    non_linearity="{{params.non_linearity}}",
    adapter_dropout=0.1,
    scaling={{params.scaling}},
)
{{outputs.peft_model}} = get_peft_model({{inputs.model}}, _adapter_config)
{{outputs.peft_model}}.print_trainable_parameters()`,
      outputBindings: { peft_model: "adapter_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. BitFit (Bias-only Tuning)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.bitfit",
    name: "BitFit (Bias-only Tuning)",
    category: "fine-tuning",
    description: "Fine-tune only the bias terms of a pretrained model — extremely parameter-efficient",
    tags: ["fine-tuning", "bitfit", "bias", "parameter-efficient", "minimal"],
    inputs: [
      { id: "model", name: "Base Model", type: "model", required: true },
    ],
    outputs: [
      { id: "model_out", name: "BitFit Model", type: "model", required: true },
      { id: "trainable_params", name: "Trainable Parameters", type: "number", required: true },
    ],
    parameters: [
      { id: "include_layernorm", name: "Include LayerNorm Parameters", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: [],
      body: `for _name, _param in {{inputs.model}}.named_parameters():
    _param.requires_grad = False
    if "bias" in _name:
        _param.requires_grad = True
    if {{params.include_layernorm}} and ("LayerNorm" in _name or "layernorm" in _name or "layer_norm" in _name):
        _param.requires_grad = True
{{outputs.trainable_params}} = sum(p.numel() for p in {{inputs.model}}.parameters() if p.requires_grad)
_total_params = sum(p.numel() for p in {{inputs.model}}.parameters())
print(f"BitFit: {{{outputs.trainable_params}}:,} / {_total_params:,} trainable ({100*{{outputs.trainable_params}}/_total_params:.2f}%)")
{{outputs.model_out}} = {{inputs.model}}`,
      outputBindings: { model_out: "bitfit_model", trainable_params: "bitfit_trainable" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. PEFT Config Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.peft-config",
    name: "PEFT Config Block",
    category: "fine-tuning",
    description: "Create a generic PEFT configuration object for flexible adapter method selection",
    tags: ["fine-tuning", "peft", "config", "adapter", "flexible"],
    inputs: [],
    outputs: [
      { id: "peft_config", name: "PEFT Config", type: "config", required: true },
    ],
    parameters: [
      { id: "method", name: "PEFT Method", type: "select", default: "lora", options: [{ label: "LoRA", value: "lora" }, { label: "Prefix Tuning", value: "prefix" }, { label: "Prompt Tuning", value: "prompt" }, { label: "IA3", value: "ia3" }] },
      { id: "task_type", name: "Task Type", type: "select", default: "CAUSAL_LM", options: [{ label: "Causal LM", value: "CAUSAL_LM" }, { label: "Seq2Seq LM", value: "SEQ_2_SEQ_LM" }, { label: "Sequence Classification", value: "SEQ_CLS" }, { label: "Token Classification", value: "TOKEN_CLS" }] },
      { id: "r", name: "Rank (LoRA only)", type: "number", default: 16, min: 1, max: 256, step: 1 },
      { id: "num_virtual_tokens", name: "Virtual Tokens (Prefix/Prompt only)", type: "number", default: 20, min: 1, max: 200, step: 1 },
    ],
    codeTemplate: {
      imports: ["from peft import LoraConfig, PrefixTuningConfig, PromptTuningConfig, IA3Config, TaskType"],
      body: `_task = getattr(TaskType, "{{params.task_type}}")
if "{{params.method}}" == "lora":
    {{outputs.peft_config}} = LoraConfig(r={{params.r}}, lora_alpha={{params.r}} * 2, task_type=_task)
elif "{{params.method}}" == "prefix":
    {{outputs.peft_config}} = PrefixTuningConfig(num_virtual_tokens={{params.num_virtual_tokens}}, task_type=_task)
elif "{{params.method}}" == "prompt":
    {{outputs.peft_config}} = PromptTuningConfig(num_virtual_tokens={{params.num_virtual_tokens}}, task_type=_task)
elif "{{params.method}}" == "ia3":
    {{outputs.peft_config}} = IA3Config(task_type=_task)`,
      outputBindings: { peft_config: "peft_config" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Merge LoRA Weights
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.merge-lora",
    name: "Merge LoRA Weights",
    category: "fine-tuning",
    description: "Merge LoRA adapter weights into the base model for deployment without adapter overhead",
    tags: ["fine-tuning", "lora", "merge", "deployment", "peft"],
    inputs: [
      { id: "peft_model", name: "PEFT Model", type: "model", required: true },
    ],
    outputs: [
      { id: "merged_model", name: "Merged Model", type: "model", required: true },
    ],
    parameters: [
      { id: "safe_merge", name: "Safe Merge (check for NaN)", type: "boolean", default: true },
      { id: "save_path", name: "Save Path (optional)", type: "string", default: "", placeholder: "Path to save merged model" },
    ],
    codeTemplate: {
      imports: [],
      body: `{{outputs.merged_model}} = {{inputs.peft_model}}.merge_and_unload(safe_merge={{params.safe_merge}})
print("LoRA weights merged into base model.")
if "{{params.save_path}}":
    {{outputs.merged_model}}.save_pretrained("{{params.save_path}}")
    print(f"Merged model saved to {{params.save_path}}")`,
      outputBindings: { merged_model: "merged_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. Instruction Tuning Dataset
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.instruction-dataset",
    name: "Instruction Tuning Dataset",
    category: "fine-tuning",
    description: "Format a dataset into instruction-following format (instruction, input, output) for SFT",
    tags: ["fine-tuning", "instruction", "dataset", "sft", "formatting"],
    inputs: [
      { id: "dataset", name: "Raw Dataset", type: "dataset", required: true },
    ],
    outputs: [
      { id: "formatted_dataset", name: "Formatted Dataset", type: "dataset", required: true },
    ],
    parameters: [
      { id: "instruction_col", name: "Instruction Column", type: "string", default: "instruction", placeholder: "Column name for instruction" },
      { id: "input_col", name: "Input Column", type: "string", default: "input", placeholder: "Column name for optional input context" },
      { id: "output_col", name: "Output Column", type: "string", default: "output", placeholder: "Column name for expected output" },
      { id: "template", name: "Prompt Template", type: "select", default: "alpaca", options: [{ label: "Alpaca", value: "alpaca" }, { label: "ChatML", value: "chatml" }, { label: "Vicuna", value: "vicuna" }] },
    ],
    codeTemplate: {
      imports: [],
      body: `_templates = {
    "alpaca": "Below is an instruction that describes a task.\\n\\n### Instruction:\\n{instruction}\\n\\n### Input:\\n{input}\\n\\n### Response:\\n{output}",
    "chatml": "<|im_start|>user\\n{instruction}\\n{input}<|im_end|>\\n<|im_start|>assistant\\n{output}<|im_end|>",
    "vicuna": "USER: {instruction}\\n{input}\\nASSISTANT: {output}"
}
_tmpl = _templates["{{params.template}}"]

def _format_row(row):
    return {"text": _tmpl.format(
        instruction=row.get("{{params.instruction_col}}", ""),
        input=row.get("{{params.input_col}}", ""),
        output=row.get("{{params.output_col}}", "")
    )}
{{outputs.formatted_dataset}} = {{inputs.dataset}}.map(_format_row)`,
      outputBindings: { formatted_dataset: "instruction_dataset" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. Chat Template Apply
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.chat-template",
    name: "Chat Template Apply",
    category: "fine-tuning",
    description: "Apply a chat template (ChatML, Llama, etc.) to conversation-format data for fine-tuning",
    tags: ["fine-tuning", "chat", "template", "conversation", "formatting"],
    inputs: [
      { id: "dataset", name: "Dataset", type: "dataset", required: true, description: "Dataset with 'messages' column" },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    outputs: [
      { id: "formatted_dataset", name: "Formatted Dataset", type: "dataset", required: true },
    ],
    parameters: [
      { id: "messages_col", name: "Messages Column", type: "string", default: "messages", placeholder: "Column containing chat messages" },
      { id: "max_length", name: "Max Sequence Length", type: "number", default: 2048, min: 64, max: 131072, step: 64 },
      { id: "add_generation_prompt", name: "Add Generation Prompt", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: [],
      body: `def _apply_chat_template(row):
    _messages = row["{{params.messages_col}}"]
    _text = {{inputs.tokenizer}}.apply_chat_template(
        _messages,
        tokenize=False,
        add_generation_prompt={{params.add_generation_prompt}}
    )
    _tokenized = {{inputs.tokenizer}}(
        _text,
        truncation=True,
        max_length={{params.max_length}},
        padding=False,
        return_tensors=None
    )
    _tokenized["labels"] = _tokenized["input_ids"].copy()
    return _tokenized
{{outputs.formatted_dataset}} = {{inputs.dataset}}.map(_apply_chat_template, remove_columns={{inputs.dataset}}.column_names)`,
      outputBindings: { formatted_dataset: "chat_formatted_dataset" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. DPO (Direct Preference Optimization)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.dpo",
    name: "DPO (Direct Preference Optimization)",
    category: "fine-tuning",
    description: "Train a language model using Direct Preference Optimization on preference pairs",
    tags: ["fine-tuning", "dpo", "preference", "alignment", "rlhf", "trl"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "ref_model", name: "Reference Model", type: "model", required: false, description: "Frozen reference model (uses model copy if not provided)" },
      { id: "train_dataset", name: "Training Dataset", type: "dataset", required: true, description: "Must have prompt, chosen, rejected columns" },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    outputs: [
      { id: "model_out", name: "DPO-Trained Model", type: "model", required: true },
      { id: "metrics", name: "Training Metrics", type: "dict", required: true },
    ],
    parameters: [
      { id: "beta", name: "Beta (KL penalty)", type: "number", default: 0.1, min: 0.01, max: 1.0, step: 0.01 },
      { id: "lr", name: "Learning Rate", type: "number", default: 5e-7, min: 0, max: 0.001, step: 1e-7 },
      { id: "epochs", name: "Epochs", type: "number", default: 1, min: 1, max: 10, step: 1 },
      { id: "batch_size", name: "Batch Size", type: "number", default: 4, min: 1, step: 1 },
      { id: "max_length", name: "Max Length", type: "number", default: 1024, min: 64, max: 8192, step: 64 },
      { id: "loss_type", name: "Loss Type", type: "select", default: "sigmoid", options: [{ label: "Sigmoid", value: "sigmoid" }, { label: "Hinge", value: "hinge" }, { label: "IPO", value: "ipo" }] },
    ],
    codeTemplate: {
      imports: ["from trl import DPOTrainer, DPOConfig"],
      body: `_dpo_config = DPOConfig(
    output_dir="./dpo_output",
    beta={{params.beta}},
    learning_rate={{params.lr}},
    num_train_epochs={{params.epochs}},
    per_device_train_batch_size={{params.batch_size}},
    max_length={{params.max_length}},
    loss_type="{{params.loss_type}}",
    logging_steps=10,
    save_strategy="epoch",
)
_dpo_trainer = DPOTrainer(
    model={{inputs.model}},
    ref_model={{inputs.ref_model}},
    args=_dpo_config,
    train_dataset={{inputs.train_dataset}},
    tokenizer={{inputs.tokenizer}},
)
{{outputs.metrics}} = _dpo_trainer.train().metrics
{{outputs.model_out}} = _dpo_trainer.model`,
      outputBindings: { model_out: "dpo_model", metrics: "dpo_metrics" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. PPO Training Loop
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.ppo",
    name: "PPO Training Loop",
    category: "fine-tuning",
    description: "Proximal Policy Optimization training loop for RLHF alignment",
    tags: ["fine-tuning", "ppo", "rlhf", "reinforcement-learning", "alignment", "trl"],
    inputs: [
      { id: "model", name: "Policy Model", type: "model", required: true },
      { id: "ref_model", name: "Reference Model", type: "model", required: false },
      { id: "reward_model", name: "Reward Model", type: "model", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
      { id: "dataset", name: "Prompt Dataset", type: "dataset", required: true },
    ],
    outputs: [
      { id: "model_out", name: "PPO-Trained Model", type: "model", required: true },
      { id: "stats", name: "Training Stats", type: "dict", required: true },
    ],
    parameters: [
      { id: "lr", name: "Learning Rate", type: "number", default: 1.41e-5, min: 0, max: 0.001, step: 1e-6 },
      { id: "batch_size", name: "Batch Size", type: "number", default: 16, min: 1, step: 1 },
      { id: "mini_batch_size", name: "Mini-batch Size", type: "number", default: 4, min: 1, step: 1 },
      { id: "ppo_epochs", name: "PPO Epochs", type: "number", default: 4, min: 1, max: 20, step: 1 },
      { id: "kl_penalty", name: "KL Penalty", type: "select", default: "kl", options: [{ label: "KL", value: "kl" }, { label: "Abs", value: "abs" }, { label: "MSE", value: "mse" }] },
      { id: "max_new_tokens", name: "Max New Tokens", type: "number", default: 128, min: 1, max: 2048, step: 1 },
    ],
    codeTemplate: {
      imports: ["from trl import PPOTrainer, PPOConfig, AutoModelForCausalLMWithValueHead", "import torch"],
      body: `_ppo_config = PPOConfig(
    learning_rate={{params.lr}},
    batch_size={{params.batch_size}},
    mini_batch_size={{params.mini_batch_size}},
    ppo_epochs={{params.ppo_epochs}},
    kl_penalty="{{params.kl_penalty}}",
)
_ppo_model = AutoModelForCausalLMWithValueHead.from_pretrained({{inputs.model}})
_ppo_trainer = PPOTrainer(
    config=_ppo_config,
    model=_ppo_model,
    ref_model={{inputs.ref_model}},
    tokenizer={{inputs.tokenizer}},
    dataset={{inputs.dataset}},
)
for _batch in _ppo_trainer.dataloader:
    _query_tensors = [{{inputs.tokenizer}}.encode(q, return_tensors="pt").squeeze() for q in _batch["query"]]
    _response_tensors = [_ppo_trainer.generate(qt, max_new_tokens={{params.max_new_tokens}}).squeeze() for qt in _query_tensors]
    _texts = [{{inputs.tokenizer}}.decode(r) for r in _response_tensors]
    with torch.no_grad():
        _rewards = [{{inputs.reward_model}}(t) for t in _texts]
    {{outputs.stats}} = _ppo_trainer.step(_query_tensors, _response_tensors, _rewards)
{{outputs.model_out}} = _ppo_trainer.model`,
      outputBindings: { model_out: "ppo_model", stats: "ppo_stats" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. GRPO
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.grpo",
    name: "GRPO",
    category: "fine-tuning",
    description: "Group Relative Policy Optimization — reward-model-free alignment using group scoring",
    tags: ["fine-tuning", "grpo", "alignment", "group-relative", "trl"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
      { id: "train_dataset", name: "Training Dataset", type: "dataset", required: true },
    ],
    outputs: [
      { id: "model_out", name: "GRPO-Trained Model", type: "model", required: true },
      { id: "metrics", name: "Training Metrics", type: "dict", required: true },
    ],
    parameters: [
      { id: "lr", name: "Learning Rate", type: "number", default: 5e-7, min: 0, max: 0.001, step: 1e-7 },
      { id: "epochs", name: "Epochs", type: "number", default: 1, min: 1, max: 10, step: 1 },
      { id: "batch_size", name: "Batch Size", type: "number", default: 4, min: 1, step: 1 },
      { id: "num_generations", name: "Generations per Prompt", type: "number", default: 4, min: 2, max: 32, step: 1 },
      { id: "max_completion_length", name: "Max Completion Length", type: "number", default: 256, min: 32, max: 4096, step: 32 },
      { id: "beta", name: "KL Beta", type: "number", default: 0.04, min: 0.001, max: 1.0, step: 0.001 },
    ],
    codeTemplate: {
      imports: ["from trl import GRPOTrainer, GRPOConfig"],
      body: `_grpo_config = GRPOConfig(
    output_dir="./grpo_output",
    learning_rate={{params.lr}},
    num_train_epochs={{params.epochs}},
    per_device_train_batch_size={{params.batch_size}},
    num_generations={{params.num_generations}},
    max_completion_length={{params.max_completion_length}},
    beta={{params.beta}},
    logging_steps=10,
)
_grpo_trainer = GRPOTrainer(
    model={{inputs.model}},
    args=_grpo_config,
    train_dataset={{inputs.train_dataset}},
    processing_class={{inputs.tokenizer}},
)
{{outputs.metrics}} = _grpo_trainer.train().metrics
{{outputs.model_out}} = _grpo_trainer.model`,
      outputBindings: { model_out: "grpo_model", metrics: "grpo_metrics" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. ORPO
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.orpo",
    name: "ORPO",
    category: "fine-tuning",
    description: "Odds Ratio Preference Optimization — combines SFT and preference alignment in one step",
    tags: ["fine-tuning", "orpo", "preference", "alignment", "trl"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "train_dataset", name: "Training Dataset", type: "dataset", required: true, description: "Must have prompt, chosen, rejected columns" },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    outputs: [
      { id: "model_out", name: "ORPO-Trained Model", type: "model", required: true },
      { id: "metrics", name: "Training Metrics", type: "dict", required: true },
    ],
    parameters: [
      { id: "lr", name: "Learning Rate", type: "number", default: 5e-6, min: 0, max: 0.001, step: 1e-7 },
      { id: "beta", name: "Lambda (odds ratio weight)", type: "number", default: 0.1, min: 0.01, max: 1.0, step: 0.01 },
      { id: "epochs", name: "Epochs", type: "number", default: 1, min: 1, max: 10, step: 1 },
      { id: "batch_size", name: "Batch Size", type: "number", default: 4, min: 1, step: 1 },
      { id: "max_length", name: "Max Length", type: "number", default: 1024, min: 64, max: 8192, step: 64 },
    ],
    codeTemplate: {
      imports: ["from trl import ORPOTrainer, ORPOConfig"],
      body: `_orpo_config = ORPOConfig(
    output_dir="./orpo_output",
    learning_rate={{params.lr}},
    beta={{params.beta}},
    num_train_epochs={{params.epochs}},
    per_device_train_batch_size={{params.batch_size}},
    max_length={{params.max_length}},
    logging_steps=10,
    save_strategy="epoch",
)
_orpo_trainer = ORPOTrainer(
    model={{inputs.model}},
    args=_orpo_config,
    train_dataset={{inputs.train_dataset}},
    tokenizer={{inputs.tokenizer}},
)
{{outputs.metrics}} = _orpo_trainer.train().metrics
{{outputs.model_out}} = _orpo_trainer.model`,
      outputBindings: { model_out: "orpo_model", metrics: "orpo_metrics" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. SFT Trainer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.sft-trainer",
    name: "SFT Trainer",
    category: "fine-tuning",
    description: "Supervised Fine-Tuning trainer from TRL for instruction-following models",
    tags: ["fine-tuning", "sft", "supervised", "instruction", "trl"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "train_dataset", name: "Training Dataset", type: "dataset", required: true },
      { id: "eval_dataset", name: "Eval Dataset", type: "dataset", required: false },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    outputs: [
      { id: "model_out", name: "SFT Model", type: "model", required: true },
      { id: "metrics", name: "Training Metrics", type: "dict", required: true },
    ],
    parameters: [
      { id: "lr", name: "Learning Rate", type: "number", default: 2e-5, min: 0, max: 0.01, step: 1e-6 },
      { id: "epochs", name: "Epochs", type: "number", default: 3, min: 1, max: 100, step: 1 },
      { id: "batch_size", name: "Batch Size", type: "number", default: 8, min: 1, step: 1 },
      { id: "max_seq_length", name: "Max Sequence Length", type: "number", default: 2048, min: 64, max: 131072, step: 64 },
      { id: "packing", name: "Pack Sequences", type: "boolean", default: false, description: "Pack multiple examples into one sequence" },
      { id: "dataset_text_field", name: "Text Field", type: "string", default: "text", placeholder: "Column name with formatted text" },
    ],
    codeTemplate: {
      imports: ["from trl import SFTTrainer, SFTConfig"],
      body: `_sft_config = SFTConfig(
    output_dir="./sft_output",
    learning_rate={{params.lr}},
    num_train_epochs={{params.epochs}},
    per_device_train_batch_size={{params.batch_size}},
    max_seq_length={{params.max_seq_length}},
    packing={{params.packing}},
    dataset_text_field="{{params.dataset_text_field}}",
    logging_steps=25,
    save_strategy="epoch",
    evaluation_strategy="epoch" if {{inputs.eval_dataset}} is not None else "no",
)
_sft_trainer = SFTTrainer(
    model={{inputs.model}},
    args=_sft_config,
    train_dataset={{inputs.train_dataset}},
    eval_dataset={{inputs.eval_dataset}},
    tokenizer={{inputs.tokenizer}},
)
{{outputs.metrics}} = _sft_trainer.train().metrics
{{outputs.model_out}} = _sft_trainer.model`,
      outputBindings: { model_out: "sft_model", metrics: "sft_metrics" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 23. Reward Model Train
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.reward-model-train",
    name: "Reward Model Train",
    category: "fine-tuning",
    description: "Train a reward model on human preference data for RLHF",
    tags: ["fine-tuning", "reward-model", "rlhf", "preference", "trl"],
    inputs: [
      { id: "model", name: "Base Model", type: "model", required: true },
      { id: "train_dataset", name: "Preference Dataset", type: "dataset", required: true, description: "Must have chosen and rejected columns" },
      { id: "eval_dataset", name: "Eval Dataset", type: "dataset", required: false },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    outputs: [
      { id: "reward_model", name: "Trained Reward Model", type: "model", required: true },
      { id: "metrics", name: "Training Metrics", type: "dict", required: true },
    ],
    parameters: [
      { id: "lr", name: "Learning Rate", type: "number", default: 1e-5, min: 0, max: 0.001, step: 1e-6 },
      { id: "epochs", name: "Epochs", type: "number", default: 1, min: 1, max: 10, step: 1 },
      { id: "batch_size", name: "Batch Size", type: "number", default: 8, min: 1, step: 1 },
      { id: "max_length", name: "Max Length", type: "number", default: 512, min: 64, max: 8192, step: 64 },
    ],
    codeTemplate: {
      imports: ["from trl import RewardTrainer, RewardConfig", "from transformers import AutoModelForSequenceClassification"],
      body: `_reward_base = AutoModelForSequenceClassification.from_pretrained(
    {{inputs.model}}.config._name_or_path,
    num_labels=1,
    torch_dtype={{inputs.model}}.dtype
)
_reward_config = RewardConfig(
    output_dir="./reward_model_output",
    learning_rate={{params.lr}},
    num_train_epochs={{params.epochs}},
    per_device_train_batch_size={{params.batch_size}},
    max_length={{params.max_length}},
    logging_steps=25,
    evaluation_strategy="epoch" if {{inputs.eval_dataset}} is not None else "no",
    save_strategy="epoch",
)
_reward_trainer = RewardTrainer(
    model=_reward_base,
    args=_reward_config,
    train_dataset={{inputs.train_dataset}},
    eval_dataset={{inputs.eval_dataset}},
    tokenizer={{inputs.tokenizer}},
)
{{outputs.metrics}} = _reward_trainer.train().metrics
{{outputs.reward_model}} = _reward_trainer.model`,
      outputBindings: { reward_model: "trained_reward_model", metrics: "reward_metrics" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 24. Constitutional AI Filter
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.constitutional-ai-filter",
    name: "Constitutional AI Filter",
    category: "fine-tuning",
    description: "Apply Constitutional AI principles to filter and revise model outputs for safety",
    tags: ["fine-tuning", "constitutional-ai", "safety", "alignment", "filter"],
    inputs: [
      { id: "model", name: "Critique Model", type: "model", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
      { id: "dataset", name: "Dataset", type: "dataset", required: true, description: "Dataset with prompt/response columns" },
    ],
    outputs: [
      { id: "filtered_dataset", name: "Filtered Dataset", type: "dataset", required: true },
    ],
    parameters: [
      { id: "principles", name: "Constitutional Principles", type: "code", default: '[\n  "Please choose the response that is most helpful, honest, and harmless.",\n  "Please choose the response that is least toxic or offensive.",\n  "Please choose the response that best refuses to engage in harmful activities."\n]', description: "JSON list of constitutional principles" },
      { id: "prompt_col", name: "Prompt Column", type: "string", default: "prompt" },
      { id: "response_col", name: "Response Column", type: "string", default: "response" },
      { id: "max_new_tokens", name: "Max New Tokens for Critique", type: "number", default: 256, min: 32, max: 1024, step: 32 },
    ],
    codeTemplate: {
      imports: ["import json", "import torch"],
      body: `_principles = json.loads("""{{params.principles}}""")

def _critique_and_revise(row):
    _prompt = row["{{params.prompt_col}}"]
    _response = row["{{params.response_col}}"]
    _revised = _response
    for _principle in _principles:
        _critique_prompt = f"Human: {_prompt}\\n\\nAssistant: {_revised}\\n\\nCritique Request: {_principle}\\n\\nCritique:"
        _inputs = {{inputs.tokenizer}}(_critique_prompt, return_tensors="pt", truncation=True, max_length=1024)
        with torch.no_grad():
            _out = {{inputs.model}}.generate(**_inputs, max_new_tokens={{params.max_new_tokens}}, do_sample=False)
        _critique = {{inputs.tokenizer}}.decode(_out[0][_inputs["input_ids"].shape[1]:], skip_special_tokens=True)
        _revise_prompt = f"{_critique_prompt}{_critique}\\n\\nRevision Request: Based on the critique, rewrite the response.\\n\\nRevision:"
        _rev_inputs = {{inputs.tokenizer}}(_revise_prompt, return_tensors="pt", truncation=True, max_length=1024)
        with torch.no_grad():
            _rev_out = {{inputs.model}}.generate(**_rev_inputs, max_new_tokens={{params.max_new_tokens}}, do_sample=False)
        _revised = {{inputs.tokenizer}}.decode(_rev_out[0][_rev_inputs["input_ids"].shape[1]:], skip_special_tokens=True)
    return {"{{params.prompt_col}}": _prompt, "{{params.response_col}}": _revised, "original_response": _response}

{{outputs.filtered_dataset}} = {{inputs.dataset}}.map(_critique_and_revise)`,
      outputBindings: { filtered_dataset: "cai_filtered_dataset" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 25. RLAIF Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "fine-tuning.rlaif",
    name: "RLAIF Block",
    category: "fine-tuning",
    description: "Reinforcement Learning from AI Feedback — use an LLM to generate preference labels for training",
    tags: ["fine-tuning", "rlaif", "ai-feedback", "alignment", "preference"],
    inputs: [
      { id: "judge_model", name: "Judge Model", type: "model", required: true },
      { id: "judge_tokenizer", name: "Judge Tokenizer", type: "tokenizer", required: true },
      { id: "dataset", name: "Dataset", type: "dataset", required: true, description: "Must have prompt, response_a, response_b columns" },
    ],
    outputs: [
      { id: "preference_dataset", name: "Preference Dataset", type: "dataset", required: true },
    ],
    parameters: [
      { id: "prompt_col", name: "Prompt Column", type: "string", default: "prompt" },
      { id: "response_a_col", name: "Response A Column", type: "string", default: "response_a" },
      { id: "response_b_col", name: "Response B Column", type: "string", default: "response_b" },
      { id: "judge_prompt", name: "Judge System Prompt", type: "code", default: "You are a helpful assistant that evaluates responses. Given a prompt and two responses A and B, output 'A' if response A is better, or 'B' if response B is better." },
      { id: "max_new_tokens", name: "Max New Tokens", type: "number", default: 8, min: 1, max: 64, step: 1 },
      { id: "batch_size", name: "Batch Size", type: "number", default: 4, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `def _judge_preference(batch):
    _results = {"prompt": [], "chosen": [], "rejected": []}
    for _i in range(len(batch["{{params.prompt_col}}"])):
        _p = batch["{{params.prompt_col}}"][_i]
        _ra = batch["{{params.response_a_col}}"][_i]
        _rb = batch["{{params.response_b_col}}"][_i]
        _judge_input = f"{{params.judge_prompt}}\\n\\nPrompt: {_p}\\n\\nResponse A: {_ra}\\n\\nResponse B: {_rb}\\n\\nWhich is better (A or B)?"
        _inputs = {{inputs.judge_tokenizer}}(_judge_input, return_tensors="pt", truncation=True, max_length=2048)
        with torch.no_grad():
            _out = {{inputs.judge_model}}.generate(**_inputs, max_new_tokens={{params.max_new_tokens}}, do_sample=False)
        _verdict = {{inputs.judge_tokenizer}}.decode(_out[0][_inputs["input_ids"].shape[1]:], skip_special_tokens=True).strip()
        _results["prompt"].append(_p)
        if "A" in _verdict.upper()[:3]:
            _results["chosen"].append(_ra)
            _results["rejected"].append(_rb)
        else:
            _results["chosen"].append(_rb)
            _results["rejected"].append(_ra)
    return _results

{{outputs.preference_dataset}} = {{inputs.dataset}}.map(
    _judge_preference, batched=True, batch_size={{params.batch_size}},
    remove_columns={{inputs.dataset}}.column_names
)
print(f"Generated {len({{outputs.preference_dataset}})} preference pairs via RLAIF")`,
      outputBindings: { preference_dataset: "rlaif_preference_dataset" },
    },
  },
];
