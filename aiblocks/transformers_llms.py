"""
aiblocks.transformers_llms — Transformers & LLMs

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def multi_head_attention(query=None, key=None, value=None, attn_mask=None, embed_dim=512, num_heads=8, dropout=0.0, batch_first=True):
    """Scaled dot-product attention across multiple heads (nn.MultiheadAttention)
    
    Dependencies: pip install torch
    
    Args:
        query (tensor) (required): Shape: (seq_len, batch, embed_dim)
        key (tensor) (required): Shape: (seq_len, batch, embed_dim)
        value (tensor) (required): Shape: (seq_len, batch, embed_dim)
        attn_mask (tensor): Optional mask to block certain positions
    
    Parameters:
        embed_dim (number, default=512): 
        num_heads (number, default=8): 
        dropout (number, default=0.0): 
        batch_first (boolean, default=True): 
    
    Returns:
        dict with keys:
            attn_out (tensor): 
            attn_weights (tensor): 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = '_mha = nn.MultiheadAttention(embed_dim={{params.embed_dim}}, num_heads={{params.num_heads}}, dropout={{params.dropout}}, batch_first={{params.batch_first}})\n{{outputs.attn_out}}, {{outputs.attn_weights}} = _mha({{inputs.query}}, {{inputs.key}}, {{inputs.value}}, attn_mask={{inputs.attn_mask}})'
    
    _code = _code.replace("{{params.embed_dim}}", str(embed_dim))
    _code = _code.replace("{{params.num_heads}}", str(num_heads))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{params.batch_first}}", str(batch_first))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{inputs.key}}", "key")
    _code = _code.replace("{{inputs.value}}", "value")
    _code = _code.replace("{{inputs.attn_mask}}", "attn_mask")
    _code = _code.replace("{{outputs.attn_out}}", "_out_attn_out")
    _code = _code.replace("{{outputs.attn_weights}}", "_out_attn_weights")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    _ns["key"] = key
    _ns["value"] = value
    _ns["attn_mask"] = attn_mask
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"attn_out": _ns.get("_out_attn_out"), "attn_weights": _ns.get("_out_attn_weights")}


def self_attention(x=None, attn_mask=None, embed_dim=512, num_heads=8, dropout=0.0):
    """Self-attention where Q, K, V all derive from the same input sequence
    
    Dependencies: pip install torch
    
    Args:
        x (tensor) (required): Shape: (batch, seq_len, embed_dim)
        attn_mask (tensor): 
    
    Parameters:
        embed_dim (number, default=512): 
        num_heads (number, default=8): 
        dropout (number, default=0.0): 
    
    Returns:
        dict with keys:
            attn_out (tensor): 
            attn_weights (tensor): 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = '_self_attn = nn.MultiheadAttention(embed_dim={{params.embed_dim}}, num_heads={{params.num_heads}}, dropout={{params.dropout}}, batch_first=True)\n{{outputs.attn_out}}, {{outputs.attn_weights}} = _self_attn({{inputs.x}}, {{inputs.x}}, {{inputs.x}}, attn_mask={{inputs.attn_mask}})'
    
    _code = _code.replace("{{params.embed_dim}}", str(embed_dim))
    _code = _code.replace("{{params.num_heads}}", str(num_heads))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{inputs.x}}", "x")
    _code = _code.replace("{{inputs.attn_mask}}", "attn_mask")
    _code = _code.replace("{{outputs.attn_out}}", "_out_attn_out")
    _code = _code.replace("{{outputs.attn_weights}}", "_out_attn_weights")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["x"] = x
    _ns["attn_mask"] = attn_mask
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"attn_out": _ns.get("_out_attn_out"), "attn_weights": _ns.get("_out_attn_weights")}


def cross_attention(query=None, encoder_out=None, attn_mask=None, embed_dim=512, num_heads=8, dropout=0.0):
    """Cross-attention between decoder queries and encoder key-values
    
    Dependencies: pip install torch
    
    Args:
        query (tensor) (required): 
        encoder_out (tensor) (required): 
        attn_mask (tensor): 
    
    Parameters:
        embed_dim (number, default=512): 
        num_heads (number, default=8): 
        dropout (number, default=0.0): 
    
    Returns:
        dict with keys:
            attn_out (tensor): 
            attn_weights (tensor): 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = '_cross_attn = nn.MultiheadAttention(embed_dim={{params.embed_dim}}, num_heads={{params.num_heads}}, dropout={{params.dropout}}, batch_first=True)\n{{outputs.attn_out}}, {{outputs.attn_weights}} = _cross_attn({{inputs.query}}, {{inputs.encoder_out}}, {{inputs.encoder_out}}, attn_mask={{inputs.attn_mask}})'
    
    _code = _code.replace("{{params.embed_dim}}", str(embed_dim))
    _code = _code.replace("{{params.num_heads}}", str(num_heads))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{inputs.encoder_out}}", "encoder_out")
    _code = _code.replace("{{inputs.attn_mask}}", "attn_mask")
    _code = _code.replace("{{outputs.attn_out}}", "_out_attn_out")
    _code = _code.replace("{{outputs.attn_weights}}", "_out_attn_weights")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    _ns["encoder_out"] = encoder_out
    _ns["attn_mask"] = attn_mask
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"attn_out": _ns.get("_out_attn_out"), "attn_weights": _ns.get("_out_attn_weights")}


def causal_mask(seq_len_tensor=None, seq_len=512, dtype='float32'):
    """Generate an upper-triangular causal mask for autoregressive decoding
    
    Dependencies: pip install torch
    
    Args:
        seq_len_tensor (tensor): Optional tensor whose seq dim determines mask size
    
    Parameters:
        seq_len (number, default=512): 
        dtype (select, default='float32'): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch']
    _code = '_seq_len = {{inputs.seq_len_tensor}}.size(1) if {{inputs.seq_len_tensor}} is not None else {{params.seq_len}}\n_dtype = getattr(torch, "{{params.dtype}}")\n{{outputs.mask}} = torch.triu(torch.ones(_seq_len, _seq_len, dtype=_dtype) * float("-inf"), diagonal=1)'
    
    _code = _code.replace("{{params.seq_len}}", str(seq_len))
    _code = _code.replace("{{params.dtype}}", str(dtype))
    _code = _code.replace("{{inputs.seq_len_tensor}}", "seq_len_tensor")
    _code = _code.replace("{{outputs.mask}}", "_out_mask")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["seq_len_tensor"] = seq_len_tensor
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_mask")


def rope(query=None, key=None, dim=64, max_seq_len=4096, base=10000):
    """Apply rotary positional embeddings to query and key tensors
    
    Dependencies: pip install torch
    
    Args:
        query (tensor) (required): 
        key (tensor) (required): 
    
    Parameters:
        dim (number, default=64): 
        max_seq_len (number, default=4096): 
        base (number, default=10000): 
    
    Returns:
        dict with keys:
            query_out (tensor): 
            key_out (tensor): 
    """
    _imports = ['import torch']
    _code = 'def _build_rope_cache(dim, max_seq_len, base={{params.base}}, device="cpu"):\n    theta = 1.0 / (base ** (torch.arange(0, dim, 2, device=device).float() / dim))\n    seq_idx = torch.arange(max_seq_len, device=device).float()\n    freqs = torch.outer(seq_idx, theta)\n    return torch.polar(torch.ones_like(freqs), freqs)\n\ndef _apply_rope(x, freqs):\n    x_ = torch.view_as_complex(x.float().reshape(*x.shape[:-1], -1, 2))\n    x_out = torch.view_as_real(x_ * freqs[:x.shape[-2]]).flatten(-2)\n    return x_out.type_as(x)\n\n_rope_cache = _build_rope_cache({{params.dim}}, {{params.max_seq_len}}, device={{inputs.query}}.device)\n{{outputs.query_out}} = _apply_rope({{inputs.query}}, _rope_cache)\n{{outputs.key_out}} = _apply_rope({{inputs.key}}, _rope_cache)'
    
    _code = _code.replace("{{params.dim}}", str(dim))
    _code = _code.replace("{{params.max_seq_len}}", str(max_seq_len))
    _code = _code.replace("{{params.base}}", str(base))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{inputs.key}}", "key")
    _code = _code.replace("{{outputs.query_out}}", "_out_query_out")
    _code = _code.replace("{{outputs.key_out}}", "_out_key_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    _ns["key"] = key
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"query_out": _ns.get("_out_query_out"), "key_out": _ns.get("_out_key_out")}


def sinusoidal_positional_encoding(x=None, d_model=512, max_len=5000, dropout=0.1):
    """Classic fixed sinusoidal positional encodings from 'Attention Is All You Need'
    
    Dependencies: pip install torch
    
    Args:
        x (tensor) (required): Shape: (batch, seq_len, d_model)
    
    Parameters:
        d_model (number, default=512): 
        max_len (number, default=5000): 
        dropout (number, default=0.1): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn', 'import math']
    _code = 'class _SinusoidalPE(nn.Module):\n    def __init__(self, d_model, max_len, dropout):\n        super().__init__()\n        self.dropout = nn.Dropout(p=dropout)\n        pe = torch.zeros(max_len, d_model)\n        position = torch.arange(0, max_len).unsqueeze(1).float()\n        div_term = torch.exp(torch.arange(0, d_model, 2).float() * -(math.log(10000.0) / d_model))\n        pe[:, "0"::2] = torch.sin(position * div_term)\n        pe[:, "1"::2] = torch.cos(position * div_term)\n        self.register_buffer("pe", pe.unsqueeze(0))\n    def forward(self, x):\n        return self.dropout(x + self.pe[:, :x.size(1)])\n\n_sinusoidal_pe = _SinusoidalPE({{params.d_model}}, {{params.max_len}}, {{params.dropout}})\n{{outputs.tensor_out}} = _sinusoidal_pe({{inputs.x}})'
    
    _code = _code.replace("{{params.d_model}}", str(d_model))
    _code = _code.replace("{{params.max_len}}", str(max_len))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{inputs.x}}", "x")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["x"] = x
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def alibi(attn_scores=None, num_heads=8, max_seq_len=2048):
    """Attention with Linear Biases — adds linear distance bias to attention scores
    
    Dependencies: pip install torch
    
    Args:
        attn_scores (tensor) (required): Shape: (batch, heads, seq_len, seq_len)
    
    Parameters:
        num_heads (number, default=8): 
        max_seq_len (number, default=2048): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import math']
    _code = 'def _get_alibi_slopes(num_heads):\n    closest_power_of_2 = 2 ** math.floor(math.log2(num_heads))\n    base = 2 ** (-(2 ** -(math.log2(closest_power_of_2) - 3)))\n    slopes = [base ** (i + 1) for i in range(closest_power_of_2)]\n    if closest_power_of_2 != num_heads:\n        extra_base = 2 ** (-(2 ** -(math.log2(2 * closest_power_of_2) - 3)))\n        extra = [extra_base ** (2 * (i + 1) - 1) for i in range(num_heads - closest_power_of_2)]\n        slopes = slopes + extra\n    return torch.tensor(slopes, dtype=torch.float32)\n\n_slopes = _get_alibi_slopes({{params.num_heads}}).to({{inputs.attn_scores}}.device)\n_seq_len = {{inputs.attn_scores}}.size(-1)\n_positions = torch.arange(_seq_len, device={{inputs.attn_scores}}.device)\n_bias = -torch.abs(_positions.unsqueeze(0) - _positions.unsqueeze(1)).float()\n_bias = _bias.unsqueeze(0) * _slopes.view(-1, 1, 1)\n{{outputs.biased_scores}} = {{inputs.attn_scores}} + _bias.unsqueeze(0)'
    
    _code = _code.replace("{{params.num_heads}}", str(num_heads))
    _code = _code.replace("{{params.max_seq_len}}", str(max_seq_len))
    _code = _code.replace("{{inputs.attn_scores}}", "attn_scores")
    _code = _code.replace("{{outputs.biased_scores}}", "_out_biased_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["attn_scores"] = attn_scores
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_biased_scores")


def ffn(x=None, d_model=512, d_ff=2048, dropout=0.1, activation='relu'):
    """Standard two-layer feed-forward network with activation (used in transformer blocks)
    
    Dependencies: pip install torch
    
    Args:
        x (tensor) (required): 
    
    Parameters:
        d_model (number, default=512): 
        d_ff (number, default=2048): 
        dropout (number, default=0.1): 
        activation (select, default='relu'): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = '_act = nn.ReLU() if "{{params.activation}}" == "relu" else nn.GELU()\n_ffn = nn.Sequential(\n    nn.Linear({{params.d_model}}, {{params.d_ff}}),\n    _act,\n    nn.Dropout({{params.dropout}}),\n    nn.Linear({{params.d_ff}}, {{params.d_model}}),\n    nn.Dropout({{params.dropout}}),\n)\n{{outputs.tensor_out}} = _ffn({{inputs.x}})'
    
    _code = _code.replace("{{params.d_model}}", str(d_model))
    _code = _code.replace("{{params.d_ff}}", str(d_ff))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{params.activation}}", str(activation))
    _code = _code.replace("{{inputs.x}}", "x")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["x"] = x
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def swiglu_ffn(x=None, d_model=4096, d_ff=11008):
    """SwiGLU gated feed-forward network used in LLaMA-style models
    
    Dependencies: pip install torch
    
    Args:
        x (tensor) (required): 
    
    Parameters:
        d_model (number, default=4096): 
        d_ff (number, default=11008): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn', 'import torch.nn.functional as F']
    _code = 'class _SwiGLU(nn.Module):\n    def __init__(self, d_model, d_ff):\n        super().__init__()\n        self.w1 = nn.Linear(d_model, d_ff, bias=False)\n        self.w2 = nn.Linear(d_ff, d_model, bias=False)\n        self.w3 = nn.Linear(d_model, d_ff, bias=False)\n    def forward(self, x):\n        return self.w2(F.silu(self.w1(x)) * self.w3(x))\n\n_swiglu = _SwiGLU({{params.d_model}}, {{params.d_ff}})\n{{outputs.tensor_out}} = _swiglu({{inputs.x}})'
    
    _code = _code.replace("{{params.d_model}}", str(d_model))
    _code = _code.replace("{{params.d_ff}}", str(d_ff))
    _code = _code.replace("{{inputs.x}}", "x")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["x"] = x
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def moe_layer(x=None, d_model=4096, d_ff=11008, num_experts=8, top_k=2):
    """Sparse Mixture-of-Experts layer with top-k gating and expert FFNs
    
    Dependencies: pip install torch
    
    Args:
        x (tensor) (required): 
    
    Parameters:
        d_model (number, default=4096): 
        d_ff (number, default=11008): 
        num_experts (number, default=8): 
        top_k (number, default=2): 
    
    Returns:
        dict with keys:
            tensor_out (tensor): 
            router_logits (tensor): 
    """
    _imports = ['import torch', 'import torch.nn as nn', 'import torch.nn.functional as F']
    _code = 'class _MoELayer(nn.Module):\n    def __init__(self, d_model, d_ff, num_experts, top_k):\n        super().__init__()\n        self.gate = nn.Linear(d_model, num_experts, bias=False)\n        self.experts = nn.ModuleList([\n            nn.Sequential(nn.Linear(d_model, d_ff, bias=False), nn.SiLU(), nn.Linear(d_ff, d_model, bias=False))\n            for _ in range(num_experts)\n        ])\n        self.top_k = top_k\n    def forward(self, x):\n        logits = self.gate(x)\n        weights, indices = torch.topk(F.softmax(logits, dim=-1), self.top_k, dim=-1)\n        weights = weights / weights.sum(dim=-1, keepdim=True)\n        out = torch.zeros_like(x)\n        for i, expert in enumerate(self.experts):\n            mask = (indices == i).any(dim=-1)\n            if mask.any():\n                out[mask] += weights[mask, (indices[mask] == i).nonzero(as_tuple=True)[-1]].unsqueeze(-1) * expert(x[mask])\n        return out, logits\n\n_moe = _MoELayer({{params.d_model}}, {{params.d_ff}}, {{params.num_experts}}, {{params.top_k}})\n{{outputs.tensor_out}}, {{outputs.router_logits}} = _moe({{inputs.x}})'
    
    _code = _code.replace("{{params.d_model}}", str(d_model))
    _code = _code.replace("{{params.d_ff}}", str(d_ff))
    _code = _code.replace("{{params.num_experts}}", str(num_experts))
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{inputs.x}}", "x")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    _code = _code.replace("{{outputs.router_logits}}", "_out_router_logits")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["x"] = x
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"tensor_out": _ns.get("_out_tensor_out"), "router_logits": _ns.get("_out_router_logits")}


def transformer_encoder_block(x=None, src_mask=None, d_model=512, nhead=8, dim_feedforward=2048, dropout=0.1, activation='relu'):
    """Single transformer encoder layer: self-attention + FFN with residual connections and layer norm
    
    Dependencies: pip install torch
    
    Args:
        x (tensor) (required): 
        src_mask (tensor): 
    
    Parameters:
        d_model (number, default=512): 
        nhead (number, default=8): 
        dim_feedforward (number, default=2048): 
        dropout (number, default=0.1): 
        activation (select, default='relu'): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = '_enc_layer = nn.TransformerEncoderLayer(\n    d_model={{params.d_model}}, nhead={{params.nhead}},\n    dim_feedforward={{params.dim_feedforward}}, dropout={{params.dropout}},\n    activation="{{params.activation}}", batch_first=True, norm_first=True,\n)\n{{outputs.tensor_out}} = _enc_layer({{inputs.x}}, src_mask={{inputs.src_mask}})'
    
    _code = _code.replace("{{params.d_model}}", str(d_model))
    _code = _code.replace("{{params.nhead}}", str(nhead))
    _code = _code.replace("{{params.dim_feedforward}}", str(dim_feedforward))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{params.activation}}", str(activation))
    _code = _code.replace("{{inputs.x}}", "x")
    _code = _code.replace("{{inputs.src_mask}}", "src_mask")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["x"] = x
    _ns["src_mask"] = src_mask
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def transformer_decoder_block(tgt=None, memory=None, tgt_mask=None, memory_mask=None, d_model=512, nhead=8, dim_feedforward=2048, dropout=0.1):
    """Single transformer decoder layer: masked self-attention + cross-attention + FFN
    
    Dependencies: pip install torch
    
    Args:
        tgt (tensor) (required): 
        memory (tensor) (required): 
        tgt_mask (tensor): 
        memory_mask (tensor): 
    
    Parameters:
        d_model (number, default=512): 
        nhead (number, default=8): 
        dim_feedforward (number, default=2048): 
        dropout (number, default=0.1): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = '_dec_layer = nn.TransformerDecoderLayer(\n    d_model={{params.d_model}}, nhead={{params.nhead}},\n    dim_feedforward={{params.dim_feedforward}}, dropout={{params.dropout}},\n    batch_first=True, norm_first=True,\n)\n{{outputs.tensor_out}} = _dec_layer({{inputs.tgt}}, {{inputs.memory}}, tgt_mask={{inputs.tgt_mask}}, memory_mask={{inputs.memory_mask}})'
    
    _code = _code.replace("{{params.d_model}}", str(d_model))
    _code = _code.replace("{{params.nhead}}", str(nhead))
    _code = _code.replace("{{params.dim_feedforward}}", str(dim_feedforward))
    _code = _code.replace("{{params.dropout}}", str(dropout))
    _code = _code.replace("{{inputs.tgt}}", "tgt")
    _code = _code.replace("{{inputs.memory}}", "memory")
    _code = _code.replace("{{inputs.tgt_mask}}", "tgt_mask")
    _code = _code.replace("{{inputs.memory_mask}}", "memory_mask")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tgt"] = tgt
    _ns["memory"] = memory
    _ns["tgt_mask"] = tgt_mask
    _ns["memory_mask"] = memory_mask
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def encoder_only(input_ids=None, attention_mask=None, model_name='bert-base-uncased'):
    """Full encoder-only transformer stack (BERT-style) for embeddings and classification
    
    Dependencies: pip install transformers
    
    Args:
        input_ids (tensor) (required): 
        attention_mask (tensor): 
    
    Parameters:
        model_name (string, default='bert-base-uncased'): 
    
    Returns:
        dict with keys:
            last_hidden (tensor): 
            pooler_output (tensor): 
    """
    _imports = ['from transformers import AutoModel']
    _code = '_encoder_model = AutoModel.from_pretrained("{{params.model_name}}")\n_encoder_output = _encoder_model(input_ids={{inputs.input_ids}}, attention_mask={{inputs.attention_mask}})\n{{outputs.last_hidden}} = _encoder_output.last_hidden_state\n{{outputs.pooler_output}} = _encoder_output.pooler_output'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{inputs.input_ids}}", "input_ids")
    _code = _code.replace("{{inputs.attention_mask}}", "attention_mask")
    _code = _code.replace("{{outputs.last_hidden}}", "_out_last_hidden")
    _code = _code.replace("{{outputs.pooler_output}}", "_out_pooler_output")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["input_ids"] = input_ids
    _ns["attention_mask"] = attention_mask
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"last_hidden": _ns.get("_out_last_hidden"), "pooler_output": _ns.get("_out_pooler_output")}


def decoder_only(input_ids=None, attention_mask=None, model_name='gpt2'):
    """Full decoder-only transformer stack (GPT / LLaMA-style) for causal language modelling
    
    Dependencies: pip install transformers
    
    Args:
        input_ids (tensor) (required): 
        attention_mask (tensor): 
    
    Parameters:
        model_name (string, default='gpt2'): 
    
    Returns:
        dict with keys:
            logits (tensor): 
            hidden_states (tensor): 
    """
    _imports = ['from transformers import AutoModelForCausalLM']
    _code = '_decoder_model = AutoModelForCausalLM.from_pretrained("{{params.model_name}}")\n_decoder_output = _decoder_model(input_ids={{inputs.input_ids}}, attention_mask={{inputs.attention_mask}}, output_hidden_states=True)\n{{outputs.logits}} = _decoder_output.logits\n{{outputs.hidden_states}} = _decoder_output.hidden_states[-1]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{inputs.input_ids}}", "input_ids")
    _code = _code.replace("{{inputs.attention_mask}}", "attention_mask")
    _code = _code.replace("{{outputs.logits}}", "_out_logits")
    _code = _code.replace("{{outputs.hidden_states}}", "_out_hidden_states")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["input_ids"] = input_ids
    _ns["attention_mask"] = attention_mask
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"logits": _ns.get("_out_logits"), "hidden_states": _ns.get("_out_hidden_states")}


def encoder_decoder(input_ids=None, decoder_input_ids=None, attention_mask=None, model_name='t5-base'):
    """Full encoder-decoder transformer (T5 / BART-style) for seq2seq tasks
    
    Dependencies: pip install transformers
    
    Args:
        input_ids (tensor) (required): 
        decoder_input_ids (tensor): 
        attention_mask (tensor): 
    
    Parameters:
        model_name (string, default='t5-base'): 
    
    Returns:
        dict with keys:
            logits (tensor): 
            encoder_hidden (tensor): 
    """
    _imports = ['from transformers import AutoModelForSeq2SeqLM']
    _code = '_enc_dec_model = AutoModelForSeq2SeqLM.from_pretrained("{{params.model_name}}")\n_enc_dec_output = _enc_dec_model(\n    input_ids={{inputs.input_ids}},\n    decoder_input_ids={{inputs.decoder_input_ids}},\n    attention_mask={{inputs.attention_mask}},\n    output_hidden_states=True,\n)\n{{outputs.logits}} = _enc_dec_output.logits\n{{outputs.encoder_hidden}} = _enc_dec_output.encoder_last_hidden_state'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{inputs.input_ids}}", "input_ids")
    _code = _code.replace("{{inputs.decoder_input_ids}}", "decoder_input_ids")
    _code = _code.replace("{{inputs.attention_mask}}", "attention_mask")
    _code = _code.replace("{{outputs.logits}}", "_out_logits")
    _code = _code.replace("{{outputs.encoder_hidden}}", "_out_encoder_hidden")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["input_ids"] = input_ids
    _ns["decoder_input_ids"] = decoder_input_ids
    _ns["attention_mask"] = attention_mask
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"logits": _ns.get("_out_logits"), "encoder_hidden": _ns.get("_out_encoder_hidden")}


def vit_block(pixel_values=None, model_name='google/vit-base-patch16-224'):
    """Vision Transformer block that processes image patches through transformer layers
    
    Dependencies: pip install transformers
    
    Args:
        pixel_values (image_batch) (required): Shape: (batch, channels, height, width)
    
    Parameters:
        model_name (string, default='google/vit-base-patch16-224'): 
    
    Returns:
        dict with keys:
            last_hidden (tensor): 
            cls_token (tensor): 
    """
    _imports = ['from transformers import ViTModel']
    _code = '_vit = ViTModel.from_pretrained("{{params.model_name}}")\n_vit_output = _vit(pixel_values={{inputs.pixel_values}})\n{{outputs.last_hidden}} = _vit_output.last_hidden_state\n{{outputs.cls_token}} = _vit_output.last_hidden_state[:, 0, :]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{inputs.pixel_values}}", "pixel_values")
    _code = _code.replace("{{outputs.last_hidden}}", "_out_last_hidden")
    _code = _code.replace("{{outputs.cls_token}}", "_out_cls_token")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["pixel_values"] = pixel_values
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"last_hidden": _ns.get("_out_last_hidden"), "cls_token": _ns.get("_out_cls_token")}


def patch_embed(image=None, img_size=224, patch_size=16, in_channels=3, embed_dim=768):
    """Split an image into fixed-size patches and project to embeddings via Conv2d
    
    Dependencies: pip install torch
    
    Args:
        image (image_batch) (required): Shape: (batch, channels, height, width)
    
    Parameters:
        img_size (number, default=224): 
        patch_size (number, default=16): 
        in_channels (number, default=3): 
        embed_dim (number, default=768): 
    
    Returns:
        tensor: Shape: (batch, num_patches, embed_dim)
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = '_patch_proj = nn.Conv2d({{params.in_channels}}, {{params.embed_dim}}, kernel_size={{params.patch_size}}, stride={{params.patch_size}})\n_patches = _patch_proj({{inputs.image}})  # (B, embed_dim, H/P, W/P)\n{{outputs.patch_embeddings}} = _patches.flatten(2).transpose(1, 2)  # (B, num_patches, embed_dim)'
    
    _code = _code.replace("{{params.img_size}}", str(img_size))
    _code = _code.replace("{{params.patch_size}}", str(patch_size))
    _code = _code.replace("{{params.in_channels}}", str(in_channels))
    _code = _code.replace("{{params.embed_dim}}", str(embed_dim))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.patch_embeddings}}", "_out_patch_embeddings")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_patch_embeddings")


def kv_cache(new_key=None, new_value=None, past_key=None, past_value=None, max_cache_len=4096):
    """Manage key-value cache for efficient autoregressive generation
    
    Dependencies: pip install torch
    
    Args:
        new_key (tensor) (required): 
        new_value (tensor) (required): 
        past_key (tensor): 
        past_value (tensor): 
    
    Parameters:
        max_cache_len (number, default=4096): Truncate cache beyond this length
    
    Returns:
        dict with keys:
            cached_key (tensor): 
            cached_value (tensor): 
    """
    _imports = ['import torch']
    _code = 'if {{inputs.past_key}} is not None:\n    {{outputs.cached_key}} = torch.cat([{{inputs.past_key}}, {{inputs.new_key}}], dim=-2)[:, :, -{{params.max_cache_len}}:, :]\n    {{outputs.cached_value}} = torch.cat([{{inputs.past_value}}, {{inputs.new_value}}], dim=-2)[:, :, -{{params.max_cache_len}}:, :]\n "else":\n    {{outputs.cached_key}} = {{inputs.new_key}}\n    {{outputs.cached_value}} = {{inputs.new_value}}'
    
    _code = _code.replace("{{params.max_cache_len}}", str(max_cache_len))
    _code = _code.replace("{{inputs.new_key}}", "new_key")
    _code = _code.replace("{{inputs.new_value}}", "new_value")
    _code = _code.replace("{{inputs.past_key}}", "past_key")
    _code = _code.replace("{{inputs.past_value}}", "past_value")
    _code = _code.replace("{{outputs.cached_key}}", "_out_cached_key")
    _code = _code.replace("{{outputs.cached_value}}", "_out_cached_value")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["new_key"] = new_key
    _ns["new_value"] = new_value
    _ns["past_key"] = past_key
    _ns["past_value"] = past_value
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"cached_key": _ns.get("_out_cached_key"), "cached_value": _ns.get("_out_cached_value")}


def flash_attention(query=None, key=None, value=None, attn_mask=None, dropout_p=0.0, is_causal=False, scale=0):
    """Memory-efficient flash attention using PyTorch scaled_dot_product_attention
    
    Dependencies: pip install torch
    
    Args:
        query (tensor) (required): 
        key (tensor) (required): 
        value (tensor) (required): 
        attn_mask (tensor): 
    
    Parameters:
        dropout_p (number, default=0.0): 
        is_causal (boolean, default=False): 
        scale (number, default=0): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn.functional as F']
    _code = '_scale = {{params.scale}} if {{params.scale}} > 0 else None\n{{outputs.attn_out}} = F.scaled_dot_product_attention(\n    {{inputs.query}}, {{inputs.key}}, {{inputs.value}},\n    attn_mask={{inputs.attn_mask}}, dropout_p={{params.dropout_p}},\n    is_causal={{params.is_causal}}, scale=_scale,\n)'
    
    _code = _code.replace("{{params.dropout_p}}", str(dropout_p))
    _code = _code.replace("{{params.is_causal}}", str(is_causal))
    _code = _code.replace("{{params.scale}}", str(scale))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{inputs.key}}", "key")
    _code = _code.replace("{{inputs.value}}", "value")
    _code = _code.replace("{{inputs.attn_mask}}", "attn_mask")
    _code = _code.replace("{{outputs.attn_out}}", "_out_attn_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    _ns["key"] = key
    _ns["value"] = value
    _ns["attn_mask"] = attn_mask
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_attn_out")


def gqa(x=None, d_model=4096, num_heads=32, num_kv_heads=8):
    """Grouped-query attention where multiple query heads share key/value heads (LLaMA-2 style)
    
    Dependencies: pip install torch
    
    Args:
        x (tensor) (required): Shape: (batch, seq_len, d_model)
    
    Parameters:
        d_model (number, default=4096): 
        num_heads (number, default=32): 
        num_kv_heads (number, default=8): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn', 'import torch.nn.functional as F']
    _code = 'class _GQA(nn.Module):\n    def __init__(self, d_model, num_heads, num_kv_heads):\n        super().__init__()\n        self.head_dim = d_model // num_heads\n        self.num_heads = num_heads\n        self.num_kv_heads = num_kv_heads\n        self.num_groups = num_heads // num_kv_heads\n        self.wq = nn.Linear(d_model, num_heads * self.head_dim, bias=False)\n        self.wk = nn.Linear(d_model, num_kv_heads * self.head_dim, bias=False)\n        self.wv = nn.Linear(d_model, num_kv_heads * self.head_dim, bias=False)\n        self.wo = nn.Linear(num_heads * self.head_dim, d_model, bias=False)\n    def forward(self, x):\n        B, S, _ = x.shape\n        q = self.wq(x).view(B, S, self.num_heads, self.head_dim).transpose(1, 2)\n        k = self.wk(x).view(B, S, self.num_kv_heads, self.head_dim).transpose(1, 2)\n        v = self.wv(x).view(B, S, self.num_kv_heads, self.head_dim).transpose(1, 2)\n        k = k.unsqueeze(2).expand(-1, -1, self.num_groups, -1, -1).reshape(B, self.num_heads, S, self.head_dim)\n        v = v.unsqueeze(2).expand(-1, -1, self.num_groups, -1, -1).reshape(B, self.num_heads, S, self.head_dim)\n        out = F.scaled_dot_product_attention(q, k, v, is_causal=True)\n        return self.wo(out.transpose(1, 2).contiguous().view(B, S, -1))\n\n_gqa = _GQA({{params.d_model}}, {{params.num_heads}}, {{params.num_kv_heads}})\n{{outputs.attn_out}} = _gqa({{inputs.x}})'
    
    _code = _code.replace("{{params.d_model}}", str(d_model))
    _code = _code.replace("{{params.num_heads}}", str(num_heads))
    _code = _code.replace("{{params.num_kv_heads}}", str(num_kv_heads))
    _code = _code.replace("{{inputs.x}}", "x")
    _code = _code.replace("{{outputs.attn_out}}", "_out_attn_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["x"] = x
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_attn_out")


def mqa(x=None, d_model=512, num_heads=8):
    """Multi-query attention where all query heads share a single key/value head
    
    Dependencies: pip install torch
    
    Args:
        x (tensor) (required): 
    
    Parameters:
        d_model (number, default=512): 
        num_heads (number, default=8): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn', 'import torch.nn.functional as F']
    _code = 'class _MQA(nn.Module):\n    def __init__(self, d_model, num_heads):\n        super().__init__()\n        self.head_dim = d_model // num_heads\n        self.num_heads = num_heads\n        self.wq = nn.Linear(d_model, d_model, bias=False)\n        self.wk = nn.Linear(d_model, self.head_dim, bias=False)\n        self.wv = nn.Linear(d_model, self.head_dim, bias=False)\n        self.wo = nn.Linear(d_model, d_model, bias=False)\n    def forward(self, x):\n        B, S, _ = x.shape\n        q = self.wq(x).view(B, S, self.num_heads, self.head_dim).transpose(1, 2)\n        k = self.wk(x).view(B, S, 1, self.head_dim).transpose(1, 2)\n        v = self.wv(x).view(B, S, 1, self.head_dim).transpose(1, 2)\n        k = k.expand(-1, self.num_heads, -1, -1)\n        v = v.expand(-1, self.num_heads, -1, -1)\n        out = F.scaled_dot_product_attention(q, k, v, is_causal=True)\n        return self.wo(out.transpose(1, 2).contiguous().view(B, S, -1))\n\n_mqa = _MQA({{params.d_model}}, {{params.num_heads}})\n{{outputs.attn_out}} = _mqa({{inputs.x}})'
    
    _code = _code.replace("{{params.d_model}}", str(d_model))
    _code = _code.replace("{{params.num_heads}}", str(num_heads))
    _code = _code.replace("{{inputs.x}}", "x")
    _code = _code.replace("{{outputs.attn_out}}", "_out_attn_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["x"] = x
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_attn_out")


def rms_norm(x=None, dim=4096, eps=1e-06):
    """Root Mean Square Layer Normalization (used in LLaMA, Gemma, etc.)
    
    Dependencies: pip install torch
    
    Args:
        x (tensor) (required): 
    
    Parameters:
        dim (number, default=4096): 
        eps (number, default=1e-06): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'import torch.nn as nn']
    _code = 'class _RMSNorm(nn.Module):\n    def __init__(self, dim, eps=1e-6):\n        super().__init__()\n        self.weight = nn.Parameter(torch.ones(dim))\n        self.eps = eps\n    def forward(self, x):\n        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps) * self.weight\n\n_rms_norm = _RMSNorm({{params.dim}}, eps={{params.eps}})\n{{outputs.tensor_out}} = _rms_norm({{inputs.x}})'
    
    _code = _code.replace("{{params.dim}}", str(dim))
    _code = _code.replace("{{params.eps}}", str(eps))
    _code = _code.replace("{{inputs.x}}", "x")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["x"] = x
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def load_pretrained_llm(model_name='meta-llama/Llama-2-7b-hf', dtype='auto', device_map='auto', load_in_4bit=False, load_in_8bit=False, trust_remote_code=False):
    """Load a pretrained causal LLM from HuggingFace with optional quantization
    
    Dependencies: pip install torch transformers
    
    Parameters:
        model_name (string, default='meta-llama/Llama-2-7b-hf'): 
        dtype (select, default='auto'): 
        device_map (select, default='auto'): 
        load_in_4bit (boolean, default=False): Use bitsandbytes 4-bit quantization
        load_in_8bit (boolean, default=False): Use bitsandbytes 8-bit quantization
        trust_remote_code (boolean, default=False): 
    
    Returns:
        dict with keys:
            model (model): 
            tokenizer (tokenizer): 
    """
    _imports = ['import torch', 'from transformers import AutoModelForCausalLM, AutoTokenizer']
    _code = '_dtype_map = {"auto": "auto", "float16": torch.float16, "bfloat16": torch.bfloat16, "float32": torch.float32}\n_torch_dtype = _dtype_map["{{params.dtype}}"]\n{{outputs.model}} = AutoModelForCausalLM.from_pretrained(\n    "{{params.model_name}}",\n    torch_dtype=_torch_dtype,\n    device_map="{{params.device_map}}",\n    load_in_4bit={{params.load_in_4bit}},\n    load_in_8bit={{params.load_in_8bit}},\n    trust_remote_code={{params.trust_remote_code}},\n)\n{{outputs.tokenizer}} = AutoTokenizer.from_pretrained("{{params.model_name}}", trust_remote_code={{params.trust_remote_code}})'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.dtype}}", str(dtype))
    _code = _code.replace("{{params.device_map}}", str(device_map))
    _code = _code.replace("{{params.load_in_4bit}}", str(load_in_4bit))
    _code = _code.replace("{{params.load_in_8bit}}", str(load_in_8bit))
    _code = _code.replace("{{params.trust_remote_code}}", str(trust_remote_code))
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.tokenizer}}", "_out_tokenizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "tokenizer": _ns.get("_out_tokenizer")}


def load_pretrained_encoder(model_name='bert-base-uncased', task='features', num_labels=2):
    """Load a pretrained encoder model (BERT, RoBERTa, etc.) for embeddings or classification
    
    Dependencies: pip install transformers
    
    Parameters:
        model_name (string, default='bert-base-uncased'): 
        task (select, default='features'): 
        num_labels (number, default=2): 
    
    Returns:
        dict with keys:
            model (model): 
            tokenizer (tokenizer): 
    """
    _imports = ['from transformers import AutoModel, AutoModelForSequenceClassification, AutoModelForTokenClassification, AutoTokenizer']
    _code = '_task_map = {\n    "features": AutoModel,\n    "classification": AutoModelForSequenceClassification,\n    "token_classification": AutoModelForTokenClassification}\n_model_cls = _task_map["{{params.task}}"]\n_kwargs = {"num_labels": {{params.num_labels}}} if "{{params.task}}" != "features" else {}\n{{outputs.model}} = _model_cls.from_pretrained("{{params.model_name}}", **_kwargs)\n{{outputs.tokenizer}} = AutoTokenizer.from_pretrained("{{params.model_name}}")'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{params.num_labels}}", str(num_labels))
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.tokenizer}}", "_out_tokenizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "tokenizer": _ns.get("_out_tokenizer")}


def tokenizer_bpe(text=None, model_name='gpt2', max_length=512, padding='max_length', truncation=True):
    """Byte-Pair Encoding tokenizer (GPT-2 / GPT-style) from HuggingFace
    
    Dependencies: pip install transformers
    
    Args:
        text (text) (required): 
    
    Parameters:
        model_name (string, default='gpt2'): 
        max_length (number, default=512): 
        padding (select, default='max_length'): 
        truncation (boolean, default=True): 
    
    Returns:
        dict with keys:
            input_ids (tensor): 
            attention_mask (tensor): 
            tokenizer (tokenizer): 
    """
    _imports = ['from transformers import AutoTokenizer']
    _code = '{{outputs.tokenizer}} = AutoTokenizer.from_pretrained("{{params.model_name}}")\nif {{outputs.tokenizer}}.pad_token is None:\n    {{outputs.tokenizer}}.pad_token = {{outputs.tokenizer}}.eos_token\n_padding = False if "{{params.padding}}" == "false" else "{{params.padding}}"\n_encoded = {{outputs.tokenizer}}({{inputs.text}}, max_length={{params.max_length}}, padding=_padding, truncation={{params.truncation}}, return_tensors="pt")\n{{outputs.input_ids}} = _encoded["input_ids"]\n{{outputs.attention_mask}} = _encoded["attention_mask"]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.max_length}}", str(max_length))
    _code = _code.replace("{{params.padding}}", str(padding))
    _code = _code.replace("{{params.truncation}}", str(truncation))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.input_ids}}", "_out_input_ids")
    _code = _code.replace("{{outputs.attention_mask}}", "_out_attention_mask")
    _code = _code.replace("{{outputs.tokenizer}}", "_out_tokenizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"input_ids": _ns.get("_out_input_ids"), "attention_mask": _ns.get("_out_attention_mask"), "tokenizer": _ns.get("_out_tokenizer")}


def tokenizer_sentencepiece(text=None, model_name='t5-base', max_length=512, padding='max_length', truncation=True):
    """SentencePiece tokenizer (T5, LLaMA-style) from HuggingFace
    
    Dependencies: pip install transformers
    
    Args:
        text (text) (required): 
    
    Parameters:
        model_name (string, default='t5-base'): 
        max_length (number, default=512): 
        padding (select, default='max_length'): 
        truncation (boolean, default=True): 
    
    Returns:
        dict with keys:
            input_ids (tensor): 
            attention_mask (tensor): 
            tokenizer (tokenizer): 
    """
    _imports = ['from transformers import AutoTokenizer']
    _code = '{{outputs.tokenizer}} = AutoTokenizer.from_pretrained("{{params.model_name}}")\n_padding = False if "{{params.padding}}" == "false" else "{{params.padding}}"\n_encoded = {{outputs.tokenizer}}({{inputs.text}}, max_length={{params.max_length}}, padding=_padding, truncation={{params.truncation}}, return_tensors="pt")\n{{outputs.input_ids}} = _encoded["input_ids"]\n{{outputs.attention_mask}} = _encoded["attention_mask"]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.max_length}}", str(max_length))
    _code = _code.replace("{{params.padding}}", str(padding))
    _code = _code.replace("{{params.truncation}}", str(truncation))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.input_ids}}", "_out_input_ids")
    _code = _code.replace("{{outputs.attention_mask}}", "_out_attention_mask")
    _code = _code.replace("{{outputs.tokenizer}}", "_out_tokenizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"input_ids": _ns.get("_out_input_ids"), "attention_mask": _ns.get("_out_attention_mask"), "tokenizer": _ns.get("_out_tokenizer")}


def tokenizer_wordpiece(text=None, model_name='bert-base-uncased', max_length=512, padding='max_length', truncation=True):
    """WordPiece tokenizer (BERT-style) from HuggingFace
    
    Dependencies: pip install transformers
    
    Args:
        text (text) (required): 
    
    Parameters:
        model_name (string, default='bert-base-uncased'): 
        max_length (number, default=512): 
        padding (select, default='max_length'): 
        truncation (boolean, default=True): 
    
    Returns:
        dict with keys:
            input_ids (tensor): 
            attention_mask (tensor): 
            token_type_ids (tensor): 
            tokenizer (tokenizer): 
    """
    _imports = ['from transformers import AutoTokenizer']
    _code = '{{outputs.tokenizer}} = AutoTokenizer.from_pretrained("{{params.model_name}}")\n_padding = False if "{{params.padding}}" == "false" else "{{params.padding}}"\n_encoded = {{outputs.tokenizer}}({{inputs.text}}, max_length={{params.max_length}}, padding=_padding, truncation={{params.truncation}}, return_tensors="pt")\n{{outputs.input_ids}} = _encoded["input_ids"]\n{{outputs.attention_mask}} = _encoded["attention_mask"]\n{{outputs.token_type_ids}} = _encoded["token_type_ids"]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.max_length}}", str(max_length))
    _code = _code.replace("{{params.padding}}", str(padding))
    _code = _code.replace("{{params.truncation}}", str(truncation))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.input_ids}}", "_out_input_ids")
    _code = _code.replace("{{outputs.attention_mask}}", "_out_attention_mask")
    _code = _code.replace("{{outputs.token_type_ids}}", "_out_token_type_ids")
    _code = _code.replace("{{outputs.tokenizer}}", "_out_tokenizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"input_ids": _ns.get("_out_input_ids"), "attention_mask": _ns.get("_out_attention_mask"), "token_type_ids": _ns.get("_out_token_type_ids"), "tokenizer": _ns.get("_out_tokenizer")}


def context_window_manager(messages=None, tokenizer=None, max_tokens=4096, strategy='truncate_oldest', reserve_for_response=512):
    """Manage token budget by truncating or sliding-window over conversation history
    
    Args:
        messages (list) (required): List of {role, content} message dicts
        tokenizer (tokenizer) (required): 
    
    Parameters:
        max_tokens (number, default=4096): 
        strategy (select, default='truncate_oldest'): 
        reserve_for_response (number, default=512): 
    
    Returns:
        dict with keys:
            trimmed_messages (list): 
            token_count (number): 
    """
    _imports = []
    _code = '_budget = {{params.max_tokens}} - {{params.reserve_for_response}}\n_messages = list({{inputs.messages}})\n_tokenizer = {{inputs.tokenizer}}\n\ndef _count_tokens(msgs):\n    return sum(len(_tokenizer.encode(m["content"])) for m in msgs)\n\nif "{{params.strategy}}" == "truncate_oldest":\n    while _count_tokens(_messages) > _budget and len(_messages) > 1:\n        if _messages[0]["role"] == "system":\n            _messages.pop(1)\n "else":\n            _messages.pop(0)\nelif "{{params.strategy}}" == "sliding_window":\n    system_msgs = [m for m in _messages if m["role"] == "system"]\n    other_msgs = [m for m in _messages if m["role"] != "system"]\n    while _count_tokens(system_msgs + other_msgs) > _budget and len(other_msgs) > 1:\n        other_msgs.pop(0)\n    _messages = system_msgs + other_msgs\n\n{{outputs.trimmed_messages}} = _messages\n{{outputs.token_count}} = _count_tokens(_messages)'
    
    _code = _code.replace("{{params.max_tokens}}", str(max_tokens))
    _code = _code.replace("{{params.strategy}}", str(strategy))
    _code = _code.replace("{{params.reserve_for_response}}", str(reserve_for_response))
    _code = _code.replace("{{inputs.messages}}", "messages")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{outputs.trimmed_messages}}", "_out_trimmed_messages")
    _code = _code.replace("{{outputs.token_count}}", "_out_token_count")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["messages"] = messages
    _ns["tokenizer"] = tokenizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"trimmed_messages": _ns.get("_out_trimmed_messages"), "token_count": _ns.get("_out_token_count")}


def system_prompt(content='You are a helpful assistant.'):
    """Define a system prompt message for LLM conversations
    
    Parameters:
        content (code, default='You are a helpful assistant.'): The system-level instruction for the LLM
    
    Returns:
        dict with keys:
            message (dict): 
            prompt_text (text): 
    """
    _imports = []
    _code = '{{outputs.prompt_text}} = """{{params.content}}"""\n{{outputs.message}} = {"role": "system", "content": {{outputs.prompt_text}}}'
    
    _code = _code.replace("{{params.content}}", str(content))
    _code = _code.replace("{{outputs.message}}", "_out_message")
    _code = _code.replace("{{outputs.prompt_text}}", "_out_prompt_text")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"message": _ns.get("_out_message"), "prompt_text": _ns.get("_out_prompt_text")}


def inference_greedy(model=None, input_ids=None, attention_mask=None, tokenizer=None, max_new_tokens=256):
    """Run greedy decoding (argmax) on a causal LLM
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        input_ids (tensor) (required): 
        attention_mask (tensor): 
        tokenizer (tokenizer) (required): 
    
    Parameters:
        max_new_tokens (number, default=256): 
    
    Returns:
        dict with keys:
            generated_ids (tensor): 
            generated_text (text): 
    """
    _imports = ['import torch']
    _code = 'with torch.no_grad():\n    {{outputs.generated_ids}} = {{inputs.model}}.generate(\n        input_ids={{inputs.input_ids}},\n        attention_mask={{inputs.attention_mask}},\n        max_new_tokens={{params.max_new_tokens}},\n        do_sample=False,\n    )\n{{outputs.generated_text}} = {{inputs.tokenizer}}.decode({{outputs.generated_ids}}[0], skip_special_tokens=True)'
    
    _code = _code.replace("{{params.max_new_tokens}}", str(max_new_tokens))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.input_ids}}", "input_ids")
    _code = _code.replace("{{inputs.attention_mask}}", "attention_mask")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{outputs.generated_ids}}", "_out_generated_ids")
    _code = _code.replace("{{outputs.generated_text}}", "_out_generated_text")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["input_ids"] = input_ids
    _ns["attention_mask"] = attention_mask
    _ns["tokenizer"] = tokenizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"generated_ids": _ns.get("_out_generated_ids"), "generated_text": _ns.get("_out_generated_text")}


def inference_beam_search(model=None, input_ids=None, attention_mask=None, tokenizer=None, max_new_tokens=256, num_beams=4, length_penalty=1.0, early_stopping=True, no_repeat_ngram_size=3):
    """Run beam search decoding on a causal LLM for higher-quality outputs
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        input_ids (tensor) (required): 
        attention_mask (tensor): 
        tokenizer (tokenizer) (required): 
    
    Parameters:
        max_new_tokens (number, default=256): 
        num_beams (number, default=4): 
        length_penalty (number, default=1.0): 
        early_stopping (boolean, default=True): 
        no_repeat_ngram_size (number, default=3): 
    
    Returns:
        dict with keys:
            generated_ids (tensor): 
            generated_text (text): 
    """
    _imports = ['import torch']
    _code = 'with torch.no_grad():\n    {{outputs.generated_ids}} = {{inputs.model}}.generate(\n        input_ids={{inputs.input_ids}},\n        attention_mask={{inputs.attention_mask}},\n        max_new_tokens={{params.max_new_tokens}},\n        num_beams={{params.num_beams}},\n        length_penalty={{params.length_penalty}},\n        early_stopping={{params.early_stopping}},\n        no_repeat_ngram_size={{params.no_repeat_ngram_size}},\n    )\n{{outputs.generated_text}} = {{inputs.tokenizer}}.decode({{outputs.generated_ids}}[0], skip_special_tokens=True)'
    
    _code = _code.replace("{{params.max_new_tokens}}", str(max_new_tokens))
    _code = _code.replace("{{params.num_beams}}", str(num_beams))
    _code = _code.replace("{{params.length_penalty}}", str(length_penalty))
    _code = _code.replace("{{params.early_stopping}}", str(early_stopping))
    _code = _code.replace("{{params.no_repeat_ngram_size}}", str(no_repeat_ngram_size))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.input_ids}}", "input_ids")
    _code = _code.replace("{{inputs.attention_mask}}", "attention_mask")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{outputs.generated_ids}}", "_out_generated_ids")
    _code = _code.replace("{{outputs.generated_text}}", "_out_generated_text")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["input_ids"] = input_ids
    _ns["attention_mask"] = attention_mask
    _ns["tokenizer"] = tokenizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"generated_ids": _ns.get("_out_generated_ids"), "generated_text": _ns.get("_out_generated_text")}


def inference_top_k_top_p(model=None, input_ids=None, attention_mask=None, tokenizer=None, max_new_tokens=256, temperature=0.7, top_k=50, top_p=0.9, repetition_penalty=1.0):
    """Run nucleus / top-k sampling on a causal LLM for diverse generation
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        input_ids (tensor) (required): 
        attention_mask (tensor): 
        tokenizer (tokenizer) (required): 
    
    Parameters:
        max_new_tokens (number, default=256): 
        temperature (number, default=0.7): 
        top_k (number, default=50): 0 = disabled
        top_p (number, default=0.9): 
        repetition_penalty (number, default=1.0): 
    
    Returns:
        dict with keys:
            generated_ids (tensor): 
            generated_text (text): 
    """
    _imports = ['import torch']
    _code = 'with torch.no_grad():\n    {{outputs.generated_ids}} = {{inputs.model}}.generate(\n        input_ids={{inputs.input_ids}},\n        attention_mask={{inputs.attention_mask}},\n        max_new_tokens={{params.max_new_tokens}},\n        do_sample=True,\n        temperature={{params.temperature}},\n        top_k={{params.top_k}},\n        top_p={{params.top_p}},\n        repetition_penalty={{params.repetition_penalty}},\n    )\n{{outputs.generated_text}} = {{inputs.tokenizer}}.decode({{outputs.generated_ids}}[0], skip_special_tokens=True)'
    
    _code = _code.replace("{{params.max_new_tokens}}", str(max_new_tokens))
    _code = _code.replace("{{params.temperature}}", str(temperature))
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{params.top_p}}", str(top_p))
    _code = _code.replace("{{params.repetition_penalty}}", str(repetition_penalty))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.input_ids}}", "input_ids")
    _code = _code.replace("{{inputs.attention_mask}}", "attention_mask")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{outputs.generated_ids}}", "_out_generated_ids")
    _code = _code.replace("{{outputs.generated_text}}", "_out_generated_text")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["input_ids"] = input_ids
    _ns["attention_mask"] = attention_mask
    _ns["tokenizer"] = tokenizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"generated_ids": _ns.get("_out_generated_ids"), "generated_text": _ns.get("_out_generated_text")}


def speculative_decoding(target_model=None, draft_model=None, input_ids=None, tokenizer=None, max_new_tokens=256, num_assistant_tokens=5):
    """Use a small draft model to speculate tokens verified by a larger target model for faster inference
    
    Dependencies: pip install torch
    
    Args:
        target_model (model) (required): 
        draft_model (model) (required): 
        input_ids (tensor) (required): 
        tokenizer (tokenizer) (required): 
    
    Parameters:
        max_new_tokens (number, default=256): 
        num_assistant_tokens (number, default=5): 
    
    Returns:
        dict with keys:
            generated_ids (tensor): 
            generated_text (text): 
    """
    _imports = ['import torch']
    _code = 'with torch.no_grad():\n    {{outputs.generated_ids}} = {{inputs.target_model}}.generate(\n        input_ids={{inputs.input_ids}},\n        max_new_tokens={{params.max_new_tokens}},\n        assistant_model={{inputs.draft_model}},\n        do_sample=False,\n    )\n{{outputs.generated_text}} = {{inputs.tokenizer}}.decode({{outputs.generated_ids}}[0], skip_special_tokens=True)'
    
    _code = _code.replace("{{params.max_new_tokens}}", str(max_new_tokens))
    _code = _code.replace("{{params.num_assistant_tokens}}", str(num_assistant_tokens))
    _code = _code.replace("{{inputs.target_model}}", "target_model")
    _code = _code.replace("{{inputs.draft_model}}", "draft_model")
    _code = _code.replace("{{inputs.input_ids}}", "input_ids")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{outputs.generated_ids}}", "_out_generated_ids")
    _code = _code.replace("{{outputs.generated_text}}", "_out_generated_text")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["target_model"] = target_model
    _ns["draft_model"] = draft_model
    _ns["input_ids"] = input_ids
    _ns["tokenizer"] = tokenizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"generated_ids": _ns.get("_out_generated_ids"), "generated_text": _ns.get("_out_generated_text")}


def streaming_token_output(model=None, input_ids=None, tokenizer=None, max_new_tokens=512, temperature=0.7):
    """Stream generated tokens one-by-one using a TextIteratorStreamer
    
    Dependencies: pip install torch transformers
    
    Args:
        model (model) (required): 
        input_ids (tensor) (required): 
        tokenizer (tokenizer) (required): 
    
    Parameters:
        max_new_tokens (number, default=512): 
        temperature (number, default=0.7): 
    
    Returns:
        dict with keys:
            streamer (any): 
            thread (any): 
    """
    _imports = ['import torch', 'from threading import Thread', 'from transformers import TextIteratorStreamer']
    _code = '{{outputs.streamer}} = TextIteratorStreamer({{inputs.tokenizer}}, skip_prompt=True, skip_special_tokens=True)\n_gen_kwargs = dict(\n    input_ids={{inputs.input_ids}},\n    max_new_tokens={{params.max_new_tokens}},\n    do_sample=True,\n    temperature={{params.temperature}},\n    streamer={{outputs.streamer}},\n)\n{{outputs.thread}} = Thread(target={{inputs.model}}.generate, kwargs=_gen_kwargs)\n{{outputs.thread}}.start()\n# Consume streamer: for token_text in {{outputs.streamer}}: print(token_text, end="", flush=True)'
    
    _code = _code.replace("{{params.max_new_tokens}}", str(max_new_tokens))
    _code = _code.replace("{{params.temperature}}", str(temperature))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.input_ids}}", "input_ids")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{outputs.streamer}}", "_out_streamer")
    _code = _code.replace("{{outputs.thread}}", "_out_thread")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["input_ids"] = input_ids
    _ns["tokenizer"] = tokenizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"streamer": _ns.get("_out_streamer"), "thread": _ns.get("_out_thread")}


def structured_output_json(prompt=None, model_name='meta-llama/Llama-2-7b-hf', json_schema='{"type": "object", "properties": {"answer": {"type": "string"}}, "required": ["answer"]}', max_tokens=512):
    """Constrain LLM output to valid JSON using vLLM guided decoding or outlines
    
    Dependencies: pip install vllm
    
    Args:
        prompt (text) (required): 
    
    Parameters:
        model_name (string, default='meta-llama/Llama-2-7b-hf'): 
        json_schema (code, default='{"type": "object", "properties": {"answer": {"type": "string"}}, "required": ["answer"]}'): JSON Schema to constrain output
        max_tokens (number, default=512): 
    
    Returns:
        dict with keys:
            json_output (dict): 
            raw_text (text): 
    """
    _imports = ['import json', 'from vllm import LLM, SamplingParams']
    _code = '_llm = LLM(model="{{params.model_name}}")\n_schema = json.loads(\'\'\'{{params.json_schema}}\'\'\')\n_sampling = SamplingParams(max_tokens={{params.max_tokens}}, temperature=0)\n_result = _llm.generate(\n    [{{inputs.prompt}}],\n    sampling_params=_sampling,\n    guided_options_request={"guided_json": _schema},\n)\n{{outputs.raw_text}} = _result[0].outputs[0].text\n{{outputs.json_output}} = json.loads({{outputs.raw_text}})'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.json_schema}}", str(json_schema))
    _code = _code.replace("{{params.max_tokens}}", str(max_tokens))
    _code = _code.replace("{{inputs.prompt}}", "prompt")
    _code = _code.replace("{{outputs.json_output}}", "_out_json_output")
    _code = _code.replace("{{outputs.raw_text}}", "_out_raw_text")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["prompt"] = prompt
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"json_output": _ns.get("_out_json_output"), "raw_text": _ns.get("_out_raw_text")}


def tool_call_function_calling(model=None, tokenizer=None, messages=None, tools=None, max_new_tokens=512):
    """Enable function/tool calling with a chat model using HuggingFace chat templates
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        tokenizer (tokenizer) (required): 
        messages (list) (required): 
        tools (list) (required): List of tool/function JSON schemas
    
    Parameters:
        max_new_tokens (number, default=512): 
    
    Returns:
        dict with keys:
            response (dict): 
            tool_calls (list): 
    """
    _imports = ['import torch', 'import json']
    _code = '_chat_input = {{inputs.tokenizer}}.apply_chat_template(\n    {{inputs.messages}},\n    tools={{inputs.tools}},\n    return_tensors="pt",\n    return_dict=True,\n).to({{inputs.model}}.device)\nwith torch.no_grad():\n    _gen_ids = {{inputs.model}}.generate(**_chat_input, max_new_tokens={{params.max_new_tokens}})\n_new_tokens = _gen_ids[0][_chat_input["input_ids"].shape[1]:]\n_decoded = {{inputs.tokenizer}}.decode(_new_tokens, skip_special_tokens=True)\n "try":\n    {{outputs.tool_calls}} = json.loads(_decoded) if _decoded.strip().startswith("[") else []\nexcept json.JSONDecodeError:\n    {{outputs.tool_calls}} = []\n{{outputs.response}} = {"role": "assistant", "content": _decoded, "tool_calls": {{outputs.tool_calls}}}'
    
    _code = _code.replace("{{params.max_new_tokens}}", str(max_new_tokens))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{inputs.messages}}", "messages")
    _code = _code.replace("{{inputs.tools}}", "tools")
    _code = _code.replace("{{outputs.response}}", "_out_response")
    _code = _code.replace("{{outputs.tool_calls}}", "_out_tool_calls")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["tokenizer"] = tokenizer
    _ns["messages"] = messages
    _ns["tools"] = tools
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"response": _ns.get("_out_response"), "tool_calls": _ns.get("_out_tool_calls")}


def multi_turn_conversation(model=None, tokenizer=None, user_message=None, history=None, max_new_tokens=512, temperature=0.7, system_prompt='You are a helpful assistant.'):
    """Manage a multi-turn chat conversation with history, applying a chat template for generation
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        tokenizer (tokenizer) (required): 
        user_message (text) (required): 
        history (list): List of prior {role, content} messages
    
    Parameters:
        max_new_tokens (number, default=512): 
        temperature (number, default=0.7): 
        system_prompt (code, default='You are a helpful assistant.'): 
    
    Returns:
        dict with keys:
            assistant_reply (text): 
            updated_history (list): 
    """
    _imports = ['import torch']
    _code = '_history = list({{inputs.history}} or [])\nif not _history or _history[0].get("role") != "system":\n    _history.insert(0, {"role": "system", "content": "{{params.system_prompt}}"})\n_history.append({"role": "user", "content": {{inputs.user_message}}})\n\n_chat_input = {{inputs.tokenizer}}.apply_chat_template(\n    _history, return_tensors="pt", return_dict=True,\n).to({{inputs.model}}.device)\nwith torch.no_grad():\n    _gen_ids = {{inputs.model}}.generate(\n        **_chat_input,\n        max_new_tokens={{params.max_new_tokens}},\n        do_sample=True,\n        temperature={{params.temperature}},\n    )\n_new_tokens = _gen_ids[0][_chat_input["input_ids"].shape[1]:]\n{{outputs.assistant_reply}} = {{inputs.tokenizer}}.decode(_new_tokens, skip_special_tokens=True)\n_history.append({"role": "assistant", "content": {{outputs.assistant_reply}}})\n{{outputs.updated_history}} = _history'
    
    _code = _code.replace("{{params.max_new_tokens}}", str(max_new_tokens))
    _code = _code.replace("{{params.temperature}}", str(temperature))
    _code = _code.replace("{{params.system_prompt}}", str(system_prompt))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{inputs.user_message}}", "user_message")
    _code = _code.replace("{{inputs.history}}", "history")
    _code = _code.replace("{{outputs.assistant_reply}}", "_out_assistant_reply")
    _code = _code.replace("{{outputs.updated_history}}", "_out_updated_history")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["tokenizer"] = tokenizer
    _ns["user_message"] = user_message
    _ns["history"] = history
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"assistant_reply": _ns.get("_out_assistant_reply"), "updated_history": _ns.get("_out_updated_history")}

