import type { BlockDefinition } from "../types.js";

export const trainingBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Train Loop
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.train-loop",
    name: "Train Loop",
    category: "training",
    description: "Standard PyTorch training loop that iterates over a DataLoader for one epoch",
    tags: ["training", "loop", "epoch", "pytorch"],
    scopeType: "loop",
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "dataloader", name: "Train DataLoader", type: "dataloader", required: true },
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    outputs: [
      { id: "epoch_loss", name: "Epoch Loss", type: "number", required: true },
      { id: "model_out", name: "Trained Model", type: "model", required: true },
    ],
    parameters: [
      { id: "num_epochs", name: "Number of Epochs", type: "number", default: 10, min: 1, max: 10000, step: 1 },
      { id: "log_interval", name: "Log Interval (batches)", type: "number", default: 100, min: 1, step: 1 },
      { id: "device", name: "Device", type: "select", default: "auto", options: [{ label: "Auto (CUDA if available)", value: "auto" }, { label: "CPU", value: "cpu" }, { label: "CUDA:0", value: "cuda:0" }] },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `_device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if "{{params.device}}" == "auto" else torch.device("{{params.device}}")
{{inputs.model}}.to(_device)
{{inputs.model}}.train()
for _epoch in range({{params.num_epochs}}):
    _running_loss = 0.0
    for _batch_idx, (_inputs, _targets) in enumerate({{inputs.dataloader}}):
        _inputs, _targets = _inputs.to(_device), _targets.to(_device)
        {{inputs.optimizer}}.zero_grad()
        _preds = {{inputs.model}}(_inputs)
        _loss = {{inputs.loss_fn}}(_preds, _targets)
        _loss.backward()
        {{inputs.optimizer}}.step()
        _running_loss += _loss.item()
        if (_batch_idx + 1) % {{params.log_interval}} == 0:
            print(f"Epoch {_epoch+1}, Batch {_batch_idx+1}, Loss: {_running_loss/(_batch_idx+1):.4f}")
    {{outputs.epoch_loss}} = _running_loss / len({{inputs.dataloader}})
{{outputs.model_out}} = {{inputs.model}}`,
      outputBindings: { epoch_loss: "train_epoch_loss", model_out: "trained_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Eval Loop
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.eval-loop",
    name: "Eval Loop",
    category: "training",
    description: "Evaluate a model on a dataset without gradient computation",
    tags: ["training", "evaluation", "loop", "inference", "pytorch"],
    scopeType: "loop",
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "dataloader", name: "Eval DataLoader", type: "dataloader", required: true },
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    outputs: [
      { id: "eval_loss", name: "Eval Loss", type: "number", required: true },
      { id: "all_preds", name: "All Predictions", type: "tensor", required: true },
      { id: "all_targets", name: "All Targets", type: "tensor", required: true },
    ],
    parameters: [
      { id: "device", name: "Device", type: "select", default: "auto", options: [{ label: "Auto", value: "auto" }, { label: "CPU", value: "cpu" }, { label: "CUDA:0", value: "cuda:0" }] },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `_device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if "{{params.device}}" == "auto" else torch.device("{{params.device}}")
{{inputs.model}}.to(_device)
{{inputs.model}}.eval()
_total_loss = 0.0
_preds_list, _targets_list = [], []
with torch.no_grad():
    for _inputs, _targets in {{inputs.dataloader}}:
        _inputs, _targets = _inputs.to(_device), _targets.to(_device)
        _preds = {{inputs.model}}(_inputs)
        _total_loss += {{inputs.loss_fn}}(_preds, _targets).item()
        _preds_list.append(_preds.cpu())
        _targets_list.append(_targets.cpu())
{{outputs.eval_loss}} = _total_loss / len({{inputs.dataloader}})
{{outputs.all_preds}} = torch.cat(_preds_list, dim=0)
{{outputs.all_targets}} = torch.cat(_targets_list, dim=0)`,
      outputBindings: { eval_loss: "eval_loss", all_preds: "eval_preds", all_targets: "eval_targets" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Validation Step
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.validation-step",
    name: "Validation Step",
    category: "training",
    description: "Run a single validation step on a batch and return loss and predictions",
    tags: ["training", "validation", "step", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "batch", name: "Batch (inputs, targets)", type: "any", required: true },
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    outputs: [
      { id: "val_loss", name: "Validation Loss", type: "number", required: true },
      { id: "preds", name: "Predictions", type: "tensor", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["import torch"],
      body: `{{inputs.model}}.eval()
_val_inputs, _val_targets = {{inputs.batch}}
with torch.no_grad():
    {{outputs.preds}} = {{inputs.model}}(_val_inputs)
    {{outputs.val_loss}} = {{inputs.loss_fn}}({{outputs.preds}}, _val_targets).item()`,
      outputBindings: { val_loss: "val_loss", preds: "val_preds" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Gradient Accumulate
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.gradient-accumulate",
    name: "Gradient Accumulate",
    category: "training",
    description: "Accumulate gradients across multiple mini-batches to simulate a larger batch size",
    tags: ["training", "gradient", "accumulation", "memory", "pytorch"],
    scopeType: "loop",
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "dataloader", name: "DataLoader", type: "dataloader", required: true },
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    outputs: [
      { id: "epoch_loss", name: "Epoch Loss", type: "number", required: true },
    ],
    parameters: [
      { id: "accum_steps", name: "Accumulation Steps", type: "number", default: 4, min: 1, max: 128, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `{{inputs.model}}.train()
{{inputs.optimizer}}.zero_grad()
_running_loss = 0.0
for _step, (_inputs, _targets) in enumerate({{inputs.dataloader}}):
    _preds = {{inputs.model}}(_inputs)
    _loss = {{inputs.loss_fn}}(_preds, _targets) / {{params.accum_steps}}
    _loss.backward()
    if (_step + 1) % {{params.accum_steps}} == 0:
        {{inputs.optimizer}}.step()
        {{inputs.optimizer}}.zero_grad()
    _running_loss += _loss.item() * {{params.accum_steps}}
{{outputs.epoch_loss}} = _running_loss / len({{inputs.dataloader}})`,
      outputBindings: { epoch_loss: "accum_epoch_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Forward Pass
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.forward-pass",
    name: "Forward Pass",
    category: "training",
    description: "Execute a single forward pass through a model on a batch of inputs",
    tags: ["training", "forward", "inference", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "inputs", name: "Inputs", type: "tensor", required: true },
    ],
    outputs: [
      { id: "output", name: "Model Output", type: "tensor", required: true },
    ],
    parameters: [
      { id: "no_grad", name: "Disable Gradients", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `if {{params.no_grad}}:
    with torch.no_grad():
        {{outputs.output}} = {{inputs.model}}({{inputs.inputs}})
else:
    {{outputs.output}} = {{inputs.model}}({{inputs.inputs}})`,
      outputBindings: { output: "forward_output" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Backward Pass
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.backward-pass",
    name: "Backward Pass",
    category: "training",
    description: "Compute gradients by back-propagating a loss value",
    tags: ["training", "backward", "gradient", "backpropagation", "pytorch"],
    inputs: [
      { id: "loss", name: "Loss", type: "number", required: true },
    ],
    outputs: [],
    parameters: [
      { id: "retain_graph", name: "Retain Computation Graph", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: [],
      body: `{{inputs.loss}}.backward(retain_graph={{params.retain_graph}})`,
      outputBindings: {},
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Optimizer Step
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.optimizer-step",
    name: "Optimizer Step",
    category: "training",
    description: "Execute one optimizer step to update model parameters from accumulated gradients",
    tags: ["training", "optimizer", "step", "update", "pytorch"],
    inputs: [
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
    ],
    outputs: [],
    parameters: [
      { id: "zero_grad_after", name: "Zero Gradients After Step", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: [],
      body: `{{inputs.optimizer}}.step()
if {{params.zero_grad_after}}:
    {{inputs.optimizer}}.zero_grad(set_to_none=True)`,
      outputBindings: {},
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Adam Optimizer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.adam-optimizer",
    name: "Adam Optimizer",
    category: "training",
    description: "Create an Adam optimizer for model parameter updates",
    tags: ["training", "optimizer", "adam", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "optimizer", name: "Adam Optimizer", type: "optimizer", required: true },
    ],
    parameters: [
      { id: "lr", name: "Learning Rate", type: "number", default: 0.001, min: 0, max: 1, step: 0.0001 },
      { id: "beta1", name: "Beta 1", type: "number", default: 0.9, min: 0, max: 1, step: 0.01 },
      { id: "beta2", name: "Beta 2", type: "number", default: 0.999, min: 0, max: 1, step: 0.001 },
      { id: "weight_decay", name: "Weight Decay", type: "number", default: 0, min: 0, max: 1, step: 0.0001 },
      { id: "eps", name: "Epsilon", type: "number", default: 1e-8, min: 0, step: 1e-9, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.optim as optim"],
      body: `{{outputs.optimizer}} = optim.Adam(
    {{inputs.model}}.parameters(),
    lr={{params.lr}},
    betas=({{params.beta1}}, {{params.beta2}}),
    weight_decay={{params.weight_decay}},
    eps={{params.eps}}
)`,
      outputBindings: { optimizer: "adam_optimizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. AdamW Optimizer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.adamw-optimizer",
    name: "AdamW Optimizer",
    category: "training",
    description: "Create an AdamW optimizer with decoupled weight decay regularization",
    tags: ["training", "optimizer", "adamw", "weight-decay", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "optimizer", name: "AdamW Optimizer", type: "optimizer", required: true },
    ],
    parameters: [
      { id: "lr", name: "Learning Rate", type: "number", default: 0.001, min: 0, max: 1, step: 0.0001 },
      { id: "beta1", name: "Beta 1", type: "number", default: 0.9, min: 0, max: 1, step: 0.01 },
      { id: "beta2", name: "Beta 2", type: "number", default: 0.999, min: 0, max: 1, step: 0.001 },
      { id: "weight_decay", name: "Weight Decay", type: "number", default: 0.01, min: 0, max: 1, step: 0.001 },
      { id: "eps", name: "Epsilon", type: "number", default: 1e-8, min: 0, step: 1e-9, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.optim as optim"],
      body: `{{outputs.optimizer}} = optim.AdamW(
    {{inputs.model}}.parameters(),
    lr={{params.lr}},
    betas=({{params.beta1}}, {{params.beta2}}),
    weight_decay={{params.weight_decay}},
    eps={{params.eps}}
)`,
      outputBindings: { optimizer: "adamw_optimizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. SGD Optimizer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.sgd-optimizer",
    name: "SGD Optimizer",
    category: "training",
    description: "Create a Stochastic Gradient Descent optimizer with optional momentum and Nesterov",
    tags: ["training", "optimizer", "sgd", "momentum", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "optimizer", name: "SGD Optimizer", type: "optimizer", required: true },
    ],
    parameters: [
      { id: "lr", name: "Learning Rate", type: "number", default: 0.01, min: 0, max: 10, step: 0.001 },
      { id: "momentum", name: "Momentum", type: "number", default: 0.9, min: 0, max: 1, step: 0.01 },
      { id: "weight_decay", name: "Weight Decay", type: "number", default: 0, min: 0, max: 1, step: 0.0001 },
      { id: "nesterov", name: "Nesterov Momentum", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import torch.optim as optim"],
      body: `{{outputs.optimizer}} = optim.SGD(
    {{inputs.model}}.parameters(),
    lr={{params.lr}},
    momentum={{params.momentum}},
    weight_decay={{params.weight_decay}},
    nesterov={{params.nesterov}}
)`,
      outputBindings: { optimizer: "sgd_optimizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Adagrad
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.adagrad-optimizer",
    name: "Adagrad",
    category: "training",
    description: "Create an Adagrad optimizer with per-parameter adaptive learning rates",
    tags: ["training", "optimizer", "adagrad", "adaptive", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "optimizer", name: "Adagrad Optimizer", type: "optimizer", required: true },
    ],
    parameters: [
      { id: "lr", name: "Learning Rate", type: "number", default: 0.01, min: 0, max: 1, step: 0.001 },
      { id: "lr_decay", name: "LR Decay", type: "number", default: 0, min: 0, max: 1, step: 0.001 },
      { id: "weight_decay", name: "Weight Decay", type: "number", default: 0, min: 0, max: 1, step: 0.0001 },
      { id: "eps", name: "Epsilon", type: "number", default: 1e-10, min: 0, step: 1e-11, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.optim as optim"],
      body: `{{outputs.optimizer}} = optim.Adagrad(
    {{inputs.model}}.parameters(),
    lr={{params.lr}},
    lr_decay={{params.lr_decay}},
    weight_decay={{params.weight_decay}},
    eps={{params.eps}}
)`,
      outputBindings: { optimizer: "adagrad_optimizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. RMSProp
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.rmsprop-optimizer",
    name: "RMSProp",
    category: "training",
    description: "Create an RMSProp optimizer that adapts learning rates using running average of squared gradients",
    tags: ["training", "optimizer", "rmsprop", "adaptive", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "optimizer", name: "RMSProp Optimizer", type: "optimizer", required: true },
    ],
    parameters: [
      { id: "lr", name: "Learning Rate", type: "number", default: 0.01, min: 0, max: 1, step: 0.001 },
      { id: "alpha", name: "Alpha (smoothing)", type: "number", default: 0.99, min: 0, max: 1, step: 0.01 },
      { id: "momentum", name: "Momentum", type: "number", default: 0, min: 0, max: 1, step: 0.01 },
      { id: "weight_decay", name: "Weight Decay", type: "number", default: 0, min: 0, max: 1, step: 0.0001 },
      { id: "centered", name: "Centered", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import torch.optim as optim"],
      body: `{{outputs.optimizer}} = optim.RMSprop(
    {{inputs.model}}.parameters(),
    lr={{params.lr}},
    alpha={{params.alpha}},
    momentum={{params.momentum}},
    weight_decay={{params.weight_decay}},
    centered={{params.centered}}
)`,
      outputBindings: { optimizer: "rmsprop_optimizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. LAMB Optimizer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.lamb-optimizer",
    name: "LAMB Optimizer",
    category: "training",
    description: "Layer-wise Adaptive Moments optimizer for large-batch training",
    tags: ["training", "optimizer", "lamb", "large-batch", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "optimizer", name: "LAMB Optimizer", type: "optimizer", required: true },
    ],
    parameters: [
      { id: "lr", name: "Learning Rate", type: "number", default: 0.001, min: 0, max: 1, step: 0.0001 },
      { id: "beta1", name: "Beta 1", type: "number", default: 0.9, min: 0, max: 1, step: 0.01 },
      { id: "beta2", name: "Beta 2", type: "number", default: 0.999, min: 0, max: 1, step: 0.001 },
      { id: "weight_decay", name: "Weight Decay", type: "number", default: 0.01, min: 0, max: 1, step: 0.001 },
    ],
    codeTemplate: {
      imports: ["from torch_optimizer import Lamb"],
      body: `{{outputs.optimizer}} = Lamb(
    {{inputs.model}}.parameters(),
    lr={{params.lr}},
    betas=({{params.beta1}}, {{params.beta2}}),
    weight_decay={{params.weight_decay}}
)`,
      outputBindings: { optimizer: "lamb_optimizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Lion Optimizer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.lion-optimizer",
    name: "Lion Optimizer",
    category: "training",
    description: "EvoLved Sign Momentum optimizer — memory-efficient alternative to Adam",
    tags: ["training", "optimizer", "lion", "efficient", "google"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "optimizer", name: "Lion Optimizer", type: "optimizer", required: true },
    ],
    parameters: [
      { id: "lr", name: "Learning Rate", type: "number", default: 0.0001, min: 0, max: 1, step: 0.00001 },
      { id: "beta1", name: "Beta 1", type: "number", default: 0.9, min: 0, max: 1, step: 0.01 },
      { id: "beta2", name: "Beta 2", type: "number", default: 0.99, min: 0, max: 1, step: 0.01 },
      { id: "weight_decay", name: "Weight Decay", type: "number", default: 0.0, min: 0, max: 1, step: 0.001 },
    ],
    codeTemplate: {
      imports: ["from lion_pytorch import Lion"],
      body: `{{outputs.optimizer}} = Lion(
    {{inputs.model}}.parameters(),
    lr={{params.lr}},
    betas=({{params.beta1}}, {{params.beta2}}),
    weight_decay={{params.weight_decay}}
)`,
      outputBindings: { optimizer: "lion_optimizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Learning Rate Scheduler (Cosine)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.lr-scheduler-cosine",
    name: "Learning Rate Scheduler (Cosine)",
    category: "training",
    description: "Cosine annealing learning rate scheduler that decays LR following a cosine curve",
    tags: ["training", "scheduler", "cosine", "annealing", "lr", "pytorch"],
    inputs: [
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
    ],
    outputs: [
      { id: "scheduler", name: "LR Scheduler", type: "scheduler", required: true },
    ],
    parameters: [
      { id: "T_max", name: "T_max (total steps)", type: "number", default: 1000, min: 1, step: 1 },
      { id: "eta_min", name: "Min Learning Rate", type: "number", default: 0, min: 0, max: 1, step: 0.00001 },
    ],
    codeTemplate: {
      imports: ["from torch.optim.lr_scheduler import CosineAnnealingLR"],
      body: `{{outputs.scheduler}} = CosineAnnealingLR({{inputs.optimizer}}, T_max={{params.T_max}}, eta_min={{params.eta_min}})`,
      outputBindings: { scheduler: "cosine_scheduler" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. LR Scheduler (Linear Warmup)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.lr-scheduler-linear-warmup",
    name: "LR Scheduler (Linear Warmup)",
    category: "training",
    description: "Linear warmup followed by linear decay, commonly used with transformers",
    tags: ["training", "scheduler", "warmup", "linear", "transformers"],
    inputs: [
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
    ],
    outputs: [
      { id: "scheduler", name: "LR Scheduler", type: "scheduler", required: true },
    ],
    parameters: [
      { id: "num_warmup_steps", name: "Warmup Steps", type: "number", default: 500, min: 0, step: 1 },
      { id: "num_training_steps", name: "Total Training Steps", type: "number", default: 10000, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["from transformers import get_linear_schedule_with_warmup"],
      body: `{{outputs.scheduler}} = get_linear_schedule_with_warmup(
    {{inputs.optimizer}},
    num_warmup_steps={{params.num_warmup_steps}},
    num_training_steps={{params.num_training_steps}}
)`,
      outputBindings: { scheduler: "warmup_scheduler" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. LR Scheduler (Step)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.lr-scheduler-step",
    name: "LR Scheduler (Step)",
    category: "training",
    description: "Decay the learning rate by a factor gamma every step_size epochs",
    tags: ["training", "scheduler", "step", "decay", "pytorch"],
    inputs: [
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
    ],
    outputs: [
      { id: "scheduler", name: "LR Scheduler", type: "scheduler", required: true },
    ],
    parameters: [
      { id: "step_size", name: "Step Size (epochs)", type: "number", default: 30, min: 1, step: 1 },
      { id: "gamma", name: "Gamma (decay factor)", type: "number", default: 0.1, min: 0, max: 1, step: 0.01 },
    ],
    codeTemplate: {
      imports: ["from torch.optim.lr_scheduler import StepLR"],
      body: `{{outputs.scheduler}} = StepLR({{inputs.optimizer}}, step_size={{params.step_size}}, gamma={{params.gamma}})`,
      outputBindings: { scheduler: "step_scheduler" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. LR Scheduler (Reduce on Plateau)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.lr-scheduler-plateau",
    name: "LR Scheduler (Reduce on Plateau)",
    category: "training",
    description: "Reduce learning rate when a monitored metric has stopped improving",
    tags: ["training", "scheduler", "plateau", "adaptive", "pytorch"],
    inputs: [
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
    ],
    outputs: [
      { id: "scheduler", name: "LR Scheduler", type: "scheduler", required: true },
    ],
    parameters: [
      { id: "mode", name: "Mode", type: "select", default: "min", options: [{ label: "Min (loss)", value: "min" }, { label: "Max (accuracy)", value: "max" }] },
      { id: "factor", name: "Factor", type: "number", default: 0.1, min: 0, max: 1, step: 0.01 },
      { id: "patience", name: "Patience (epochs)", type: "number", default: 10, min: 1, step: 1 },
      { id: "threshold", name: "Threshold", type: "number", default: 0.0001, min: 0, step: 0.00001, advanced: true },
    ],
    codeTemplate: {
      imports: ["from torch.optim.lr_scheduler import ReduceLROnPlateau"],
      body: `{{outputs.scheduler}} = ReduceLROnPlateau(
    {{inputs.optimizer}},
    mode="{{params.mode}}",
    factor={{params.factor}},
    patience={{params.patience}},
    threshold={{params.threshold}}
)`,
      outputBindings: { scheduler: "plateau_scheduler" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. Cross-Entropy Loss
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.cross-entropy-loss",
    name: "Cross-Entropy Loss",
    category: "training",
    description: "Standard cross-entropy loss for multi-class classification",
    tags: ["training", "loss", "cross-entropy", "classification", "pytorch"],
    inputs: [],
    outputs: [
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    parameters: [
      { id: "label_smoothing", name: "Label Smoothing", type: "number", default: 0.0, min: 0, max: 0.5, step: 0.01 },
      { id: "ignore_index", name: "Ignore Index", type: "number", default: -100, step: 1, description: "Class index to ignore in loss", advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.loss_fn}} = nn.CrossEntropyLoss(label_smoothing={{params.label_smoothing}}, ignore_index={{params.ignore_index}})`,
      outputBindings: { loss_fn: "ce_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. Binary CE Loss
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.binary-ce-loss",
    name: "Binary CE Loss",
    category: "training",
    description: "Binary cross-entropy loss with optional logits mode for binary classification",
    tags: ["training", "loss", "binary", "cross-entropy", "classification", "pytorch"],
    inputs: [],
    outputs: [
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    parameters: [
      { id: "with_logits", name: "With Logits (numerically stable)", type: "boolean", default: true },
      { id: "reduction", name: "Reduction", type: "select", default: "mean", options: [{ label: "Mean", value: "mean" }, { label: "Sum", value: "sum" }, { label: "None", value: "none" }] },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `if {{params.with_logits}}:
    {{outputs.loss_fn}} = nn.BCEWithLogitsLoss(reduction="{{params.reduction}}")
else:
    {{outputs.loss_fn}} = nn.BCELoss(reduction="{{params.reduction}}")`,
      outputBindings: { loss_fn: "bce_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. MSE Loss
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.mse-loss",
    name: "MSE Loss",
    category: "training",
    description: "Mean Squared Error loss for regression tasks",
    tags: ["training", "loss", "mse", "regression", "pytorch"],
    inputs: [],
    outputs: [
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    parameters: [
      { id: "reduction", name: "Reduction", type: "select", default: "mean", options: [{ label: "Mean", value: "mean" }, { label: "Sum", value: "sum" }, { label: "None", value: "none" }] },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.loss_fn}} = nn.MSELoss(reduction="{{params.reduction}}")`,
      outputBindings: { loss_fn: "mse_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. MAE Loss
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.mae-loss",
    name: "MAE Loss",
    category: "training",
    description: "Mean Absolute Error (L1) loss for robust regression",
    tags: ["training", "loss", "mae", "l1", "regression", "pytorch"],
    inputs: [],
    outputs: [
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    parameters: [
      { id: "reduction", name: "Reduction", type: "select", default: "mean", options: [{ label: "Mean", value: "mean" }, { label: "Sum", value: "sum" }, { label: "None", value: "none" }] },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.loss_fn}} = nn.L1Loss(reduction="{{params.reduction}}")`,
      outputBindings: { loss_fn: "mae_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 23. Huber Loss
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.huber-loss",
    name: "Huber Loss",
    category: "training",
    description: "Smooth L1 / Huber loss that is less sensitive to outliers than MSE",
    tags: ["training", "loss", "huber", "smooth-l1", "regression", "pytorch"],
    inputs: [],
    outputs: [
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    parameters: [
      { id: "delta", name: "Delta", type: "number", default: 1.0, min: 0.01, max: 10, step: 0.1 },
      { id: "reduction", name: "Reduction", type: "select", default: "mean", options: [{ label: "Mean", value: "mean" }, { label: "Sum", value: "sum" }, { label: "None", value: "none" }] },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.loss_fn}} = nn.HuberLoss(delta={{params.delta}}, reduction="{{params.reduction}}")`,
      outputBindings: { loss_fn: "huber_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 24. Focal Loss
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.focal-loss",
    name: "Focal Loss",
    category: "training",
    description: "Focal loss for handling class imbalance by down-weighting easy examples",
    tags: ["training", "loss", "focal", "imbalance", "classification"],
    inputs: [],
    outputs: [
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    parameters: [
      { id: "alpha", name: "Alpha (class weight)", type: "number", default: 0.25, min: 0, max: 1, step: 0.01 },
      { id: "gamma", name: "Gamma (focus)", type: "number", default: 2.0, min: 0, max: 5, step: 0.1 },
      { id: "reduction", name: "Reduction", type: "select", default: "mean", options: [{ label: "Mean", value: "mean" }, { label: "Sum", value: "sum" }, { label: "None", value: "none" }] },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn", "import torch.nn.functional as F"],
      body: `class _FocalLoss(nn.Module):
    def __init__(self, alpha={{params.alpha}}, gamma={{params.gamma}}, reduction="{{params.reduction}}"):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction
    def forward(self, inputs, targets):
        ce_loss = F.cross_entropy(inputs, targets, reduction="none")
        pt = torch.exp(-ce_loss)
        focal_loss = self.alpha * (1 - pt) ** self.gamma * ce_loss
        if self.reduction == "mean":
            return focal_loss.mean()
        elif self.reduction == "sum":
            return focal_loss.sum()
        return focal_loss
{{outputs.loss_fn}} = _FocalLoss()`,
      outputBindings: { loss_fn: "focal_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 25. Contrastive Loss
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.contrastive-loss",
    name: "Contrastive Loss",
    category: "training",
    description: "Contrastive loss for learning similarity between pairs of embeddings",
    tags: ["training", "loss", "contrastive", "similarity", "metric-learning"],
    inputs: [],
    outputs: [
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    parameters: [
      { id: "margin", name: "Margin", type: "number", default: 1.0, min: 0, max: 10, step: 0.1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn", "import torch.nn.functional as F"],
      body: `class _ContrastiveLoss(nn.Module):
    def __init__(self, margin={{params.margin}}):
        super().__init__()
        self.margin = margin
    def forward(self, emb1, emb2, label):
        dist = F.pairwise_distance(emb1, emb2)
        loss = label * dist.pow(2) + (1 - label) * F.relu(self.margin - dist).pow(2)
        return loss.mean()
{{outputs.loss_fn}} = _ContrastiveLoss()`,
      outputBindings: { loss_fn: "contrastive_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 26. Triplet Loss
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.triplet-loss",
    name: "Triplet Loss",
    category: "training",
    description: "Triplet margin loss for metric learning with anchor/positive/negative samples",
    tags: ["training", "loss", "triplet", "metric-learning", "pytorch"],
    inputs: [],
    outputs: [
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    parameters: [
      { id: "margin", name: "Margin", type: "number", default: 1.0, min: 0, max: 10, step: 0.1 },
      { id: "p", name: "Distance Norm (p)", type: "number", default: 2, min: 1, max: 3, step: 1 },
      { id: "swap", name: "Swap (use hardest negative)", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.loss_fn}} = nn.TripletMarginLoss(margin={{params.margin}}, p={{params.p}}, swap={{params.swap}})`,
      outputBindings: { loss_fn: "triplet_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 27. RLHF Reward Signal
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.rlhf-reward-signal",
    name: "RLHF Reward Signal",
    category: "training",
    description: "Compute a reward signal from a reward model for RLHF training",
    tags: ["training", "rlhf", "reward", "alignment", "transformers"],
    inputs: [
      { id: "reward_model", name: "Reward Model", type: "model", required: true },
      { id: "input_ids", name: "Input IDs", type: "tensor", required: true },
      { id: "attention_mask", name: "Attention Mask", type: "tensor", required: true },
    ],
    outputs: [
      { id: "rewards", name: "Reward Scores", type: "tensor", required: true },
    ],
    parameters: [
      { id: "normalize", name: "Normalize Rewards", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `{{inputs.reward_model}}.eval()
with torch.no_grad():
    _reward_out = {{inputs.reward_model}}(input_ids={{inputs.input_ids}}, attention_mask={{inputs.attention_mask}})
    {{outputs.rewards}} = _reward_out.logits.squeeze(-1) if hasattr(_reward_out, "logits") else _reward_out[0].squeeze(-1)
if {{params.normalize}}:
    {{outputs.rewards}} = ({{outputs.rewards}} - {{outputs.rewards}}.mean()) / ({{outputs.rewards}}.std() + 1e-8)`,
      outputBindings: { rewards: "rlhf_rewards" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 28. KL Divergence Loss
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.kl-divergence-loss",
    name: "KL Divergence Loss",
    category: "training",
    description: "Kullback-Leibler divergence loss for distribution matching and knowledge distillation",
    tags: ["training", "loss", "kl-divergence", "distillation", "pytorch"],
    inputs: [],
    outputs: [
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    parameters: [
      { id: "reduction", name: "Reduction", type: "select", default: "batchmean", options: [{ label: "Batch Mean", value: "batchmean" }, { label: "Sum", value: "sum" }, { label: "Mean", value: "mean" }, { label: "None", value: "none" }] },
      { id: "log_target", name: "Target is Log-probability", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.loss_fn}} = nn.KLDivLoss(reduction="{{params.reduction}}", log_target={{params.log_target}})`,
      outputBindings: { loss_fn: "kl_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 29. Gradient Clip
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.gradient-clip",
    name: "Gradient Clip",
    category: "training",
    description: "Clip gradients by maximum norm or value to prevent exploding gradients",
    tags: ["training", "gradient", "clipping", "stability", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "total_norm", name: "Total Gradient Norm", type: "number", required: true },
    ],
    parameters: [
      { id: "method", name: "Clipping Method", type: "select", default: "norm", options: [{ label: "Clip by Norm", value: "norm" }, { label: "Clip by Value", value: "value" }] },
      { id: "max_norm", name: "Max Norm / Value", type: "number", default: 1.0, min: 0, max: 100, step: 0.1 },
      { id: "norm_type", name: "Norm Type", type: "number", default: 2.0, min: 1, max: 3, step: 0.5, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn.utils as nn_utils"],
      body: `if "{{params.method}}" == "norm":
    {{outputs.total_norm}} = nn_utils.clip_grad_norm_({{inputs.model}}.parameters(), max_norm={{params.max_norm}}, norm_type={{params.norm_type}}).item()
else:
    nn_utils.clip_grad_value_({{inputs.model}}.parameters(), clip_value={{params.max_norm}})
    {{outputs.total_norm}} = 0.0`,
      outputBindings: { total_norm: "grad_total_norm" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 30. Mixed Precision (AMP)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.mixed-precision-amp",
    name: "Mixed Precision (AMP)",
    category: "training",
    description: "Enable automatic mixed precision training with GradScaler for faster GPU training",
    tags: ["training", "amp", "mixed-precision", "fp16", "performance", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: true },
      { id: "dataloader", name: "DataLoader", type: "dataloader", required: true },
      { id: "loss_fn", name: "Loss Function", type: "loss_fn", required: true },
    ],
    outputs: [
      { id: "epoch_loss", name: "Epoch Loss", type: "number", required: true },
    ],
    parameters: [
      { id: "dtype", name: "AMP Dtype", type: "select", default: "float16", options: [{ label: "Float16", value: "float16" }, { label: "BFloat16", value: "bfloat16" }] },
      { id: "enabled", name: "Enabled", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import torch", "from torch.cuda.amp import autocast, GradScaler"],
      body: `_scaler = GradScaler(enabled={{params.enabled}})
_amp_dtype = torch.float16 if "{{params.dtype}}" == "float16" else torch.bfloat16
{{inputs.model}}.train()
_running_loss = 0.0
for _inputs, _targets in {{inputs.dataloader}}:
    {{inputs.optimizer}}.zero_grad()
    with autocast(dtype=_amp_dtype, enabled={{params.enabled}}):
        _preds = {{inputs.model}}(_inputs)
        _loss = {{inputs.loss_fn}}(_preds, _targets)
    _scaler.scale(_loss).backward()
    _scaler.step({{inputs.optimizer}})
    _scaler.update()
    _running_loss += _loss.item()
{{outputs.epoch_loss}} = _running_loss / len({{inputs.dataloader}})`,
      outputBindings: { epoch_loss: "amp_epoch_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 31. Checkpoint Save
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.checkpoint-save",
    name: "Checkpoint Save",
    category: "training",
    description: "Save a model checkpoint including model state, optimizer state, and epoch info",
    tags: ["training", "checkpoint", "save", "persistence", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: false },
      { id: "epoch", name: "Epoch Number", type: "number", required: false },
      { id: "loss", name: "Loss Value", type: "number", required: false },
    ],
    outputs: [
      { id: "path", name: "Saved Path", type: "path", required: true },
    ],
    parameters: [
      { id: "save_dir", name: "Save Directory", type: "string", default: "./checkpoints", placeholder: "Directory to save checkpoint" },
      { id: "filename", name: "Filename Pattern", type: "string", default: "checkpoint_epoch_{epoch}.pt", placeholder: "e.g., checkpoint_epoch_{epoch}.pt" },
    ],
    codeTemplate: {
      imports: ["import torch", "import os"],
      body: `os.makedirs("{{params.save_dir}}", exist_ok=True)
_ckpt_name = "{{params.filename}}".format(epoch={{inputs.epoch}} if {{inputs.epoch}} is not None else 0)
{{outputs.path}} = os.path.join("{{params.save_dir}}", _ckpt_name)
_ckpt = {
    "model_state_dict": {{inputs.model}}.state_dict(),
    "optimizer_state_dict": {{inputs.optimizer}}.state_dict() if {{inputs.optimizer}} is not None else None,
    "epoch": {{inputs.epoch}},
    "loss": {{inputs.loss}},
}
torch.save(_ckpt, {{outputs.path}})
print(f"Checkpoint saved to {{{outputs.path}}}")`,
      outputBindings: { path: "ckpt_save_path" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 32. Checkpoint Load
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.checkpoint-load",
    name: "Checkpoint Load",
    category: "training",
    description: "Load a model checkpoint and restore model/optimizer state",
    tags: ["training", "checkpoint", "load", "restore", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "optimizer", name: "Optimizer", type: "optimizer", required: false },
      { id: "ckpt_path", name: "Checkpoint Path", type: "path", required: true },
    ],
    outputs: [
      { id: "model_out", name: "Restored Model", type: "model", required: true },
      { id: "epoch", name: "Epoch", type: "number", required: true },
      { id: "loss", name: "Loss", type: "number", required: true },
    ],
    parameters: [
      { id: "strict", name: "Strict Loading", type: "boolean", default: true, description: "Fail if keys don't match exactly" },
      { id: "map_location", name: "Map Location", type: "select", default: "auto", options: [{ label: "Auto", value: "auto" }, { label: "CPU", value: "cpu" }, { label: "CUDA:0", value: "cuda:0" }] },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `_map_loc = "cpu" if "{{params.map_location}}" == "auto" and not torch.cuda.is_available() else ("{{params.map_location}}" if "{{params.map_location}}" != "auto" else None)
_ckpt = torch.load({{inputs.ckpt_path}}, map_location=_map_loc)
{{inputs.model}}.load_state_dict(_ckpt["model_state_dict"], strict={{params.strict}})
if {{inputs.optimizer}} is not None and _ckpt.get("optimizer_state_dict") is not None:
    {{inputs.optimizer}}.load_state_dict(_ckpt["optimizer_state_dict"])
{{outputs.model_out}} = {{inputs.model}}
{{outputs.epoch}} = _ckpt.get("epoch", 0)
{{outputs.loss}} = _ckpt.get("loss", 0.0)
print(f"Checkpoint loaded from {{{inputs.ckpt_path}}}, epoch={{{outputs.epoch}}}")`,
      outputBindings: { model_out: "restored_model", epoch: "ckpt_epoch", loss: "ckpt_loss" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 33. Early Stopping
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.early-stopping",
    name: "Early Stopping",
    category: "training",
    description: "Stop training when monitored metric stops improving (simple counter-based)",
    tags: ["training", "early-stopping", "regularization", "pytorch"],
    inputs: [
      { id: "metric_value", name: "Metric Value", type: "number", required: true },
    ],
    outputs: [
      { id: "should_stop", name: "Should Stop", type: "boolean", required: true },
      { id: "best_value", name: "Best Value", type: "number", required: true },
    ],
    parameters: [
      { id: "patience", name: "Patience", type: "number", default: 5, min: 1, max: 100, step: 1 },
      { id: "mode", name: "Mode", type: "select", default: "min", options: [{ label: "Min (loss)", value: "min" }, { label: "Max (accuracy)", value: "max" }] },
      { id: "min_delta", name: "Min Delta", type: "number", default: 0.0, min: 0, step: 0.0001 },
    ],
    codeTemplate: {
      imports: [],
      setup: `_es_counter = 0
_es_best = float("inf") if "{{params.mode}}" == "min" else float("-inf")`,
      body: `_improved = False
if "{{params.mode}}" == "min":
    _improved = {{inputs.metric_value}} < (_es_best - {{params.min_delta}})
else:
    _improved = {{inputs.metric_value}} > (_es_best + {{params.min_delta}})
if _improved:
    _es_best = {{inputs.metric_value}}
    _es_counter = 0
else:
    _es_counter += 1
{{outputs.should_stop}} = _es_counter >= {{params.patience}}
{{outputs.best_value}} = _es_best`,
      outputBindings: { should_stop: "es_should_stop", best_value: "es_best_value" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 34. EarlyStopping (Patience)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.early-stopping-patience",
    name: "EarlyStopping (Patience)",
    category: "training",
    description: "Reusable early stopping class with model checkpoint restoration on best epoch",
    tags: ["training", "early-stopping", "patience", "checkpoint", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "metric_value", name: "Metric Value", type: "number", required: true },
    ],
    outputs: [
      { id: "should_stop", name: "Should Stop", type: "boolean", required: true },
      { id: "is_best", name: "Is Best Epoch", type: "boolean", required: true },
    ],
    parameters: [
      { id: "patience", name: "Patience", type: "number", default: 7, min: 1, max: 200, step: 1 },
      { id: "mode", name: "Mode", type: "select", default: "min", options: [{ label: "Min (loss)", value: "min" }, { label: "Max (accuracy)", value: "max" }] },
      { id: "restore_best", name: "Restore Best Weights on Stop", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import copy"],
      setup: `_esp_counter = 0
_esp_best = float("inf") if "{{params.mode}}" == "min" else float("-inf")
_esp_best_state = None`,
      body: `{{outputs.is_best}} = False
if ("{{params.mode}}" == "min" and {{inputs.metric_value}} < _esp_best) or ("{{params.mode}}" == "max" and {{inputs.metric_value}} > _esp_best):
    _esp_best = {{inputs.metric_value}}
    _esp_counter = 0
    {{outputs.is_best}} = True
    if {{params.restore_best}}:
        _esp_best_state = copy.deepcopy({{inputs.model}}.state_dict())
else:
    _esp_counter += 1
{{outputs.should_stop}} = _esp_counter >= {{params.patience}}
if {{outputs.should_stop}} and {{params.restore_best}} and _esp_best_state is not None:
    {{inputs.model}}.load_state_dict(_esp_best_state)
    print("Restored best model weights.")`,
      outputBindings: { should_stop: "esp_should_stop", is_best: "esp_is_best" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 35. Epoch Counter
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.epoch-counter",
    name: "Epoch Counter",
    category: "training",
    description: "Track and emit the current epoch number in a training loop",
    tags: ["training", "epoch", "counter", "loop", "utility"],
    inputs: [],
    outputs: [
      { id: "epoch", name: "Current Epoch", type: "number", required: true },
    ],
    parameters: [
      { id: "start", name: "Start Epoch", type: "number", default: 0, min: 0, step: 1 },
      { id: "total", name: "Total Epochs", type: "number", default: 100, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: [],
      setup: `_current_epoch = {{params.start}}`,
      body: `{{outputs.epoch}} = _current_epoch
_current_epoch += 1
print(f"Epoch {{{outputs.epoch}} + 1}/{{{params.total}}}")`,
      outputBindings: { epoch: "current_epoch" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 36. Step Counter
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.step-counter",
    name: "Step Counter",
    category: "training",
    description: "Track the global training step across epochs for logging and scheduling",
    tags: ["training", "step", "counter", "global", "utility"],
    inputs: [],
    outputs: [
      { id: "global_step", name: "Global Step", type: "number", required: true },
    ],
    parameters: [
      { id: "start", name: "Start Step", type: "number", default: 0, min: 0, step: 1 },
    ],
    codeTemplate: {
      imports: [],
      setup: `_global_step = {{params.start}}`,
      body: `{{outputs.global_step}} = _global_step
_global_step += 1`,
      outputBindings: { global_step: "global_step" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 37. Batch Sampler
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.batch-sampler",
    name: "Batch Sampler",
    category: "training",
    description: "Create a custom batch sampler with configurable batch size, shuffling, and drop-last",
    tags: ["training", "sampler", "batch", "dataloader", "pytorch"],
    inputs: [
      { id: "dataset", name: "Dataset", type: "dataset", required: true },
    ],
    outputs: [
      { id: "dataloader", name: "DataLoader", type: "dataloader", required: true },
    ],
    parameters: [
      { id: "batch_size", name: "Batch Size", type: "number", default: 32, min: 1, step: 1 },
      { id: "shuffle", name: "Shuffle", type: "boolean", default: true },
      { id: "drop_last", name: "Drop Last Incomplete Batch", type: "boolean", default: false },
      { id: "num_workers", name: "Num Workers", type: "number", default: 4, min: 0, max: 32, step: 1 },
      { id: "pin_memory", name: "Pin Memory", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from torch.utils.data import DataLoader"],
      body: `{{outputs.dataloader}} = DataLoader(
    {{inputs.dataset}},
    batch_size={{params.batch_size}},
    shuffle={{params.shuffle}},
    drop_last={{params.drop_last}},
    num_workers={{params.num_workers}},
    pin_memory={{params.pin_memory}}
)`,
      outputBindings: { dataloader: "train_dataloader" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 38. Weighted Sampler
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.weighted-sampler",
    name: "Weighted Sampler",
    category: "training",
    description: "Create a weighted random sampler for handling class imbalance in training",
    tags: ["training", "sampler", "weighted", "imbalance", "pytorch"],
    inputs: [
      { id: "dataset", name: "Dataset", type: "dataset", required: true },
      { id: "labels", name: "Labels", type: "tensor", required: true, description: "Integer class labels for each sample" },
    ],
    outputs: [
      { id: "dataloader", name: "DataLoader", type: "dataloader", required: true },
    ],
    parameters: [
      { id: "batch_size", name: "Batch Size", type: "number", default: 32, min: 1, step: 1 },
      { id: "num_workers", name: "Num Workers", type: "number", default: 4, min: 0, max: 32, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "from torch.utils.data import DataLoader, WeightedRandomSampler", "from collections import Counter"],
      body: `_label_counts = Counter({{inputs.labels}}.tolist())
_num_samples = len({{inputs.labels}})
_class_weights = {cls: _num_samples / count for cls, count in _label_counts.items()}
_sample_weights = torch.tensor([_class_weights[int(l)] for l in {{inputs.labels}}])
_sampler = WeightedRandomSampler(_sample_weights, num_samples=_num_samples, replacement=True)
{{outputs.dataloader}} = DataLoader(
    {{inputs.dataset}},
    batch_size={{params.batch_size}},
    sampler=_sampler,
    num_workers={{params.num_workers}}
)`,
      outputBindings: { dataloader: "weighted_dataloader" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 39. Distributed Data Parallel (DDP)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.ddp",
    name: "Distributed Data Parallel (DDP)",
    category: "training",
    description: "Wrap a model with DistributedDataParallel for multi-GPU synchronous training",
    tags: ["training", "distributed", "ddp", "multi-gpu", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "ddp_model", name: "DDP Model", type: "model", required: true },
    ],
    parameters: [
      { id: "backend", name: "Backend", type: "select", default: "nccl", options: [{ label: "NCCL (GPU)", value: "nccl" }, { label: "Gloo (CPU/GPU)", value: "gloo" }] },
      { id: "find_unused", name: "Find Unused Parameters", type: "boolean", default: false },
      { id: "gradient_as_bucket_view", name: "Gradient as Bucket View", type: "boolean", default: true, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.distributed as dist", "from torch.nn.parallel import DistributedDataParallel as DDP", "import os"],
      body: `if not dist.is_initialized():
    dist.init_process_group(backend="{{params.backend}}")
_local_rank = int(os.environ.get("LOCAL_RANK", 0))
_device = torch.device(f"cuda:{_local_rank}")
{{inputs.model}}.to(_device)
{{outputs.ddp_model}} = DDP(
    {{inputs.model}},
    device_ids=[_local_rank],
    find_unused_parameters={{params.find_unused}},
    gradient_as_bucket_view={{params.gradient_as_bucket_view}}
)`,
      outputBindings: { ddp_model: "ddp_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 40. FSDP
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.fsdp",
    name: "FSDP",
    category: "training",
    description: "Wrap a model with Fully Sharded Data Parallel for memory-efficient distributed training",
    tags: ["training", "distributed", "fsdp", "sharding", "large-model", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "fsdp_model", name: "FSDP Model", type: "model", required: true },
    ],
    parameters: [
      { id: "sharding_strategy", name: "Sharding Strategy", type: "select", default: "FULL_SHARD", options: [{ label: "Full Shard", value: "FULL_SHARD" }, { label: "Shard Grad Op", value: "SHARD_GRAD_OP" }, { label: "No Shard (DDP)", value: "NO_SHARD" }] },
      { id: "mixed_precision", name: "Mixed Precision", type: "boolean", default: true },
      { id: "mp_dtype", name: "Compute Dtype", type: "select", default: "bfloat16", options: [{ label: "BFloat16", value: "bfloat16" }, { label: "Float16", value: "float16" }], advanced: true },
      { id: "activation_checkpointing", name: "Activation Checkpointing", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.distributed as dist", "from torch.distributed.fsdp import FullyShardedDataParallel as FSDP, ShardingStrategy, MixedPrecision"],
      body: `if not dist.is_initialized():
    dist.init_process_group(backend="nccl")
_fsdp_mp = None
if {{params.mixed_precision}}:
    _mp_dtype = torch.bfloat16 if "{{params.mp_dtype}}" == "bfloat16" else torch.float16
    _fsdp_mp = MixedPrecision(param_dtype=_mp_dtype, reduce_dtype=_mp_dtype, buffer_dtype=_mp_dtype)
{{outputs.fsdp_model}} = FSDP(
    {{inputs.model}},
    sharding_strategy=ShardingStrategy.{{params.sharding_strategy}},
    mixed_precision=_fsdp_mp
)`,
      outputBindings: { fsdp_model: "fsdp_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 41. Model Parallelism
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "training.model-parallelism",
    name: "Model Parallelism",
    category: "training",
    description: "Split a model across multiple GPUs using pipeline or tensor parallelism",
    tags: ["training", "distributed", "model-parallel", "pipeline", "multi-gpu", "pytorch"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
    ],
    outputs: [
      { id: "parallel_model", name: "Parallel Model", type: "model", required: true },
    ],
    parameters: [
      { id: "strategy", name: "Parallelism Strategy", type: "select", default: "pipeline", options: [{ label: "Pipeline Parallel", value: "pipeline" }, { label: "Manual Device Map", value: "device_map" }] },
      { id: "num_gpus", name: "Number of GPUs", type: "number", default: 2, min: 2, max: 8, step: 1 },
      { id: "chunks", name: "Micro-batches (pipeline)", type: "number", default: 8, min: 1, max: 64, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "from torch.distributed.pipeline.sync import Pipe"],
      body: `if "{{params.strategy}}" == "pipeline":
    _devices = [f"cuda:{i}" for i in range({{params.num_gpus}})]
    _layers = list({{inputs.model}}.children())
    _split = len(_layers) // {{params.num_gpus}}
    _partitions = []
    for _i in range({{params.num_gpus}}):
        _start = _i * _split
        _end = _start + _split if _i < {{params.num_gpus}} - 1 else len(_layers)
        _partition = torch.nn.Sequential(*_layers[_start:_end]).to(_devices[_i])
        _partitions.append(_partition)
    _sequential = torch.nn.Sequential(*_partitions)
    {{outputs.parallel_model}} = Pipe(_sequential, chunks={{params.chunks}})
else:
    _layers = list({{inputs.model}}.children())
    _split = len(_layers) // {{params.num_gpus}}
    for _i, _layer in enumerate(_layers):
        _dev_idx = min(_i // max(_split, 1), {{params.num_gpus}} - 1)
        _layer.to(f"cuda:{_dev_idx}")
    {{outputs.parallel_model}} = {{inputs.model}}`,
      outputBindings: { parallel_model: "parallel_model" },
    },
  },
];
