"""
aiblocks.training — Training

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def train_loop(model=None, dataloader=None, optimizer=None, loss_fn=None, num_epochs=10, log_interval=100, device='auto'):
    """Standard PyTorch training loop that iterates over a DataLoader for one epoch
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        dataloader (dataloader) (required): 
        optimizer (optimizer) (required): 
        loss_fn (loss_fn) (required): 
    
    Parameters:
        num_epochs (number, default=10): 
        log_interval (number, default=100): 
        device (select, default='auto'): 
    
    Returns:
        dict with keys:
            epoch_loss (number): 
            model_out (model): 
    """
    _imports = ['import torch']
    _code = '_device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if "{{params.device}}" == "auto" else torch.device("{{params.device}}")\n{{inputs.model}}.to(_device)\n{{inputs.model}}.train()\nfor _epoch in range({{params.num_epochs}}):\n    _running_loss = 0.0\n    for _batch_idx, (_inputs, _targets) in enumerate({{inputs.dataloader}}):\n        _inputs, _targets = _inputs.to(_device), _targets.to(_device)\n        {{inputs.optimizer}}.zero_grad()\n        _preds = {{inputs.model}}(_inputs)\n        _loss = {{inputs.loss_fn}}(_preds, _targets)\n        _loss.backward()\n        {{inputs.optimizer}}.step()\n        _running_loss += _loss.item()\n        if (_batch_idx + 1) % {{params.log_interval}} == 0:\n            print(f"Epoch {_epoch+1}, Batch {_batch_idx+1}, "Loss": {_running_loss/(_batch_idx+1):.4f}")\n    {{outputs.epoch_loss}} = _running_loss / len({{inputs.dataloader}})\n{{outputs.model_out}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.num_epochs}}", str(num_epochs))
    _code = _code.replace("{{params.log_interval}}", str(log_interval))
    _code = _code.replace("{{params.device}}", str(device))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.dataloader}}", "dataloader")
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{inputs.loss_fn}}", "loss_fn")
    _code = _code.replace("{{outputs.epoch_loss}}", "_out_epoch_loss")
    _code = _code.replace("{{outputs.model_out}}", "_out_model_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["dataloader"] = dataloader
    _ns["optimizer"] = optimizer
    _ns["loss_fn"] = loss_fn
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"epoch_loss": _ns.get("_out_epoch_loss"), "model_out": _ns.get("_out_model_out")}


def eval_loop(model=None, dataloader=None, loss_fn=None, device='auto'):
    """Evaluate a model on a dataset without gradient computation
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        dataloader (dataloader) (required): 
        loss_fn (loss_fn) (required): 
    
    Parameters:
        device (select, default='auto'): 
    
    Returns:
        dict with keys:
            eval_loss (number): 
            all_preds (tensor): 
            all_targets (tensor): 
    """
    _imports = ['import torch']
    _code = '_device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if "{{params.device}}" == "auto" else torch.device("{{params.device}}")\n{{inputs.model}}.to(_device)\n{{inputs.model}}.eval()\n_total_loss = 0.0\n_preds_list, _targets_list = [], []\nwith torch.no_grad():\n    for _inputs, _targets in {{inputs.dataloader}}:\n        _inputs, _targets = _inputs.to(_device), _targets.to(_device)\n        _preds = {{inputs.model}}(_inputs)\n        _total_loss += {{inputs.loss_fn}}(_preds, _targets).item()\n        _preds_list.append(_preds.cpu())\n        _targets_list.append(_targets.cpu())\n{{outputs.eval_loss}} = _total_loss / len({{inputs.dataloader}})\n{{outputs.all_preds}} = torch.cat(_preds_list, dim=0)\n{{outputs.all_targets}} = torch.cat(_targets_list, dim=0)'
    
    _code = _code.replace("{{params.device}}", str(device))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.dataloader}}", "dataloader")
    _code = _code.replace("{{inputs.loss_fn}}", "loss_fn")
    _code = _code.replace("{{outputs.eval_loss}}", "_out_eval_loss")
    _code = _code.replace("{{outputs.all_preds}}", "_out_all_preds")
    _code = _code.replace("{{outputs.all_targets}}", "_out_all_targets")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["dataloader"] = dataloader
    _ns["loss_fn"] = loss_fn
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"eval_loss": _ns.get("_out_eval_loss"), "all_preds": _ns.get("_out_all_preds"), "all_targets": _ns.get("_out_all_targets")}


def validation_step(model=None, batch=None, loss_fn=None):
    """Run a single validation step on a batch and return loss and predictions
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        batch (any) (required): 
        loss_fn (loss_fn) (required): 
    
    Returns:
        dict with keys:
            val_loss (number): 
            preds (tensor): 
    """
    _imports = ['import torch']
    _code = '{{inputs.model}}.eval()\n_val_inputs, _val_targets = {{inputs.batch}}\nwith torch.no_grad():\n    {{outputs.preds}} = {{inputs.model}}(_val_inputs)\n    {{outputs.val_loss}} = {{inputs.loss_fn}}({{outputs.preds}}, _val_targets).item()'
    
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.batch}}", "batch")
    _code = _code.replace("{{inputs.loss_fn}}", "loss_fn")
    _code = _code.replace("{{outputs.val_loss}}", "_out_val_loss")
    _code = _code.replace("{{outputs.preds}}", "_out_preds")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["batch"] = batch
    _ns["loss_fn"] = loss_fn
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"val_loss": _ns.get("_out_val_loss"), "preds": _ns.get("_out_preds")}


def gradient_accumulate(model=None, dataloader=None, optimizer=None, loss_fn=None, accum_steps=4):
    """Accumulate gradients across multiple mini-batches to simulate a larger batch size
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        dataloader (dataloader) (required): 
        optimizer (optimizer) (required): 
        loss_fn (loss_fn) (required): 
    
    Parameters:
        accum_steps (number, default=4): 
    
    Returns:
        number: 
    """
    _imports = ['import torch']
    _code = '{{inputs.model}}.train()\n{{inputs.optimizer}}.zero_grad()\n_running_loss = 0.0\nfor _step, (_inputs, _targets) in enumerate({{inputs.dataloader}}):\n    _preds = {{inputs.model}}(_inputs)\n    _loss = {{inputs.loss_fn}}(_preds, _targets) / {{params.accum_steps}}\n    _loss.backward()\n    if (_step + 1) % {{params.accum_steps}} == 0:\n        {{inputs.optimizer}}.step()\n        {{inputs.optimizer}}.zero_grad()\n    _running_loss += _loss.item() * {{params.accum_steps}}\n{{outputs.epoch_loss}} = _running_loss / len({{inputs.dataloader}})'
    
    _code = _code.replace("{{params.accum_steps}}", str(accum_steps))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.dataloader}}", "dataloader")
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{inputs.loss_fn}}", "loss_fn")
    _code = _code.replace("{{outputs.epoch_loss}}", "_out_epoch_loss")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["dataloader"] = dataloader
    _ns["optimizer"] = optimizer
    _ns["loss_fn"] = loss_fn
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_epoch_loss")


def forward_pass(model=None, inputs=None, no_grad=False):
    """Execute a single forward pass through a model on a batch of inputs
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        inputs (tensor) (required): 
    
    Parameters:
        no_grad (boolean, default=False): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch']
    _code = 'if {{params.no_grad}}:\n    with torch.no_grad():\n        {{outputs.output}} = {{inputs.model}}({{inputs.inputs}})\n "else":\n    {{outputs.output}} = {{inputs.model}}({{inputs.inputs}})'
    
    _code = _code.replace("{{params.no_grad}}", str(no_grad))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.inputs}}", "inputs")
    _code = _code.replace("{{outputs.output}}", "_out_output")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["inputs"] = inputs
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_output")


def backward_pass(loss=None, retain_graph=False):
    """Compute gradients by back-propagating a loss value
    
    Args:
        loss (number) (required): 
    
    Parameters:
        retain_graph (boolean, default=False): 
    """
    _imports = []
    _code = '{{inputs.loss}}.backward(retain_graph={{params.retain_graph}})'
    
    _code = _code.replace("{{params.retain_graph}}", str(retain_graph))
    _code = _code.replace("{{inputs.loss}}", "loss")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["loss"] = loss
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def optimizer_step(optimizer=None, zero_grad_after=True):
    """Execute one optimizer step to update model parameters from accumulated gradients
    
    Args:
        optimizer (optimizer) (required): 
    
    Parameters:
        zero_grad_after (boolean, default=True): 
    """
    _imports = []
    _code = '{{inputs.optimizer}}.step()\nif {{params.zero_grad_after}}:\n    {{inputs.optimizer}}.zero_grad(set_to_none=True)'
    
    _code = _code.replace("{{params.zero_grad_after}}", str(zero_grad_after))
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["optimizer"] = optimizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def adam_optimizer(model=None, lr=0.001, beta1=0.9, beta2=0.999, weight_decay=0, eps=1e-08):
    """Create an Adam optimizer for model parameter updates
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        lr (number, default=0.001): 
        beta1 (number, default=0.9): 
        beta2 (number, default=0.999): 
        weight_decay (number, default=0): 
        eps (number, default=1e-08): 
    
    Returns:
        optimizer: 
    """
    _imports = ['import torch.optim as optim']
    _code = '{{outputs.optimizer}} = optim.Adam(\n    {{inputs.model}}.parameters(),\n    lr={{params.lr}},\n    betas=({{params.beta1}}, {{params.beta2}}),\n    weight_decay={{params.weight_decay}},\n    eps={{params.eps}}\n)'
    
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.beta1}}", str(beta1))
    _code = _code.replace("{{params.beta2}}", str(beta2))
    _code = _code.replace("{{params.weight_decay}}", str(weight_decay))
    _code = _code.replace("{{params.eps}}", str(eps))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.optimizer}}", "_out_optimizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_optimizer")


def adamw_optimizer(model=None, lr=0.001, beta1=0.9, beta2=0.999, weight_decay=0.01, eps=1e-08):
    """Create an AdamW optimizer with decoupled weight decay regularization
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        lr (number, default=0.001): 
        beta1 (number, default=0.9): 
        beta2 (number, default=0.999): 
        weight_decay (number, default=0.01): 
        eps (number, default=1e-08): 
    
    Returns:
        optimizer: 
    """
    _imports = ['import torch.optim as optim']
    _code = '{{outputs.optimizer}} = optim.AdamW(\n    {{inputs.model}}.parameters(),\n    lr={{params.lr}},\n    betas=({{params.beta1}}, {{params.beta2}}),\n    weight_decay={{params.weight_decay}},\n    eps={{params.eps}}\n)'
    
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.beta1}}", str(beta1))
    _code = _code.replace("{{params.beta2}}", str(beta2))
    _code = _code.replace("{{params.weight_decay}}", str(weight_decay))
    _code = _code.replace("{{params.eps}}", str(eps))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.optimizer}}", "_out_optimizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_optimizer")


def sgd_optimizer(model=None, lr=0.01, momentum=0.9, weight_decay=0, nesterov=False):
    """Create a Stochastic Gradient Descent optimizer with optional momentum and Nesterov
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        lr (number, default=0.01): 
        momentum (number, default=0.9): 
        weight_decay (number, default=0): 
        nesterov (boolean, default=False): 
    
    Returns:
        optimizer: 
    """
    _imports = ['import torch.optim as optim']
    _code = '{{outputs.optimizer}} = optim.SGD(\n    {{inputs.model}}.parameters(),\n    lr={{params.lr}},\n    momentum={{params.momentum}},\n    weight_decay={{params.weight_decay}},\n    nesterov={{params.nesterov}}\n)'
    
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.momentum}}", str(momentum))
    _code = _code.replace("{{params.weight_decay}}", str(weight_decay))
    _code = _code.replace("{{params.nesterov}}", str(nesterov))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.optimizer}}", "_out_optimizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_optimizer")


def adagrad_optimizer(model=None, lr=0.01, lr_decay=0, weight_decay=0, eps=1e-10):
    """Create an Adagrad optimizer with per-parameter adaptive learning rates
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        lr (number, default=0.01): 
        lr_decay (number, default=0): 
        weight_decay (number, default=0): 
        eps (number, default=1e-10): 
    
    Returns:
        optimizer: 
    """
    _imports = ['import torch.optim as optim']
    _code = '{{outputs.optimizer}} = optim.Adagrad(\n    {{inputs.model}}.parameters(),\n    lr={{params.lr}},\n    lr_decay={{params.lr_decay}},\n    weight_decay={{params.weight_decay}},\n    eps={{params.eps}}\n)'
    
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.lr_decay}}", str(lr_decay))
    _code = _code.replace("{{params.weight_decay}}", str(weight_decay))
    _code = _code.replace("{{params.eps}}", str(eps))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.optimizer}}", "_out_optimizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_optimizer")


def rmsprop_optimizer(model=None, lr=0.01, alpha=0.99, momentum=0, weight_decay=0, centered=False):
    """Create an RMSProp optimizer that adapts learning rates using running average of squared gradients
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        lr (number, default=0.01): 
        alpha (number, default=0.99): 
        momentum (number, default=0): 
        weight_decay (number, default=0): 
        centered (boolean, default=False): 
    
    Returns:
        optimizer: 
    """
    _imports = ['import torch.optim as optim']
    _code = '{{outputs.optimizer}} = optim.RMSprop(\n    {{inputs.model}}.parameters(),\n    lr={{params.lr}},\n    alpha={{params.alpha}},\n    momentum={{params.momentum}},\n    weight_decay={{params.weight_decay}},\n    centered={{params.centered}}\n)'
    
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.momentum}}", str(momentum))
    _code = _code.replace("{{params.weight_decay}}", str(weight_decay))
    _code = _code.replace("{{params.centered}}", str(centered))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.optimizer}}", "_out_optimizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_optimizer")


def lamb_optimizer(model=None, lr=0.001, beta1=0.9, beta2=0.999, weight_decay=0.01):
    """Layer-wise Adaptive Moments optimizer for large-batch training
    
    Dependencies: pip install torch_optimizer
    
    Args:
        model (model) (required): 
    
    Parameters:
        lr (number, default=0.001): 
        beta1 (number, default=0.9): 
        beta2 (number, default=0.999): 
        weight_decay (number, default=0.01): 
    
    Returns:
        optimizer: 
    """
    _imports = ['from torch_optimizer import Lamb']
    _code = '{{outputs.optimizer}} = Lamb(\n    {{inputs.model}}.parameters(),\n    lr={{params.lr}},\n    betas=({{params.beta1}}, {{params.beta2}}),\n    weight_decay={{params.weight_decay}}\n)'
    
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.beta1}}", str(beta1))
    _code = _code.replace("{{params.beta2}}", str(beta2))
    _code = _code.replace("{{params.weight_decay}}", str(weight_decay))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.optimizer}}", "_out_optimizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_optimizer")


def lion_optimizer(model=None, lr=0.0001, beta1=0.9, beta2=0.99, weight_decay=0.0):
    """EvoLved Sign Momentum optimizer — memory-efficient alternative to Adam
    
    Dependencies: pip install lion_pytorch
    
    Args:
        model (model) (required): 
    
    Parameters:
        lr (number, default=0.0001): 
        beta1 (number, default=0.9): 
        beta2 (number, default=0.99): 
        weight_decay (number, default=0.0): 
    
    Returns:
        optimizer: 
    """
    _imports = ['from lion_pytorch import Lion']
    _code = '{{outputs.optimizer}} = Lion(\n    {{inputs.model}}.parameters(),\n    lr={{params.lr}},\n    betas=({{params.beta1}}, {{params.beta2}}),\n    weight_decay={{params.weight_decay}}\n)'
    
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{params.beta1}}", str(beta1))
    _code = _code.replace("{{params.beta2}}", str(beta2))
    _code = _code.replace("{{params.weight_decay}}", str(weight_decay))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.optimizer}}", "_out_optimizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_optimizer")


def lr_scheduler_cosine(optimizer=None, T_max=1000, eta_min=0):
    """Cosine annealing learning rate scheduler that decays LR following a cosine curve
    
    Dependencies: pip install torch
    
    Args:
        optimizer (optimizer) (required): 
    
    Parameters:
        T_max (number, default=1000): 
        eta_min (number, default=0): 
    
    Returns:
        scheduler: 
    """
    _imports = ['from torch.optim.lr_scheduler import CosineAnnealingLR']
    _code = '{{outputs.scheduler}} = CosineAnnealingLR({{inputs.optimizer}}, T_max={{params.T_max}}, eta_min={{params.eta_min}})'
    
    _code = _code.replace("{{params.T_max}}", str(T_max))
    _code = _code.replace("{{params.eta_min}}", str(eta_min))
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{outputs.scheduler}}", "_out_scheduler")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["optimizer"] = optimizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_scheduler")


def lr_scheduler_linear_warmup(optimizer=None, num_warmup_steps=500, num_training_steps=10000):
    """Linear warmup followed by linear decay, commonly used with transformers
    
    Dependencies: pip install transformers
    
    Args:
        optimizer (optimizer) (required): 
    
    Parameters:
        num_warmup_steps (number, default=500): 
        num_training_steps (number, default=10000): 
    
    Returns:
        scheduler: 
    """
    _imports = ['from transformers import get_linear_schedule_with_warmup']
    _code = '{{outputs.scheduler}} = get_linear_schedule_with_warmup(\n    {{inputs.optimizer}},\n    num_warmup_steps={{params.num_warmup_steps}},\n    num_training_steps={{params.num_training_steps}}\n)'
    
    _code = _code.replace("{{params.num_warmup_steps}}", str(num_warmup_steps))
    _code = _code.replace("{{params.num_training_steps}}", str(num_training_steps))
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{outputs.scheduler}}", "_out_scheduler")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["optimizer"] = optimizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_scheduler")


def lr_scheduler_step(optimizer=None, step_size=30, gamma=0.1):
    """Decay the learning rate by a factor gamma every step_size epochs
    
    Dependencies: pip install torch
    
    Args:
        optimizer (optimizer) (required): 
    
    Parameters:
        step_size (number, default=30): 
        gamma (number, default=0.1): 
    
    Returns:
        scheduler: 
    """
    _imports = ['from torch.optim.lr_scheduler import StepLR']
    _code = '{{outputs.scheduler}} = StepLR({{inputs.optimizer}}, step_size={{params.step_size}}, gamma={{params.gamma}})'
    
    _code = _code.replace("{{params.step_size}}", str(step_size))
    _code = _code.replace("{{params.gamma}}", str(gamma))
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{outputs.scheduler}}", "_out_scheduler")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["optimizer"] = optimizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_scheduler")


def lr_scheduler_plateau(optimizer=None, mode='min', factor=0.1, patience=10, threshold=0.0001):
    """Reduce learning rate when a monitored metric has stopped improving
    
    Dependencies: pip install torch
    
    Args:
        optimizer (optimizer) (required): 
    
    Parameters:
        mode (select, default='min'): 
        factor (number, default=0.1): 
        patience (number, default=10): 
        threshold (number, default=0.0001): 
    
    Returns:
        scheduler: 
    """
    _imports = ['from torch.optim.lr_scheduler import ReduceLROnPlateau']
    _code = '{{outputs.scheduler}} = ReduceLROnPlateau(\n    {{inputs.optimizer}},\n    mode="{{params.mode}}",\n    factor={{params.factor}},\n    patience={{params.patience}},\n    threshold={{params.threshold}}\n)'
    
    _code = _code.replace("{{params.mode}}", str(mode))
    _code = _code.replace("{{params.factor}}", str(factor))
    _code = _code.replace("{{params.patience}}", str(patience))
    _code = _code.replace("{{params.threshold}}", str(threshold))
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{outputs.scheduler}}", "_out_scheduler")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["optimizer"] = optimizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_scheduler")


def cross_entropy_loss(label_smoothing=0.0, ignore_index=-100):
    """Standard cross-entropy loss for multi-class classification
    
    Dependencies: pip install torch
    
    Parameters:
        label_smoothing (number, default=0.0): 
        ignore_index (number, default=-100): Class index to ignore in loss
    
    Returns:
        loss_fn: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.loss_fn}} = nn.CrossEntropyLoss(label_smoothing={{params.label_smoothing}}, ignore_index={{params.ignore_index}})'
    
    _code = _code.replace("{{params.label_smoothing}}", str(label_smoothing))
    _code = _code.replace("{{params.ignore_index}}", str(ignore_index))
    _code = _code.replace("{{outputs.loss_fn}}", "_out_loss_fn")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_loss_fn")


def binary_ce_loss(with_logits=True, reduction='mean'):
    """Binary cross-entropy loss with optional logits mode for binary classification
    
    Dependencies: pip install torch
    
    Parameters:
        with_logits (boolean, default=True): 
        reduction (select, default='mean'): 
    
    Returns:
        loss_fn: 
    """
    _imports = ['import torch.nn as nn']
    _code = 'if {{params.with_logits}}:\n    {{outputs.loss_fn}} = nn.BCEWithLogitsLoss(reduction="{{params.reduction}}")\n "else":\n    {{outputs.loss_fn}} = nn.BCELoss(reduction="{{params.reduction}}")'
    
    _code = _code.replace("{{params.with_logits}}", str(with_logits))
    _code = _code.replace("{{params.reduction}}", str(reduction))
    _code = _code.replace("{{outputs.loss_fn}}", "_out_loss_fn")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_loss_fn")


def mse_loss(reduction='mean'):
    """Mean Squared Error loss for regression tasks
    
    Dependencies: pip install torch
    
    Parameters:
        reduction (select, default='mean'): 
    
    Returns:
        loss_fn: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.loss_fn}} = nn.MSELoss(reduction="{{params.reduction}}")'
    
    _code = _code.replace("{{params.reduction}}", str(reduction))
    _code = _code.replace("{{outputs.loss_fn}}", "_out_loss_fn")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_loss_fn")


def mae_loss(reduction='mean'):
    """Mean Absolute Error (L1) loss for robust regression
    
    Dependencies: pip install torch
    
    Parameters:
        reduction (select, default='mean'): 
    
    Returns:
        loss_fn: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.loss_fn}} = nn.L1Loss(reduction="{{params.reduction}}")'
    
    _code = _code.replace("{{params.reduction}}", str(reduction))
    _code = _code.replace("{{outputs.loss_fn}}", "_out_loss_fn")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_loss_fn")


def huber_loss(delta=1.0, reduction='mean'):
    """Smooth L1 / Huber loss that is less sensitive to outliers than MSE
    
    Dependencies: pip install torch
    
    Parameters:
        delta (number, default=1.0): 
        reduction (select, default='mean'): 
    
    Returns:
        loss_fn: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.loss_fn}} = nn.HuberLoss(delta={{params.delta}}, reduction="{{params.reduction}}")'
    
    _code = _code.replace("{{params.delta}}", str(delta))
    _code = _code.replace("{{params.reduction}}", str(reduction))
    _code = _code.replace("{{outputs.loss_fn}}", "_out_loss_fn")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_loss_fn")


def focal_loss(alpha=0.25, gamma=2.0, reduction='mean'):
    """Focal loss for handling class imbalance by down-weighting easy examples
    
    Dependencies: pip install torch
    
    Parameters:
        alpha (number, default=0.25): 
        gamma (number, default=2.0): 
        reduction (select, default='mean'): 
    
    Returns:
        loss_fn: 
    """
    _imports = ['import torch', 'import torch.nn as nn', 'import torch.nn.functional as F']
    _code = 'class _FocalLoss(nn.Module):\n    def __init__(self, alpha={{params.alpha}}, gamma={{params.gamma}}, reduction="{{params.reduction}}"):\n        super().__init__()\n        self.alpha = alpha\n        self.gamma = gamma\n        self.reduction = reduction\n    def forward(self, inputs, targets):\n        ce_loss = F.cross_entropy(inputs, targets, reduction="none")\n        pt = torch.exp(-ce_loss)\n        focal_loss = self.alpha * (1 - pt) ** self.gamma * ce_loss\n        if self.reduction == "mean":\n            return focal_loss.mean()\n        elif self.reduction == "sum":\n            return focal_loss.sum()\n        return focal_loss\n{{outputs.loss_fn}} = _FocalLoss()'
    
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.gamma}}", str(gamma))
    _code = _code.replace("{{params.reduction}}", str(reduction))
    _code = _code.replace("{{outputs.loss_fn}}", "_out_loss_fn")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_loss_fn")


def contrastive_loss(margin=1.0):
    """Contrastive loss for learning similarity between pairs of embeddings
    
    Dependencies: pip install torch
    
    Parameters:
        margin (number, default=1.0): 
    
    Returns:
        loss_fn: 
    """
    _imports = ['import torch', 'import torch.nn as nn', 'import torch.nn.functional as F']
    _code = 'class _ContrastiveLoss(nn.Module):\n    def __init__(self, margin={{params.margin}}):\n        super().__init__()\n        self.margin = margin\n    def forward(self, emb1, emb2, label):\n        dist = F.pairwise_distance(emb1, emb2)\n        loss = label * dist.pow(2) + (1 - label) * F.relu(self.margin - dist).pow(2)\n        return loss.mean()\n{{outputs.loss_fn}} = _ContrastiveLoss()'
    
    _code = _code.replace("{{params.margin}}", str(margin))
    _code = _code.replace("{{outputs.loss_fn}}", "_out_loss_fn")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_loss_fn")


def triplet_loss(margin=1.0, p=2, swap=False):
    """Triplet margin loss for metric learning with anchor/positive/negative samples
    
    Dependencies: pip install torch
    
    Parameters:
        margin (number, default=1.0): 
        p (number, default=2): 
        swap (boolean, default=False): 
    
    Returns:
        loss_fn: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.loss_fn}} = nn.TripletMarginLoss(margin={{params.margin}}, p={{params.p}}, swap={{params.swap}})'
    
    _code = _code.replace("{{params.margin}}", str(margin))
    _code = _code.replace("{{params.p}}", str(p))
    _code = _code.replace("{{params.swap}}", str(swap))
    _code = _code.replace("{{outputs.loss_fn}}", "_out_loss_fn")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_loss_fn")


def rlhf_reward_signal(reward_model=None, input_ids=None, attention_mask=None, normalize=True):
    """Compute a reward signal from a reward model for RLHF training
    
    Dependencies: pip install torch
    
    Args:
        reward_model (model) (required): 
        input_ids (tensor) (required): 
        attention_mask (tensor) (required): 
    
    Parameters:
        normalize (boolean, default=True): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch']
    _code = '{{inputs.reward_model}}.eval()\nwith torch.no_grad():\n    _reward_out = {{inputs.reward_model}}(input_ids={{inputs.input_ids}}, attention_mask={{inputs.attention_mask}})\n    {{outputs.rewards}} = _reward_out.logits.squeeze(-1) if hasattr(_reward_out, "logits") else _reward_out[0].squeeze(-1)\nif {{params.normalize}}:\n    {{outputs.rewards}} = ({{outputs.rewards}} - {{outputs.rewards}}.mean()) / ({{outputs.rewards}}.std() + 1e-8)'
    
    _code = _code.replace("{{params.normalize}}", str(normalize))
    _code = _code.replace("{{inputs.reward_model}}", "reward_model")
    _code = _code.replace("{{inputs.input_ids}}", "input_ids")
    _code = _code.replace("{{inputs.attention_mask}}", "attention_mask")
    _code = _code.replace("{{outputs.rewards}}", "_out_rewards")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["reward_model"] = reward_model
    _ns["input_ids"] = input_ids
    _ns["attention_mask"] = attention_mask
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_rewards")


def kl_divergence_loss(reduction='batchmean', log_target=False):
    """Kullback-Leibler divergence loss for distribution matching and knowledge distillation
    
    Dependencies: pip install torch
    
    Parameters:
        reduction (select, default='batchmean'): 
        log_target (boolean, default=False): 
    
    Returns:
        loss_fn: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.loss_fn}} = nn.KLDivLoss(reduction="{{params.reduction}}", log_target={{params.log_target}})'
    
    _code = _code.replace("{{params.reduction}}", str(reduction))
    _code = _code.replace("{{params.log_target}}", str(log_target))
    _code = _code.replace("{{outputs.loss_fn}}", "_out_loss_fn")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_loss_fn")


def gradient_clip(model=None, method='norm', max_norm=1.0, norm_type=2.0):
    """Clip gradients by maximum norm or value to prevent exploding gradients
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        method (select, default='norm'): 
        max_norm (number, default=1.0): 
        norm_type (number, default=2.0): 
    
    Returns:
        number: 
    """
    _imports = ['import torch.nn.utils as nn_utils']
    _code = 'if "{{params.method}}" == "norm":\n    {{outputs.total_norm}} = nn_utils.clip_grad_norm_({{inputs.model}}.parameters(), max_norm={{params.max_norm}}, norm_type={{params.norm_type}}).item()\n "else":\n    nn_utils.clip_grad_value_({{inputs.model}}.parameters(), clip_value={{params.max_norm}})\n    {{outputs.total_norm}} = 0.0'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.max_norm}}", str(max_norm))
    _code = _code.replace("{{params.norm_type}}", str(norm_type))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.total_norm}}", "_out_total_norm")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_total_norm")


def mixed_precision_amp(model=None, optimizer=None, dataloader=None, loss_fn=None, dtype='float16', enabled=True):
    """Enable automatic mixed precision training with GradScaler for faster GPU training
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        optimizer (optimizer) (required): 
        dataloader (dataloader) (required): 
        loss_fn (loss_fn) (required): 
    
    Parameters:
        dtype (select, default='float16'): 
        enabled (boolean, default=True): 
    
    Returns:
        number: 
    """
    _imports = ['import torch', 'from torch.cuda.amp import autocast, GradScaler']
    _code = '_scaler = GradScaler(enabled={{params.enabled}})\n_amp_dtype = torch.float16 if "{{params.dtype}}" == "float16" else torch.bfloat16\n{{inputs.model}}.train()\n_running_loss = 0.0\nfor _inputs, _targets in {{inputs.dataloader}}:\n    {{inputs.optimizer}}.zero_grad()\n    with autocast(dtype=_amp_dtype, enabled={{params.enabled}}):\n        _preds = {{inputs.model}}(_inputs)\n        _loss = {{inputs.loss_fn}}(_preds, _targets)\n    _scaler.scale(_loss).backward()\n    _scaler.step({{inputs.optimizer}})\n    _scaler.update()\n    _running_loss += _loss.item()\n{{outputs.epoch_loss}} = _running_loss / len({{inputs.dataloader}})'
    
    _code = _code.replace("{{params.dtype}}", str(dtype))
    _code = _code.replace("{{params.enabled}}", str(enabled))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{inputs.dataloader}}", "dataloader")
    _code = _code.replace("{{inputs.loss_fn}}", "loss_fn")
    _code = _code.replace("{{outputs.epoch_loss}}", "_out_epoch_loss")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["optimizer"] = optimizer
    _ns["dataloader"] = dataloader
    _ns["loss_fn"] = loss_fn
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_epoch_loss")


def checkpoint_save(model=None, optimizer=None, epoch=None, loss=None, save_dir='./checkpoints', filename='checkpoint_epoch_{epoch}.pt'):
    """Save a model checkpoint including model state, optimizer state, and epoch info
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        optimizer (optimizer): 
        epoch (number): 
        loss (number): 
    
    Parameters:
        save_dir (string, default='./checkpoints'): 
        filename (string, default='checkpoint_epoch_{epoch}.pt'): 
    
    Returns:
        path: 
    """
    _imports = ['import torch', 'import os']
    _code = 'os.makedirs("{{params.save_dir}}", exist_ok=True)\n_ckpt_name = "{{params.filename}}".format(epoch={{inputs.epoch}} if {{inputs.epoch}} is not None else 0)\n{{outputs.path}} = os.path.join("{{params.save_dir}}", _ckpt_name)\n_ckpt = {\n    "model_state_dict": {{inputs.model}}.state_dict(),\n    "optimizer_state_dict": {{inputs.optimizer}}.state_dict() if {{inputs.optimizer}} is not None else None,\n    "epoch": {{inputs.epoch}},\n    "loss": {{inputs.loss}}}\ntorch.save(_ckpt, {{outputs.path}})\nprint(f"Checkpoint saved to {{{outputs.path}}}")'
    
    _code = _code.replace("{{params.save_dir}}", str(save_dir))
    _code = _code.replace("{{params.filename}}", str(filename))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{inputs.epoch}}", "epoch")
    _code = _code.replace("{{inputs.loss}}", "loss")
    _code = _code.replace("{{outputs.path}}", "_out_path")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["optimizer"] = optimizer
    _ns["epoch"] = epoch
    _ns["loss"] = loss
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_path")


def checkpoint_load(model=None, optimizer=None, ckpt_path=None, strict=True, map_location='auto'):
    """Load a model checkpoint and restore model/optimizer state
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        optimizer (optimizer): 
        ckpt_path (path) (required): 
    
    Parameters:
        strict (boolean, default=True): Fail if keys don't match exactly
        map_location (select, default='auto'): 
    
    Returns:
        dict with keys:
            model_out (model): 
            epoch (number): 
            loss (number): 
    """
    _imports = ['import torch']
    _code = '_map_loc = "cpu" if "{{params.map_location}}" == "auto" and not torch.cuda.is_available() else ("{{params.map_location}}" if "{{params.map_location}}" != "auto" else None)\n_ckpt = torch.load({{inputs.ckpt_path}}, map_location=_map_loc)\n{{inputs.model}}.load_state_dict(_ckpt["model_state_dict"], strict={{params.strict}})\nif {{inputs.optimizer}} is not None and _ckpt.get("optimizer_state_dict") is not None:\n    {{inputs.optimizer}}.load_state_dict(_ckpt["optimizer_state_dict"])\n{{outputs.model_out}} = {{inputs.model}}\n{{outputs.epoch}} = _ckpt.get("epoch", 0)\n{{outputs.loss}} = _ckpt.get("loss", 0.0)\nprint(f"Checkpoint loaded from {{{inputs.ckpt_path}}}, epoch={{{outputs.epoch}}}")'
    
    _code = _code.replace("{{params.strict}}", str(strict))
    _code = _code.replace("{{params.map_location}}", str(map_location))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{inputs.ckpt_path}}", "ckpt_path")
    _code = _code.replace("{{outputs.model_out}}", "_out_model_out")
    _code = _code.replace("{{outputs.epoch}}", "_out_epoch")
    _code = _code.replace("{{outputs.loss}}", "_out_loss")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["optimizer"] = optimizer
    _ns["ckpt_path"] = ckpt_path
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model_out": _ns.get("_out_model_out"), "epoch": _ns.get("_out_epoch"), "loss": _ns.get("_out_loss")}


def early_stopping(metric_value=None, patience=5, mode='min', min_delta=0.0):
    """Stop training when monitored metric stops improving (simple counter-based)
    
    Args:
        metric_value (number) (required): 
    
    Parameters:
        patience (number, default=5): 
        mode (select, default='min'): 
        min_delta (number, default=0.0): 
    
    Returns:
        dict with keys:
            should_stop (boolean): 
            best_value (number): 
    """
    _imports = []
    _code = '_improved = False\nif "{{params.mode}}" == "min":\n    _improved = {{inputs.metric_value}} < (_es_best - {{params.min_delta}})\n "else":\n    _improved = {{inputs.metric_value}} > (_es_best + {{params.min_delta}})\nif _improved:\n    _es_best = {{inputs.metric_value}}\n    _es_counter = 0\n "else":\n    _es_counter += 1\n{{outputs.should_stop}} = _es_counter >= {{params.patience}}\n{{outputs.best_value}} = _es_best'
    
    _code = _code.replace("{{params.patience}}", str(patience))
    _code = _code.replace("{{params.mode}}", str(mode))
    _code = _code.replace("{{params.min_delta}}", str(min_delta))
    _code = _code.replace("{{inputs.metric_value}}", "metric_value")
    _code = _code.replace("{{outputs.should_stop}}", "_out_should_stop")
    _code = _code.replace("{{outputs.best_value}}", "_out_best_value")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["metric_value"] = metric_value
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"should_stop": _ns.get("_out_should_stop"), "best_value": _ns.get("_out_best_value")}


def early_stopping_patience(model=None, metric_value=None, patience=7, mode='min', restore_best=True):
    """Reusable early stopping class with model checkpoint restoration on best epoch
    
    Args:
        model (model) (required): 
        metric_value (number) (required): 
    
    Parameters:
        patience (number, default=7): 
        mode (select, default='min'): 
        restore_best (boolean, default=True): 
    
    Returns:
        dict with keys:
            should_stop (boolean): 
            is_best (boolean): 
    """
    _imports = ['import copy']
    _code = '{{outputs.is_best}} = False\nif ("{{params.mode}}" == "min" and {{inputs.metric_value}} < _esp_best) or ("{{params.mode}}" == "max" and {{inputs.metric_value}} > _esp_best):\n    _esp_best = {{inputs.metric_value}}\n    _esp_counter = 0\n    {{outputs.is_best}} = True\n    if {{params.restore_best}}:\n        _esp_best_state = copy.deepcopy({{inputs.model}}.state_dict())\n "else":\n    _esp_counter += 1\n{{outputs.should_stop}} = _esp_counter >= {{params.patience}}\nif {{outputs.should_stop}} and {{params.restore_best}} and _esp_best_state is not None:\n    {{inputs.model}}.load_state_dict(_esp_best_state)\n    print("Restored best model weights.")'
    
    _code = _code.replace("{{params.patience}}", str(patience))
    _code = _code.replace("{{params.mode}}", str(mode))
    _code = _code.replace("{{params.restore_best}}", str(restore_best))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.metric_value}}", "metric_value")
    _code = _code.replace("{{outputs.should_stop}}", "_out_should_stop")
    _code = _code.replace("{{outputs.is_best}}", "_out_is_best")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["metric_value"] = metric_value
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"should_stop": _ns.get("_out_should_stop"), "is_best": _ns.get("_out_is_best")}


def epoch_counter(start=0, total=100):
    """Track and emit the current epoch number in a training loop
    
    Parameters:
        start (number, default=0): 
        total (number, default=100): 
    
    Returns:
        number: 
    """
    _imports = []
    _code = '{{outputs.epoch}} = _current_epoch\n_current_epoch += 1\nprint(f"Epoch {{{outputs.epoch}} + 1}/{{{params.total}}}")'
    
    _code = _code.replace("{{params.start}}", str(start))
    _code = _code.replace("{{params.total}}", str(total))
    _code = _code.replace("{{outputs.epoch}}", "_out_epoch")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_epoch")


def step_counter(start=0):
    """Track the global training step across epochs for logging and scheduling
    
    Parameters:
        start (number, default=0): 
    
    Returns:
        number: 
    """
    _imports = []
    _code = '{{outputs.global_step}} = _global_step\n_global_step += 1'
    
    _code = _code.replace("{{params.start}}", str(start))
    _code = _code.replace("{{outputs.global_step}}", "_out_global_step")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_global_step")


def batch_sampler(dataset=None, batch_size=32, shuffle=True, drop_last=False, num_workers=4, pin_memory=True):
    """Create a custom batch sampler with configurable batch size, shuffling, and drop-last
    
    Dependencies: pip install torch
    
    Args:
        dataset (dataset) (required): 
    
    Parameters:
        batch_size (number, default=32): 
        shuffle (boolean, default=True): 
        drop_last (boolean, default=False): 
        num_workers (number, default=4): 
        pin_memory (boolean, default=True): 
    
    Returns:
        dataloader: 
    """
    _imports = ['from torch.utils.data import DataLoader']
    _code = '{{outputs.dataloader}} = DataLoader(\n    {{inputs.dataset}},\n    batch_size={{params.batch_size}},\n    shuffle={{params.shuffle}},\n    drop_last={{params.drop_last}},\n    num_workers={{params.num_workers}},\n    pin_memory={{params.pin_memory}}\n)'
    
    _code = _code.replace("{{params.batch_size}}", str(batch_size))
    _code = _code.replace("{{params.shuffle}}", str(shuffle))
    _code = _code.replace("{{params.drop_last}}", str(drop_last))
    _code = _code.replace("{{params.num_workers}}", str(num_workers))
    _code = _code.replace("{{params.pin_memory}}", str(pin_memory))
    _code = _code.replace("{{inputs.dataset}}", "dataset")
    _code = _code.replace("{{outputs.dataloader}}", "_out_dataloader")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataset"] = dataset
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_dataloader")


def weighted_sampler(dataset=None, labels=None, batch_size=32, num_workers=4):
    """Create a weighted random sampler for handling class imbalance in training
    
    Dependencies: pip install torch
    
    Args:
        dataset (dataset) (required): 
        labels (tensor) (required): Integer class labels for each sample
    
    Parameters:
        batch_size (number, default=32): 
        num_workers (number, default=4): 
    
    Returns:
        dataloader: 
    """
    _imports = ['import torch', 'from torch.utils.data import DataLoader, WeightedRandomSampler', 'from collections import Counter']
    _code = '_label_counts = Counter({{inputs.labels}}.tolist())\n_num_samples = len({{inputs.labels}})\n_class_weights = { "cls": _num_samples / count for cls, count in _label_counts.items()}\n_sample_weights = torch.tensor([_class_weights[int(l)] for l in {{inputs.labels}}])\n_sampler = WeightedRandomSampler(_sample_weights, num_samples=_num_samples, replacement=True)\n{{outputs.dataloader}} = DataLoader(\n    {{inputs.dataset}},\n    batch_size={{params.batch_size}},\n    sampler=_sampler,\n    num_workers={{params.num_workers}}\n)'
    
    _code = _code.replace("{{params.batch_size}}", str(batch_size))
    _code = _code.replace("{{params.num_workers}}", str(num_workers))
    _code = _code.replace("{{inputs.dataset}}", "dataset")
    _code = _code.replace("{{inputs.labels}}", "labels")
    _code = _code.replace("{{outputs.dataloader}}", "_out_dataloader")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataset"] = dataset
    _ns["labels"] = labels
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_dataloader")


def ddp(model=None, backend='nccl', find_unused=False, gradient_as_bucket_view=True):
    """Wrap a model with DistributedDataParallel for multi-GPU synchronous training
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        backend (select, default='nccl'): 
        find_unused (boolean, default=False): 
        gradient_as_bucket_view (boolean, default=True): 
    
    Returns:
        model: 
    """
    _imports = ['import torch', 'import torch.distributed as dist', 'from torch.nn.parallel import DistributedDataParallel as DDP', 'import os']
    _code = 'if not dist.is_initialized():\n    dist.init_process_group(backend="{{params.backend}}")\n_local_rank = int(os.environ.get("LOCAL_RANK", 0))\n_device = torch.device(f"cuda:{_local_rank}")\n{{inputs.model}}.to(_device)\n{{outputs.ddp_model}} = DDP(\n    {{inputs.model}},\n    device_ids=[_local_rank],\n    find_unused_parameters={{params.find_unused}},\n    gradient_as_bucket_view={{params.gradient_as_bucket_view}}\n)'
    
    _code = _code.replace("{{params.backend}}", str(backend))
    _code = _code.replace("{{params.find_unused}}", str(find_unused))
    _code = _code.replace("{{params.gradient_as_bucket_view}}", str(gradient_as_bucket_view))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.ddp_model}}", "_out_ddp_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_ddp_model")


def fsdp(model=None, sharding_strategy='FULL_SHARD', mixed_precision=True, mp_dtype='bfloat16', activation_checkpointing=False):
    """Wrap a model with Fully Sharded Data Parallel for memory-efficient distributed training
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        sharding_strategy (select, default='FULL_SHARD'): 
        mixed_precision (boolean, default=True): 
        mp_dtype (select, default='bfloat16'): 
        activation_checkpointing (boolean, default=False): 
    
    Returns:
        model: 
    """
    _imports = ['import torch', 'import torch.distributed as dist', 'from torch.distributed.fsdp import FullyShardedDataParallel as FSDP, ShardingStrategy, MixedPrecision']
    _code = 'if not dist.is_initialized():\n    dist.init_process_group(backend="nccl")\n_fsdp_mp = None\nif {{params.mixed_precision}}:\n    _mp_dtype = torch.bfloat16 if "{{params.mp_dtype}}" == "bfloat16" else torch.float16\n    _fsdp_mp = MixedPrecision(param_dtype=_mp_dtype, reduce_dtype=_mp_dtype, buffer_dtype=_mp_dtype)\n{{outputs.fsdp_model}} = FSDP(\n    {{inputs.model}},\n    sharding_strategy=ShardingStrategy.{{params.sharding_strategy}},\n    mixed_precision=_fsdp_mp\n)'
    
    _code = _code.replace("{{params.sharding_strategy}}", str(sharding_strategy))
    _code = _code.replace("{{params.mixed_precision}}", str(mixed_precision))
    _code = _code.replace("{{params.mp_dtype}}", str(mp_dtype))
    _code = _code.replace("{{params.activation_checkpointing}}", str(activation_checkpointing))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.fsdp_model}}", "_out_fsdp_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_fsdp_model")


def model_parallelism(model=None, strategy='pipeline', num_gpus=2, chunks=8):
    """Split a model across multiple GPUs using pipeline or tensor parallelism
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        strategy (select, default='pipeline'): 
        num_gpus (number, default=2): 
        chunks (number, default=8): 
    
    Returns:
        model: 
    """
    _imports = ['import torch', 'from torch.distributed.pipeline.sync import Pipe']
    _code = 'if "{{params.strategy}}" == "pipeline":\n    _devices = [f"cuda:{i}" for i in range({{params.num_gpus}})]\n    _layers = list({{inputs.model}}.children())\n    _split = len(_layers) // {{params.num_gpus}}\n    _partitions = []\n    for _i in range({{params.num_gpus}}):\n        _start = _i * _split\n        _end = _start + _split if _i < {{params.num_gpus}} - 1 else len(_layers)\n        _partition = torch.nn.Sequential(*_layers[_start:_end]).to(_devices[_i])\n        _partitions.append(_partition)\n    _sequential = torch.nn.Sequential(*_partitions)\n    {{outputs.parallel_model}} = Pipe(_sequential, chunks={{params.chunks}})\n "else":\n    _layers = list({{inputs.model}}.children())\n    _split = len(_layers) // {{params.num_gpus}}\n    for _i, _layer in enumerate(_layers):\n        _dev_idx = min(_i // max(_split, 1), {{params.num_gpus}} - 1)\n        _layer.to(f"cuda:{_dev_idx}")\n    {{outputs.parallel_model}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.strategy}}", str(strategy))
    _code = _code.replace("{{params.num_gpus}}", str(num_gpus))
    _code = _code.replace("{{params.chunks}}", str(chunks))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.parallel_model}}", "_out_parallel_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_parallel_model")

