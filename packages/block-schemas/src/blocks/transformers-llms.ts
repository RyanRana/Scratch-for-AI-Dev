import type { BlockDefinition } from "../types.js";

export const transformersLlmBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Multi-Head Attention
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.multi-head-attention",
    name: "Multi-Head Attention",
    category: "transformers-llms",
    description: "Scaled dot-product attention across multiple heads (nn.MultiheadAttention)",
    tags: ["attention", "multi-head", "transformer", "pytorch"],
    inputs: [
      { id: "query", name: "Query", type: "tensor", required: true, description: "Shape: (seq_len, batch, embed_dim)" },
      { id: "key", name: "Key", type: "tensor", required: true, description: "Shape: (seq_len, batch, embed_dim)" },
      { id: "value", name: "Value", type: "tensor", required: true, description: "Shape: (seq_len, batch, embed_dim)" },
      { id: "attn_mask", name: "Attention Mask", type: "tensor", required: false, description: "Optional mask to block certain positions" },
    ],
    outputs: [
      { id: "attn_out", name: "Attention Output", type: "tensor", required: true },
      { id: "attn_weights", name: "Attention Weights", type: "tensor", required: true },
    ],
    parameters: [
      { id: "embed_dim", name: "Embed Dimension", type: "number", default: 512, min: 1, step: 1 },
      { id: "num_heads", name: "Num Heads", type: "number", default: 8, min: 1, step: 1 },
      { id: "dropout", name: "Dropout", type: "number", default: 0.0, min: 0, max: 1, step: 0.05 },
      { id: "batch_first", name: "Batch First", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `_mha = nn.MultiheadAttention(embed_dim={{params.embed_dim}}, num_heads={{params.num_heads}}, dropout={{params.dropout}}, batch_first={{params.batch_first}})
{{outputs.attn_out}}, {{outputs.attn_weights}} = _mha({{inputs.query}}, {{inputs.key}}, {{inputs.value}}, attn_mask={{inputs.attn_mask}})`,
      outputBindings: { attn_out: "mha_out", attn_weights: "mha_weights" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Self-Attention
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.self-attention",
    name: "Self-Attention",
    category: "transformers-llms",
    description: "Self-attention where Q, K, V all derive from the same input sequence",
    tags: ["attention", "self-attention", "transformer", "pytorch"],
    inputs: [
      { id: "x", name: "Input Tensor", type: "tensor", required: true, description: "Shape: (batch, seq_len, embed_dim)" },
      { id: "attn_mask", name: "Attention Mask", type: "tensor", required: false },
    ],
    outputs: [
      { id: "attn_out", name: "Attention Output", type: "tensor", required: true },
      { id: "attn_weights", name: "Attention Weights", type: "tensor", required: true },
    ],
    parameters: [
      { id: "embed_dim", name: "Embed Dimension", type: "number", default: 512, min: 1, step: 1 },
      { id: "num_heads", name: "Num Heads", type: "number", default: 8, min: 1, step: 1 },
      { id: "dropout", name: "Dropout", type: "number", default: 0.0, min: 0, max: 1, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `_self_attn = nn.MultiheadAttention(embed_dim={{params.embed_dim}}, num_heads={{params.num_heads}}, dropout={{params.dropout}}, batch_first=True)
{{outputs.attn_out}}, {{outputs.attn_weights}} = _self_attn({{inputs.x}}, {{inputs.x}}, {{inputs.x}}, attn_mask={{inputs.attn_mask}})`,
      outputBindings: { attn_out: "self_attn_out", attn_weights: "self_attn_weights" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Cross-Attention
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.cross-attention",
    name: "Cross-Attention",
    category: "transformers-llms",
    description: "Cross-attention between decoder queries and encoder key-values",
    tags: ["attention", "cross-attention", "encoder-decoder", "transformer", "pytorch"],
    inputs: [
      { id: "query", name: "Query (Decoder)", type: "tensor", required: true },
      { id: "encoder_out", name: "Encoder Output (K/V)", type: "tensor", required: true },
      { id: "attn_mask", name: "Attention Mask", type: "tensor", required: false },
    ],
    outputs: [
      { id: "attn_out", name: "Cross-Attention Output", type: "tensor", required: true },
      { id: "attn_weights", name: "Attention Weights", type: "tensor", required: true },
    ],
    parameters: [
      { id: "embed_dim", name: "Embed Dimension", type: "number", default: 512, min: 1, step: 1 },
      { id: "num_heads", name: "Num Heads", type: "number", default: 8, min: 1, step: 1 },
      { id: "dropout", name: "Dropout", type: "number", default: 0.0, min: 0, max: 1, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `_cross_attn = nn.MultiheadAttention(embed_dim={{params.embed_dim}}, num_heads={{params.num_heads}}, dropout={{params.dropout}}, batch_first=True)
{{outputs.attn_out}}, {{outputs.attn_weights}} = _cross_attn({{inputs.query}}, {{inputs.encoder_out}}, {{inputs.encoder_out}}, attn_mask={{inputs.attn_mask}})`,
      outputBindings: { attn_out: "cross_attn_out", attn_weights: "cross_attn_weights" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Causal Mask
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.causal-mask",
    name: "Causal Mask",
    category: "transformers-llms",
    description: "Generate an upper-triangular causal mask for autoregressive decoding",
    tags: ["mask", "causal", "autoregressive", "transformer", "pytorch"],
    inputs: [
      { id: "seq_len_tensor", name: "Sequence Length Tensor", type: "tensor", required: false, description: "Optional tensor whose seq dim determines mask size" },
    ],
    outputs: [
      { id: "mask", name: "Causal Mask", type: "tensor", required: true },
    ],
    parameters: [
      { id: "seq_len", name: "Sequence Length", type: "number", default: 512, min: 1, step: 1 },
      { id: "dtype", name: "Dtype", type: "select", default: "float32", options: [{ label: "float32", value: "float32" }, { label: "float16", value: "float16" }, { label: "bfloat16", value: "bfloat16" }] },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `_seq_len = {{inputs.seq_len_tensor}}.size(1) if {{inputs.seq_len_tensor}} is not None else {{params.seq_len}}
_dtype = getattr(torch, "{{params.dtype}}")
{{outputs.mask}} = torch.triu(torch.ones(_seq_len, _seq_len, dtype=_dtype) * float("-inf"), diagonal=1)`,
      outputBindings: { mask: "causal_mask" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Rotary Positional Encoding (RoPE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.rope",
    name: "Rotary Positional Encoding (RoPE)",
    category: "transformers-llms",
    description: "Apply rotary positional embeddings to query and key tensors",
    tags: ["positional-encoding", "rope", "rotary", "transformer", "llm"],
    inputs: [
      { id: "query", name: "Query Tensor", type: "tensor", required: true },
      { id: "key", name: "Key Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "query_out", name: "Rotated Query", type: "tensor", required: true },
      { id: "key_out", name: "Rotated Key", type: "tensor", required: true },
    ],
    parameters: [
      { id: "dim", name: "Head Dimension", type: "number", default: 64, min: 1, step: 1 },
      { id: "max_seq_len", name: "Max Sequence Length", type: "number", default: 4096, min: 1, step: 1 },
      { id: "base", name: "Theta Base", type: "number", default: 10000, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `def _build_rope_cache(dim, max_seq_len, base={{params.base}}, device="cpu"):
    theta = 1.0 / (base ** (torch.arange(0, dim, 2, device=device).float() / dim))
    seq_idx = torch.arange(max_seq_len, device=device).float()
    freqs = torch.outer(seq_idx, theta)
    return torch.polar(torch.ones_like(freqs), freqs)

def _apply_rope(x, freqs):
    x_ = torch.view_as_complex(x.float().reshape(*x.shape[:-1], -1, 2))
    x_out = torch.view_as_real(x_ * freqs[:x.shape[-2]]).flatten(-2)
    return x_out.type_as(x)

_rope_cache = _build_rope_cache({{params.dim}}, {{params.max_seq_len}}, device={{inputs.query}}.device)
{{outputs.query_out}} = _apply_rope({{inputs.query}}, _rope_cache)
{{outputs.key_out}} = _apply_rope({{inputs.key}}, _rope_cache)`,
      outputBindings: { query_out: "rope_q", key_out: "rope_k" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Sinusoidal Positional Encoding
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.sinusoidal-positional-encoding",
    name: "Sinusoidal Positional Encoding",
    category: "transformers-llms",
    description: "Classic fixed sinusoidal positional encodings from 'Attention Is All You Need'",
    tags: ["positional-encoding", "sinusoidal", "transformer"],
    inputs: [
      { id: "x", name: "Input Tensor", type: "tensor", required: true, description: "Shape: (batch, seq_len, d_model)" },
    ],
    outputs: [
      { id: "tensor_out", name: "Output + Positional", type: "tensor", required: true },
    ],
    parameters: [
      { id: "d_model", name: "Model Dimension", type: "number", default: 512, min: 1, step: 1 },
      { id: "max_len", name: "Max Sequence Length", type: "number", default: 5000, min: 1, step: 1 },
      { id: "dropout", name: "Dropout", type: "number", default: 0.1, min: 0, max: 1, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn", "import math"],
      body: `class _SinusoidalPE(nn.Module):
    def __init__(self, d_model, max_len, dropout):
        super().__init__()
        self.dropout = nn.Dropout(p=dropout)
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len).unsqueeze(1).float()
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * -(math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer("pe", pe.unsqueeze(0))
    def forward(self, x):
        return self.dropout(x + self.pe[:, :x.size(1)])

_sinusoidal_pe = _SinusoidalPE({{params.d_model}}, {{params.max_len}}, {{params.dropout}})
{{outputs.tensor_out}} = _sinusoidal_pe({{inputs.x}})`,
      outputBindings: { tensor_out: "pe_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. ALiBi Positional Bias
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.alibi",
    name: "ALiBi Positional Bias",
    category: "transformers-llms",
    description: "Attention with Linear Biases — adds linear distance bias to attention scores",
    tags: ["positional-encoding", "alibi", "bias", "transformer", "llm"],
    inputs: [
      { id: "attn_scores", name: "Attention Scores", type: "tensor", required: true, description: "Shape: (batch, heads, seq_len, seq_len)" },
    ],
    outputs: [
      { id: "biased_scores", name: "Biased Attention Scores", type: "tensor", required: true },
    ],
    parameters: [
      { id: "num_heads", name: "Num Heads", type: "number", default: 8, min: 1, step: 1 },
      { id: "max_seq_len", name: "Max Sequence Length", type: "number", default: 2048, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import math"],
      body: `def _get_alibi_slopes(num_heads):
    closest_power_of_2 = 2 ** math.floor(math.log2(num_heads))
    base = 2 ** (-(2 ** -(math.log2(closest_power_of_2) - 3)))
    slopes = [base ** (i + 1) for i in range(closest_power_of_2)]
    if closest_power_of_2 != num_heads:
        extra_base = 2 ** (-(2 ** -(math.log2(2 * closest_power_of_2) - 3)))
        extra = [extra_base ** (2 * (i + 1) - 1) for i in range(num_heads - closest_power_of_2)]
        slopes = slopes + extra
    return torch.tensor(slopes, dtype=torch.float32)

_slopes = _get_alibi_slopes({{params.num_heads}}).to({{inputs.attn_scores}}.device)
_seq_len = {{inputs.attn_scores}}.size(-1)
_positions = torch.arange(_seq_len, device={{inputs.attn_scores}}.device)
_bias = -torch.abs(_positions.unsqueeze(0) - _positions.unsqueeze(1)).float()
_bias = _bias.unsqueeze(0) * _slopes.view(-1, 1, 1)
{{outputs.biased_scores}} = {{inputs.attn_scores}} + _bias.unsqueeze(0)`,
      outputBindings: { biased_scores: "alibi_scores" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Feed-Forward Block (FFN)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.ffn",
    name: "Feed-Forward Block (FFN)",
    category: "transformers-llms",
    description: "Standard two-layer feed-forward network with activation (used in transformer blocks)",
    tags: ["ffn", "feed-forward", "mlp", "transformer", "pytorch"],
    inputs: [
      { id: "x", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "FFN Output", type: "tensor", required: true },
    ],
    parameters: [
      { id: "d_model", name: "Model Dimension", type: "number", default: 512, min: 1, step: 1 },
      { id: "d_ff", name: "FFN Hidden Dimension", type: "number", default: 2048, min: 1, step: 1 },
      { id: "dropout", name: "Dropout", type: "number", default: 0.1, min: 0, max: 1, step: 0.05 },
      { id: "activation", name: "Activation", type: "select", default: "relu", options: [{ label: "ReLU", value: "relu" }, { label: "GELU", value: "gelu" }] },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `_act = nn.ReLU() if "{{params.activation}}" == "relu" else nn.GELU()
_ffn = nn.Sequential(
    nn.Linear({{params.d_model}}, {{params.d_ff}}),
    _act,
    nn.Dropout({{params.dropout}}),
    nn.Linear({{params.d_ff}}, {{params.d_model}}),
    nn.Dropout({{params.dropout}}),
)
{{outputs.tensor_out}} = _ffn({{inputs.x}})`,
      outputBindings: { tensor_out: "ffn_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. SwiGLU FFN
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.swiglu-ffn",
    name: "SwiGLU FFN",
    category: "transformers-llms",
    description: "SwiGLU gated feed-forward network used in LLaMA-style models",
    tags: ["ffn", "swiglu", "gated", "llama", "transformer", "llm"],
    inputs: [
      { id: "x", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "SwiGLU Output", type: "tensor", required: true },
    ],
    parameters: [
      { id: "d_model", name: "Model Dimension", type: "number", default: 4096, min: 1, step: 1 },
      { id: "d_ff", name: "FFN Hidden Dimension", type: "number", default: 11008, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn", "import torch.nn.functional as F"],
      body: `class _SwiGLU(nn.Module):
    def __init__(self, d_model, d_ff):
        super().__init__()
        self.w1 = nn.Linear(d_model, d_ff, bias=False)
        self.w2 = nn.Linear(d_ff, d_model, bias=False)
        self.w3 = nn.Linear(d_model, d_ff, bias=False)
    def forward(self, x):
        return self.w2(F.silu(self.w1(x)) * self.w3(x))

_swiglu = _SwiGLU({{params.d_model}}, {{params.d_ff}})
{{outputs.tensor_out}} = _swiglu({{inputs.x}})`,
      outputBindings: { tensor_out: "swiglu_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. MoE Layer (Mixture of Experts)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.moe-layer",
    name: "MoE Layer (Mixture of Experts)",
    category: "transformers-llms",
    description: "Sparse Mixture-of-Experts layer with top-k gating and expert FFNs",
    tags: ["moe", "mixture-of-experts", "sparse", "transformer", "llm"],
    inputs: [
      { id: "x", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "MoE Output", type: "tensor", required: true },
      { id: "router_logits", name: "Router Logits", type: "tensor", required: true },
    ],
    parameters: [
      { id: "d_model", name: "Model Dimension", type: "number", default: 4096, min: 1, step: 1 },
      { id: "d_ff", name: "Expert FFN Dimension", type: "number", default: 11008, min: 1, step: 1 },
      { id: "num_experts", name: "Number of Experts", type: "number", default: 8, min: 2, step: 1 },
      { id: "top_k", name: "Top-K Experts", type: "number", default: 2, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn", "import torch.nn.functional as F"],
      body: `class _MoELayer(nn.Module):
    def __init__(self, d_model, d_ff, num_experts, top_k):
        super().__init__()
        self.gate = nn.Linear(d_model, num_experts, bias=False)
        self.experts = nn.ModuleList([
            nn.Sequential(nn.Linear(d_model, d_ff, bias=False), nn.SiLU(), nn.Linear(d_ff, d_model, bias=False))
            for _ in range(num_experts)
        ])
        self.top_k = top_k
    def forward(self, x):
        logits = self.gate(x)
        weights, indices = torch.topk(F.softmax(logits, dim=-1), self.top_k, dim=-1)
        weights = weights / weights.sum(dim=-1, keepdim=True)
        out = torch.zeros_like(x)
        for i, expert in enumerate(self.experts):
            mask = (indices == i).any(dim=-1)
            if mask.any():
                out[mask] += weights[mask, (indices[mask] == i).nonzero(as_tuple=True)[-1]].unsqueeze(-1) * expert(x[mask])
        return out, logits

_moe = _MoELayer({{params.d_model}}, {{params.d_ff}}, {{params.num_experts}}, {{params.top_k}})
{{outputs.tensor_out}}, {{outputs.router_logits}} = _moe({{inputs.x}})`,
      outputBindings: { tensor_out: "moe_out", router_logits: "moe_router_logits" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Transformer Encoder Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.transformer-encoder-block",
    name: "Transformer Encoder Block",
    category: "transformers-llms",
    description: "Single transformer encoder layer: self-attention + FFN with residual connections and layer norm",
    tags: ["encoder", "transformer", "block", "pytorch"],
    inputs: [
      { id: "x", name: "Input Tensor", type: "tensor", required: true },
      { id: "src_mask", name: "Source Mask", type: "tensor", required: false },
    ],
    outputs: [
      { id: "tensor_out", name: "Encoder Output", type: "tensor", required: true },
    ],
    parameters: [
      { id: "d_model", name: "Model Dimension", type: "number", default: 512, min: 1, step: 1 },
      { id: "nhead", name: "Num Heads", type: "number", default: 8, min: 1, step: 1 },
      { id: "dim_feedforward", name: "FFN Dimension", type: "number", default: 2048, min: 1, step: 1 },
      { id: "dropout", name: "Dropout", type: "number", default: 0.1, min: 0, max: 1, step: 0.05 },
      { id: "activation", name: "Activation", type: "select", default: "relu", options: [{ label: "ReLU", value: "relu" }, { label: "GELU", value: "gelu" }] },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `_enc_layer = nn.TransformerEncoderLayer(
    d_model={{params.d_model}}, nhead={{params.nhead}},
    dim_feedforward={{params.dim_feedforward}}, dropout={{params.dropout}},
    activation="{{params.activation}}", batch_first=True, norm_first=True,
)
{{outputs.tensor_out}} = _enc_layer({{inputs.x}}, src_mask={{inputs.src_mask}})`,
      outputBindings: { tensor_out: "enc_block_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Transformer Decoder Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.transformer-decoder-block",
    name: "Transformer Decoder Block",
    category: "transformers-llms",
    description: "Single transformer decoder layer: masked self-attention + cross-attention + FFN",
    tags: ["decoder", "transformer", "block", "pytorch"],
    inputs: [
      { id: "tgt", name: "Target Tensor", type: "tensor", required: true },
      { id: "memory", name: "Encoder Memory", type: "tensor", required: true },
      { id: "tgt_mask", name: "Target Mask", type: "tensor", required: false },
      { id: "memory_mask", name: "Memory Mask", type: "tensor", required: false },
    ],
    outputs: [
      { id: "tensor_out", name: "Decoder Output", type: "tensor", required: true },
    ],
    parameters: [
      { id: "d_model", name: "Model Dimension", type: "number", default: 512, min: 1, step: 1 },
      { id: "nhead", name: "Num Heads", type: "number", default: 8, min: 1, step: 1 },
      { id: "dim_feedforward", name: "FFN Dimension", type: "number", default: 2048, min: 1, step: 1 },
      { id: "dropout", name: "Dropout", type: "number", default: 0.1, min: 0, max: 1, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `_dec_layer = nn.TransformerDecoderLayer(
    d_model={{params.d_model}}, nhead={{params.nhead}},
    dim_feedforward={{params.dim_feedforward}}, dropout={{params.dropout}},
    batch_first=True, norm_first=True,
)
{{outputs.tensor_out}} = _dec_layer({{inputs.tgt}}, {{inputs.memory}}, tgt_mask={{inputs.tgt_mask}}, memory_mask={{inputs.memory_mask}})`,
      outputBindings: { tensor_out: "dec_block_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. Encoder-Only (BERT-style)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.encoder-only",
    name: "Encoder-Only (BERT-style)",
    category: "transformers-llms",
    description: "Full encoder-only transformer stack (BERT-style) for embeddings and classification",
    tags: ["encoder", "bert", "architecture", "transformer", "huggingface"],
    inputs: [
      { id: "input_ids", name: "Input IDs", type: "tensor", required: true },
      { id: "attention_mask", name: "Attention Mask", type: "tensor", required: false },
    ],
    outputs: [
      { id: "last_hidden", name: "Last Hidden State", type: "tensor", required: true },
      { id: "pooler_output", name: "Pooler Output", type: "tensor", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "bert-base-uncased", placeholder: "e.g. bert-base-uncased, roberta-base" },
    ],
    codeTemplate: {
      imports: ["from transformers import AutoModel"],
      body: `_encoder_model = AutoModel.from_pretrained("{{params.model_name}}")
_encoder_output = _encoder_model(input_ids={{inputs.input_ids}}, attention_mask={{inputs.attention_mask}})
{{outputs.last_hidden}} = _encoder_output.last_hidden_state
{{outputs.pooler_output}} = _encoder_output.pooler_output`,
      outputBindings: { last_hidden: "encoder_hidden", pooler_output: "encoder_pooled" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Decoder-Only (GPT-style)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.decoder-only",
    name: "Decoder-Only (GPT-style)",
    category: "transformers-llms",
    description: "Full decoder-only transformer stack (GPT / LLaMA-style) for causal language modelling",
    tags: ["decoder", "gpt", "llama", "causal-lm", "architecture", "transformer", "huggingface"],
    inputs: [
      { id: "input_ids", name: "Input IDs", type: "tensor", required: true },
      { id: "attention_mask", name: "Attention Mask", type: "tensor", required: false },
    ],
    outputs: [
      { id: "logits", name: "Logits", type: "tensor", required: true },
      { id: "hidden_states", name: "Hidden States", type: "tensor", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "gpt2", placeholder: "e.g. gpt2, meta-llama/Llama-2-7b-hf" },
    ],
    codeTemplate: {
      imports: ["from transformers import AutoModelForCausalLM"],
      body: `_decoder_model = AutoModelForCausalLM.from_pretrained("{{params.model_name}}")
_decoder_output = _decoder_model(input_ids={{inputs.input_ids}}, attention_mask={{inputs.attention_mask}}, output_hidden_states=True)
{{outputs.logits}} = _decoder_output.logits
{{outputs.hidden_states}} = _decoder_output.hidden_states[-1]`,
      outputBindings: { logits: "decoder_logits", hidden_states: "decoder_hidden" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Encoder-Decoder (T5-style)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.encoder-decoder",
    name: "Encoder-Decoder (T5-style)",
    category: "transformers-llms",
    description: "Full encoder-decoder transformer (T5 / BART-style) for seq2seq tasks",
    tags: ["encoder-decoder", "t5", "bart", "seq2seq", "architecture", "transformer", "huggingface"],
    inputs: [
      { id: "input_ids", name: "Encoder Input IDs", type: "tensor", required: true },
      { id: "decoder_input_ids", name: "Decoder Input IDs", type: "tensor", required: false },
      { id: "attention_mask", name: "Attention Mask", type: "tensor", required: false },
    ],
    outputs: [
      { id: "logits", name: "Logits", type: "tensor", required: true },
      { id: "encoder_hidden", name: "Encoder Hidden State", type: "tensor", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "t5-base", placeholder: "e.g. t5-base, google/flan-t5-large" },
    ],
    codeTemplate: {
      imports: ["from transformers import AutoModelForSeq2SeqLM"],
      body: `_enc_dec_model = AutoModelForSeq2SeqLM.from_pretrained("{{params.model_name}}")
_enc_dec_output = _enc_dec_model(
    input_ids={{inputs.input_ids}},
    decoder_input_ids={{inputs.decoder_input_ids}},
    attention_mask={{inputs.attention_mask}},
    output_hidden_states=True,
)
{{outputs.logits}} = _enc_dec_output.logits
{{outputs.encoder_hidden}} = _enc_dec_output.encoder_last_hidden_state`,
      outputBindings: { logits: "seq2seq_logits", encoder_hidden: "seq2seq_enc_hidden" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. Vision Transformer (ViT) Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.vit-block",
    name: "Vision Transformer (ViT) Block",
    category: "transformers-llms",
    description: "Vision Transformer block that processes image patches through transformer layers",
    tags: ["vit", "vision", "transformer", "image", "huggingface"],
    inputs: [
      { id: "pixel_values", name: "Pixel Values", type: "image_batch", required: true, description: "Shape: (batch, channels, height, width)" },
    ],
    outputs: [
      { id: "last_hidden", name: "Last Hidden State", type: "tensor", required: true },
      { id: "cls_token", name: "CLS Token", type: "tensor", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "google/vit-base-patch16-224", placeholder: "e.g. google/vit-base-patch16-224" },
    ],
    codeTemplate: {
      imports: ["from transformers import ViTModel"],
      body: `_vit = ViTModel.from_pretrained("{{params.model_name}}")
_vit_output = _vit(pixel_values={{inputs.pixel_values}})
{{outputs.last_hidden}} = _vit_output.last_hidden_state
{{outputs.cls_token}} = _vit_output.last_hidden_state[:, 0, :]`,
      outputBindings: { last_hidden: "vit_hidden", cls_token: "vit_cls" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. Patch Embed
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.patch-embed",
    name: "Patch Embed",
    category: "transformers-llms",
    description: "Split an image into fixed-size patches and project to embeddings via Conv2d",
    tags: ["patch", "embed", "vit", "vision", "transformer", "pytorch"],
    inputs: [
      { id: "image", name: "Input Image", type: "image_batch", required: true, description: "Shape: (batch, channels, height, width)" },
    ],
    outputs: [
      { id: "patch_embeddings", name: "Patch Embeddings", type: "tensor", required: true, description: "Shape: (batch, num_patches, embed_dim)" },
    ],
    parameters: [
      { id: "img_size", name: "Image Size", type: "number", default: 224, min: 1, step: 1 },
      { id: "patch_size", name: "Patch Size", type: "number", default: 16, min: 1, step: 1 },
      { id: "in_channels", name: "In Channels", type: "number", default: 3, min: 1, step: 1 },
      { id: "embed_dim", name: "Embed Dimension", type: "number", default: 768, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `_patch_proj = nn.Conv2d({{params.in_channels}}, {{params.embed_dim}}, kernel_size={{params.patch_size}}, stride={{params.patch_size}})
_patches = _patch_proj({{inputs.image}})  # (B, embed_dim, H/P, W/P)
{{outputs.patch_embeddings}} = _patches.flatten(2).transpose(1, 2)  # (B, num_patches, embed_dim)`,
      outputBindings: { patch_embeddings: "patch_embeds" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. KV Cache
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.kv-cache",
    name: "KV Cache",
    category: "transformers-llms",
    description: "Manage key-value cache for efficient autoregressive generation",
    tags: ["kv-cache", "cache", "inference", "autoregressive", "transformer", "llm"],
    inputs: [
      { id: "new_key", name: "New Key", type: "tensor", required: true },
      { id: "new_value", name: "New Value", type: "tensor", required: true },
      { id: "past_key", name: "Past Key Cache", type: "tensor", required: false },
      { id: "past_value", name: "Past Value Cache", type: "tensor", required: false },
    ],
    outputs: [
      { id: "cached_key", name: "Cached Key", type: "tensor", required: true },
      { id: "cached_value", name: "Cached Value", type: "tensor", required: true },
    ],
    parameters: [
      { id: "max_cache_len", name: "Max Cache Length", type: "number", default: 4096, min: 1, step: 1, description: "Truncate cache beyond this length" },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `if {{inputs.past_key}} is not None:
    {{outputs.cached_key}} = torch.cat([{{inputs.past_key}}, {{inputs.new_key}}], dim=-2)[:, :, -{{params.max_cache_len}}:, :]
    {{outputs.cached_value}} = torch.cat([{{inputs.past_value}}, {{inputs.new_value}}], dim=-2)[:, :, -{{params.max_cache_len}}:, :]
else:
    {{outputs.cached_key}} = {{inputs.new_key}}
    {{outputs.cached_value}} = {{inputs.new_value}}`,
      outputBindings: { cached_key: "kv_key", cached_value: "kv_value" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. Flash Attention
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.flash-attention",
    name: "Flash Attention",
    category: "transformers-llms",
    description: "Memory-efficient flash attention using PyTorch scaled_dot_product_attention",
    tags: ["attention", "flash", "efficient", "memory", "transformer", "pytorch"],
    inputs: [
      { id: "query", name: "Query", type: "tensor", required: true },
      { id: "key", name: "Key", type: "tensor", required: true },
      { id: "value", name: "Value", type: "tensor", required: true },
      { id: "attn_mask", name: "Attention Mask", type: "tensor", required: false },
    ],
    outputs: [
      { id: "attn_out", name: "Attention Output", type: "tensor", required: true },
    ],
    parameters: [
      { id: "dropout_p", name: "Dropout", type: "number", default: 0.0, min: 0, max: 1, step: 0.05 },
      { id: "is_causal", name: "Is Causal", type: "boolean", default: false },
      { id: "scale", name: "Scale (0 = auto)", type: "number", default: 0, min: 0, step: 0.01 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn.functional as F"],
      body: `_scale = {{params.scale}} if {{params.scale}} > 0 else None
{{outputs.attn_out}} = F.scaled_dot_product_attention(
    {{inputs.query}}, {{inputs.key}}, {{inputs.value}},
    attn_mask={{inputs.attn_mask}}, dropout_p={{params.dropout_p}},
    is_causal={{params.is_causal}}, scale=_scale,
)`,
      outputBindings: { attn_out: "flash_attn_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. Grouped Query Attention (GQA)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.gqa",
    name: "Grouped Query Attention (GQA)",
    category: "transformers-llms",
    description: "Grouped-query attention where multiple query heads share key/value heads (LLaMA-2 style)",
    tags: ["attention", "gqa", "grouped-query", "efficient", "llama", "transformer"],
    inputs: [
      { id: "x", name: "Input Tensor", type: "tensor", required: true, description: "Shape: (batch, seq_len, d_model)" },
    ],
    outputs: [
      { id: "attn_out", name: "GQA Output", type: "tensor", required: true },
    ],
    parameters: [
      { id: "d_model", name: "Model Dimension", type: "number", default: 4096, min: 1, step: 1 },
      { id: "num_heads", name: "Num Query Heads", type: "number", default: 32, min: 1, step: 1 },
      { id: "num_kv_heads", name: "Num KV Heads", type: "number", default: 8, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn", "import torch.nn.functional as F"],
      body: `class _GQA(nn.Module):
    def __init__(self, d_model, num_heads, num_kv_heads):
        super().__init__()
        self.head_dim = d_model // num_heads
        self.num_heads = num_heads
        self.num_kv_heads = num_kv_heads
        self.num_groups = num_heads // num_kv_heads
        self.wq = nn.Linear(d_model, num_heads * self.head_dim, bias=False)
        self.wk = nn.Linear(d_model, num_kv_heads * self.head_dim, bias=False)
        self.wv = nn.Linear(d_model, num_kv_heads * self.head_dim, bias=False)
        self.wo = nn.Linear(num_heads * self.head_dim, d_model, bias=False)
    def forward(self, x):
        B, S, _ = x.shape
        q = self.wq(x).view(B, S, self.num_heads, self.head_dim).transpose(1, 2)
        k = self.wk(x).view(B, S, self.num_kv_heads, self.head_dim).transpose(1, 2)
        v = self.wv(x).view(B, S, self.num_kv_heads, self.head_dim).transpose(1, 2)
        k = k.unsqueeze(2).expand(-1, -1, self.num_groups, -1, -1).reshape(B, self.num_heads, S, self.head_dim)
        v = v.unsqueeze(2).expand(-1, -1, self.num_groups, -1, -1).reshape(B, self.num_heads, S, self.head_dim)
        out = F.scaled_dot_product_attention(q, k, v, is_causal=True)
        return self.wo(out.transpose(1, 2).contiguous().view(B, S, -1))

_gqa = _GQA({{params.d_model}}, {{params.num_heads}}, {{params.num_kv_heads}})
{{outputs.attn_out}} = _gqa({{inputs.x}})`,
      outputBindings: { attn_out: "gqa_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. Multi-Query Attention (MQA)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.mqa",
    name: "Multi-Query Attention (MQA)",
    category: "transformers-llms",
    description: "Multi-query attention where all query heads share a single key/value head",
    tags: ["attention", "mqa", "multi-query", "efficient", "transformer"],
    inputs: [
      { id: "x", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "attn_out", name: "MQA Output", type: "tensor", required: true },
    ],
    parameters: [
      { id: "d_model", name: "Model Dimension", type: "number", default: 512, min: 1, step: 1 },
      { id: "num_heads", name: "Num Query Heads", type: "number", default: 8, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn", "import torch.nn.functional as F"],
      body: `class _MQA(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.head_dim = d_model // num_heads
        self.num_heads = num_heads
        self.wq = nn.Linear(d_model, d_model, bias=False)
        self.wk = nn.Linear(d_model, self.head_dim, bias=False)
        self.wv = nn.Linear(d_model, self.head_dim, bias=False)
        self.wo = nn.Linear(d_model, d_model, bias=False)
    def forward(self, x):
        B, S, _ = x.shape
        q = self.wq(x).view(B, S, self.num_heads, self.head_dim).transpose(1, 2)
        k = self.wk(x).view(B, S, 1, self.head_dim).transpose(1, 2)
        v = self.wv(x).view(B, S, 1, self.head_dim).transpose(1, 2)
        k = k.expand(-1, self.num_heads, -1, -1)
        v = v.expand(-1, self.num_heads, -1, -1)
        out = F.scaled_dot_product_attention(q, k, v, is_causal=True)
        return self.wo(out.transpose(1, 2).contiguous().view(B, S, -1))

_mqa = _MQA({{params.d_model}}, {{params.num_heads}})
{{outputs.attn_out}} = _mqa({{inputs.x}})`,
      outputBindings: { attn_out: "mqa_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. RMS Norm
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.rms-norm",
    name: "RMS Norm",
    category: "transformers-llms",
    description: "Root Mean Square Layer Normalization (used in LLaMA, Gemma, etc.)",
    tags: ["normalization", "rms-norm", "llama", "transformer", "pytorch"],
    inputs: [
      { id: "x", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Normalized Output", type: "tensor", required: true },
    ],
    parameters: [
      { id: "dim", name: "Dimension", type: "number", default: 4096, min: 1, step: 1 },
      { id: "eps", name: "Epsilon", type: "number", default: 1e-6, min: 0, step: 1e-7, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `class _RMSNorm(nn.Module):
    def __init__(self, dim, eps=1e-6):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(dim))
        self.eps = eps
    def forward(self, x):
        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps) * self.weight

_rms_norm = _RMSNorm({{params.dim}}, eps={{params.eps}})
{{outputs.tensor_out}} = _rms_norm({{inputs.x}})`,
      outputBindings: { tensor_out: "rms_norm_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 23. Load Pretrained LLM
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.load-pretrained-llm",
    name: "Load Pretrained LLM",
    category: "transformers-llms",
    description: "Load a pretrained causal LLM from HuggingFace with optional quantization",
    tags: ["llm", "pretrained", "huggingface", "load", "quantization"],
    inputs: [],
    outputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "meta-llama/Llama-2-7b-hf", placeholder: "HuggingFace model ID" },
      { id: "dtype", name: "Dtype", type: "select", default: "auto", options: [{ label: "Auto", value: "auto" }, { label: "float16", value: "float16" }, { label: "bfloat16", value: "bfloat16" }, { label: "float32", value: "float32" }] },
      { id: "device_map", name: "Device Map", type: "select", default: "auto", options: [{ label: "Auto", value: "auto" }, { label: "CPU", value: "cpu" }, { label: "CUDA:0", value: "cuda:0" }] },
      { id: "load_in_4bit", name: "Load in 4-bit", type: "boolean", default: false, description: "Use bitsandbytes 4-bit quantization" },
      { id: "load_in_8bit", name: "Load in 8-bit", type: "boolean", default: false, description: "Use bitsandbytes 8-bit quantization" },
      { id: "trust_remote_code", name: "Trust Remote Code", type: "boolean", default: false, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch", "from transformers import AutoModelForCausalLM, AutoTokenizer"],
      body: `_dtype_map = {"auto": "auto", "float16": torch.float16, "bfloat16": torch.bfloat16, "float32": torch.float32}
_torch_dtype = _dtype_map["{{params.dtype}}"]
{{outputs.model}} = AutoModelForCausalLM.from_pretrained(
    "{{params.model_name}}",
    torch_dtype=_torch_dtype,
    device_map="{{params.device_map}}",
    load_in_4bit={{params.load_in_4bit}},
    load_in_8bit={{params.load_in_8bit}},
    trust_remote_code={{params.trust_remote_code}},
)
{{outputs.tokenizer}} = AutoTokenizer.from_pretrained("{{params.model_name}}", trust_remote_code={{params.trust_remote_code}})`,
      outputBindings: { model: "llm_model", tokenizer: "llm_tokenizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 24. Load Pretrained Encoder
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.load-pretrained-encoder",
    name: "Load Pretrained Encoder",
    category: "transformers-llms",
    description: "Load a pretrained encoder model (BERT, RoBERTa, etc.) for embeddings or classification",
    tags: ["encoder", "pretrained", "bert", "roberta", "huggingface", "load"],
    inputs: [],
    outputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "bert-base-uncased", placeholder: "e.g. bert-base-uncased, roberta-large" },
      { id: "task", name: "Task", type: "select", default: "features", options: [{ label: "Feature Extraction", value: "features" }, { label: "Sequence Classification", value: "classification" }, { label: "Token Classification", value: "token_classification" }] },
      { id: "num_labels", name: "Num Labels (for classification)", type: "number", default: 2, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["from transformers import AutoModel, AutoModelForSequenceClassification, AutoModelForTokenClassification, AutoTokenizer"],
      body: `_task_map = {
    "features": AutoModel,
    "classification": AutoModelForSequenceClassification,
    "token_classification": AutoModelForTokenClassification,
}
_model_cls = _task_map["{{params.task}}"]
_kwargs = {"num_labels": {{params.num_labels}}} if "{{params.task}}" != "features" else {}
{{outputs.model}} = _model_cls.from_pretrained("{{params.model_name}}", **_kwargs)
{{outputs.tokenizer}} = AutoTokenizer.from_pretrained("{{params.model_name}}")`,
      outputBindings: { model: "encoder_model", tokenizer: "encoder_tokenizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 25. Tokenizer (BPE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.tokenizer-bpe",
    name: "Tokenizer (BPE)",
    category: "transformers-llms",
    description: "Byte-Pair Encoding tokenizer (GPT-2 / GPT-style) from HuggingFace",
    tags: ["tokenizer", "bpe", "gpt", "text", "huggingface"],
    inputs: [
      { id: "text", name: "Input Text", type: "text", required: true },
    ],
    outputs: [
      { id: "input_ids", name: "Input IDs", type: "tensor", required: true },
      { id: "attention_mask", name: "Attention Mask", type: "tensor", required: true },
      { id: "tokenizer", name: "Tokenizer Instance", type: "tokenizer", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model / Tokenizer Name", type: "string", default: "gpt2", placeholder: "e.g. gpt2, openai-community/gpt2" },
      { id: "max_length", name: "Max Length", type: "number", default: 512, min: 1, step: 1 },
      { id: "padding", name: "Padding", type: "select", default: "max_length", options: [{ label: "Max Length", value: "max_length" }, { label: "Longest", value: "longest" }, { label: "None", value: "false" }] },
      { id: "truncation", name: "Truncation", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from transformers import AutoTokenizer"],
      body: `{{outputs.tokenizer}} = AutoTokenizer.from_pretrained("{{params.model_name}}")
if {{outputs.tokenizer}}.pad_token is None:
    {{outputs.tokenizer}}.pad_token = {{outputs.tokenizer}}.eos_token
_padding = False if "{{params.padding}}" == "false" else "{{params.padding}}"
_encoded = {{outputs.tokenizer}}({{inputs.text}}, max_length={{params.max_length}}, padding=_padding, truncation={{params.truncation}}, return_tensors="pt")
{{outputs.input_ids}} = _encoded["input_ids"]
{{outputs.attention_mask}} = _encoded["attention_mask"]`,
      outputBindings: { input_ids: "bpe_ids", attention_mask: "bpe_mask", tokenizer: "bpe_tokenizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 26. Tokenizer (SentencePiece)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.tokenizer-sentencepiece",
    name: "Tokenizer (SentencePiece)",
    category: "transformers-llms",
    description: "SentencePiece tokenizer (T5, LLaMA-style) from HuggingFace",
    tags: ["tokenizer", "sentencepiece", "t5", "llama", "text", "huggingface"],
    inputs: [
      { id: "text", name: "Input Text", type: "text", required: true },
    ],
    outputs: [
      { id: "input_ids", name: "Input IDs", type: "tensor", required: true },
      { id: "attention_mask", name: "Attention Mask", type: "tensor", required: true },
      { id: "tokenizer", name: "Tokenizer Instance", type: "tokenizer", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model / Tokenizer Name", type: "string", default: "t5-base", placeholder: "e.g. t5-base, meta-llama/Llama-2-7b-hf" },
      { id: "max_length", name: "Max Length", type: "number", default: 512, min: 1, step: 1 },
      { id: "padding", name: "Padding", type: "select", default: "max_length", options: [{ label: "Max Length", value: "max_length" }, { label: "Longest", value: "longest" }, { label: "None", value: "false" }] },
      { id: "truncation", name: "Truncation", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from transformers import AutoTokenizer"],
      body: `{{outputs.tokenizer}} = AutoTokenizer.from_pretrained("{{params.model_name}}")
_padding = False if "{{params.padding}}" == "false" else "{{params.padding}}"
_encoded = {{outputs.tokenizer}}({{inputs.text}}, max_length={{params.max_length}}, padding=_padding, truncation={{params.truncation}}, return_tensors="pt")
{{outputs.input_ids}} = _encoded["input_ids"]
{{outputs.attention_mask}} = _encoded["attention_mask"]`,
      outputBindings: { input_ids: "sp_ids", attention_mask: "sp_mask", tokenizer: "sp_tokenizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 27. Tokenizer (WordPiece)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.tokenizer-wordpiece",
    name: "Tokenizer (WordPiece)",
    category: "transformers-llms",
    description: "WordPiece tokenizer (BERT-style) from HuggingFace",
    tags: ["tokenizer", "wordpiece", "bert", "text", "huggingface"],
    inputs: [
      { id: "text", name: "Input Text", type: "text", required: true },
    ],
    outputs: [
      { id: "input_ids", name: "Input IDs", type: "tensor", required: true },
      { id: "attention_mask", name: "Attention Mask", type: "tensor", required: true },
      { id: "token_type_ids", name: "Token Type IDs", type: "tensor", required: true },
      { id: "tokenizer", name: "Tokenizer Instance", type: "tokenizer", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model / Tokenizer Name", type: "string", default: "bert-base-uncased", placeholder: "e.g. bert-base-uncased" },
      { id: "max_length", name: "Max Length", type: "number", default: 512, min: 1, step: 1 },
      { id: "padding", name: "Padding", type: "select", default: "max_length", options: [{ label: "Max Length", value: "max_length" }, { label: "Longest", value: "longest" }, { label: "None", value: "false" }] },
      { id: "truncation", name: "Truncation", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from transformers import AutoTokenizer"],
      body: `{{outputs.tokenizer}} = AutoTokenizer.from_pretrained("{{params.model_name}}")
_padding = False if "{{params.padding}}" == "false" else "{{params.padding}}"
_encoded = {{outputs.tokenizer}}({{inputs.text}}, max_length={{params.max_length}}, padding=_padding, truncation={{params.truncation}}, return_tensors="pt")
{{outputs.input_ids}} = _encoded["input_ids"]
{{outputs.attention_mask}} = _encoded["attention_mask"]
{{outputs.token_type_ids}} = _encoded["token_type_ids"]`,
      outputBindings: { input_ids: "wp_ids", attention_mask: "wp_mask", token_type_ids: "wp_type_ids", tokenizer: "wp_tokenizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 28. Context Window Manager
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.context-window-manager",
    name: "Context Window Manager",
    category: "transformers-llms",
    description: "Manage token budget by truncating or sliding-window over conversation history",
    tags: ["context", "window", "truncation", "sliding-window", "llm", "inference"],
    inputs: [
      { id: "messages", name: "Messages", type: "list", required: true, description: "List of {role, content} message dicts" },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    outputs: [
      { id: "trimmed_messages", name: "Trimmed Messages", type: "list", required: true },
      { id: "token_count", name: "Token Count", type: "number", required: true },
    ],
    parameters: [
      { id: "max_tokens", name: "Max Context Tokens", type: "number", default: 4096, min: 1, step: 1 },
      { id: "strategy", name: "Strategy", type: "select", default: "truncate_oldest", options: [{ label: "Truncate Oldest", value: "truncate_oldest" }, { label: "Sliding Window", value: "sliding_window" }, { label: "Summarize Oldest", value: "summarize_oldest" }] },
      { id: "reserve_for_response", name: "Reserve Tokens for Response", type: "number", default: 512, min: 0, step: 1 },
    ],
    codeTemplate: {
      imports: [],
      body: `_budget = {{params.max_tokens}} - {{params.reserve_for_response}}
_messages = list({{inputs.messages}})
_tokenizer = {{inputs.tokenizer}}

def _count_tokens(msgs):
    return sum(len(_tokenizer.encode(m["content"])) for m in msgs)

if "{{params.strategy}}" == "truncate_oldest":
    while _count_tokens(_messages) > _budget and len(_messages) > 1:
        if _messages[0]["role"] == "system":
            _messages.pop(1)
        else:
            _messages.pop(0)
elif "{{params.strategy}}" == "sliding_window":
    system_msgs = [m for m in _messages if m["role"] == "system"]
    other_msgs = [m for m in _messages if m["role"] != "system"]
    while _count_tokens(system_msgs + other_msgs) > _budget and len(other_msgs) > 1:
        other_msgs.pop(0)
    _messages = system_msgs + other_msgs

{{outputs.trimmed_messages}} = _messages
{{outputs.token_count}} = _count_tokens(_messages)`,
      outputBindings: { trimmed_messages: "ctx_messages", token_count: "ctx_token_count" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 29. System Prompt
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.system-prompt",
    name: "System Prompt",
    category: "transformers-llms",
    description: "Define a system prompt message for LLM conversations",
    tags: ["prompt", "system", "chat", "llm", "instruction"],
    inputs: [],
    outputs: [
      { id: "message", name: "System Message", type: "dict", required: true },
      { id: "prompt_text", name: "Prompt Text", type: "text", required: true },
    ],
    parameters: [
      { id: "content", name: "System Prompt", type: "code", default: "You are a helpful assistant.", description: "The system-level instruction for the LLM" },
    ],
    codeTemplate: {
      imports: [],
      body: `{{outputs.prompt_text}} = """{{params.content}}"""
{{outputs.message}} = {"role": "system", "content": {{outputs.prompt_text}}}`,
      outputBindings: { message: "system_message", prompt_text: "system_prompt_text" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 30. LLM Inference (Greedy)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.inference-greedy",
    name: "LLM Inference (Greedy)",
    category: "transformers-llms",
    description: "Run greedy decoding (argmax) on a causal LLM",
    tags: ["inference", "greedy", "decoding", "generation", "llm", "huggingface"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "input_ids", name: "Input IDs", type: "tensor", required: true },
      { id: "attention_mask", name: "Attention Mask", type: "tensor", required: false },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    outputs: [
      { id: "generated_ids", name: "Generated IDs", type: "tensor", required: true },
      { id: "generated_text", name: "Generated Text", type: "text", required: true },
    ],
    parameters: [
      { id: "max_new_tokens", name: "Max New Tokens", type: "number", default: 256, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `with torch.no_grad():
    {{outputs.generated_ids}} = {{inputs.model}}.generate(
        input_ids={{inputs.input_ids}},
        attention_mask={{inputs.attention_mask}},
        max_new_tokens={{params.max_new_tokens}},
        do_sample=False,
    )
{{outputs.generated_text}} = {{inputs.tokenizer}}.decode({{outputs.generated_ids}}[0], skip_special_tokens=True)`,
      outputBindings: { generated_ids: "greedy_ids", generated_text: "greedy_text" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 31. LLM Inference (Beam Search)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.inference-beam-search",
    name: "LLM Inference (Beam Search)",
    category: "transformers-llms",
    description: "Run beam search decoding on a causal LLM for higher-quality outputs",
    tags: ["inference", "beam-search", "decoding", "generation", "llm", "huggingface"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "input_ids", name: "Input IDs", type: "tensor", required: true },
      { id: "attention_mask", name: "Attention Mask", type: "tensor", required: false },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    outputs: [
      { id: "generated_ids", name: "Generated IDs", type: "tensor", required: true },
      { id: "generated_text", name: "Generated Text", type: "text", required: true },
    ],
    parameters: [
      { id: "max_new_tokens", name: "Max New Tokens", type: "number", default: 256, min: 1, step: 1 },
      { id: "num_beams", name: "Num Beams", type: "number", default: 4, min: 2, step: 1 },
      { id: "length_penalty", name: "Length Penalty", type: "number", default: 1.0, min: 0, step: 0.1 },
      { id: "early_stopping", name: "Early Stopping", type: "boolean", default: true },
      { id: "no_repeat_ngram_size", name: "No Repeat N-gram Size", type: "number", default: 3, min: 0, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `with torch.no_grad():
    {{outputs.generated_ids}} = {{inputs.model}}.generate(
        input_ids={{inputs.input_ids}},
        attention_mask={{inputs.attention_mask}},
        max_new_tokens={{params.max_new_tokens}},
        num_beams={{params.num_beams}},
        length_penalty={{params.length_penalty}},
        early_stopping={{params.early_stopping}},
        no_repeat_ngram_size={{params.no_repeat_ngram_size}},
    )
{{outputs.generated_text}} = {{inputs.tokenizer}}.decode({{outputs.generated_ids}}[0], skip_special_tokens=True)`,
      outputBindings: { generated_ids: "beam_ids", generated_text: "beam_text" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 32. LLM Inference (Top-k/Top-p)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.inference-top-k-top-p",
    name: "LLM Inference (Top-k/Top-p)",
    category: "transformers-llms",
    description: "Run nucleus / top-k sampling on a causal LLM for diverse generation",
    tags: ["inference", "sampling", "top-k", "top-p", "nucleus", "decoding", "generation", "llm", "huggingface"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "input_ids", name: "Input IDs", type: "tensor", required: true },
      { id: "attention_mask", name: "Attention Mask", type: "tensor", required: false },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    outputs: [
      { id: "generated_ids", name: "Generated IDs", type: "tensor", required: true },
      { id: "generated_text", name: "Generated Text", type: "text", required: true },
    ],
    parameters: [
      { id: "max_new_tokens", name: "Max New Tokens", type: "number", default: 256, min: 1, step: 1 },
      { id: "temperature", name: "Temperature", type: "number", default: 0.7, min: 0.01, max: 2.0, step: 0.05 },
      { id: "top_k", name: "Top-K", type: "number", default: 50, min: 0, step: 1, description: "0 = disabled" },
      { id: "top_p", name: "Top-P (Nucleus)", type: "number", default: 0.9, min: 0, max: 1, step: 0.05 },
      { id: "repetition_penalty", name: "Repetition Penalty", type: "number", default: 1.0, min: 1.0, max: 2.0, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `with torch.no_grad():
    {{outputs.generated_ids}} = {{inputs.model}}.generate(
        input_ids={{inputs.input_ids}},
        attention_mask={{inputs.attention_mask}},
        max_new_tokens={{params.max_new_tokens}},
        do_sample=True,
        temperature={{params.temperature}},
        top_k={{params.top_k}},
        top_p={{params.top_p}},
        repetition_penalty={{params.repetition_penalty}},
    )
{{outputs.generated_text}} = {{inputs.tokenizer}}.decode({{outputs.generated_ids}}[0], skip_special_tokens=True)`,
      outputBindings: { generated_ids: "sample_ids", generated_text: "sample_text" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 33. Speculative Decoding
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.speculative-decoding",
    name: "Speculative Decoding",
    category: "transformers-llms",
    description: "Use a small draft model to speculate tokens verified by a larger target model for faster inference",
    tags: ["inference", "speculative", "decoding", "acceleration", "llm", "huggingface"],
    inputs: [
      { id: "target_model", name: "Target (Large) Model", type: "model", required: true },
      { id: "draft_model", name: "Draft (Small) Model", type: "model", required: true },
      { id: "input_ids", name: "Input IDs", type: "tensor", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    outputs: [
      { id: "generated_ids", name: "Generated IDs", type: "tensor", required: true },
      { id: "generated_text", name: "Generated Text", type: "text", required: true },
    ],
    parameters: [
      { id: "max_new_tokens", name: "Max New Tokens", type: "number", default: 256, min: 1, step: 1 },
      { id: "num_assistant_tokens", name: "Draft Tokens per Step", type: "number", default: 5, min: 1, max: 20, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `with torch.no_grad():
    {{outputs.generated_ids}} = {{inputs.target_model}}.generate(
        input_ids={{inputs.input_ids}},
        max_new_tokens={{params.max_new_tokens}},
        assistant_model={{inputs.draft_model}},
        do_sample=False,
    )
{{outputs.generated_text}} = {{inputs.tokenizer}}.decode({{outputs.generated_ids}}[0], skip_special_tokens=True)`,
      outputBindings: { generated_ids: "spec_ids", generated_text: "spec_text" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 34. Streaming Token Output
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.streaming-token-output",
    name: "Streaming Token Output",
    category: "transformers-llms",
    description: "Stream generated tokens one-by-one using a TextIteratorStreamer",
    tags: ["inference", "streaming", "generation", "llm", "huggingface"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "input_ids", name: "Input IDs", type: "tensor", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    outputs: [
      { id: "streamer", name: "Token Streamer", type: "any", required: true },
      { id: "thread", name: "Generation Thread", type: "any", required: true },
    ],
    parameters: [
      { id: "max_new_tokens", name: "Max New Tokens", type: "number", default: 512, min: 1, step: 1 },
      { id: "temperature", name: "Temperature", type: "number", default: 0.7, min: 0.01, max: 2.0, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "from threading import Thread", "from transformers import TextIteratorStreamer"],
      body: `{{outputs.streamer}} = TextIteratorStreamer({{inputs.tokenizer}}, skip_prompt=True, skip_special_tokens=True)
_gen_kwargs = dict(
    input_ids={{inputs.input_ids}},
    max_new_tokens={{params.max_new_tokens}},
    do_sample=True,
    temperature={{params.temperature}},
    streamer={{outputs.streamer}},
)
{{outputs.thread}} = Thread(target={{inputs.model}}.generate, kwargs=_gen_kwargs)
{{outputs.thread}}.start()
# Consume streamer: for token_text in {{outputs.streamer}}: print(token_text, end="", flush=True)`,
      outputBindings: { streamer: "token_streamer", thread: "gen_thread" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 35. Structured Output (JSON mode)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.structured-output-json",
    name: "Structured Output (JSON mode)",
    category: "transformers-llms",
    description: "Constrain LLM output to valid JSON using vLLM guided decoding or outlines",
    tags: ["inference", "json", "structured", "constrained", "vllm", "llm"],
    inputs: [
      { id: "prompt", name: "Prompt", type: "text", required: true },
    ],
    outputs: [
      { id: "json_output", name: "Parsed JSON", type: "dict", required: true },
      { id: "raw_text", name: "Raw Text", type: "text", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "meta-llama/Llama-2-7b-hf" },
      { id: "json_schema", name: "JSON Schema", type: "code", default: '{"type": "object", "properties": {"answer": {"type": "string"}}, "required": ["answer"]}', description: "JSON Schema to constrain output" },
      { id: "max_tokens", name: "Max Tokens", type: "number", default: 512, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import json", "from vllm import LLM, SamplingParams"],
      body: `_llm = LLM(model="{{params.model_name}}")
_schema = json.loads('''{{params.json_schema}}''')
_sampling = SamplingParams(max_tokens={{params.max_tokens}}, temperature=0)
_result = _llm.generate(
    [{{inputs.prompt}}],
    sampling_params=_sampling,
    guided_options_request={"guided_json": _schema},
)
{{outputs.raw_text}} = _result[0].outputs[0].text
{{outputs.json_output}} = json.loads({{outputs.raw_text}})`,
      outputBindings: { json_output: "structured_json", raw_text: "structured_raw" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 36. Tool Call / Function Calling
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.tool-call-function-calling",
    name: "Tool Call / Function Calling",
    category: "transformers-llms",
    description: "Enable function/tool calling with a chat model using HuggingFace chat templates",
    tags: ["tool-call", "function-calling", "chat", "agent", "llm", "huggingface"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
      { id: "messages", name: "Messages", type: "list", required: true },
      { id: "tools", name: "Tool Definitions", type: "list", required: true, description: "List of tool/function JSON schemas" },
    ],
    outputs: [
      { id: "response", name: "Model Response", type: "dict", required: true },
      { id: "tool_calls", name: "Tool Calls", type: "list", required: true },
    ],
    parameters: [
      { id: "max_new_tokens", name: "Max New Tokens", type: "number", default: 512, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import json"],
      body: `_chat_input = {{inputs.tokenizer}}.apply_chat_template(
    {{inputs.messages}},
    tools={{inputs.tools}},
    return_tensors="pt",
    return_dict=True,
).to({{inputs.model}}.device)
with torch.no_grad():
    _gen_ids = {{inputs.model}}.generate(**_chat_input, max_new_tokens={{params.max_new_tokens}})
_new_tokens = _gen_ids[0][_chat_input["input_ids"].shape[1]:]
_decoded = {{inputs.tokenizer}}.decode(_new_tokens, skip_special_tokens=True)
try:
    {{outputs.tool_calls}} = json.loads(_decoded) if _decoded.strip().startswith("[") else []
except json.JSONDecodeError:
    {{outputs.tool_calls}} = []
{{outputs.response}} = {"role": "assistant", "content": _decoded, "tool_calls": {{outputs.tool_calls}}}`,
      outputBindings: { response: "tool_response", tool_calls: "parsed_tool_calls" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 37. Multi-Turn Conversation Manager
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "transformers-llms.multi-turn-conversation",
    name: "Multi-Turn Conversation Manager",
    category: "transformers-llms",
    description: "Manage a multi-turn chat conversation with history, applying a chat template for generation",
    tags: ["chat", "conversation", "multi-turn", "history", "llm", "huggingface"],
    inputs: [
      { id: "model", name: "Model", type: "model", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
      { id: "user_message", name: "User Message", type: "text", required: true },
      { id: "history", name: "Conversation History", type: "list", required: false, description: "List of prior {role, content} messages" },
    ],
    outputs: [
      { id: "assistant_reply", name: "Assistant Reply", type: "text", required: true },
      { id: "updated_history", name: "Updated History", type: "list", required: true },
    ],
    parameters: [
      { id: "max_new_tokens", name: "Max New Tokens", type: "number", default: 512, min: 1, step: 1 },
      { id: "temperature", name: "Temperature", type: "number", default: 0.7, min: 0.01, max: 2.0, step: 0.05 },
      { id: "system_prompt", name: "System Prompt", type: "code", default: "You are a helpful assistant." },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `_history = list({{inputs.history}} or [])
if not _history or _history[0].get("role") != "system":
    _history.insert(0, {"role": "system", "content": "{{params.system_prompt}}"})
_history.append({"role": "user", "content": {{inputs.user_message}}})

_chat_input = {{inputs.tokenizer}}.apply_chat_template(
    _history, return_tensors="pt", return_dict=True,
).to({{inputs.model}}.device)
with torch.no_grad():
    _gen_ids = {{inputs.model}}.generate(
        **_chat_input,
        max_new_tokens={{params.max_new_tokens}},
        do_sample=True,
        temperature={{params.temperature}},
    )
_new_tokens = _gen_ids[0][_chat_input["input_ids"].shape[1]:]
{{outputs.assistant_reply}} = {{inputs.tokenizer}}.decode(_new_tokens, skip_special_tokens=True)
_history.append({"role": "assistant", "content": {{outputs.assistant_reply}}})
{{outputs.updated_history}} = _history`,
      outputBindings: { assistant_reply: "assistant_text", updated_history: "chat_history" },
    },
  },
];
