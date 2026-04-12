"""
aiblocks.neural_networks — Neural Networks

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def dense_layer(tensor_in=None, in_features=256, out_features=128, bias=True):
    """Fully-connected linear layer (torch.nn.Linear)
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        in_features (number, default=256): 
        out_features (number, default=128): 
        bias (boolean, default=True): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = '_dense = nn.Linear(in_features={{params.in_features}}, out_features={{params.out_features}}, bias={{params.bias}})\n{{outputs.tensor_out}} = _dense({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.in_features}}", str(in_features))
    _code = _code.replace("{{params.out_features}}", str(out_features))
    _code = _code.replace("{{params.bias}}", str(bias))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def dropout_layer(tensor_in=None, p=0.5, inplace=False):
    """Randomly zeroes elements during training for regularization
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        p (number, default=0.5): 
        inplace (boolean, default=False): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_dropout = nn.Dropout(p={{params.p}}, inplace={{params.inplace}})\n{{outputs.tensor_out}} = _dropout({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.p}}", str(p))
    _code = _code.replace("{{params.inplace}}", str(inplace))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def batch_norm(tensor_in=None, num_features=64, eps=1e-05, momentum=0.1, affine=True, dims='2d'):
    """Batch normalization over a mini-batch (normalizes per-channel)
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        num_features (number, default=64): 
        eps (number, default=1e-05): 
        momentum (number, default=0.1): 
        affine (boolean, default=True): Learnable affine parameters
        dims (select, default='2d'): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_bn_cls = {"1d": nn.BatchNorm1d, "2d": nn.BatchNorm2d, "3d": nn.BatchNorm3d}["{{params.dims}}"]\n_bn = _bn_cls(num_features={{params.num_features}}, eps={{params.eps}}, momentum={{params.momentum}}, affine={{params.affine}})\n{{outputs.tensor_out}} = _bn({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.num_features}}", str(num_features))
    _code = _code.replace("{{params.eps}}", str(eps))
    _code = _code.replace("{{params.momentum}}", str(momentum))
    _code = _code.replace("{{params.affine}}", str(affine))
    _code = _code.replace("{{params.dims}}", str(dims))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def layer_norm(tensor_in=None, normalized_shape='256', eps=1e-05, elementwise_affine=True):
    """Layer normalization across the feature dimension
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        normalized_shape (string, default='256'): Shape of the last dimensions to normalize (comma-separated)
        eps (number, default=1e-05): 
        elementwise_affine (boolean, default=True): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_normalized_shape = [int(x.strip()) for x in "{{params.normalized_shape}}".split(",")]\n_ln = nn.LayerNorm(normalized_shape=_normalized_shape, eps={{params.eps}}, elementwise_affine={{params.elementwise_affine}})\n{{outputs.tensor_out}} = _ln({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.normalized_shape}}", str(normalized_shape))
    _code = _code.replace("{{params.eps}}", str(eps))
    _code = _code.replace("{{params.elementwise_affine}}", str(elementwise_affine))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def conv1d(tensor_in=None, in_channels=1, out_channels=32, kernel_size=3, stride=1, padding=0, bias=True):
    """1D convolution over temporal / sequential data
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): Shape: (batch, channels, length)
    
    Parameters:
        in_channels (number, default=1): 
        out_channels (number, default=32): 
        kernel_size (number, default=3): 
        stride (number, default=1): 
        padding (number, default=0): 
        bias (boolean, default=True): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_conv1d = nn.Conv1d(in_channels={{params.in_channels}}, out_channels={{params.out_channels}}, kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}}, bias={{params.bias}})\n{{outputs.tensor_out}} = _conv1d({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.in_channels}}", str(in_channels))
    _code = _code.replace("{{params.out_channels}}", str(out_channels))
    _code = _code.replace("{{params.kernel_size}}", str(kernel_size))
    _code = _code.replace("{{params.stride}}", str(stride))
    _code = _code.replace("{{params.padding}}", str(padding))
    _code = _code.replace("{{params.bias}}", str(bias))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def conv2d(tensor_in=None, in_channels=3, out_channels=64, kernel_size=3, stride=1, padding=1, groups=1, bias=True):
    """2D convolution over spatial data (images)
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): Shape: (batch, channels, height, width)
    
    Parameters:
        in_channels (number, default=3): 
        out_channels (number, default=64): 
        kernel_size (number, default=3): 
        stride (number, default=1): 
        padding (number, default=1): 
        groups (number, default=1): 
        bias (boolean, default=True): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_conv2d = nn.Conv2d(in_channels={{params.in_channels}}, out_channels={{params.out_channels}}, kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}}, groups={{params.groups}}, bias={{params.bias}})\n{{outputs.tensor_out}} = _conv2d({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.in_channels}}", str(in_channels))
    _code = _code.replace("{{params.out_channels}}", str(out_channels))
    _code = _code.replace("{{params.kernel_size}}", str(kernel_size))
    _code = _code.replace("{{params.stride}}", str(stride))
    _code = _code.replace("{{params.padding}}", str(padding))
    _code = _code.replace("{{params.groups}}", str(groups))
    _code = _code.replace("{{params.bias}}", str(bias))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def conv3d(tensor_in=None, in_channels=1, out_channels=32, kernel_size=3, stride=1, padding=1, bias=True):
    """3D convolution over volumetric / video data
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): Shape: (batch, channels, depth, height, width)
    
    Parameters:
        in_channels (number, default=1): 
        out_channels (number, default=32): 
        kernel_size (number, default=3): 
        stride (number, default=1): 
        padding (number, default=1): 
        bias (boolean, default=True): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_conv3d = nn.Conv3d(in_channels={{params.in_channels}}, out_channels={{params.out_channels}}, kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}}, bias={{params.bias}})\n{{outputs.tensor_out}} = _conv3d({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.in_channels}}", str(in_channels))
    _code = _code.replace("{{params.out_channels}}", str(out_channels))
    _code = _code.replace("{{params.kernel_size}}", str(kernel_size))
    _code = _code.replace("{{params.stride}}", str(stride))
    _code = _code.replace("{{params.padding}}", str(padding))
    _code = _code.replace("{{params.bias}}", str(bias))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def depthwise_conv(tensor_in=None, in_channels=32, kernel_size=3, stride=1, padding=1, bias=False):
    """Depthwise separable convolution — each channel is convolved independently
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): Shape: (batch, channels, height, width)
    
    Parameters:
        in_channels (number, default=32): 
        kernel_size (number, default=3): 
        stride (number, default=1): 
        padding (number, default=1): 
        bias (boolean, default=False): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '# Depthwise: groups == in_channels, out_channels == in_channels\n_dw_conv = nn.Conv2d(in_channels={{params.in_channels}}, out_channels={{params.in_channels}}, kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}}, groups={{params.in_channels}}, bias={{params.bias}})\n{{outputs.tensor_out}} = _dw_conv({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.in_channels}}", str(in_channels))
    _code = _code.replace("{{params.kernel_size}}", str(kernel_size))
    _code = _code.replace("{{params.stride}}", str(stride))
    _code = _code.replace("{{params.padding}}", str(padding))
    _code = _code.replace("{{params.bias}}", str(bias))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def transposed_conv(tensor_in=None, in_channels=64, out_channels=32, kernel_size=4, stride=2, padding=1, output_padding=0, bias=True):
    """Transposed (fractionally-strided) 2D convolution for upsampling
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        in_channels (number, default=64): 
        out_channels (number, default=32): 
        kernel_size (number, default=4): 
        stride (number, default=2): 
        padding (number, default=1): 
        output_padding (number, default=0): 
        bias (boolean, default=True): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_tconv = nn.ConvTranspose2d(in_channels={{params.in_channels}}, out_channels={{params.out_channels}}, kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}}, output_padding={{params.output_padding}}, bias={{params.bias}})\n{{outputs.tensor_out}} = _tconv({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.in_channels}}", str(in_channels))
    _code = _code.replace("{{params.out_channels}}", str(out_channels))
    _code = _code.replace("{{params.kernel_size}}", str(kernel_size))
    _code = _code.replace("{{params.stride}}", str(stride))
    _code = _code.replace("{{params.padding}}", str(padding))
    _code = _code.replace("{{params.output_padding}}", str(output_padding))
    _code = _code.replace("{{params.bias}}", str(bias))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def maxpool(tensor_in=None, kernel_size=2, stride=2, padding=0, dims='2d'):
    """Max pooling over spatial dimensions to downsample feature maps
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        kernel_size (number, default=2): 
        stride (number, default=2): 
        padding (number, default=0): 
        dims (select, default='2d'): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_pool_cls = {"1d": nn.MaxPool1d, "2d": nn.MaxPool2d, "3d": nn.MaxPool3d}["{{params.dims}}"]\n_maxpool = _pool_cls(kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}})\n{{outputs.tensor_out}} = _maxpool({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.kernel_size}}", str(kernel_size))
    _code = _code.replace("{{params.stride}}", str(stride))
    _code = _code.replace("{{params.padding}}", str(padding))
    _code = _code.replace("{{params.dims}}", str(dims))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def avgpool(tensor_in=None, kernel_size=2, stride=2, padding=0, dims='2d'):
    """Average pooling over spatial dimensions
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        kernel_size (number, default=2): 
        stride (number, default=2): 
        padding (number, default=0): 
        dims (select, default='2d'): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_pool_cls = {"1d": nn.AvgPool1d, "2d": nn.AvgPool2d, "3d": nn.AvgPool3d}["{{params.dims}}"]\n_avgpool = _pool_cls(kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}})\n{{outputs.tensor_out}} = _avgpool({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.kernel_size}}", str(kernel_size))
    _code = _code.replace("{{params.stride}}", str(stride))
    _code = _code.replace("{{params.padding}}", str(padding))
    _code = _code.replace("{{params.dims}}", str(dims))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def global_avgpool(tensor_in=None, dims='2d'):
    """Global average pooling — reduces each channel to a single value
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        dims (select, default='2d'): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_gap_cls = {"1d": nn.AdaptiveAvgPool1d, "2d": nn.AdaptiveAvgPool2d}["{{params.dims}}"]\n_gap = _gap_cls(1)\n{{outputs.tensor_out}} = _gap({{inputs.tensor_in}}).flatten(1)'
    
    _code = _code.replace("{{params.dims}}", str(dims))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def flatten(tensor_in=None, start_dim=1, end_dim=-1):
    """Flattens contiguous dimensions into a single dimension
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        start_dim (number, default=1): First dim to flatten
        end_dim (number, default=-1): Last dim to flatten
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_flatten = nn.Flatten(start_dim={{params.start_dim}}, end_dim={{params.end_dim}})\n{{outputs.tensor_out}} = _flatten({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.start_dim}}", str(start_dim))
    _code = _code.replace("{{params.end_dim}}", str(end_dim))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def reshape(tensor_in=None, shape='-1, 16, 16'):
    """Reshapes a tensor to a given target shape (preserving batch dim)
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        shape (string, default='-1, 16, 16'): Target shape (excluding batch). Use -1 for inferred dim.
    
    Returns:
        tensor: 
    """
    _imports = ['import torch']
    _code = '_shape = tuple(int(x.strip()) for x in "{{params.shape}}".split(","))\n{{outputs.tensor_out}} = {{inputs.tensor_in}}.view({{inputs.tensor_in}}.size(0), *_shape)'
    
    _code = _code.replace("{{params.shape}}", str(shape))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def embedding(tensor_in=None, num_embeddings=30000, embedding_dim=256, padding_idx=0):
    """Lookup table that maps integer indices to dense vectors
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): LongTensor of indices
    
    Parameters:
        num_embeddings (number, default=30000): 
        embedding_dim (number, default=256): 
        padding_idx (number, default=0): Index that outputs all zeros
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_emb = nn.Embedding(num_embeddings={{params.num_embeddings}}, embedding_dim={{params.embedding_dim}}, padding_idx={{params.padding_idx}})\n{{outputs.tensor_out}} = _emb({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.num_embeddings}}", str(num_embeddings))
    _code = _code.replace("{{params.embedding_dim}}", str(embedding_dim))
    _code = _code.replace("{{params.padding_idx}}", str(padding_idx))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def lstm(tensor_in=None, input_size=256, hidden_size=128, num_layers=1, batch_first=True, dropout=0.0, bidirectional=False):
    """Long Short-Term Memory recurrent layer
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): Shape: (batch, seq_len, input_size) if batch_first
    
    Parameters:
        input_size (number, default=256): 
        hidden_size (number, default=128): 
        num_layers (number, default=1): 
        batch_first (boolean, default=True): 
        dropout (number, default=0.0): Dropout between LSTM layers (>1 layer)
        bidirectional (boolean, default=False): 
    
    Returns:
        dict with keys:
            tensor_out (tensor): 
            hidden (tensor): 
    """
    _imports = ['import torch.nn as nn']
    _code = '_lstm = nn.LSTM(input_size={{params.input_size}}, hidden_size={{params.hidden_size}}, num_layers={{params.num_layers}}, batch_first={{params.batch_first}}, dropout={{params.dropout}}, bidirectional={{params.bidirectional}})\n{{outputs.tensor_out}}, ({{outputs.hidden}}, _cell) = _lstm({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.input_size}}", str(input_size))
    _code = _code.replace("{{params.hidden_size}}", str(hidden_size))
    _code = _code.replace("{{params.num_layers}}", str(num_layers))
    _code = _code.replace("{{params.batch_first}}", str(batch_first))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{params.bidirectional}}", str(bidirectional))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    _code = _code.replace("{{outputs.hidden}}", "_out_hidden")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"tensor_out": _ns.get("_out_tensor_out"), "hidden": _ns.get("_out_hidden")}


def gru(tensor_in=None, input_size=256, hidden_size=128, num_layers=1, batch_first=True, dropout=0.0, bidirectional=False):
    """Gated Recurrent Unit layer — lighter alternative to LSTM
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        input_size (number, default=256): 
        hidden_size (number, default=128): 
        num_layers (number, default=1): 
        batch_first (boolean, default=True): 
        dropout (number, default=0.0): 
        bidirectional (boolean, default=False): 
    
    Returns:
        dict with keys:
            tensor_out (tensor): 
            hidden (tensor): 
    """
    _imports = ['import torch.nn as nn']
    _code = '_gru = nn.GRU(input_size={{params.input_size}}, hidden_size={{params.hidden_size}}, num_layers={{params.num_layers}}, batch_first={{params.batch_first}}, dropout={{params.dropout}}, bidirectional={{params.bidirectional}})\n{{outputs.tensor_out}}, {{outputs.hidden}} = _gru({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.input_size}}", str(input_size))
    _code = _code.replace("{{params.hidden_size}}", str(hidden_size))
    _code = _code.replace("{{params.num_layers}}", str(num_layers))
    _code = _code.replace("{{params.batch_first}}", str(batch_first))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{params.bidirectional}}", str(bidirectional))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    _code = _code.replace("{{outputs.hidden}}", "_out_hidden")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"tensor_out": _ns.get("_out_tensor_out"), "hidden": _ns.get("_out_hidden")}


def bidirectional_wrapper(tensor_in=None, rnn_type='LSTM', input_size=256, hidden_size=128, num_layers=1, batch_first=True):
    """Wraps any RNN module to process sequences in both directions
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        rnn_type (select, default='LSTM'): 
        input_size (number, default=256): 
        hidden_size (number, default=128): 
        num_layers (number, default=1): 
        batch_first (boolean, default=True): 
    
    Returns:
        dict with keys:
            tensor_out (tensor): 
            hidden (tensor): 
    """
    _imports = ['import torch.nn as nn']
    _code = '_rnn_cls = {"LSTM": nn.LSTM, "GRU": nn.GRU, "RNN": nn.RNN}["{{params.rnn_type}}"]\n_birnn = _rnn_cls(input_size={{params.input_size}}, hidden_size={{params.hidden_size}}, num_layers={{params.num_layers}}, batch_first={{params.batch_first}}, bidirectional=True)\n{{outputs.tensor_out}}, {{outputs.hidden}} = _birnn({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.rnn_type}}", str(rnn_type))
    _code = _code.replace("{{params.input_size}}", str(input_size))
    _code = _code.replace("{{params.hidden_size}}", str(hidden_size))
    _code = _code.replace("{{params.num_layers}}", str(num_layers))
    _code = _code.replace("{{params.batch_first}}", str(batch_first))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    _code = _code.replace("{{outputs.hidden}}", "_out_hidden")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"tensor_out": _ns.get("_out_tensor_out"), "hidden": _ns.get("_out_hidden")}


def rnn_1d(tensor_in=None, input_size=256, hidden_size=128, num_layers=1, nonlinearity='tanh', batch_first=True, dropout=0.0):
    """Vanilla (Elman) recurrent neural network layer
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        input_size (number, default=256): 
        hidden_size (number, default=128): 
        num_layers (number, default=1): 
        nonlinearity (select, default='tanh'): 
        batch_first (boolean, default=True): 
        dropout (number, default=0.0): 
    
    Returns:
        dict with keys:
            tensor_out (tensor): 
            hidden (tensor): 
    """
    _imports = ['import torch.nn as nn']
    _code = '_rnn = nn.RNN(input_size={{params.input_size}}, hidden_size={{params.hidden_size}}, num_layers={{params.num_layers}}, nonlinearity="{{params.nonlinearity}}", batch_first={{params.batch_first}}, dropout={{params.dropout}})\n{{outputs.tensor_out}}, {{outputs.hidden}} = _rnn({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.input_size}}", str(input_size))
    _code = _code.replace("{{params.hidden_size}}", str(hidden_size))
    _code = _code.replace("{{params.num_layers}}", str(num_layers))
    _code = _code.replace("{{params.nonlinearity}}", str(nonlinearity))
    _code = _code.replace("{{params.batch_first}}", str(batch_first))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    _code = _code.replace("{{outputs.hidden}}", "_out_hidden")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"tensor_out": _ns.get("_out_tensor_out"), "hidden": _ns.get("_out_hidden")}


def tcn(tensor_in=None, in_channels=1, out_channels=64, kernel_size=3, num_layers=4, dropout=0.1):
    """Temporal Convolutional Network with dilated causal convolutions
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): Shape: (batch, channels, seq_len)
    
    Parameters:
        in_channels (number, default=1): 
        out_channels (number, default=64): 
        kernel_size (number, default=3): 
        num_layers (number, default=4): Number of dilated conv layers (dilation doubles each layer)
        dropout (number, default=0.1): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = 'class _TCNBlock(nn.Module):\n    def __init__(self, in_ch, out_ch, ks, dilation, dropout):\n        super().__init__()\n        padding = (ks - 1) * dilation\n        self.conv = nn.Conv1d(in_ch, out_ch, ks, padding=padding, dilation=dilation)\n        self.chomp = padding\n        self.relu = nn.ReLU()\n        self.dropout = nn.Dropout(dropout)\n        self.downsample = nn.Conv1d(in_ch, out_ch, 1) if in_ch != out_ch else None\n    def forward(self, x):\n        out = self.conv(x)[:, :, :x.size(2)]\n        out = self.dropout(self.relu(out))\n        res = x if self.downsample is None else self.downsample(x)\n        return self.relu(out + res)\n\n_layers = []\nfor i in range({{params.num_layers}}):\n    _in_ch = {{params.in_channels}} if i == 0 else {{params.out_channels}}\n    _layers.append(_TCNBlock(_in_ch, {{params.out_channels}}, {{params.kernel_size}}, dilation=2**i, dropout={{params.dropout}}))\n_tcn = nn.Sequential(*_layers)\n{{outputs.tensor_out}} = _tcn({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.in_channels}}", str(in_channels))
    _code = _code.replace("{{params.out_channels}}", str(out_channels))
    _code = _code.replace("{{params.kernel_size}}", str(kernel_size))
    _code = _code.replace("{{params.num_layers}}", str(num_layers))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def relu(tensor_in=None, inplace=False):
    """Rectified Linear Unit activation: max(0, x)
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        inplace (boolean, default=False): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.tensor_out}} = nn.ReLU(inplace={{params.inplace}})({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.inplace}}", str(inplace))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def gelu(tensor_in=None, approximate='none'):
    """Gaussian Error Linear Unit activation — smooth approximation of ReLU
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        approximate (select, default='none'): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.tensor_out}} = nn.GELU(approximate="{{params.approximate}}")({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.approximate}}", str(approximate))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def silu(tensor_in=None, inplace=False):
    """Sigmoid-weighted Linear Unit: x * sigmoid(x)
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        inplace (boolean, default=False): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.tensor_out}} = nn.SiLU(inplace={{params.inplace}})({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.inplace}}", str(inplace))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def sigmoid(tensor_in=None):
    """Sigmoid activation: 1 / (1 + exp(-x))
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.tensor_out}} = nn.Sigmoid()({{inputs.tensor_in}})'
    
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def tanh(tensor_in=None):
    """Hyperbolic tangent activation
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.tensor_out}} = nn.Tanh()({{inputs.tensor_in}})'
    
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def softmax(tensor_in=None, dim=-1):
    """Softmax activation over a specified dimension
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        dim (number, default=-1): Dimension along which to apply softmax
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.tensor_out}} = nn.Softmax(dim={{params.dim}})({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.dim}}", str(dim))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def elu(tensor_in=None, alpha=1.0, inplace=False):
    """Exponential Linear Unit: alpha * (exp(x) - 1) for x < 0
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        alpha (number, default=1.0): 
        inplace (boolean, default=False): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.tensor_out}} = nn.ELU(alpha={{params.alpha}}, inplace={{params.inplace}})({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.inplace}}", str(inplace))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def prelu(tensor_in=None, num_parameters=1, init=0.25):
    """Parametric ReLU with learnable slope for negative values
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        num_parameters (number, default=1): Number of learnable slopes (1 or num_channels)
        init (number, default=0.25): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_prelu = nn.PReLU(num_parameters={{params.num_parameters}}, init={{params.init}})\n{{outputs.tensor_out}} = _prelu({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.num_parameters}}", str(num_parameters))
    _code = _code.replace("{{params.init}}", str(init))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def leaky_relu(tensor_in=None, negative_slope=0.01, inplace=False):
    """Leaky ReLU: allows small gradient for negative values
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        negative_slope (number, default=0.01): 
        inplace (boolean, default=False): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.tensor_out}} = nn.LeakyReLU(negative_slope={{params.negative_slope}}, inplace={{params.inplace}})({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.negative_slope}}", str(negative_slope))
    _code = _code.replace("{{params.inplace}}", str(inplace))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def mish(tensor_in=None, inplace=False):
    """Mish activation: x * tanh(softplus(x))
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        inplace (boolean, default=False): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.tensor_out}} = nn.Mish(inplace={{params.inplace}})({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.inplace}}", str(inplace))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def residual_block(tensor_in=None, in_channels=64, out_channels=64, stride=1):
    """Standard ResNet-style residual block with skip connection
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): Shape: (batch, channels, H, W)
    
    Parameters:
        in_channels (number, default=64): 
        out_channels (number, default=64): 
        stride (number, default=1): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = 'class _ResidualBlock(nn.Module):\n    def __init__(self, in_ch, out_ch, stride):\n        super().__init__()\n        self.conv1 = nn.Conv2d(in_ch, out_ch, 3, stride=stride, padding=1, bias=False)\n        self.bn1 = nn.BatchNorm2d(out_ch)\n        self.conv2 = nn.Conv2d(out_ch, out_ch, 3, stride=1, padding=1, bias=False)\n        self.bn2 = nn.BatchNorm2d(out_ch)\n        self.relu = nn.ReLU(inplace=True)\n        self.downsample = None\n        if stride != 1 or in_ch != out_ch:\n            self.downsample = nn.Sequential(\n                nn.Conv2d(in_ch, out_ch, 1, stride=stride, bias=False),\n                nn.BatchNorm2d(out_ch),\n            )\n    def forward(self, x):\n        identity = x\n        out = self.relu(self.bn1(self.conv1(x)))\n        out = self.bn2(self.conv2(out))\n        if self.downsample is not None:\n            identity = self.downsample(x)\n        return self.relu(out + identity)\n\n_resblock = _ResidualBlock({{params.in_channels}}, {{params.out_channels}}, {{params.stride}})\n{{outputs.tensor_out}} = _resblock({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.in_channels}}", str(in_channels))
    _code = _code.replace("{{params.out_channels}}", str(out_channels))
    _code = _code.replace("{{params.stride}}", str(stride))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def inception_block(tensor_in=None, in_channels=256, ch1x1=64, ch3x3=128, ch5x5=32, pool_proj=32):
    """GoogLeNet-style inception module with parallel convolutions at multiple scales
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        in_channels (number, default=256): 
        ch1x1 (number, default=64): 
        ch3x3 (number, default=128): 
        ch5x5 (number, default=32): 
        pool_proj (number, default=32): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = 'class _InceptionBlock(nn.Module):\n    def __init__(self, in_ch, ch1x1, ch3x3, ch5x5, pool_proj):\n        super().__init__()\n        self.branch1 = nn.Sequential(nn.Conv2d(in_ch, ch1x1, 1), nn.ReLU(True))\n        self.branch3 = nn.Sequential(nn.Conv2d(in_ch, ch3x3, 1), nn.ReLU(True), nn.Conv2d(ch3x3, ch3x3, 3, padding=1), nn.ReLU(True))\n        self.branch5 = nn.Sequential(nn.Conv2d(in_ch, ch5x5, 1), nn.ReLU(True), nn.Conv2d(ch5x5, ch5x5, 5, padding=2), nn.ReLU(True))\n        self.branch_pool = nn.Sequential(nn.MaxPool2d(3, stride=1, padding=1), nn.Conv2d(in_ch, pool_proj, 1), nn.ReLU(True))\n    def forward(self, x):\n        return torch.cat([self.branch1(x), self.branch3(x), self.branch5(x), self.branch_pool(x)], dim=1)\n\n_inception = _InceptionBlock({{params.in_channels}}, {{params.ch1x1}}, {{params.ch3x3}}, {{params.ch5x5}}, {{params.pool_proj}})\n{{outputs.tensor_out}} = _inception({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.in_channels}}", str(in_channels))
    _code = _code.replace("{{params.ch1x1}}", str(ch1x1))
    _code = _code.replace("{{params.ch3x3}}", str(ch3x3))
    _code = _code.replace("{{params.ch5x5}}", str(ch5x5))
    _code = _code.replace("{{params.pool_proj}}", str(pool_proj))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def squeeze_excite(tensor_in=None, channels=64, reduction=16):
    """Channel attention mechanism — recalibrates channel-wise feature responses
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): Shape: (batch, channels, H, W)
    
    Parameters:
        channels (number, default=64): 
        reduction (number, default=16): Bottleneck ratio for the SE pathway
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = 'class _SqueezeExcite(nn.Module):\n    def __init__(self, channels, reduction):\n        super().__init__()\n        mid = max(1, channels // reduction)\n        self.pool = nn.AdaptiveAvgPool2d(1)\n        self.fc = nn.Sequential(\n            nn.Linear(channels, mid, bias=False),\n            nn.ReLU(inplace=True),\n            nn.Linear(mid, channels, bias=False),\n            nn.Sigmoid(),\n        )\n    def forward(self, x):\n        b, c, _, _ = x.size()\n        w = self.pool(x).view(b, c)\n        w = self.fc(w).view(b, c, 1, 1)\n        return x * w\n\n_se = _SqueezeExcite({{params.channels}}, {{params.reduction}})\n{{outputs.tensor_out}} = _se({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.channels}}", str(channels))
    _code = _code.replace("{{params.reduction}}", str(reduction))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def mlp_block(tensor_in=None, in_features=256, hidden_features=512, out_features=256, dropout=0.0, activation='gelu'):
    """Multi-layer perceptron block with configurable hidden layers
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        in_features (number, default=256): 
        hidden_features (number, default=512): 
        out_features (number, default=256): 
        dropout (number, default=0.0): 
        activation (select, default='gelu'): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch.nn as nn']
    _code = '_act_fn = {"gelu": nn.GELU(), "relu": nn.ReLU(), "silu": nn.SiLU()}["{{params.activation}}"]\n_mlp = nn.Sequential(\n    nn.Linear({{params.in_features}}, {{params.hidden_features}}),\n    _act_fn,\n    nn.Dropout({{params.dropout}}),\n    nn.Linear({{params.hidden_features}}, {{params.out_features}}),\n    nn.Dropout({{params.dropout}}),\n)\n{{outputs.tensor_out}} = _mlp({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.in_features}}", str(in_features))
    _code = _code.replace("{{params.hidden_features}}", str(hidden_features))
    _code = _code.replace("{{params.out_features}}", str(out_features))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{params.activation}}", str(activation))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def build_sequential(layers=None):
    """Combines a list of layers into a nn.Sequential model
    
    Dependencies: pip install torch
    
    Args:
        layers (list) (required): Ordered list of nn.Module layers
    
    Returns:
        model: 
    """
    _imports = ['import torch.nn as nn']
    _code = '{{outputs.model}} = nn.Sequential(*{{inputs.layers}})'
    
    _code = _code.replace("{{inputs.layers}}", "layers")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["layers"] = layers
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def build_functional(tensor_in=None, layers=None, forward_code="x = self.layers['layer1'](x)\nx = self.layers['layer2'](x)\nreturn x"):
    """Composes layers as a directed acyclic graph with a custom forward method
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
        layers (dict) (required): Dict mapping layer names to nn.Module instances
    
    Parameters:
        forward_code (code, default="x = self.layers['layer1'](x)\nx = self.layers['layer2'](x)\nreturn x"): Python code for the forward method (x = input tensor)
    
    Returns:
        model: 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = 'class _FunctionalModel(nn.Module):\n    def __init__(self, layers_dict):\n        super().__init__()\n        self.layers = nn.ModuleDict(layers_dict)\n    def forward(self, x):\n        {{params.forward_code}}\n\n{{outputs.model}} = _FunctionalModel({{inputs.layers}})'
    
    _code = _code.replace("{{params.forward_code}}", str(forward_code))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{inputs.layers}}", "layers")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    _ns["layers"] = layers
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def custom_layer(tensor_in=None, init_code='self.linear = nn.Linear(256, 128)', forward_code='return self.linear(x)'):
    """User-defined nn.Module layer with custom init and forward code
    
    Dependencies: pip install torch
    
    Args:
        tensor_in (tensor) (required): 
    
    Parameters:
        init_code (code, default='self.linear = nn.Linear(256, 128)'): Code inside __init__ (self and super().__init__() already called)
        forward_code (code, default='return self.linear(x)'): Code inside forward(self, x)
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = 'class _CustomLayer(nn.Module):\n    def __init__(self):\n        super().__init__()\n        {{params.init_code}}\n    def forward(self, x):\n        {{params.forward_code}}\n\n_custom = _CustomLayer()\n{{outputs.tensor_out}} = _custom({{inputs.tensor_in}})'
    
    _code = _code.replace("{{params.init_code}}", str(init_code))
    _code = _code.replace("{{params.forward_code}}", str(forward_code))
    _code = _code.replace("{{inputs.tensor_in}}", "tensor_in")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tensor_in"] = tensor_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def attention_bahdanau(query=None, keys=None, query_dim=256, key_dim=256, hidden_dim=128):
    """Additive (Bahdanau) attention mechanism — computes alignment via a learned MLP
    
    Dependencies: pip install torch
    
    Args:
        query (tensor) (required): Decoder hidden state: (batch, query_dim)
        keys (tensor) (required): Encoder outputs: (batch, seq_len, key_dim)
    
    Parameters:
        query_dim (number, default=256): 
        key_dim (number, default=256): 
        hidden_dim (number, default=128): Alignment network hidden size
    
    Returns:
        dict with keys:
            context (tensor): 
            weights (tensor): 
    """
    _imports = ['import torch', 'import torch.nn as nn', 'import torch.nn.functional as F']
    _code = 'class _BahdanauAttention(nn.Module):\n    def __init__(self, query_dim, key_dim, hidden_dim):\n        super().__init__()\n        self.W_q = nn.Linear(query_dim, hidden_dim, bias=False)\n        self.W_k = nn.Linear(key_dim, hidden_dim, bias=False)\n        self.V = nn.Linear(hidden_dim, 1, bias=False)\n    def forward(self, query, keys):\n        # query: (B, query_dim) -> (B, 1, hidden)\n        q = self.W_q(query).unsqueeze(1)\n        k = self.W_k(keys)  # (B, T, hidden)\n        energy = self.V(torch.tanh(q + k)).squeeze(-1)  # (B, T)\n        weights = F.softmax(energy, dim=-1)  # (B, T)\n        context = torch.bmm(weights.unsqueeze(1), keys).squeeze(1)  # (B, key_dim)\n        return context, weights\n\n_attn = _BahdanauAttention({{params.query_dim}}, {{params.key_dim}}, {{params.hidden_dim}})\n{{outputs.context}}, {{outputs.weights}} = _attn({{inputs.query}}, {{inputs.keys}})'
    
    _code = _code.replace("{{params.query_dim}}", str(query_dim))
    _code = _code.replace("{{params.key_dim}}", str(key_dim))
    _code = _code.replace("{{params.hidden_dim}}", str(hidden_dim))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{inputs.keys}}", "keys")
    _code = _code.replace("{{outputs.context}}", "_out_context")
    _code = _code.replace("{{outputs.weights}}", "_out_weights")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    _ns["keys"] = keys
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"context": _ns.get("_out_context"), "weights": _ns.get("_out_weights")}


def attention_luong(query=None, keys=None, query_dim=256, key_dim=256, method='dot'):
    """Multiplicative (Luong) attention — computes alignment via dot product or bilinear form
    
    Dependencies: pip install torch
    
    Args:
        query (tensor) (required): Decoder hidden state: (batch, query_dim)
        keys (tensor) (required): Encoder outputs: (batch, seq_len, key_dim)
    
    Parameters:
        query_dim (number, default=256): 
        key_dim (number, default=256): 
        method (select, default='dot'): 
    
    Returns:
        dict with keys:
            context (tensor): 
            weights (tensor): 
    """
    _imports = ['import torch', 'import torch.nn as nn', 'import torch.nn.functional as F']
    _code = 'class _LuongAttention(nn.Module):\n    def __init__(self, query_dim, key_dim, method):\n        super().__init__()\n        self.method = method\n        if method == "general":\n            self.W = nn.Linear(key_dim, query_dim, bias=False)\n        elif method == "concat":\n            self.W = nn.Linear(query_dim + key_dim, query_dim, bias=False)\n            self.V = nn.Linear(query_dim, 1, bias=False)\n    def forward(self, query, keys):\n        # query: (B, query_dim), "keys": (B, T, key_dim)\n        if self.method == "dot":\n            energy = torch.bmm(keys, query.unsqueeze(2)).squeeze(2)  # (B, T)\n        elif self.method == "general":\n            energy = torch.bmm(self.W(keys), query.unsqueeze(2)).squeeze(2)\n "else":  # concat\n            T = keys.size(1)\n            q_exp = query.unsqueeze(1).expand(-1, T, -1)\n            energy = self.V(torch.tanh(self.W(torch.cat([q_exp, keys], dim=2)))).squeeze(2)\n        weights = F.softmax(energy, dim=-1)\n        context = torch.bmm(weights.unsqueeze(1), keys).squeeze(1)\n        return context, weights\n\n_attn = _LuongAttention({{params.query_dim}}, {{params.key_dim}}, "{{params.method}}")\n{{outputs.context}}, {{outputs.weights}} = _attn({{inputs.query}}, {{inputs.keys}})'
    
    _code = _code.replace("{{params.query_dim}}", str(query_dim))
    _code = _code.replace("{{params.key_dim}}", str(key_dim))
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{inputs.keys}}", "keys")
    _code = _code.replace("{{outputs.context}}", "_out_context")
    _code = _code.replace("{{outputs.weights}}", "_out_weights")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    _ns["keys"] = keys
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"context": _ns.get("_out_context"), "weights": _ns.get("_out_weights")}

