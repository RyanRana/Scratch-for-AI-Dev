"""
aiblocks.distillation — Distillation & Compression

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def teacher_model(model=None, freeze=True, device='auto'):
    """Wrap a pretrained model as the teacher for knowledge distillation
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        freeze (boolean, default=True): Freeze all teacher parameters
        device (select, default='auto'): 
    
    Returns:
        model: 
    """
    _imports = ['import torch']
    _code = '_device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if "{{params.device}}" == "auto" else torch.device("{{params.device}}")\n{{inputs.model}}.to(_device)\nif {{params.freeze}}:\n    for _p in {{inputs.model}}.parameters():\n        _p.requires_grad = False\n{{inputs.model}}.eval()\n{{outputs.teacher}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.freeze}}", str(freeze))
    _code = _code.replace("{{params.device}}", str(device))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.teacher}}", "_out_teacher")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_teacher")


def student_model(model=None, init_from_teacher=False, device='auto'):
    """Wrap a smaller model as the student for knowledge distillation
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        init_from_teacher (boolean, default=False): 
        device (select, default='auto'): 
    
    Returns:
        model: 
    """
    _imports = ['import torch']
    _code = '_device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if "{{params.device}}" == "auto" else torch.device("{{params.device}}")\n{{inputs.model}}.to(_device)\n{{inputs.model}}.train()\n{{outputs.student}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.init_from_teacher}}", str(init_from_teacher))
    _code = _code.replace("{{params.device}}", str(device))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.student}}", "_out_student")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_student")


def kd_loss_soft_labels(student_logits=None, teacher_logits=None, hard_labels=None, temperature=4.0, alpha=0.7):
    """Compute knowledge distillation loss using softened logits from teacher and student
    
    Dependencies: pip install torch
    
    Args:
        student_logits (tensor) (required): 
        teacher_logits (tensor) (required): 
        hard_labels (tensor): 
    
    Parameters:
        temperature (number, default=4.0): 
        alpha (number, default=0.7): 
    
    Returns:
        loss_fn: 
    """
    _imports = ['import torch', 'import torch.nn.functional as F']
    _code = '_T = {{params.temperature}}\n_alpha = {{params.alpha}}\n_soft_student = F.log_softmax({{inputs.student_logits}} / _T, dim=-1)\n_soft_teacher = F.softmax({{inputs.teacher_logits}} / _T, dim=-1)\n_kd_loss = F.kl_div(_soft_student, _soft_teacher, reduction="batchmean") * (_T * _T)\nif {{inputs.hard_labels}} is not None:\n    _hard_loss = F.cross_entropy({{inputs.student_logits}}, {{inputs.hard_labels}})\n    {{outputs.loss}} = _alpha * _kd_loss + (1 - _alpha) * _hard_loss\n "else":\n    {{outputs.loss}} = _kd_loss'
    
    _code = _code.replace("{{params.temperature}}", str(temperature))
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{inputs.student_logits}}", "student_logits")
    _code = _code.replace("{{inputs.teacher_logits}}", "teacher_logits")
    _code = _code.replace("{{inputs.hard_labels}}", "hard_labels")
    _code = _code.replace("{{outputs.loss}}", "_out_loss")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["student_logits"] = student_logits
    _ns["teacher_logits"] = teacher_logits
    _ns["hard_labels"] = hard_labels
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_loss")


def kd_loss_feature_map(student_features=None, teacher_features=None, loss_type='mse', normalize=True):
    """Compute feature-based distillation loss by matching intermediate feature maps between teacher and student
    
    Dependencies: pip install torch
    
    Args:
        student_features (tensor) (required): 
        teacher_features (tensor) (required): 
    
    Parameters:
        loss_type (select, default='mse'): 
        normalize (boolean, default=True): 
    
    Returns:
        loss_fn: 
    """
    _imports = ['import torch', 'import torch.nn.functional as F']
    _code = '_s = {{inputs.student_features}}\n_t = {{inputs.teacher_features}}\nif {{params.normalize}}:\n    _s = F.normalize(_s, dim=-1)\n    _t = F.normalize(_t, dim=-1)\nif "{{params.loss_type}}" == "mse":\n    {{outputs.loss}} = F.mse_loss(_s, _t)\nelif "{{params.loss_type}}" == "l1":\n    {{outputs.loss}} = F.l1_loss(_s, _t)\n "else":\n    {{outputs.loss}} = (1 - F.cosine_similarity(_s, _t, dim=-1)).mean()'
    
    _code = _code.replace("{{params.loss_type}}", str(loss_type))
    _code = _code.replace("{{params.normalize}}", str(normalize))
    _code = _code.replace("{{inputs.student_features}}", "student_features")
    _code = _code.replace("{{inputs.teacher_features}}", "teacher_features")
    _code = _code.replace("{{outputs.loss}}", "_out_loss")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["student_features"] = student_features
    _ns["teacher_features"] = teacher_features
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_loss")


def response_based_kd(teacher=None, student=None, dataloader=None, optimizer=None, temperature=4.0, alpha=0.7, epochs=10):
    """End-to-end response-based knowledge distillation using final output logits
    
    Dependencies: pip install torch
    
    Args:
        teacher (model) (required): 
        student (model) (required): 
        dataloader (dataloader) (required): 
        optimizer (optimizer) (required): 
    
    Parameters:
        temperature (number, default=4.0): 
        alpha (number, default=0.7): 
        epochs (number, default=10): 
    
    Returns:
        dict with keys:
            student_out (model): 
            loss (number): 
    """
    _imports = ['import torch', 'import torch.nn.functional as F']
    _code = '_T = {{params.temperature}}\n_alpha = {{params.alpha}}\n{{inputs.teacher}}.eval()\n{{inputs.student}}.train()\nfor _epoch in range({{params.epochs}}):\n    _total = 0.0\n    for _x, _y in {{inputs.dataloader}}:\n        with torch.no_grad():\n            _t_logits = {{inputs.teacher}}(_x)\n        _s_logits = {{inputs.student}}(_x)\n        _soft = F.kl_div(F.log_softmax(_s_logits / _T, dim=-1), F.softmax(_t_logits / _T, dim=-1), reduction="batchmean") * (_T * _T)\n        _hard = F.cross_entropy(_s_logits, _y)\n        _loss = _alpha * _soft + (1 - _alpha) * _hard\n        {{inputs.optimizer}}.zero_grad()\n        _loss.backward()\n        {{inputs.optimizer}}.step()\n        _total += _loss.item()\n    {{outputs.loss}} = _total / len({{inputs.dataloader}})\n{{outputs.student_out}} = {{inputs.student}}'
    
    _code = _code.replace("{{params.temperature}}", str(temperature))
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.epochs}}", str(epochs))
    _code = _code.replace("{{inputs.teacher}}", "teacher")
    _code = _code.replace("{{inputs.student}}", "student")
    _code = _code.replace("{{inputs.dataloader}}", "dataloader")
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{outputs.student_out}}", "_out_student_out")
    _code = _code.replace("{{outputs.loss}}", "_out_loss")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["teacher"] = teacher
    _ns["student"] = student
    _ns["dataloader"] = dataloader
    _ns["optimizer"] = optimizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"student_out": _ns.get("_out_student_out"), "loss": _ns.get("_out_loss")}


def feature_based_kd(teacher=None, student=None, dataloader=None, optimizer=None, layer_pairs='[["layer2", "layer1"]]', beta=0.5, epochs=10):
    """Knowledge distillation that matches intermediate feature representations between teacher and student
    
    Dependencies: pip install torch
    
    Args:
        teacher (model) (required): 
        student (model) (required): 
        dataloader (dataloader) (required): 
        optimizer (optimizer) (required): 
    
    Parameters:
        layer_pairs (json, default='[["layer2", "layer1"]]'): JSON array of [teacher_layer, student_layer] pairs
        beta (number, default=0.5): 
        epochs (number, default=10): 
    
    Returns:
        dict with keys:
            student_out (model): 
            loss (number): 
    """
    _imports = ['import torch', 'import torch.nn.functional as F', 'import json']
    _code = '_layer_pairs = json.loads(\'{{params.layer_pairs}}\')\n_hooks, _feats = [], {"teacher": {}, "student": {}}\ndef _make_hook(name, role):\n    def _hook(mod, inp, out):\n        _feats[role][name] = out\n    return _hook\nfor _tl, _sl in _layer_pairs:\n    _hooks.append(dict({{inputs.teacher}}.named_modules())[_tl].register_forward_hook(_make_hook(_tl, "teacher")))\n    _hooks.append(dict({{inputs.student}}.named_modules())[_sl].register_forward_hook(_make_hook(_sl, "student")))\n{{inputs.teacher}}.eval()\n{{inputs.student}}.train()\nfor _epoch in range({{params.epochs}}):\n    _total = 0.0\n    for _x, _y in {{inputs.dataloader}}:\n        with torch.no_grad():\n            {{inputs.teacher}}(_x)\n        _s_logits = {{inputs.student}}(_x)\n        _feat_loss = sum(F.mse_loss(_feats["student"][_sl], _feats["teacher"][_tl]) for _tl, _sl in _layer_pairs)\n        _ce_loss = F.cross_entropy(_s_logits, _y)\n        _loss = {{params.beta}} * _feat_loss + (1 - {{params.beta}}) * _ce_loss\n        {{inputs.optimizer}}.zero_grad()\n        _loss.backward()\n        {{inputs.optimizer}}.step()\n        _total += _loss.item()\n    {{outputs.loss}} = _total / len({{inputs.dataloader}})\nfor _h in _hooks:\n    _h.remove()\n{{outputs.student_out}} = {{inputs.student}}'
    
    _code = _code.replace("{{params.layer_pairs}}", str(layer_pairs))
    _code = _code.replace("{{params.beta}}", str(beta))
    _code = _code.replace("{{params.epochs}}", str(epochs))
    _code = _code.replace("{{inputs.teacher}}", "teacher")
    _code = _code.replace("{{inputs.student}}", "student")
    _code = _code.replace("{{inputs.dataloader}}", "dataloader")
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{outputs.student_out}}", "_out_student_out")
    _code = _code.replace("{{outputs.loss}}", "_out_loss")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["teacher"] = teacher
    _ns["student"] = student
    _ns["dataloader"] = dataloader
    _ns["optimizer"] = optimizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"student_out": _ns.get("_out_student_out"), "loss": _ns.get("_out_loss")}


def relation_based_kd(teacher=None, student=None, dataloader=None, optimizer=None, relation='distance', epochs=10):
    """Distill inter-sample relationships (e.g., pairwise distance matrices) from teacher to student
    
    Dependencies: pip install torch
    
    Args:
        teacher (model) (required): 
        student (model) (required): 
        dataloader (dataloader) (required): 
        optimizer (optimizer) (required): 
    
    Parameters:
        relation (select, default='distance'): 
        epochs (number, default=10): 
    
    Returns:
        dict with keys:
            student_out (model): 
            loss (number): 
    """
    _imports = ['import torch', 'import torch.nn.functional as F']
    _code = '{{inputs.teacher}}.eval()\n{{inputs.student}}.train()\ndef _distance_matrix(feat):\n    return torch.cdist(feat, feat)\ndef _angle_matrix(feat):\n    _normed = F.normalize(feat, dim=-1)\n    return _normed @ _normed.T\n_rel_fn = _distance_matrix if "{{params.relation}}" == "distance" else _angle_matrix\nfor _epoch in range({{params.epochs}}):\n    _total = 0.0\n    for _x, _y in {{inputs.dataloader}}:\n        with torch.no_grad():\n            _t_feat = {{inputs.teacher}}(_x)\n        _s_feat = {{inputs.student}}(_x)\n        _loss = F.mse_loss(_rel_fn(_s_feat), _rel_fn(_t_feat))\n        {{inputs.optimizer}}.zero_grad()\n        _loss.backward()\n        {{inputs.optimizer}}.step()\n        _total += _loss.item()\n    {{outputs.loss}} = _total / len({{inputs.dataloader}})\n{{outputs.student_out}} = {{inputs.student}}'
    
    _code = _code.replace("{{params.relation}}", str(relation))
    _code = _code.replace("{{params.epochs}}", str(epochs))
    _code = _code.replace("{{inputs.teacher}}", "teacher")
    _code = _code.replace("{{inputs.student}}", "student")
    _code = _code.replace("{{inputs.dataloader}}", "dataloader")
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{outputs.student_out}}", "_out_student_out")
    _code = _code.replace("{{outputs.loss}}", "_out_loss")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["teacher"] = teacher
    _ns["student"] = student
    _ns["dataloader"] = dataloader
    _ns["optimizer"] = optimizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"student_out": _ns.get("_out_student_out"), "loss": _ns.get("_out_loss")}


def self_distillation(model=None, dataloader=None, optimizer=None, deep_layer='layer4', shallow_layer='layer2', epochs=10):
    """Distill knowledge from deeper layers to shallower layers within the same network
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        dataloader (dataloader) (required): 
        optimizer (optimizer) (required): 
    
    Parameters:
        deep_layer (string, default='layer4'): 
        shallow_layer (string, default='layer2'): 
        epochs (number, default=10): 
    
    Returns:
        dict with keys:
            model_out (model): 
            loss (number): 
    """
    _imports = ['import torch', 'import torch.nn.functional as F']
    _code = '_feats = {}\ndef _hook(name):\n    def _fn(mod, inp, out):\n        _feats[name] = out\n    return _fn\n_h1 = dict({{inputs.model}}.named_modules())["{{params.deep_layer}}"].register_forward_hook(_hook("deep"))\n_h2 = dict({{inputs.model}}.named_modules())["{{params.shallow_layer}}"].register_forward_hook(_hook("shallow"))\n{{inputs.model}}.train()\nfor _epoch in range({{params.epochs}}):\n    _total = 0.0\n    for _x, _y in {{inputs.dataloader}}:\n        _out = {{inputs.model}}(_x)\n        _ce = F.cross_entropy(_out, _y)\n        _sd = F.mse_loss(_feats["shallow"], _feats["deep"].detach())\n        _loss = _ce + _sd\n        {{inputs.optimizer}}.zero_grad()\n        _loss.backward()\n        {{inputs.optimizer}}.step()\n        _total += _loss.item()\n    {{outputs.loss}} = _total / len({{inputs.dataloader}})\n_h1.remove()\n_h2.remove()\n{{outputs.model_out}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.deep_layer}}", str(deep_layer))
    _code = _code.replace("{{params.shallow_layer}}", str(shallow_layer))
    _code = _code.replace("{{params.epochs}}", str(epochs))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.dataloader}}", "dataloader")
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{outputs.model_out}}", "_out_model_out")
    _code = _code.replace("{{outputs.loss}}", "_out_loss")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["dataloader"] = dataloader
    _ns["optimizer"] = optimizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model_out": _ns.get("_out_model_out"), "loss": _ns.get("_out_loss")}


def born_again_network(teacher=None, student=None, dataloader=None, optimizer=None, temperature=3.0, epochs=20):
    """Train a student of the same architecture as the teacher (born-again distillation)
    
    Dependencies: pip install torch
    
    Args:
        teacher (model) (required): 
        student (model) (required): 
        dataloader (dataloader) (required): 
        optimizer (optimizer) (required): 
    
    Parameters:
        temperature (number, default=3.0): 
        epochs (number, default=20): 
    
    Returns:
        dict with keys:
            student_out (model): 
            loss (number): 
    """
    _imports = ['import torch', 'import torch.nn.functional as F']
    _code = '_T = {{params.temperature}}\n{{inputs.teacher}}.eval()\n{{inputs.student}}.train()\nfor _epoch in range({{params.epochs}}):\n    _total = 0.0\n    for _x, _y in {{inputs.dataloader}}:\n        with torch.no_grad():\n            _t_logits = {{inputs.teacher}}(_x)\n        _s_logits = {{inputs.student}}(_x)\n        _loss = F.kl_div(F.log_softmax(_s_logits / _T, dim=-1), F.softmax(_t_logits / _T, dim=-1), reduction="batchmean") * (_T * _T)\n        {{inputs.optimizer}}.zero_grad()\n        _loss.backward()\n        {{inputs.optimizer}}.step()\n        _total += _loss.item()\n    {{outputs.loss}} = _total / len({{inputs.dataloader}})\n{{outputs.student_out}} = {{inputs.student}}'
    
    _code = _code.replace("{{params.temperature}}", str(temperature))
    _code = _code.replace("{{params.epochs}}", str(epochs))
    _code = _code.replace("{{inputs.teacher}}", "teacher")
    _code = _code.replace("{{inputs.student}}", "student")
    _code = _code.replace("{{inputs.dataloader}}", "dataloader")
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{outputs.student_out}}", "_out_student_out")
    _code = _code.replace("{{outputs.loss}}", "_out_loss")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["teacher"] = teacher
    _ns["student"] = student
    _ns["dataloader"] = dataloader
    _ns["optimizer"] = optimizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"student_out": _ns.get("_out_student_out"), "loss": _ns.get("_out_loss")}


def ptq(model=None, calibration_data=None, mode='dynamic', dtype='qint8'):
    """Quantize a trained model without retraining using PyTorch dynamic or static quantization
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        calibration_data (dataloader): 
    
    Parameters:
        mode (select, default='dynamic'): 
        dtype (select, default='qint8'): 
    
    Returns:
        model: 
    """
    _imports = ['import torch', 'import torch.quantization as tq']
    _code = '{{inputs.model}}.eval()\nif "{{params.mode}}" == "dynamic":\n    {{outputs.quantized_model}} = torch.quantization.quantize_dynamic({{inputs.model}}, {torch.nn.Linear}, dtype=torch.{{params.dtype}})\n "else":\n    {{inputs.model}}.qconfig = tq.get_default_qconfig("fbgemm")\n    tq.prepare({{inputs.model}}, inplace=True)\n    if {{inputs.calibration_data}} is not None:\n        with torch.no_grad():\n            for _x, _ in {{inputs.calibration_data}}:\n                {{inputs.model}}(_x)\n    {{outputs.quantized_model}} = tq.convert({{inputs.model}})'
    
    _code = _code.replace("{{params.mode}}", str(mode))
    _code = _code.replace("{{params.dtype}}", str(dtype))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.calibration_data}}", "calibration_data")
    _code = _code.replace("{{outputs.quantized_model}}", "_out_quantized_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["calibration_data"] = calibration_data
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_quantized_model")


def qat(model=None, dataloader=None, optimizer=None, loss_fn=None, epochs=5, backend='fbgemm'):
    """Train a model with simulated quantization to preserve accuracy after conversion
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        dataloader (dataloader) (required): 
        optimizer (optimizer) (required): 
        loss_fn (loss_fn) (required): 
    
    Parameters:
        epochs (number, default=5): 
        backend (select, default='fbgemm'): 
    
    Returns:
        dict with keys:
            quantized_model (model): 
            loss (number): 
    """
    _imports = ['import torch', 'import torch.quantization as tq']
    _code = '{{inputs.model}}.train()\n{{inputs.model}}.qconfig = tq.get_default_qat_qconfig("{{params.backend}}")\ntq.prepare_qat({{inputs.model}}, inplace=True)\nfor _epoch in range({{params.epochs}}):\n    _total = 0.0\n    for _x, _y in {{inputs.dataloader}}:\n        _preds = {{inputs.model}}(_x)\n        _loss = {{inputs.loss_fn}}(_preds, _y)\n        {{inputs.optimizer}}.zero_grad()\n        _loss.backward()\n        {{inputs.optimizer}}.step()\n        _total += _loss.item()\n    {{outputs.loss}} = _total / len({{inputs.dataloader}})\n{{outputs.quantized_model}} = tq.convert({{inputs.model}}.eval())'
    
    _code = _code.replace("{{params.epochs}}", str(epochs))
    _code = _code.replace("{{params.backend}}", str(backend))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.dataloader}}", "dataloader")
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{inputs.loss_fn}}", "loss_fn")
    _code = _code.replace("{{outputs.quantized_model}}", "_out_quantized_model")
    _code = _code.replace("{{outputs.loss}}", "_out_loss")
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
    return {"quantized_model": _ns.get("_out_quantized_model"), "loss": _ns.get("_out_loss")}


def int8_quantize(model=None, per_channel=True):
    """Convert model weights and activations to INT8 precision
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        per_channel (boolean, default=True): 
    
    Returns:
        model: 
    """
    _imports = ['import torch']
    _code = '{{inputs.model}}.eval()\n{{outputs.quantized_model}} = torch.quantization.quantize_dynamic({{inputs.model}}, {torch.nn.Linear, torch.nn.Conv2d}, dtype=torch.qint8)'
    
    _code = _code.replace("{{params.per_channel}}", str(per_channel))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.quantized_model}}", "_out_quantized_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_quantized_model")


def int4_quantize(model_name=None, quant_type='nf4', double_quant=True):
    """Convert model to INT4 precision using bitsandbytes for extreme compression
    
    Dependencies: pip install torch transformers
    
    Args:
        model_name (text) (required): 
    
    Parameters:
        quant_type (select, default='nf4'): 
        double_quant (boolean, default=True): 
    
    Returns:
        dict with keys:
            model (model): 
            tokenizer (tokenizer): 
    """
    _imports = ['import torch', 'from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig']
    _code = '_bnb_config = BitsAndBytesConfig(\n    load_in_4bit=True,\n    bnb_4bit_quant_type="{{params.quant_type}}",\n    bnb_4bit_use_double_quant={{params.double_quant}},\n    bnb_4bit_compute_dtype=torch.float16,\n)\n{{outputs.model}} = AutoModelForCausalLM.from_pretrained({{inputs.model_name}}, quantization_config=_bnb_config, device_map="auto")\n{{outputs.tokenizer}} = AutoTokenizer.from_pretrained({{inputs.model_name}})'
    
    _code = _code.replace("{{params.quant_type}}", str(quant_type))
    _code = _code.replace("{{params.double_quant}}", str(double_quant))
    _code = _code.replace("{{inputs.model_name}}", "model_name")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.tokenizer}}", "_out_tokenizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model_name"] = model_name
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "tokenizer": _ns.get("_out_tokenizer")}


def gptq(model_name=None, calibration_data=None, bits=4, group_size=128, desc_act=True):
    """Quantize a language model using GPTQ (post-training quantization for generative models)
    
    Dependencies: pip install auto-gptq transformers
    
    Args:
        model_name (text) (required): 
        calibration_data (dataset) (required): 
    
    Parameters:
        bits (select, default=4): 
        group_size (number, default=128): 
        desc_act (boolean, default=True): 
    
    Returns:
        dict with keys:
            model (model): 
            tokenizer (tokenizer): 
    """
    _imports = ['from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig', 'from transformers import AutoTokenizer']
    _code = '{{outputs.tokenizer}} = AutoTokenizer.from_pretrained({{inputs.model_name}})\n_quant_config = BaseQuantizeConfig(bits={{params.bits}}, group_size={{params.group_size}}, desc_act={{params.desc_act}})\n_model = AutoGPTQForCausalLM.from_pretrained({{inputs.model_name}}, _quant_config)\n_model.quantize({{inputs.calibration_data}})\n{{outputs.model}} = _model'
    
    _code = _code.replace("{{params.bits}}", str(bits))
    _code = _code.replace("{{params.group_size}}", str(group_size))
    _code = _code.replace("{{params.desc_act}}", str(desc_act))
    _code = _code.replace("{{inputs.model_name}}", "model_name")
    _code = _code.replace("{{inputs.calibration_data}}", "calibration_data")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.tokenizer}}", "_out_tokenizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model_name"] = model_name
    _ns["calibration_data"] = calibration_data
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "tokenizer": _ns.get("_out_tokenizer")}


def awq(model_name=None, bits=4, group_size=128, zero_point=True):
    """Quantize a model using Activation-aware Weight Quantization (AWQ)
    
    Dependencies: pip install autoawq transformers
    
    Args:
        model_name (text) (required): 
    
    Parameters:
        bits (select, default=4): 
        group_size (number, default=128): 
        zero_point (boolean, default=True): 
    
    Returns:
        dict with keys:
            model (model): 
            tokenizer (tokenizer): 
    """
    _imports = ['from awq import AutoAWQForCausalLM', 'from transformers import AutoTokenizer']
    _code = '{{outputs.tokenizer}} = AutoTokenizer.from_pretrained({{inputs.model_name}})\n_model = AutoAWQForCausalLM.from_pretrained({{inputs.model_name}})\n_quant_config = {"zero_point": {{params.zero_point}}, "q_group_size": {{params.group_size}}, "w_bit": {{params.bits}}}\n_model.quantize({{outputs.tokenizer}}, quant_config=_quant_config)\n{{outputs.model}} = _model'
    
    _code = _code.replace("{{params.bits}}", str(bits))
    _code = _code.replace("{{params.group_size}}", str(group_size))
    _code = _code.replace("{{params.zero_point}}", str(zero_point))
    _code = _code.replace("{{inputs.model_name}}", "model_name")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.tokenizer}}", "_out_tokenizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model_name"] = model_name
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "tokenizer": _ns.get("_out_tokenizer")}


def gguf_export(model_path=None, quant_method='q4_k_m', output_dir='./gguf_output'):
    """Export a model to GGUF format for use with llama.cpp and compatible runtimes
    
    Args:
        model_path (path) (required): 
    
    Parameters:
        quant_method (select, default='q4_k_m'): 
        output_dir (string, default='./gguf_output'): 
    
    Returns:
        path: 
    """
    _imports = ['import subprocess', 'import os']
    _code = 'os.makedirs("{{params.output_dir}}", exist_ok=True)\n_out = os.path.join("{{params.output_dir}}", "model-{{params.quant_method}}.gguf")\nsubprocess.run(["python", "llama.cpp/convert.py", {{inputs.model_path}}, "--outfile", _out, "--outtype", "{{params.quant_method}}"], check=True)\n{{outputs.gguf_path}} = _out'
    
    _code = _code.replace("{{params.quant_method}}", str(quant_method))
    _code = _code.replace("{{params.output_dir}}", str(output_dir))
    _code = _code.replace("{{inputs.model_path}}", "model_path")
    _code = _code.replace("{{outputs.gguf_path}}", "_out_gguf_path")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model_path"] = model_path
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_gguf_path")


def structured_pruning(model=None, amount=0.3, norm=1):
    """Remove entire filters, channels, or attention heads from a model
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        amount (number, default=0.3): 
        norm (select, default=1): 
    
    Returns:
        model: 
    """
    _imports = ['import torch', 'import torch.nn.utils.prune as prune']
    _code = 'for _name, _module in {{inputs.model}}.named_modules():\n    if isinstance(_module, (torch.nn.Conv2d, torch.nn.Linear)):\n        prune.ln_structured(_module, name="weight", amount={{params.amount}}, n={{params.norm}}, dim=0)\n        prune.remove(_module, "weight")\n{{outputs.pruned_model}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.amount}}", str(amount))
    _code = _code.replace("{{params.norm}}", str(norm))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.pruned_model}}", "_out_pruned_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_pruned_model")


def unstructured_pruning(model=None, amount=0.4):
    """Zero out individual weights based on magnitude threshold
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        amount (number, default=0.4): 
    
    Returns:
        dict with keys:
            pruned_model (model): 
            sparsity (number): 
    """
    _imports = ['import torch', 'import torch.nn.utils.prune as prune']
    _code = 'for _name, _module in {{inputs.model}}.named_modules():\n    if isinstance(_module, (torch.nn.Conv2d, torch.nn.Linear)):\n        prune.l1_unstructured(_module, name="weight", amount={{params.amount}})\n        prune.remove(_module, "weight")\n_total, _zeros = 0, 0\nfor _p in {{inputs.model}}.parameters():\n    _total += _p.numel()\n    _zeros += (_p == 0).sum().item()\n{{outputs.sparsity}} = _zeros / _total\n{{outputs.pruned_model}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.amount}}", str(amount))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.pruned_model}}", "_out_pruned_model")
    _code = _code.replace("{{outputs.sparsity}}", "_out_sparsity")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"pruned_model": _ns.get("_out_pruned_model"), "sparsity": _ns.get("_out_sparsity")}


def magnitude_pruning(model=None, amount=0.3):
    """Prune weights globally by absolute magnitude across all layers
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        amount (number, default=0.3): 
    
    Returns:
        model: 
    """
    _imports = ['import torch', 'import torch.nn.utils.prune as prune']
    _code = '_params_to_prune = []\nfor _name, _module in {{inputs.model}}.named_modules():\n    if isinstance(_module, (torch.nn.Conv2d, torch.nn.Linear)):\n        _params_to_prune.append((_module, "weight"))\nprune.global_unstructured(_params_to_prune, pruning_method=prune.L1Unstructured, amount={{params.amount}})\nfor _module, _pname in _params_to_prune:\n    prune.remove(_module, _pname)\n{{outputs.pruned_model}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.amount}}", str(amount))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.pruned_model}}", "_out_pruned_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_pruned_model")


def movement_pruning(model=None, dataloader=None, optimizer=None, loss_fn=None, amount=0.3, warmup_steps=100):
    """Prune weights based on movement (change in magnitude during fine-tuning) rather than absolute value
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        dataloader (dataloader) (required): 
        optimizer (optimizer) (required): 
        loss_fn (loss_fn) (required): 
    
    Parameters:
        amount (number, default=0.3): 
        warmup_steps (number, default=100): 
    
    Returns:
        model: 
    """
    _imports = ['import torch', 'import torch.nn.utils.prune as prune', 'import copy']
    _code = '_initial_weights = { "n": p.clone() for n, p in {{inputs.model}}.named_parameters() if "weight" in n}\n{{inputs.model}}.train()\n_step = 0\nfor _x, _y in {{inputs.dataloader}}:\n    _preds = {{inputs.model}}(_x)\n    _loss = {{inputs.loss_fn}}(_preds, _y)\n    {{inputs.optimizer}}.zero_grad()\n    _loss.backward()\n    {{inputs.optimizer}}.step()\n    _step += 1\n    if _step >= {{params.warmup_steps}}:\n        break\n_movements = {}\nfor _n, _p in {{inputs.model}}.named_parameters():\n    if _n in _initial_weights:\n        _movements[_n] = (_p.data - _initial_weights[_n]).abs()\n_all_mvmt = torch.cat([m.flatten() for m in _movements.values()])\n_threshold = torch.quantile(_all_mvmt, {{params.amount}})\nfor _n, _p in {{inputs.model}}.named_parameters():\n    if _n in _movements:\n        _mask = (_movements[_n] > _threshold).float()\n        _p.data *= _mask\n{{outputs.pruned_model}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.amount}}", str(amount))
    _code = _code.replace("{{params.warmup_steps}}", str(warmup_steps))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.dataloader}}", "dataloader")
    _code = _code.replace("{{inputs.optimizer}}", "optimizer")
    _code = _code.replace("{{inputs.loss_fn}}", "loss_fn")
    _code = _code.replace("{{outputs.pruned_model}}", "_out_pruned_model")
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
    return _ns.get("_out_pruned_model")


def lottery_ticket_mask(model=None, dataloader=None, loss_fn=None, prune_rate=0.2, rounds=3, train_steps=500, lr=0.01):
    """Identify a sparse sub-network (lottery ticket) by iterative magnitude pruning and rewinding
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        dataloader (dataloader) (required): 
        loss_fn (loss_fn) (required): 
    
    Parameters:
        prune_rate (number, default=0.2): 
        rounds (number, default=3): 
        train_steps (number, default=500): 
        lr (number, default=0.01): 
    
    Returns:
        dict with keys:
            mask (dict): 
            model_out (model): 
    """
    _imports = ['import torch', 'import torch.nn.utils.prune as prune', 'import copy']
    _code = '_init_state = copy.deepcopy({{inputs.model}}.state_dict())\n_masks = {}\nfor _round in range({{params.rounds}}):\n    {{inputs.model}}.load_state_dict(_init_state)\n    for _n, _m in _masks.items():\n        dict({{inputs.model}}.named_parameters())[_n].data *= _m\n    _opt = torch.optim.SGD({{inputs.model}}.parameters(), lr={{params.lr}})\n    {{inputs.model}}.train()\n    _step = 0\n    for _x, _y in {{inputs.dataloader}}:\n        _loss = {{inputs.loss_fn}}({{inputs.model}}(_x), _y)\n        _opt.zero_grad()\n        _loss.backward()\n        _opt.step()\n        _step += 1\n        if _step >= {{params.train_steps}}:\n            break\n    for _n, _p in {{inputs.model}}.named_parameters():\n        if "weight" in _n:\n            _thresh = torch.quantile(_p.data.abs().flatten(), {{params.prune_rate}})\n            _new_mask = (_p.data.abs() > _thresh).float()\n            _masks[_n] = _masks.get(_n, torch.ones_like(_p.data)) * _new_mask\n{{outputs.mask}} = _masks\n{{inputs.model}}.load_state_dict(_init_state)\nfor _n, _m in _masks.items():\n    dict({{inputs.model}}.named_parameters())[_n].data *= _m\n{{outputs.model_out}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.prune_rate}}", str(prune_rate))
    _code = _code.replace("{{params.rounds}}", str(rounds))
    _code = _code.replace("{{params.train_steps}}", str(train_steps))
    _code = _code.replace("{{params.lr}}", str(lr))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.dataloader}}", "dataloader")
    _code = _code.replace("{{inputs.loss_fn}}", "loss_fn")
    _code = _code.replace("{{outputs.mask}}", "_out_mask")
    _code = _code.replace("{{outputs.model_out}}", "_out_model_out")
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
    return {"mask": _ns.get("_out_mask"), "model_out": _ns.get("_out_model_out")}


def weight_sharing(model=None, num_clusters=16):
    """Compress a model by clustering weights and sharing centroids across groups
    
    Dependencies: pip install numpy scikit-learn torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        num_clusters (number, default=16): 
    
    Returns:
        model: 
    """
    _imports = ['import torch', 'from sklearn.cluster import KMeans', 'import numpy as np']
    _code = 'for _name, _param in {{inputs.model}}.named_parameters():\n    if "weight" in _name and _param.dim() >= 2:\n        _w = _param.data.cpu().numpy().flatten()\n        _kmeans = KMeans(n_clusters=min({{params.num_clusters}}, len(_w)), random_state=0, n_init=10).fit(_w.reshape(-1, 1))\n        _quantized = _kmeans.cluster_centers_[_kmeans.labels_].reshape(_param.shape)\n        _param.data = torch.tensor(_quantized, dtype=_param.dtype, device=_param.device)\n{{outputs.compressed_model}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.num_clusters}}", str(num_clusters))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.compressed_model}}", "_out_compressed_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_compressed_model")


def low_rank_factorization(model=None, rank_fraction=0.5):
    """Replace weight matrices with low-rank approximations using SVD to reduce parameters
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
    
    Parameters:
        rank_fraction (number, default=0.5): Fraction of original rank to keep
    
    Returns:
        dict with keys:
            factorized_model (model): 
            compression_ratio (number): 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = '_original_params = sum(p.numel() for p in {{inputs.model}}.parameters())\nfor _name, _module in list({{inputs.model}}.named_modules()):\n    if isinstance(_module, nn.Linear):\n        _W = _module.weight.data\n        _rank = max(1, int(min(_W.shape) * {{params.rank_fraction}}))\n        _U, _S, _Vh = torch.linalg.svd(_W, full_matrices=False)\n        _U_r = _U[:, :_rank] @ torch.diag(_S[:_rank])\n        _V_r = _Vh[:_rank, :]\n        _linear1 = nn.Linear(_V_r.shape[1], _rank, bias=False)\n        _linear2 = nn.Linear(_rank, _U_r.shape[0], bias=_module.bias is not None)\n        _linear1.weight.data = _V_r\n        _linear2.weight.data = _U_r\n        if _module.bias is not None:\n            _linear2.bias.data = _module.bias.data\n        _parts = _name.rsplit(".", 1)\n        if len(_parts) == 2:\n            _parent = dict({{inputs.model}}.named_modules())[_parts[0]]\n            setattr(_parent, _parts[1], nn.Sequential(_linear1, _linear2))\n "else":\n            setattr({{inputs.model}}, _name, nn.Sequential(_linear1, _linear2))\n_new_params = sum(p.numel() for p in {{inputs.model}}.parameters())\n{{outputs.compression_ratio}} = _original_params / _new_params\n{{outputs.factorized_model}} = {{inputs.model}}'
    
    _code = _code.replace("{{params.rank_fraction}}", str(rank_fraction))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{outputs.factorized_model}}", "_out_factorized_model")
    _code = _code.replace("{{outputs.compression_ratio}}", "_out_compression_ratio")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"factorized_model": _ns.get("_out_factorized_model"), "compression_ratio": _ns.get("_out_compression_ratio")}


def onnx_export(model=None, sample_input=None, output_path='./model.onnx', opset_version=17, dynamic_axes=True):
    """Export a PyTorch model to ONNX format for cross-framework inference
    
    Dependencies: pip install onnx torch
    
    Args:
        model (model) (required): 
        sample_input (tensor) (required): 
    
    Parameters:
        output_path (string, default='./model.onnx'): 
        opset_version (number, default=17): 
        dynamic_axes (boolean, default=True): 
    
    Returns:
        path: 
    """
    _imports = ['import torch', 'import onnx']
    _code = '{{inputs.model}}.eval()\n_dynamic = {"input": { "0": "batch"}, "output": { "0": "batch"}} if {{params.dynamic_axes}} else None\ntorch.onnx.export({{inputs.model}}, {{inputs.sample_input}}, "{{params.output_path}}", opset_version={{params.opset_version}}, input_names=["input"], output_names=["output"], dynamic_axes=_dynamic)\n_onnx_model = onnx.load("{{params.output_path}}")\nonnx.checker.check_model(_onnx_model)\n{{outputs.onnx_path}} = "{{params.output_path}}"'
    
    _code = _code.replace("{{params.output_path}}", str(output_path))
    _code = _code.replace("{{params.opset_version}}", str(opset_version))
    _code = _code.replace("{{params.dynamic_axes}}", str(dynamic_axes))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.sample_input}}", "sample_input")
    _code = _code.replace("{{outputs.onnx_path}}", "_out_onnx_path")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["sample_input"] = sample_input
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_onnx_path")


def tensorrt_export(onnx_path=None, output_path='./model.trt', precision='fp16', max_batch_size=8, workspace_gb=4):
    """Optimize and export a model using NVIDIA TensorRT for high-performance GPU inference
    
    Dependencies: pip install tensorrt
    
    Args:
        onnx_path (path) (required): 
    
    Parameters:
        output_path (string, default='./model.trt'): 
        precision (select, default='fp16'): 
        max_batch_size (number, default=8): 
        workspace_gb (number, default=4): 
    
    Returns:
        path: 
    """
    _imports = ['import tensorrt as trt']
    _code = '_logger = trt.Logger(trt.Logger.WARNING)\n_builder = trt.Builder(_logger)\n_network = _builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))\n_parser = trt.OnnxParser(_network, _logger)\nwith open({{inputs.onnx_path}}, "rb") as _f:\n    _parser.parse(_f.read())\n_config = _builder.create_builder_config()\n_config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, {{params.workspace_gb}} << 30)\nif "{{params.precision}}" == "fp16":\n    _config.set_flag(trt.BuilderFlag.FP16)\nelif "{{params.precision}}" == "int8":\n    _config.set_flag(trt.BuilderFlag.INT8)\n_engine = _builder.build_serialized_network(_network, _config)\nwith open("{{params.output_path}}", "wb") as _f:\n    _f.write(_engine)\n{{outputs.engine_path}} = "{{params.output_path}}"'
    
    _code = _code.replace("{{params.output_path}}", str(output_path))
    _code = _code.replace("{{params.precision}}", str(precision))
    _code = _code.replace("{{params.max_batch_size}}", str(max_batch_size))
    _code = _code.replace("{{params.workspace_gb}}", str(workspace_gb))
    _code = _code.replace("{{inputs.onnx_path}}", "onnx_path")
    _code = _code.replace("{{outputs.engine_path}}", "_out_engine_path")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["onnx_path"] = onnx_path
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_engine_path")


def tflite_export(saved_model_path=None, output_path='./model.tflite', quantize='none'):
    """Convert and export a model to TensorFlow Lite format for mobile and edge deployment
    
    Dependencies: pip install tensorflow
    
    Args:
        saved_model_path (path) (required): 
    
    Parameters:
        output_path (string, default='./model.tflite'): 
        quantize (select, default='none'): 
    
    Returns:
        path: 
    """
    _imports = ['import tensorflow as tf']
    _code = '_converter = tf.lite.TFLiteConverter.from_saved_model({{inputs.saved_model_path}})\nif "{{params.quantize}}" == "dynamic":\n    _converter.optimizations = [tf.lite.Optimize.DEFAULT]\nelif "{{params.quantize}}" == "float16":\n    _converter.optimizations = [tf.lite.Optimize.DEFAULT]\n    _converter.target_spec.supported_types = [tf.float16]\nelif "{{params.quantize}}" == "int8":\n    _converter.optimizations = [tf.lite.Optimize.DEFAULT]\n    _converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]\n_tflite_model = _converter.convert()\nwith open("{{params.output_path}}", "wb") as _f:\n    _f.write(_tflite_model)\n{{outputs.tflite_path}} = "{{params.output_path}}"'
    
    _code = _code.replace("{{params.output_path}}", str(output_path))
    _code = _code.replace("{{params.quantize}}", str(quantize))
    _code = _code.replace("{{inputs.saved_model_path}}", "saved_model_path")
    _code = _code.replace("{{outputs.tflite_path}}", "_out_tflite_path")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["saved_model_path"] = saved_model_path
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tflite_path")


def model_benchmarker(model=None, sample_input=None, num_warmup=10, num_runs=100, device='auto'):
    """Benchmark model latency, throughput, memory usage, and parameter count
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        sample_input (tensor) (required): 
    
    Parameters:
        num_warmup (number, default=10): 
        num_runs (number, default=100): 
        device (select, default='auto'): 
    
    Returns:
        dict: 
    """
    _imports = ['import torch', 'import time']
    _code = '_device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if "{{params.device}}" == "auto" else torch.device("{{params.device}}")\n{{inputs.model}}.to(_device).eval()\n_inp = {{inputs.sample_input}}.to(_device)\n_n_params = sum(p.numel() for p in {{inputs.model}}.parameters())\n_n_trainable = sum(p.numel() for p in {{inputs.model}}.parameters() if p.requires_grad)\nwith torch.no_grad():\n    for _ in range({{params.num_warmup}}):\n        {{inputs.model}}(_inp)\n    if _device.type == "cuda":\n        torch.cuda.synchronize()\n    _start = time.perf_counter()\n    for _ in range({{params.num_runs}}):\n        {{inputs.model}}(_inp)\n    if _device.type == "cuda":\n        torch.cuda.synchronize()\n    _elapsed = time.perf_counter() - _start\n_avg_ms = (_elapsed / {{params.num_runs}}) * 1000\n_throughput = {{params.num_runs}} / _elapsed\n_mem_mb = torch.cuda.max_memory_allocated(_device) / 1e6 if _device.type == "cuda" else 0\n{{outputs.report}} = {"avg_latency_ms": round(_avg_ms, 3), "throughput_per_sec": round(_throughput, 2), "total_params": _n_params, "trainable_params": _n_trainable, "gpu_memory_mb": round(_mem_mb, 2), "device": str(_device)}'
    
    _code = _code.replace("{{params.num_warmup}}", str(num_warmup))
    _code = _code.replace("{{params.num_runs}}", str(num_runs))
    _code = _code.replace("{{params.device}}", str(device))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.sample_input}}", "sample_input")
    _code = _code.replace("{{outputs.report}}", "_out_report")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["sample_input"] = sample_input
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_report")

