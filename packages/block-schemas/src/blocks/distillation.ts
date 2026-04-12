import type { BlockDefinition } from "../types.js";

export const distillationBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Teacher Model
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.teacher-model",
    name: "Teacher Model",
    category: "distillation",
    description: "Wrap a pretrained model as the teacher for knowledge distillation",
    tags: ["distillation", "teacher", "pretrained", "pytorch"],
    inputs: [
      { id: "model", name: "Pretrained Model", type: "model", required: true },
    ],
    outputs: [
      { id: "teacher", name: "Teacher Model", type: "model", required: true },
    ],
    parameters: [
      { id: "freeze", name: "Freeze Weights", type: "boolean", default: true, description: "Freeze all teacher parameters" },
      { id: "device", name: "Device", type: "select", default: "auto", options: [{ label: "Auto", value: "auto" }, { label: "CPU", value: "cpu" }, { label: "CUDA:0", value: "cuda:0" }] },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `_device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if "{{params.device}}" == "auto" else torch.device("{{params.device}}")
{{inputs.model}}.to(_device)
if {{params.freeze}}:
    for _p in {{inputs.model}}.parameters():
        _p.requires_grad = False
{{inputs.model}}.eval()
{{outputs.teacher}} = {{inputs.model}}`,
      outputBindings: { teacher: "teacher_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Student Model
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.student-model",
    name: "Student Model",
    category: "distillation",
    description: "Wrap a smaller model as the student for knowledge distillation",
    tags: ["distillation", "student", "compact", "pytorch"],
    inputs: [
      { id: "model", name: "Student Model", type: "model", required: true },
    ],
    outputs: [
      { id: "student", name: "Student Model", type: "model", required: true },
    ],
    parameters: [
      { id: "init_from_teacher", name: "Initialize from Teacher Layers", type: "boolean", default: false },
      { id: "device", name: "Device", type: "select", default: "auto", options: [{ label: "Auto", value: "auto" }, { label: "CPU", value: "cpu" }, { label: "CUDA:0", value: "cuda:0" }] },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `_device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if "{{params.device}}" == "auto" else torch.device("{{params.device}}")
{{inputs.model}}.to(_device)
{{inputs.model}}.train()
{{outputs.student}} = {{inputs.model}}`,
      outputBindings: { student: "student_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. KD Loss (Soft Labels)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.kd-loss-soft-labels",
    name: "KD Loss (Soft Labels)",
    category: "distillation",
    description: "Compute knowledge distillation loss using softened logits from teacher and student",
    tags: ["distillation", "loss", "soft-labels", "kl-divergence", "pytorch"],
    inputs: [
      { id: "student_logits", name: "Student Logits", type: "tensor", required: true },
      { id: "teacher_logits", name: "Teacher Logits", type: "tensor", required: true },
      { id: "hard_labels", name: "Hard Labels", type: "tensor", required: false },
    ],
    outputs: [
      { id: "loss", name: "KD Loss", type: "loss_fn", required: true },
    ],
    parameters: [
      { id: "temperature", name: "Temperature", type: "number", default: 4.0, min: 0.1, max: 100, step: 0.1 },
      { id: "alpha", name: "Alpha (soft weight)", type: "number", default: 0.7, min: 0.0, max: 1.0, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn.functional as F"],
      body: `_T = {{params.temperature}}
_alpha = {{params.alpha}}
_soft_student = F.log_softmax({{inputs.student_logits}} / _T, dim=-1)
_soft_teacher = F.softmax({{inputs.teacher_logits}} / _T, dim=-1)
_kd_loss = F.kl_div(_soft_student, _soft_teacher, reduction="batchmean") * (_T * _T)
if {{inputs.hard_labels}} is not None:
    _hard_loss = F.cross_entropy({{inputs.student_logits}}, {{inputs.hard_labels}})
    {{outputs.loss}} = _alpha * _kd_loss + (1 - _alpha) * _hard_loss
else:
    {{outputs.loss}} = _kd_loss`,
      outputBindings: { loss: "kd_soft_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. KD Loss (Feature Map)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.kd-loss-feature-map",
    name: "KD Loss (Feature Map)",
    category: "distillation",
    description: "Compute feature-based distillation loss by matching intermediate feature maps between teacher and student",
    tags: ["distillation", "loss", "feature-map", "mse", "pytorch"],
    inputs: [
      { id: "student_features", name: "Student Features", type: "tensor", required: true },
      { id: "teacher_features", name: "Teacher Features", type: "tensor", required: true },
    ],
    outputs: [
      { id: "loss", name: "Feature KD Loss", type: "loss_fn", required: true },
    ],
    parameters: [
      { id: "loss_type", name: "Loss Type", type: "select", default: "mse", options: [{ label: "MSE", value: "mse" }, { label: "L1", value: "l1" }, { label: "Cosine", value: "cosine" }] },
      { id: "normalize", name: "Normalize Features", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn.functional as F"],
      body: `_s = {{inputs.student_features}}
_t = {{inputs.teacher_features}}
if {{params.normalize}}:
    _s = F.normalize(_s, dim=-1)
    _t = F.normalize(_t, dim=-1)
if "{{params.loss_type}}" == "mse":
    {{outputs.loss}} = F.mse_loss(_s, _t)
elif "{{params.loss_type}}" == "l1":
    {{outputs.loss}} = F.l1_loss(_s, _t)
else:
    {{outputs.loss}} = (1 - F.cosine_similarity(_s, _t, dim=-1)).mean()`,
      outputBindings: { loss: "kd_feature_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Response-Based KD
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.response-based-kd",
    name: "Response-Based KD",
    category: "distillation",
    description: "End-to-end response-based knowledge distillation using final output logits",
    tags: ["distillation", "response-based", "logits", "pytorch"],
    inputs: [
      { id: "teacher", name: "Teacher Model", type: "model", required: true },
      { id: "student", name: "Student Model", type: "model", required: true },
      { id: "dataloader", name: "DataLoader", type: "dataloader", required: true },
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
    ],
    outputs: [
      { id: "student_out", name: "Distilled Student", type: "model", required: true },
      { id: "loss", name: "Final Loss", type: "number", required: true },
    ],
    parameters: [
      { id: "temperature", name: "Temperature", type: "number", default: 4.0, min: 0.1, max: 100, step: 0.1 },
      { id: "alpha", name: "Alpha", type: "number", default: 0.7, min: 0.0, max: 1.0, step: 0.05 },
      { id: "epochs", name: "Epochs", type: "number", default: 10, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn.functional as F"],
      body: `_T = {{params.temperature}}
_alpha = {{params.alpha}}
{{inputs.teacher}}.eval()
{{inputs.student}}.train()
for _epoch in range({{params.epochs}}):
    _total = 0.0
    for _x, _y in {{inputs.dataloader}}:
        with torch.no_grad():
            _t_logits = {{inputs.teacher}}(_x)
        _s_logits = {{inputs.student}}(_x)
        _soft = F.kl_div(F.log_softmax(_s_logits / _T, dim=-1), F.softmax(_t_logits / _T, dim=-1), reduction="batchmean") * (_T * _T)
        _hard = F.cross_entropy(_s_logits, _y)
        _loss = _alpha * _soft + (1 - _alpha) * _hard
        {{inputs.optimizer}}.zero_grad()
        _loss.backward()
        {{inputs.optimizer}}.step()
        _total += _loss.item()
    {{outputs.loss}} = _total / len({{inputs.dataloader}})
{{outputs.student_out}} = {{inputs.student}}`,
      outputBindings: { student_out: "distilled_student", loss: "response_kd_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Feature-Based KD
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.feature-based-kd",
    name: "Feature-Based KD",
    category: "distillation",
    description: "Knowledge distillation that matches intermediate feature representations between teacher and student",
    tags: ["distillation", "feature-based", "intermediate", "pytorch"],
    inputs: [
      { id: "teacher", name: "Teacher Model", type: "model", required: true },
      { id: "student", name: "Student Model", type: "model", required: true },
      { id: "dataloader", name: "DataLoader", type: "dataloader", required: true },
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
    ],
    outputs: [
      { id: "student_out", name: "Distilled Student", type: "model", required: true },
      { id: "loss", name: "Final Loss", type: "number", required: true },
    ],
    parameters: [
      { id: "layer_pairs", name: "Layer Pairs (JSON)", type: "json", default: "[[\"layer2\", \"layer1\"]]", description: "JSON array of [teacher_layer, student_layer] pairs" },
      { id: "beta", name: "Feature Loss Weight", type: "number", default: 0.5, min: 0.0, max: 1.0, step: 0.05 },
      { id: "epochs", name: "Epochs", type: "number", default: 10, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn.functional as F", "import json"],
      body: `_layer_pairs = json.loads('{{params.layer_pairs}}')
_hooks, _feats = [], {"teacher": {}, "student": {}}
def _make_hook(name, role):
    def _hook(mod, inp, out):
        _feats[role][name] = out
    return _hook
for _tl, _sl in _layer_pairs:
    _hooks.append(dict({{inputs.teacher}}.named_modules())[_tl].register_forward_hook(_make_hook(_tl, "teacher")))
    _hooks.append(dict({{inputs.student}}.named_modules())[_sl].register_forward_hook(_make_hook(_sl, "student")))
{{inputs.teacher}}.eval()
{{inputs.student}}.train()
for _epoch in range({{params.epochs}}):
    _total = 0.0
    for _x, _y in {{inputs.dataloader}}:
        with torch.no_grad():
            {{inputs.teacher}}(_x)
        _s_logits = {{inputs.student}}(_x)
        _feat_loss = sum(F.mse_loss(_feats["student"][_sl], _feats["teacher"][_tl]) for _tl, _sl in _layer_pairs)
        _ce_loss = F.cross_entropy(_s_logits, _y)
        _loss = {{params.beta}} * _feat_loss + (1 - {{params.beta}}) * _ce_loss
        {{inputs.optimizer}}.zero_grad()
        _loss.backward()
        {{inputs.optimizer}}.step()
        _total += _loss.item()
    {{outputs.loss}} = _total / len({{inputs.dataloader}})
for _h in _hooks:
    _h.remove()
{{outputs.student_out}} = {{inputs.student}}`,
      outputBindings: { student_out: "feature_kd_student", loss: "feature_kd_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Relation-Based KD
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.relation-based-kd",
    name: "Relation-Based KD",
    category: "distillation",
    description: "Distill inter-sample relationships (e.g., pairwise distance matrices) from teacher to student",
    tags: ["distillation", "relation-based", "pairwise", "pytorch"],
    inputs: [
      { id: "teacher", name: "Teacher Model", type: "model", required: true },
      { id: "student", name: "Student Model", type: "model", required: true },
      { id: "dataloader", name: "DataLoader", type: "dataloader", required: true },
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
    ],
    outputs: [
      { id: "student_out", name: "Distilled Student", type: "model", required: true },
      { id: "loss", name: "Final Loss", type: "number", required: true },
    ],
    parameters: [
      { id: "relation", name: "Relation Type", type: "select", default: "distance", options: [{ label: "Distance", value: "distance" }, { label: "Angle", value: "angle" }] },
      { id: "epochs", name: "Epochs", type: "number", default: 10, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn.functional as F"],
      body: `{{inputs.teacher}}.eval()
{{inputs.student}}.train()
def _distance_matrix(feat):
    return torch.cdist(feat, feat)
def _angle_matrix(feat):
    _normed = F.normalize(feat, dim=-1)
    return _normed @ _normed.T
_rel_fn = _distance_matrix if "{{params.relation}}" == "distance" else _angle_matrix
for _epoch in range({{params.epochs}}):
    _total = 0.0
    for _x, _y in {{inputs.dataloader}}:
        with torch.no_grad():
            _t_feat = {{inputs.teacher}}(_x)
        _s_feat = {{inputs.student}}(_x)
        _loss = F.mse_loss(_rel_fn(_s_feat), _rel_fn(_t_feat))
        {{inputs.optimizer}}.zero_grad()
        _loss.backward()
        {{inputs.optimizer}}.step()
        _total += _loss.item()
    {{outputs.loss}} = _total / len({{inputs.dataloader}})
{{outputs.student_out}} = {{inputs.student}}`,
      outputBindings: { student_out: "relation_kd_student", loss: "relation_kd_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Self-Distillation
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.self-distillation",
    name: "Self-Distillation",
    category: "distillation",
    description: "Distill knowledge from deeper layers to shallower layers within the same network",
    tags: ["distillation", "self-distillation", "same-network", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "dataloader", name: "DataLoader", type: "dataloader", required: true },
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
    ],
    outputs: [
      { id: "model_out", name: "Self-Distilled Model", type: "model", required: true },
      { id: "loss", name: "Final Loss", type: "number", required: true },
    ],
    parameters: [
      { id: "deep_layer", name: "Deep Layer Name", type: "string", default: "layer4" },
      { id: "shallow_layer", name: "Shallow Layer Name", type: "string", default: "layer2" },
      { id: "epochs", name: "Epochs", type: "number", default: 10, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn.functional as F"],
      body: `_feats = {}
def _hook(name):
    def _fn(mod, inp, out):
        _feats[name] = out
    return _fn
_h1 = dict({{inputs.model}}.named_modules())["{{params.deep_layer}}"].register_forward_hook(_hook("deep"))
_h2 = dict({{inputs.model}}.named_modules())["{{params.shallow_layer}}"].register_forward_hook(_hook("shallow"))
{{inputs.model}}.train()
for _epoch in range({{params.epochs}}):
    _total = 0.0
    for _x, _y in {{inputs.dataloader}}:
        _out = {{inputs.model}}(_x)
        _ce = F.cross_entropy(_out, _y)
        _sd = F.mse_loss(_feats["shallow"], _feats["deep"].detach())
        _loss = _ce + _sd
        {{inputs.optimizer}}.zero_grad()
        _loss.backward()
        {{inputs.optimizer}}.step()
        _total += _loss.item()
    {{outputs.loss}} = _total / len({{inputs.dataloader}})
_h1.remove()
_h2.remove()
{{outputs.model_out}} = {{inputs.model}}`,
      outputBindings: { model_out: "self_distilled_model", loss: "self_distill_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Born-Again Network
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.born-again-network",
    name: "Born-Again Network",
    category: "distillation",
    description: "Train a student of the same architecture as the teacher (born-again distillation)",
    tags: ["distillation", "born-again", "same-capacity", "pytorch"],
    inputs: [
      { id: "teacher", name: "Teacher Model", type: "model", required: true },
      { id: "student", name: "Student Model (same arch)", type: "model", required: true },
      { id: "dataloader", name: "DataLoader", type: "dataloader", required: true },
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
    ],
    outputs: [
      { id: "student_out", name: "Born-Again Student", type: "model", required: true },
      { id: "loss", name: "Final Loss", type: "number", required: true },
    ],
    parameters: [
      { id: "temperature", name: "Temperature", type: "number", default: 3.0, min: 0.1, max: 50, step: 0.1 },
      { id: "epochs", name: "Epochs", type: "number", default: 20, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn.functional as F"],
      body: `_T = {{params.temperature}}
{{inputs.teacher}}.eval()
{{inputs.student}}.train()
for _epoch in range({{params.epochs}}):
    _total = 0.0
    for _x, _y in {{inputs.dataloader}}:
        with torch.no_grad():
            _t_logits = {{inputs.teacher}}(_x)
        _s_logits = {{inputs.student}}(_x)
        _loss = F.kl_div(F.log_softmax(_s_logits / _T, dim=-1), F.softmax(_t_logits / _T, dim=-1), reduction="batchmean") * (_T * _T)
        {{inputs.optimizer}}.zero_grad()
        _loss.backward()
        {{inputs.optimizer}}.step()
        _total += _loss.item()
    {{outputs.loss}} = _total / len({{inputs.dataloader}})
{{outputs.student_out}} = {{inputs.student}}`,
      outputBindings: { student_out: "born_again_model", loss: "born_again_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Post-Training Quantization (PTQ)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.ptq",
    name: "Post-Training Quantization (PTQ)",
    category: "distillation",
    description: "Quantize a trained model without retraining using PyTorch dynamic or static quantization",
    tags: ["compression", "quantization", "ptq", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "calibration_data", name: "Calibration DataLoader", type: "dataloader", required: false },
    ],
    outputs: [
      { id: "quantized_model", name: "Quantized Model", type: "model", required: true },
    ],
    parameters: [
      { id: "mode", name: "Quantization Mode", type: "select", default: "dynamic", options: [{ label: "Dynamic", value: "dynamic" }, { label: "Static", value: "static" }] },
      { id: "dtype", name: "Data Type", type: "select", default: "qint8", options: [{ label: "QINT8", value: "qint8" }, { label: "FLOAT16", value: "float16" }] },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.quantization as tq"],
      body: `{{inputs.model}}.eval()
if "{{params.mode}}" == "dynamic":
    {{outputs.quantized_model}} = torch.quantization.quantize_dynamic({{inputs.model}}, {torch.nn.Linear}, dtype=torch.{{params.dtype}})
else:
    {{inputs.model}}.qconfig = tq.get_default_qconfig("fbgemm")
    tq.prepare({{inputs.model}}, inplace=True)
    if {{inputs.calibration_data}} is not None:
        with torch.no_grad():
            for _x, _ in {{inputs.calibration_data}}:
                {{inputs.model}}(_x)
    {{outputs.quantized_model}} = tq.convert({{inputs.model}})`,
      outputBindings: { quantized_model: "ptq_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Quantization-Aware Training (QAT)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.qat",
    name: "Quantization-Aware Training (QAT)",
    category: "distillation",
    description: "Train a model with simulated quantization to preserve accuracy after conversion",
    tags: ["compression", "quantization", "qat", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "dataloader", name: "DataLoader", type: "dataloader", required: true },
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    outputs: [
      { id: "quantized_model", name: "QAT Model", type: "model", required: true },
      { id: "loss", name: "Final Loss", type: "number", required: true },
    ],
    parameters: [
      { id: "epochs", name: "Epochs", type: "number", default: 5, min: 1, step: 1 },
      { id: "backend", name: "Backend", type: "select", default: "fbgemm", options: [{ label: "FBGEMM (x86)", value: "fbgemm" }, { label: "QNNPACK (ARM)", value: "qnnpack" }] },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.quantization as tq"],
      body: `{{inputs.model}}.train()
{{inputs.model}}.qconfig = tq.get_default_qat_qconfig("{{params.backend}}")
tq.prepare_qat({{inputs.model}}, inplace=True)
for _epoch in range({{params.epochs}}):
    _total = 0.0
    for _x, _y in {{inputs.dataloader}}:
        _preds = {{inputs.model}}(_x)
        _loss = {{inputs.loss_fn}}(_preds, _y)
        {{inputs.optimizer}}.zero_grad()
        _loss.backward()
        {{inputs.optimizer}}.step()
        _total += _loss.item()
    {{outputs.loss}} = _total / len({{inputs.dataloader}})
{{outputs.quantized_model}} = tq.convert({{inputs.model}}.eval())`,
      outputBindings: { quantized_model: "qat_model", loss: "qat_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. INT8 Quantize
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.int8-quantize",
    name: "INT8 Quantize",
    category: "distillation",
    description: "Convert model weights and activations to INT8 precision",
    tags: ["compression", "quantization", "int8", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "quantized_model", name: "INT8 Model", type: "model", required: true },
    ],
    parameters: [
      { id: "per_channel", name: "Per-Channel Quantization", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `{{inputs.model}}.eval()
{{outputs.quantized_model}} = torch.quantization.quantize_dynamic({{inputs.model}}, {torch.nn.Linear, torch.nn.Conv2d}, dtype=torch.qint8)`,
      outputBindings: { quantized_model: "int8_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. INT4 Quantize
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.int4-quantize",
    name: "INT4 Quantize",
    category: "distillation",
    description: "Convert model to INT4 precision using bitsandbytes for extreme compression",
    tags: ["compression", "quantization", "int4", "bitsandbytes"],
    inputs: [
      { id: "model_name", name: "Model Name or Path", type: "text", required: true },
    ],
    outputs: [
      { id: "model", name: "INT4 Model", type: "model", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    parameters: [
      { id: "quant_type", name: "Quantization Type", type: "select", default: "nf4", options: [{ label: "NF4", value: "nf4" }, { label: "FP4", value: "fp4" }] },
      { id: "double_quant", name: "Double Quantization", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import torch", "from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig"],
      body: `_bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="{{params.quant_type}}",
    bnb_4bit_use_double_quant={{params.double_quant}},
    bnb_4bit_compute_dtype=torch.float16,
)
{{outputs.model}} = AutoModelForCausalLM.from_pretrained({{inputs.model_name}}, quantization_config=_bnb_config, device_map="auto")
{{outputs.tokenizer}} = AutoTokenizer.from_pretrained({{inputs.model_name}})`,
      outputBindings: { model: "int4_model", tokenizer: "int4_tokenizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. GPTQ Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.gptq",
    name: "GPTQ Block",
    category: "distillation",
    description: "Quantize a language model using GPTQ (post-training quantization for generative models)",
    tags: ["compression", "quantization", "gptq", "auto-gptq"],
    inputs: [
      { id: "model_name", name: "Model Name or Path", type: "text", required: true },
      { id: "calibration_data", name: "Calibration Dataset", type: "dataset", required: true },
    ],
    outputs: [
      { id: "model", name: "GPTQ Model", type: "model", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    parameters: [
      { id: "bits", name: "Bits", type: "select", default: 4, options: [{ label: "4-bit", value: 4 }, { label: "8-bit", value: 8 }, { label: "3-bit", value: 3 }] },
      { id: "group_size", name: "Group Size", type: "number", default: 128, min: 32, max: 1024, step: 32 },
      { id: "desc_act", name: "Desc Act (activation order)", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig", "from transformers import AutoTokenizer"],
      body: `{{outputs.tokenizer}} = AutoTokenizer.from_pretrained({{inputs.model_name}})
_quant_config = BaseQuantizeConfig(bits={{params.bits}}, group_size={{params.group_size}}, desc_act={{params.desc_act}})
_model = AutoGPTQForCausalLM.from_pretrained({{inputs.model_name}}, _quant_config)
_model.quantize({{inputs.calibration_data}})
{{outputs.model}} = _model`,
      outputBindings: { model: "gptq_model", tokenizer: "gptq_tokenizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. AWQ Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.awq",
    name: "AWQ Block",
    category: "distillation",
    description: "Quantize a model using Activation-aware Weight Quantization (AWQ)",
    tags: ["compression", "quantization", "awq", "autoawq"],
    inputs: [
      { id: "model_name", name: "Model Name or Path", type: "text", required: true },
    ],
    outputs: [
      { id: "model", name: "AWQ Model", type: "model", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    parameters: [
      { id: "bits", name: "Bits", type: "select", default: 4, options: [{ label: "4-bit", value: 4 }, { label: "8-bit", value: 8 }] },
      { id: "group_size", name: "Group Size", type: "number", default: 128, min: 32, max: 1024, step: 32 },
      { id: "zero_point", name: "Zero Point", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from awq import AutoAWQForCausalLM", "from transformers import AutoTokenizer"],
      body: `{{outputs.tokenizer}} = AutoTokenizer.from_pretrained({{inputs.model_name}})
_model = AutoAWQForCausalLM.from_pretrained({{inputs.model_name}})
_quant_config = {"zero_point": {{params.zero_point}}, "q_group_size": {{params.group_size}}, "w_bit": {{params.bits}}}
_model.quantize({{outputs.tokenizer}}, quant_config=_quant_config)
{{outputs.model}} = _model`,
      outputBindings: { model: "awq_model", tokenizer: "awq_tokenizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. GGUF Export
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.gguf-export",
    name: "GGUF Export",
    category: "distillation",
    description: "Export a model to GGUF format for use with llama.cpp and compatible runtimes",
    tags: ["compression", "export", "gguf", "llama-cpp"],
    inputs: [
      { id: "model_path", name: "Model Path", type: "path", required: true },
    ],
    outputs: [
      { id: "gguf_path", name: "GGUF File Path", type: "path", required: true },
    ],
    parameters: [
      { id: "quant_method", name: "Quantization Method", type: "select", default: "q4_k_m", options: [{ label: "Q4_K_M", value: "q4_k_m" }, { label: "Q5_K_M", value: "q5_k_m" }, { label: "Q8_0", value: "q8_0" }, { label: "F16", value: "f16" }] },
      { id: "output_dir", name: "Output Directory", type: "string", default: "./gguf_output" },
    ],
    codeTemplate: {
      imports: ["import subprocess", "import os"],
      body: `os.makedirs("{{params.output_dir}}", exist_ok=True)
_out = os.path.join("{{params.output_dir}}", "model-{{params.quant_method}}.gguf")
subprocess.run(["python", "llama.cpp/convert.py", {{inputs.model_path}}, "--outfile", _out, "--outtype", "{{params.quant_method}}"], check=True)
{{outputs.gguf_path}} = _out`,
      outputBindings: { gguf_path: "gguf_file_path" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. Structured Pruning
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.structured-pruning",
    name: "Structured Pruning",
    category: "distillation",
    description: "Remove entire filters, channels, or attention heads from a model",
    tags: ["compression", "pruning", "structured", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "pruned_model", name: "Pruned Model", type: "model", required: true },
    ],
    parameters: [
      { id: "amount", name: "Pruning Amount", type: "number", default: 0.3, min: 0.0, max: 0.99, step: 0.05 },
      { id: "norm", name: "Norm (Ln)", type: "select", default: 1, options: [{ label: "L1", value: 1 }, { label: "L2", value: 2 }] },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn.utils.prune as prune"],
      body: `for _name, _module in {{inputs.model}}.named_modules():
    if isinstance(_module, (torch.nn.Conv2d, torch.nn.Linear)):
        prune.ln_structured(_module, name="weight", amount={{params.amount}}, n={{params.norm}}, dim=0)
        prune.remove(_module, "weight")
{{outputs.pruned_model}} = {{inputs.model}}`,
      outputBindings: { pruned_model: "structured_pruned_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. Unstructured Pruning
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.unstructured-pruning",
    name: "Unstructured Pruning",
    category: "distillation",
    description: "Zero out individual weights based on magnitude threshold",
    tags: ["compression", "pruning", "unstructured", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "pruned_model", name: "Pruned Model", type: "model", required: true },
      { id: "sparsity", name: "Sparsity Ratio", type: "number", required: true },
    ],
    parameters: [
      { id: "amount", name: "Pruning Amount", type: "number", default: 0.4, min: 0.0, max: 0.99, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn.utils.prune as prune"],
      body: `for _name, _module in {{inputs.model}}.named_modules():
    if isinstance(_module, (torch.nn.Conv2d, torch.nn.Linear)):
        prune.l1_unstructured(_module, name="weight", amount={{params.amount}})
        prune.remove(_module, "weight")
_total, _zeros = 0, 0
for _p in {{inputs.model}}.parameters():
    _total += _p.numel()
    _zeros += (_p == 0).sum().item()
{{outputs.sparsity}} = _zeros / _total
{{outputs.pruned_model}} = {{inputs.model}}`,
      outputBindings: { pruned_model: "unstructured_pruned_model", sparsity: "model_sparsity" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. Magnitude Pruning
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.magnitude-pruning",
    name: "Magnitude Pruning",
    category: "distillation",
    description: "Prune weights globally by absolute magnitude across all layers",
    tags: ["compression", "pruning", "magnitude", "global", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "pruned_model", name: "Pruned Model", type: "model", required: true },
    ],
    parameters: [
      { id: "amount", name: "Global Pruning Amount", type: "number", default: 0.3, min: 0.0, max: 0.99, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn.utils.prune as prune"],
      body: `_params_to_prune = []
for _name, _module in {{inputs.model}}.named_modules():
    if isinstance(_module, (torch.nn.Conv2d, torch.nn.Linear)):
        _params_to_prune.append((_module, "weight"))
prune.global_unstructured(_params_to_prune, pruning_method=prune.L1Unstructured, amount={{params.amount}})
for _module, _pname in _params_to_prune:
    prune.remove(_module, _pname)
{{outputs.pruned_model}} = {{inputs.model}}`,
      outputBindings: { pruned_model: "magnitude_pruned_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. Movement Pruning
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.movement-pruning",
    name: "Movement Pruning",
    category: "distillation",
    description: "Prune weights based on movement (change in magnitude during fine-tuning) rather than absolute value",
    tags: ["compression", "pruning", "movement", "fine-tuning", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "dataloader", name: "DataLoader", type: "dataloader", required: true },
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    outputs: [
      { id: "pruned_model", name: "Pruned Model", type: "model", required: true },
    ],
    parameters: [
      { id: "amount", name: "Pruning Amount", type: "number", default: 0.3, min: 0.0, max: 0.99, step: 0.05 },
      { id: "warmup_steps", name: "Warmup Steps", type: "number", default: 100, min: 1, step: 10 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn.utils.prune as prune", "import copy"],
      body: `_initial_weights = {n: p.clone() for n, p in {{inputs.model}}.named_parameters() if "weight" in n}
{{inputs.model}}.train()
_step = 0
for _x, _y in {{inputs.dataloader}}:
    _preds = {{inputs.model}}(_x)
    _loss = {{inputs.loss_fn}}(_preds, _y)
    {{inputs.optimizer}}.zero_grad()
    _loss.backward()
    {{inputs.optimizer}}.step()
    _step += 1
    if _step >= {{params.warmup_steps}}:
        break
_movements = {}
for _n, _p in {{inputs.model}}.named_parameters():
    if _n in _initial_weights:
        _movements[_n] = (_p.data - _initial_weights[_n]).abs()
_all_mvmt = torch.cat([m.flatten() for m in _movements.values()])
_threshold = torch.quantile(_all_mvmt, {{params.amount}})
for _n, _p in {{inputs.model}}.named_parameters():
    if _n in _movements:
        _mask = (_movements[_n] > _threshold).float()
        _p.data *= _mask
{{outputs.pruned_model}} = {{inputs.model}}`,
      outputBindings: { pruned_model: "movement_pruned_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. Lottery Ticket Mask
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.lottery-ticket-mask",
    name: "Lottery Ticket Mask",
    category: "distillation",
    description: "Identify a sparse sub-network (lottery ticket) by iterative magnitude pruning and rewinding",
    tags: ["compression", "pruning", "lottery-ticket", "rewinding", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "dataloader", name: "DataLoader", type: "dataloader", required: true },
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    outputs: [
      { id: "mask", name: "Pruning Mask", type: "dict", required: true },
      { id: "model_out", name: "Masked Model", type: "model", required: true },
    ],
    parameters: [
      { id: "prune_rate", name: "Prune Rate per Round", type: "number", default: 0.2, min: 0.05, max: 0.5, step: 0.05 },
      { id: "rounds", name: "Pruning Rounds", type: "number", default: 3, min: 1, max: 20, step: 1 },
      { id: "train_steps", name: "Train Steps per Round", type: "number", default: 500, min: 10, step: 10 },
      { id: "lr", name: "Learning Rate", type: "number", default: 0.01, min: 0.0001, max: 1.0, step: 0.001 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn.utils.prune as prune", "import copy"],
      body: `_init_state = copy.deepcopy({{inputs.model}}.state_dict())
_masks = {}
for _round in range({{params.rounds}}):
    {{inputs.model}}.load_state_dict(_init_state)
    for _n, _m in _masks.items():
        dict({{inputs.model}}.named_parameters())[_n].data *= _m
    _opt = torch.optim.SGD({{inputs.model}}.parameters(), lr={{params.lr}})
    {{inputs.model}}.train()
    _step = 0
    for _x, _y in {{inputs.dataloader}}:
        _loss = {{inputs.loss_fn}}({{inputs.model}}(_x), _y)
        _opt.zero_grad()
        _loss.backward()
        _opt.step()
        _step += 1
        if _step >= {{params.train_steps}}:
            break
    for _n, _p in {{inputs.model}}.named_parameters():
        if "weight" in _n:
            _thresh = torch.quantile(_p.data.abs().flatten(), {{params.prune_rate}})
            _new_mask = (_p.data.abs() > _thresh).float()
            _masks[_n] = _masks.get(_n, torch.ones_like(_p.data)) * _new_mask
{{outputs.mask}} = _masks
{{inputs.model}}.load_state_dict(_init_state)
for _n, _m in _masks.items():
    dict({{inputs.model}}.named_parameters())[_n].data *= _m
{{outputs.model_out}} = {{inputs.model}}`,
      outputBindings: { mask: "lottery_ticket_mask", model_out: "lottery_ticket_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. Weight Sharing
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.weight-sharing",
    name: "Weight Sharing",
    category: "distillation",
    description: "Compress a model by clustering weights and sharing centroids across groups",
    tags: ["compression", "weight-sharing", "clustering", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "compressed_model", name: "Compressed Model", type: "model", required: true },
    ],
    parameters: [
      { id: "num_clusters", name: "Number of Clusters", type: "number", default: 16, min: 2, max: 256, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "from sklearn.cluster import KMeans", "import numpy as np"],
      body: `for _name, _param in {{inputs.model}}.named_parameters():
    if "weight" in _name and _param.dim() >= 2:
        _w = _param.data.cpu().numpy().flatten()
        _kmeans = KMeans(n_clusters=min({{params.num_clusters}}, len(_w)), random_state=0, n_init=10).fit(_w.reshape(-1, 1))
        _quantized = _kmeans.cluster_centers_[_kmeans.labels_].reshape(_param.shape)
        _param.data = torch.tensor(_quantized, dtype=_param.dtype, device=_param.device)
{{outputs.compressed_model}} = {{inputs.model}}`,
      outputBindings: { compressed_model: "weight_shared_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 23. Low-Rank Factorization
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.low-rank-factorization",
    name: "Low-Rank Factorization",
    category: "distillation",
    description: "Replace weight matrices with low-rank approximations using SVD to reduce parameters",
    tags: ["compression", "low-rank", "svd", "factorization", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "factorized_model", name: "Factorized Model", type: "model", required: true },
      { id: "compression_ratio", name: "Compression Ratio", type: "number", required: true },
    ],
    parameters: [
      { id: "rank_fraction", name: "Rank Fraction", type: "number", default: 0.5, min: 0.05, max: 0.95, step: 0.05, description: "Fraction of original rank to keep" },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `_original_params = sum(p.numel() for p in {{inputs.model}}.parameters())
for _name, _module in list({{inputs.model}}.named_modules()):
    if isinstance(_module, nn.Linear):
        _W = _module.weight.data
        _rank = max(1, int(min(_W.shape) * {{params.rank_fraction}}))
        _U, _S, _Vh = torch.linalg.svd(_W, full_matrices=False)
        _U_r = _U[:, :_rank] @ torch.diag(_S[:_rank])
        _V_r = _Vh[:_rank, :]
        _linear1 = nn.Linear(_V_r.shape[1], _rank, bias=False)
        _linear2 = nn.Linear(_rank, _U_r.shape[0], bias=_module.bias is not None)
        _linear1.weight.data = _V_r
        _linear2.weight.data = _U_r
        if _module.bias is not None:
            _linear2.bias.data = _module.bias.data
        _parts = _name.rsplit(".", 1)
        if len(_parts) == 2:
            _parent = dict({{inputs.model}}.named_modules())[_parts[0]]
            setattr(_parent, _parts[1], nn.Sequential(_linear1, _linear2))
        else:
            setattr({{inputs.model}}, _name, nn.Sequential(_linear1, _linear2))
_new_params = sum(p.numel() for p in {{inputs.model}}.parameters())
{{outputs.compression_ratio}} = _original_params / _new_params
{{outputs.factorized_model}} = {{inputs.model}}`,
      outputBindings: { factorized_model: "factorized_model", compression_ratio: "compression_ratio" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 24. ONNX Export
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.onnx-export",
    name: "ONNX Export",
    category: "distillation",
    description: "Export a PyTorch model to ONNX format for cross-framework inference",
    tags: ["export", "onnx", "inference", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "sample_input", name: "Sample Input", type: "tensor", required: true },
    ],
    outputs: [
      { id: "onnx_path", name: "ONNX File Path", type: "path", required: true },
    ],
    parameters: [
      { id: "output_path", name: "Output Path", type: "string", default: "./model.onnx" },
      { id: "opset_version", name: "Opset Version", type: "number", default: 17, min: 9, max: 20, step: 1 },
      { id: "dynamic_axes", name: "Dynamic Batch Dim", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import torch", "import onnx"],
      body: `{{inputs.model}}.eval()
_dynamic = {"input": {0: "batch"}, "output": {0: "batch"}} if {{params.dynamic_axes}} else None
torch.onnx.export({{inputs.model}}, {{inputs.sample_input}}, "{{params.output_path}}", opset_version={{params.opset_version}}, input_names=["input"], output_names=["output"], dynamic_axes=_dynamic)
_onnx_model = onnx.load("{{params.output_path}}")
onnx.checker.check_model(_onnx_model)
{{outputs.onnx_path}} = "{{params.output_path}}"`,
      outputBindings: { onnx_path: "onnx_file_path" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 25. TensorRT Export
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.tensorrt-export",
    name: "TensorRT Export",
    category: "distillation",
    description: "Optimize and export a model using NVIDIA TensorRT for high-performance GPU inference",
    tags: ["export", "tensorrt", "nvidia", "optimization", "inference"],
    inputs: [
      { id: "onnx_path", name: "ONNX Model Path", type: "path", required: true },
    ],
    outputs: [
      { id: "engine_path", name: "TensorRT Engine Path", type: "path", required: true },
    ],
    parameters: [
      { id: "output_path", name: "Output Path", type: "string", default: "./model.trt" },
      { id: "precision", name: "Precision", type: "select", default: "fp16", options: [{ label: "FP32", value: "fp32" }, { label: "FP16", value: "fp16" }, { label: "INT8", value: "int8" }] },
      { id: "max_batch_size", name: "Max Batch Size", type: "number", default: 8, min: 1, max: 256, step: 1 },
      { id: "workspace_gb", name: "Workspace (GB)", type: "number", default: 4, min: 1, max: 32, step: 1 },
    ],
    codeTemplate: {
      imports: ["import tensorrt as trt"],
      body: `_logger = trt.Logger(trt.Logger.WARNING)
_builder = trt.Builder(_logger)
_network = _builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))
_parser = trt.OnnxParser(_network, _logger)
with open({{inputs.onnx_path}}, "rb") as _f:
    _parser.parse(_f.read())
_config = _builder.create_builder_config()
_config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, {{params.workspace_gb}} << 30)
if "{{params.precision}}" == "fp16":
    _config.set_flag(trt.BuilderFlag.FP16)
elif "{{params.precision}}" == "int8":
    _config.set_flag(trt.BuilderFlag.INT8)
_engine = _builder.build_serialized_network(_network, _config)
with open("{{params.output_path}}", "wb") as _f:
    _f.write(_engine)
{{outputs.engine_path}} = "{{params.output_path}}"`,
      outputBindings: { engine_path: "trt_engine_path" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 26. TFLite Export
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.tflite-export",
    name: "TFLite Export",
    category: "distillation",
    description: "Convert and export a model to TensorFlow Lite format for mobile and edge deployment",
    tags: ["export", "tflite", "mobile", "edge", "tensorflow"],
    inputs: [
      { id: "saved_model_path", name: "SavedModel or ONNX Path", type: "path", required: true },
    ],
    outputs: [
      { id: "tflite_path", name: "TFLite File Path", type: "path", required: true },
    ],
    parameters: [
      { id: "output_path", name: "Output Path", type: "string", default: "./model.tflite" },
      { id: "quantize", name: "Post-Training Quantization", type: "select", default: "none", options: [{ label: "None", value: "none" }, { label: "Dynamic Range", value: "dynamic" }, { label: "Float16", value: "float16" }, { label: "Full Integer", value: "int8" }] },
    ],
    codeTemplate: {
      imports: ["import tensorflow as tf"],
      body: `_converter = tf.lite.TFLiteConverter.from_saved_model({{inputs.saved_model_path}})
if "{{params.quantize}}" == "dynamic":
    _converter.optimizations = [tf.lite.Optimize.DEFAULT]
elif "{{params.quantize}}" == "float16":
    _converter.optimizations = [tf.lite.Optimize.DEFAULT]
    _converter.target_spec.supported_types = [tf.float16]
elif "{{params.quantize}}" == "int8":
    _converter.optimizations = [tf.lite.Optimize.DEFAULT]
    _converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
_tflite_model = _converter.convert()
with open("{{params.output_path}}", "wb") as _f:
    _f.write(_tflite_model)
{{outputs.tflite_path}} = "{{params.output_path}}"`,
      outputBindings: { tflite_path: "tflite_file_path" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 27. Model Benchmarker
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "distillation.model-benchmarker",
    name: "Model Benchmarker",
    category: "distillation",
    description: "Benchmark model latency, throughput, memory usage, and parameter count",
    tags: ["benchmark", "latency", "throughput", "profiling", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "sample_input", name: "Sample Input", type: "tensor", required: true },
    ],
    outputs: [
      { id: "report", name: "Benchmark Report", type: "dict", required: true },
    ],
    parameters: [
      { id: "num_warmup", name: "Warmup Iterations", type: "number", default: 10, min: 0, max: 100, step: 1 },
      { id: "num_runs", name: "Benchmark Iterations", type: "number", default: 100, min: 10, max: 1000, step: 10 },
      { id: "device", name: "Device", type: "select", default: "auto", options: [{ label: "Auto", value: "auto" }, { label: "CPU", value: "cpu" }, { label: "CUDA:0", value: "cuda:0" }] },
    ],
    codeTemplate: {
      imports: ["import torch", "import time"],
      body: `_device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if "{{params.device}}" == "auto" else torch.device("{{params.device}}")
{{inputs.model}}.to(_device).eval()
_inp = {{inputs.sample_input}}.to(_device)
_n_params = sum(p.numel() for p in {{inputs.model}}.parameters())
_n_trainable = sum(p.numel() for p in {{inputs.model}}.parameters() if p.requires_grad)
with torch.no_grad():
    for _ in range({{params.num_warmup}}):
        {{inputs.model}}(_inp)
    if _device.type == "cuda":
        torch.cuda.synchronize()
    _start = time.perf_counter()
    for _ in range({{params.num_runs}}):
        {{inputs.model}}(_inp)
    if _device.type == "cuda":
        torch.cuda.synchronize()
    _elapsed = time.perf_counter() - _start
_avg_ms = (_elapsed / {{params.num_runs}}) * 1000
_throughput = {{params.num_runs}} / _elapsed
_mem_mb = torch.cuda.max_memory_allocated(_device) / 1e6 if _device.type == "cuda" else 0
{{outputs.report}} = {"avg_latency_ms": round(_avg_ms, 3), "throughput_per_sec": round(_throughput, 2), "total_params": _n_params, "trainable_params": _n_trainable, "gpu_memory_mb": round(_mem_mb, 2), "device": str(_device)}`,
      outputBindings: { report: "benchmark_report" },
    },
  },
];
