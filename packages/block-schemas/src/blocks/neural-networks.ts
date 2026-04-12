import type { BlockDefinition } from "../types.js";

export const neuralNetworkBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Dense Layer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.dense-layer",
    name: "Dense Layer",
    category: "neural-networks",
    description: "Fully-connected linear layer (torch.nn.Linear)",
    tags: ["layer", "dense", "linear", "fully-connected", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "in_features", name: "In Features", type: "number", default: 256, min: 1, step: 1 },
      { id: "out_features", name: "Out Features", type: "number", default: 128, min: 1, step: 1 },
      { id: "bias", name: "Bias", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `_dense = nn.Linear(in_features={{params.in_features}}, out_features={{params.out_features}}, bias={{params.bias}})
{{outputs.tensor_out}} = _dense({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "dense_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Dropout Layer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.dropout-layer",
    name: "Dropout Layer",
    category: "neural-networks",
    description: "Randomly zeroes elements during training for regularization",
    tags: ["layer", "dropout", "regularization", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "p", name: "Dropout Probability", type: "number", default: 0.5, min: 0, max: 1, step: 0.05 },
      { id: "inplace", name: "In-place", type: "boolean", default: false, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_dropout = nn.Dropout(p={{params.p}}, inplace={{params.inplace}})
{{outputs.tensor_out}} = _dropout({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "dropout_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Batch Norm Layer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.batch-norm",
    name: "Batch Norm Layer",
    category: "neural-networks",
    description: "Batch normalization over a mini-batch (normalizes per-channel)",
    tags: ["layer", "normalization", "batch-norm", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "num_features", name: "Num Features / Channels", type: "number", default: 64, min: 1, step: 1 },
      { id: "eps", name: "Epsilon", type: "number", default: 1e-5, min: 0, step: 1e-6, advanced: true },
      { id: "momentum", name: "Momentum", type: "number", default: 0.1, min: 0, max: 1, step: 0.01, advanced: true },
      { id: "affine", name: "Affine", type: "boolean", default: true, description: "Learnable affine parameters", advanced: true },
      { id: "dims", name: "Dimensions", type: "select", default: "2d", options: [{ label: "1D (BatchNorm1d)", value: "1d" }, { label: "2D (BatchNorm2d)", value: "2d" }, { label: "3D (BatchNorm3d)", value: "3d" }] },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_bn_cls = {"1d": nn.BatchNorm1d, "2d": nn.BatchNorm2d, "3d": nn.BatchNorm3d}["{{params.dims}}"]
_bn = _bn_cls(num_features={{params.num_features}}, eps={{params.eps}}, momentum={{params.momentum}}, affine={{params.affine}})
{{outputs.tensor_out}} = _bn({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "bn_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Layer Norm
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.layer-norm",
    name: "Layer Norm",
    category: "neural-networks",
    description: "Layer normalization across the feature dimension",
    tags: ["layer", "normalization", "layer-norm", "pytorch", "transformer"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "normalized_shape", name: "Normalized Shape", type: "string", default: "256", placeholder: "256 or 32,64", description: "Shape of the last dimensions to normalize (comma-separated)" },
      { id: "eps", name: "Epsilon", type: "number", default: 1e-5, min: 0, step: 1e-6, advanced: true },
      { id: "elementwise_affine", name: "Elementwise Affine", type: "boolean", default: true, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_normalized_shape = [int(x.strip()) for x in "{{params.normalized_shape}}".split(",")]
_ln = nn.LayerNorm(normalized_shape=_normalized_shape, eps={{params.eps}}, elementwise_affine={{params.elementwise_affine}})
{{outputs.tensor_out}} = _ln({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "ln_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Conv1D Layer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.conv1d",
    name: "Conv1D Layer",
    category: "neural-networks",
    description: "1D convolution over temporal / sequential data",
    tags: ["layer", "convolution", "conv1d", "temporal", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true, description: "Shape: (batch, channels, length)" },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "in_channels", name: "In Channels", type: "number", default: 1, min: 1, step: 1 },
      { id: "out_channels", name: "Out Channels", type: "number", default: 32, min: 1, step: 1 },
      { id: "kernel_size", name: "Kernel Size", type: "number", default: 3, min: 1, step: 1 },
      { id: "stride", name: "Stride", type: "number", default: 1, min: 1, step: 1 },
      { id: "padding", name: "Padding", type: "number", default: 0, min: 0, step: 1 },
      { id: "bias", name: "Bias", type: "boolean", default: true, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_conv1d = nn.Conv1d(in_channels={{params.in_channels}}, out_channels={{params.out_channels}}, kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}}, bias={{params.bias}})
{{outputs.tensor_out}} = _conv1d({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "conv1d_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Conv2D Layer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.conv2d",
    name: "Conv2D Layer",
    category: "neural-networks",
    description: "2D convolution over spatial data (images)",
    tags: ["layer", "convolution", "conv2d", "spatial", "image", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true, description: "Shape: (batch, channels, height, width)" },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "in_channels", name: "In Channels", type: "number", default: 3, min: 1, step: 1 },
      { id: "out_channels", name: "Out Channels", type: "number", default: 64, min: 1, step: 1 },
      { id: "kernel_size", name: "Kernel Size", type: "number", default: 3, min: 1, step: 1 },
      { id: "stride", name: "Stride", type: "number", default: 1, min: 1, step: 1 },
      { id: "padding", name: "Padding", type: "number", default: 1, min: 0, step: 1 },
      { id: "groups", name: "Groups", type: "number", default: 1, min: 1, step: 1, advanced: true },
      { id: "bias", name: "Bias", type: "boolean", default: true, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_conv2d = nn.Conv2d(in_channels={{params.in_channels}}, out_channels={{params.out_channels}}, kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}}, groups={{params.groups}}, bias={{params.bias}})
{{outputs.tensor_out}} = _conv2d({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "conv2d_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Conv3D Layer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.conv3d",
    name: "Conv3D Layer",
    category: "neural-networks",
    description: "3D convolution over volumetric / video data",
    tags: ["layer", "convolution", "conv3d", "volumetric", "video", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true, description: "Shape: (batch, channels, depth, height, width)" },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "in_channels", name: "In Channels", type: "number", default: 1, min: 1, step: 1 },
      { id: "out_channels", name: "Out Channels", type: "number", default: 32, min: 1, step: 1 },
      { id: "kernel_size", name: "Kernel Size", type: "number", default: 3, min: 1, step: 1 },
      { id: "stride", name: "Stride", type: "number", default: 1, min: 1, step: 1 },
      { id: "padding", name: "Padding", type: "number", default: 1, min: 0, step: 1 },
      { id: "bias", name: "Bias", type: "boolean", default: true, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_conv3d = nn.Conv3d(in_channels={{params.in_channels}}, out_channels={{params.out_channels}}, kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}}, bias={{params.bias}})
{{outputs.tensor_out}} = _conv3d({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "conv3d_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Depthwise Conv
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.depthwise-conv",
    name: "Depthwise Conv",
    category: "neural-networks",
    description: "Depthwise separable convolution — each channel is convolved independently",
    tags: ["layer", "convolution", "depthwise", "separable", "efficient", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true, description: "Shape: (batch, channels, height, width)" },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "in_channels", name: "In Channels", type: "number", default: 32, min: 1, step: 1 },
      { id: "kernel_size", name: "Kernel Size", type: "number", default: 3, min: 1, step: 1 },
      { id: "stride", name: "Stride", type: "number", default: 1, min: 1, step: 1 },
      { id: "padding", name: "Padding", type: "number", default: 1, min: 0, step: 1 },
      { id: "bias", name: "Bias", type: "boolean", default: false, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `# Depthwise: groups == in_channels, out_channels == in_channels
_dw_conv = nn.Conv2d(in_channels={{params.in_channels}}, out_channels={{params.in_channels}}, kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}}, groups={{params.in_channels}}, bias={{params.bias}})
{{outputs.tensor_out}} = _dw_conv({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "dw_conv_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Transposed Conv
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.transposed-conv",
    name: "Transposed Conv",
    category: "neural-networks",
    description: "Transposed (fractionally-strided) 2D convolution for upsampling",
    tags: ["layer", "convolution", "transposed", "deconv", "upsampling", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "in_channels", name: "In Channels", type: "number", default: 64, min: 1, step: 1 },
      { id: "out_channels", name: "Out Channels", type: "number", default: 32, min: 1, step: 1 },
      { id: "kernel_size", name: "Kernel Size", type: "number", default: 4, min: 1, step: 1 },
      { id: "stride", name: "Stride", type: "number", default: 2, min: 1, step: 1 },
      { id: "padding", name: "Padding", type: "number", default: 1, min: 0, step: 1 },
      { id: "output_padding", name: "Output Padding", type: "number", default: 0, min: 0, step: 1, advanced: true },
      { id: "bias", name: "Bias", type: "boolean", default: true, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_tconv = nn.ConvTranspose2d(in_channels={{params.in_channels}}, out_channels={{params.out_channels}}, kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}}, output_padding={{params.output_padding}}, bias={{params.bias}})
{{outputs.tensor_out}} = _tconv({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "tconv_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. MaxPool
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.maxpool",
    name: "MaxPool",
    category: "neural-networks",
    description: "Max pooling over spatial dimensions to downsample feature maps",
    tags: ["layer", "pooling", "maxpool", "downsample", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "kernel_size", name: "Kernel Size", type: "number", default: 2, min: 1, step: 1 },
      { id: "stride", name: "Stride", type: "number", default: 2, min: 1, step: 1 },
      { id: "padding", name: "Padding", type: "number", default: 0, min: 0, step: 1 },
      { id: "dims", name: "Dimensions", type: "select", default: "2d", options: [{ label: "1D", value: "1d" }, { label: "2D", value: "2d" }, { label: "3D", value: "3d" }] },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_pool_cls = {"1d": nn.MaxPool1d, "2d": nn.MaxPool2d, "3d": nn.MaxPool3d}["{{params.dims}}"]
_maxpool = _pool_cls(kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}})
{{outputs.tensor_out}} = _maxpool({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "maxpool_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. AvgPool
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.avgpool",
    name: "AvgPool",
    category: "neural-networks",
    description: "Average pooling over spatial dimensions",
    tags: ["layer", "pooling", "avgpool", "downsample", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "kernel_size", name: "Kernel Size", type: "number", default: 2, min: 1, step: 1 },
      { id: "stride", name: "Stride", type: "number", default: 2, min: 1, step: 1 },
      { id: "padding", name: "Padding", type: "number", default: 0, min: 0, step: 1 },
      { id: "dims", name: "Dimensions", type: "select", default: "2d", options: [{ label: "1D", value: "1d" }, { label: "2D", value: "2d" }, { label: "3D", value: "3d" }] },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_pool_cls = {"1d": nn.AvgPool1d, "2d": nn.AvgPool2d, "3d": nn.AvgPool3d}["{{params.dims}}"]
_avgpool = _pool_cls(kernel_size={{params.kernel_size}}, stride={{params.stride}}, padding={{params.padding}})
{{outputs.tensor_out}} = _avgpool({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "avgpool_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. GlobalAvgPool
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.global-avgpool",
    name: "GlobalAvgPool",
    category: "neural-networks",
    description: "Global average pooling — reduces each channel to a single value",
    tags: ["layer", "pooling", "global", "avgpool", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "dims", name: "Dimensions", type: "select", default: "2d", options: [{ label: "1D", value: "1d" }, { label: "2D", value: "2d" }] },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_gap_cls = {"1d": nn.AdaptiveAvgPool1d, "2d": nn.AdaptiveAvgPool2d}["{{params.dims}}"]
_gap = _gap_cls(1)
{{outputs.tensor_out}} = _gap({{inputs.tensor_in}}).flatten(1)`,
      outputBindings: { tensor_out: "gap_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. Flatten Layer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.flatten",
    name: "Flatten Layer",
    category: "neural-networks",
    description: "Flattens contiguous dimensions into a single dimension",
    tags: ["layer", "flatten", "reshape", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "start_dim", name: "Start Dim", type: "number", default: 1, min: 0, step: 1, description: "First dim to flatten" },
      { id: "end_dim", name: "End Dim", type: "number", default: -1, step: 1, description: "Last dim to flatten" },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_flatten = nn.Flatten(start_dim={{params.start_dim}}, end_dim={{params.end_dim}})
{{outputs.tensor_out}} = _flatten({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "flat_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Reshape Layer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.reshape",
    name: "Reshape Layer",
    category: "neural-networks",
    description: "Reshapes a tensor to a given target shape (preserving batch dim)",
    tags: ["layer", "reshape", "view", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "shape", name: "Target Shape", type: "string", default: "-1, 16, 16", placeholder: "-1, 16, 16", description: "Target shape (excluding batch). Use -1 for inferred dim." },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `_shape = tuple(int(x.strip()) for x in "{{params.shape}}".split(","))
{{outputs.tensor_out}} = {{inputs.tensor_in}}.view({{inputs.tensor_in}}.size(0), *_shape)`,
      outputBindings: { tensor_out: "reshaped_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Embedding Layer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.embedding",
    name: "Embedding Layer",
    category: "neural-networks",
    description: "Lookup table that maps integer indices to dense vectors",
    tags: ["layer", "embedding", "lookup", "nlp", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Indices", type: "tensor", required: true, description: "LongTensor of indices" },
    ],
    outputs: [
      { id: "tensor_out", name: "Embeddings", type: "tensor", required: true },
    ],
    parameters: [
      { id: "num_embeddings", name: "Vocab Size", type: "number", default: 30000, min: 1, step: 1 },
      { id: "embedding_dim", name: "Embedding Dim", type: "number", default: 256, min: 1, step: 1 },
      { id: "padding_idx", name: "Padding Index", type: "number", default: 0, min: 0, step: 1, description: "Index that outputs all zeros", advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_emb = nn.Embedding(num_embeddings={{params.num_embeddings}}, embedding_dim={{params.embedding_dim}}, padding_idx={{params.padding_idx}})
{{outputs.tensor_out}} = _emb({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "emb_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. LSTM Layer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.lstm",
    name: "LSTM Layer",
    category: "neural-networks",
    description: "Long Short-Term Memory recurrent layer",
    tags: ["layer", "rnn", "lstm", "recurrent", "sequence", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true, description: "Shape: (batch, seq_len, input_size) if batch_first" },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
      { id: "hidden", name: "Hidden State", type: "tensor", required: false },
    ],
    parameters: [
      { id: "input_size", name: "Input Size", type: "number", default: 256, min: 1, step: 1 },
      { id: "hidden_size", name: "Hidden Size", type: "number", default: 128, min: 1, step: 1 },
      { id: "num_layers", name: "Num Layers", type: "number", default: 1, min: 1, step: 1 },
      { id: "batch_first", name: "Batch First", type: "boolean", default: true },
      { id: "dropout", name: "Dropout", type: "number", default: 0.0, min: 0, max: 1, step: 0.05, description: "Dropout between LSTM layers (>1 layer)", advanced: true },
      { id: "bidirectional", name: "Bidirectional", type: "boolean", default: false, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_lstm = nn.LSTM(input_size={{params.input_size}}, hidden_size={{params.hidden_size}}, num_layers={{params.num_layers}}, batch_first={{params.batch_first}}, dropout={{params.dropout}}, bidirectional={{params.bidirectional}})
{{outputs.tensor_out}}, ({{outputs.hidden}}, _cell) = _lstm({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "lstm_out", hidden: "lstm_hidden" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. GRU Layer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.gru",
    name: "GRU Layer",
    category: "neural-networks",
    description: "Gated Recurrent Unit layer — lighter alternative to LSTM",
    tags: ["layer", "rnn", "gru", "recurrent", "sequence", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
      { id: "hidden", name: "Hidden State", type: "tensor", required: false },
    ],
    parameters: [
      { id: "input_size", name: "Input Size", type: "number", default: 256, min: 1, step: 1 },
      { id: "hidden_size", name: "Hidden Size", type: "number", default: 128, min: 1, step: 1 },
      { id: "num_layers", name: "Num Layers", type: "number", default: 1, min: 1, step: 1 },
      { id: "batch_first", name: "Batch First", type: "boolean", default: true },
      { id: "dropout", name: "Dropout", type: "number", default: 0.0, min: 0, max: 1, step: 0.05, advanced: true },
      { id: "bidirectional", name: "Bidirectional", type: "boolean", default: false, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_gru = nn.GRU(input_size={{params.input_size}}, hidden_size={{params.hidden_size}}, num_layers={{params.num_layers}}, batch_first={{params.batch_first}}, dropout={{params.dropout}}, bidirectional={{params.bidirectional}})
{{outputs.tensor_out}}, {{outputs.hidden}} = _gru({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "gru_out", hidden: "gru_hidden" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. Bidirectional Wrapper
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.bidirectional-wrapper",
    name: "Bidirectional Wrapper",
    category: "neural-networks",
    description: "Wraps any RNN module to process sequences in both directions",
    tags: ["layer", "rnn", "bidirectional", "wrapper", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
      { id: "hidden", name: "Hidden State", type: "tensor", required: false },
    ],
    parameters: [
      { id: "rnn_type", name: "RNN Type", type: "select", default: "LSTM", options: [{ label: "LSTM", value: "LSTM" }, { label: "GRU", value: "GRU" }, { label: "RNN", value: "RNN" }] },
      { id: "input_size", name: "Input Size", type: "number", default: 256, min: 1, step: 1 },
      { id: "hidden_size", name: "Hidden Size", type: "number", default: 128, min: 1, step: 1 },
      { id: "num_layers", name: "Num Layers", type: "number", default: 1, min: 1, step: 1 },
      { id: "batch_first", name: "Batch First", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_rnn_cls = {"LSTM": nn.LSTM, "GRU": nn.GRU, "RNN": nn.RNN}["{{params.rnn_type}}"]
_birnn = _rnn_cls(input_size={{params.input_size}}, hidden_size={{params.hidden_size}}, num_layers={{params.num_layers}}, batch_first={{params.batch_first}}, bidirectional=True)
{{outputs.tensor_out}}, {{outputs.hidden}} = _birnn({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "birnn_out", hidden: "birnn_hidden" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. 1D RNN
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.rnn-1d",
    name: "1D RNN",
    category: "neural-networks",
    description: "Vanilla (Elman) recurrent neural network layer",
    tags: ["layer", "rnn", "recurrent", "sequence", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
      { id: "hidden", name: "Hidden State", type: "tensor", required: false },
    ],
    parameters: [
      { id: "input_size", name: "Input Size", type: "number", default: 256, min: 1, step: 1 },
      { id: "hidden_size", name: "Hidden Size", type: "number", default: 128, min: 1, step: 1 },
      { id: "num_layers", name: "Num Layers", type: "number", default: 1, min: 1, step: 1 },
      { id: "nonlinearity", name: "Nonlinearity", type: "select", default: "tanh", options: [{ label: "Tanh", value: "tanh" }, { label: "ReLU", value: "relu" }] },
      { id: "batch_first", name: "Batch First", type: "boolean", default: true },
      { id: "dropout", name: "Dropout", type: "number", default: 0.0, min: 0, max: 1, step: 0.05, advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_rnn = nn.RNN(input_size={{params.input_size}}, hidden_size={{params.hidden_size}}, num_layers={{params.num_layers}}, nonlinearity="{{params.nonlinearity}}", batch_first={{params.batch_first}}, dropout={{params.dropout}})
{{outputs.tensor_out}}, {{outputs.hidden}} = _rnn({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "rnn_out", hidden: "rnn_hidden" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. TCN (Temporal Conv Net)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.tcn",
    name: "TCN (Temporal Conv Net)",
    category: "neural-networks",
    description: "Temporal Convolutional Network with dilated causal convolutions",
    tags: ["layer", "tcn", "temporal", "convolution", "causal", "sequence", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true, description: "Shape: (batch, channels, seq_len)" },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "in_channels", name: "In Channels", type: "number", default: 1, min: 1, step: 1 },
      { id: "out_channels", name: "Out Channels", type: "number", default: 64, min: 1, step: 1 },
      { id: "kernel_size", name: "Kernel Size", type: "number", default: 3, min: 1, step: 1 },
      { id: "num_layers", name: "Num Layers", type: "number", default: 4, min: 1, step: 1, description: "Number of dilated conv layers (dilation doubles each layer)" },
      { id: "dropout", name: "Dropout", type: "number", default: 0.1, min: 0, max: 1, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `class _TCNBlock(nn.Module):
    def __init__(self, in_ch, out_ch, ks, dilation, dropout):
        super().__init__()
        padding = (ks - 1) * dilation
        self.conv = nn.Conv1d(in_ch, out_ch, ks, padding=padding, dilation=dilation)
        self.chomp = padding
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.downsample = nn.Conv1d(in_ch, out_ch, 1) if in_ch != out_ch else None
    def forward(self, x):
        out = self.conv(x)[:, :, :x.size(2)]
        out = self.dropout(self.relu(out))
        res = x if self.downsample is None else self.downsample(x)
        return self.relu(out + res)

_layers = []
for i in range({{params.num_layers}}):
    _in_ch = {{params.in_channels}} if i == 0 else {{params.out_channels}}
    _layers.append(_TCNBlock(_in_ch, {{params.out_channels}}, {{params.kernel_size}}, dilation=2**i, dropout={{params.dropout}}))
_tcn = nn.Sequential(*_layers)
{{outputs.tensor_out}} = _tcn({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "tcn_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. ReLU
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.relu",
    name: "ReLU",
    category: "neural-networks",
    description: "Rectified Linear Unit activation: max(0, x)",
    tags: ["activation", "relu", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "inplace", name: "In-place", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.tensor_out}} = nn.ReLU(inplace={{params.inplace}})({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "relu_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. GELU
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.gelu",
    name: "GELU",
    category: "neural-networks",
    description: "Gaussian Error Linear Unit activation — smooth approximation of ReLU",
    tags: ["activation", "gelu", "transformer", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "approximate", name: "Approximate", type: "select", default: "none", options: [{ label: "None (exact)", value: "none" }, { label: "Tanh", value: "tanh" }] },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.tensor_out}} = nn.GELU(approximate="{{params.approximate}}")({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "gelu_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 23. SiLU/Swish
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.silu",
    name: "SiLU/Swish",
    category: "neural-networks",
    description: "Sigmoid-weighted Linear Unit: x * sigmoid(x)",
    tags: ["activation", "silu", "swish", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "inplace", name: "In-place", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.tensor_out}} = nn.SiLU(inplace={{params.inplace}})({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "silu_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 24. Sigmoid
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.sigmoid",
    name: "Sigmoid",
    category: "neural-networks",
    description: "Sigmoid activation: 1 / (1 + exp(-x))",
    tags: ["activation", "sigmoid", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.tensor_out}} = nn.Sigmoid()({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "sigmoid_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 25. Tanh
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.tanh",
    name: "Tanh",
    category: "neural-networks",
    description: "Hyperbolic tangent activation",
    tags: ["activation", "tanh", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.tensor_out}} = nn.Tanh()({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "tanh_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 26. Softmax
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.softmax",
    name: "Softmax",
    category: "neural-networks",
    description: "Softmax activation over a specified dimension",
    tags: ["activation", "softmax", "probability", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "dim", name: "Dimension", type: "number", default: -1, step: 1, description: "Dimension along which to apply softmax" },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.tensor_out}} = nn.Softmax(dim={{params.dim}})({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "softmax_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 27. ELU
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.elu",
    name: "ELU",
    category: "neural-networks",
    description: "Exponential Linear Unit: alpha * (exp(x) - 1) for x < 0",
    tags: ["activation", "elu", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "alpha", name: "Alpha", type: "number", default: 1.0, min: 0, step: 0.1 },
      { id: "inplace", name: "In-place", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.tensor_out}} = nn.ELU(alpha={{params.alpha}}, inplace={{params.inplace}})({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "elu_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 28. PReLU
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.prelu",
    name: "PReLU",
    category: "neural-networks",
    description: "Parametric ReLU with learnable slope for negative values",
    tags: ["activation", "prelu", "learnable", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "num_parameters", name: "Num Parameters", type: "number", default: 1, min: 1, step: 1, description: "Number of learnable slopes (1 or num_channels)" },
      { id: "init", name: "Init Value", type: "number", default: 0.25, min: 0, step: 0.01 },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_prelu = nn.PReLU(num_parameters={{params.num_parameters}}, init={{params.init}})
{{outputs.tensor_out}} = _prelu({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "prelu_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 29. LeakyReLU
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.leaky-relu",
    name: "LeakyReLU",
    category: "neural-networks",
    description: "Leaky ReLU: allows small gradient for negative values",
    tags: ["activation", "leaky-relu", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "negative_slope", name: "Negative Slope", type: "number", default: 0.01, min: 0, step: 0.01 },
      { id: "inplace", name: "In-place", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.tensor_out}} = nn.LeakyReLU(negative_slope={{params.negative_slope}}, inplace={{params.inplace}})({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "leaky_relu_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 30. Mish
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.mish",
    name: "Mish",
    category: "neural-networks",
    description: "Mish activation: x * tanh(softplus(x))",
    tags: ["activation", "mish", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "inplace", name: "In-place", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.tensor_out}} = nn.Mish(inplace={{params.inplace}})({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "mish_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 31. Residual Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.residual-block",
    name: "Residual Block",
    category: "neural-networks",
    description: "Standard ResNet-style residual block with skip connection",
    tags: ["block", "residual", "resnet", "skip-connection", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true, description: "Shape: (batch, channels, H, W)" },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "in_channels", name: "In Channels", type: "number", default: 64, min: 1, step: 1 },
      { id: "out_channels", name: "Out Channels", type: "number", default: 64, min: 1, step: 1 },
      { id: "stride", name: "Stride", type: "number", default: 1, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `class _ResidualBlock(nn.Module):
    def __init__(self, in_ch, out_ch, stride):
        super().__init__()
        self.conv1 = nn.Conv2d(in_ch, out_ch, 3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_ch)
        self.conv2 = nn.Conv2d(out_ch, out_ch, 3, stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_ch)
        self.relu = nn.ReLU(inplace=True)
        self.downsample = None
        if stride != 1 or in_ch != out_ch:
            self.downsample = nn.Sequential(
                nn.Conv2d(in_ch, out_ch, 1, stride=stride, bias=False),
                nn.BatchNorm2d(out_ch),
            )
    def forward(self, x):
        identity = x
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        if self.downsample is not None:
            identity = self.downsample(x)
        return self.relu(out + identity)

_resblock = _ResidualBlock({{params.in_channels}}, {{params.out_channels}}, {{params.stride}})
{{outputs.tensor_out}} = _resblock({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "resblock_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 32. Inception Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.inception-block",
    name: "Inception Block",
    category: "neural-networks",
    description: "GoogLeNet-style inception module with parallel convolutions at multiple scales",
    tags: ["block", "inception", "googlenet", "multi-scale", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "in_channels", name: "In Channels", type: "number", default: 256, min: 1, step: 1 },
      { id: "ch1x1", name: "1x1 Channels", type: "number", default: 64, min: 1, step: 1 },
      { id: "ch3x3", name: "3x3 Channels", type: "number", default: 128, min: 1, step: 1 },
      { id: "ch5x5", name: "5x5 Channels", type: "number", default: 32, min: 1, step: 1 },
      { id: "pool_proj", name: "Pool Proj Channels", type: "number", default: 32, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `class _InceptionBlock(nn.Module):
    def __init__(self, in_ch, ch1x1, ch3x3, ch5x5, pool_proj):
        super().__init__()
        self.branch1 = nn.Sequential(nn.Conv2d(in_ch, ch1x1, 1), nn.ReLU(True))
        self.branch3 = nn.Sequential(nn.Conv2d(in_ch, ch3x3, 1), nn.ReLU(True), nn.Conv2d(ch3x3, ch3x3, 3, padding=1), nn.ReLU(True))
        self.branch5 = nn.Sequential(nn.Conv2d(in_ch, ch5x5, 1), nn.ReLU(True), nn.Conv2d(ch5x5, ch5x5, 5, padding=2), nn.ReLU(True))
        self.branch_pool = nn.Sequential(nn.MaxPool2d(3, stride=1, padding=1), nn.Conv2d(in_ch, pool_proj, 1), nn.ReLU(True))
    def forward(self, x):
        return torch.cat([self.branch1(x), self.branch3(x), self.branch5(x), self.branch_pool(x)], dim=1)

_inception = _InceptionBlock({{params.in_channels}}, {{params.ch1x1}}, {{params.ch3x3}}, {{params.ch5x5}}, {{params.pool_proj}})
{{outputs.tensor_out}} = _inception({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "inception_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 33. Squeeze-Excite Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.squeeze-excite",
    name: "Squeeze-Excite Block",
    category: "neural-networks",
    description: "Channel attention mechanism — recalibrates channel-wise feature responses",
    tags: ["block", "attention", "squeeze-excite", "se", "channel", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true, description: "Shape: (batch, channels, H, W)" },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "channels", name: "Channels", type: "number", default: 64, min: 1, step: 1 },
      { id: "reduction", name: "Reduction Ratio", type: "number", default: 16, min: 1, step: 1, description: "Bottleneck ratio for the SE pathway" },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `class _SqueezeExcite(nn.Module):
    def __init__(self, channels, reduction):
        super().__init__()
        mid = max(1, channels // reduction)
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Sequential(
            nn.Linear(channels, mid, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(mid, channels, bias=False),
            nn.Sigmoid(),
        )
    def forward(self, x):
        b, c, _, _ = x.size()
        w = self.pool(x).view(b, c)
        w = self.fc(w).view(b, c, 1, 1)
        return x * w

_se = _SqueezeExcite({{params.channels}}, {{params.reduction}})
{{outputs.tensor_out}} = _se({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "se_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 34. MLP Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.mlp-block",
    name: "MLP Block",
    category: "neural-networks",
    description: "Multi-layer perceptron block with configurable hidden layers",
    tags: ["block", "mlp", "feedforward", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "in_features", name: "In Features", type: "number", default: 256, min: 1, step: 1 },
      { id: "hidden_features", name: "Hidden Features", type: "number", default: 512, min: 1, step: 1 },
      { id: "out_features", name: "Out Features", type: "number", default: 256, min: 1, step: 1 },
      { id: "dropout", name: "Dropout", type: "number", default: 0.0, min: 0, max: 1, step: 0.05 },
      { id: "activation", name: "Activation", type: "select", default: "gelu", options: [{ label: "GELU", value: "gelu" }, { label: "ReLU", value: "relu" }, { label: "SiLU", value: "silu" }] },
    ],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `_act_fn = {"gelu": nn.GELU(), "relu": nn.ReLU(), "silu": nn.SiLU()}["{{params.activation}}"]
_mlp = nn.Sequential(
    nn.Linear({{params.in_features}}, {{params.hidden_features}}),
    _act_fn,
    nn.Dropout({{params.dropout}}),
    nn.Linear({{params.hidden_features}}, {{params.out_features}}),
    nn.Dropout({{params.dropout}}),
)
{{outputs.tensor_out}} = _mlp({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "mlp_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 35. Build Sequential
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.build-sequential",
    name: "Build Sequential",
    category: "neural-networks",
    description: "Combines a list of layers into a nn.Sequential model",
    tags: ["model", "sequential", "compose", "pytorch"],
    inputs: [
      { id: "layers", name: "Layers", type: "list", required: true, description: "Ordered list of nn.Module layers", multiple: true },
    ],
    outputs: [
      { id: "model", name: "Sequential Model", type: "model", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["import torch.nn as nn"],
      body: `{{outputs.model}} = nn.Sequential(*{{inputs.layers}})`,
      outputBindings: { model: "seq_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 36. Build Functional (DAG)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.build-functional",
    name: "Build Functional (DAG)",
    category: "neural-networks",
    description: "Composes layers as a directed acyclic graph with a custom forward method",
    tags: ["model", "functional", "dag", "custom", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
      { id: "layers", name: "Layer Dict", type: "dict", required: true, description: "Dict mapping layer names to nn.Module instances" },
    ],
    outputs: [
      { id: "model", name: "Functional Model", type: "model", required: true },
    ],
    parameters: [
      { id: "forward_code", name: "Forward Code", type: "code", default: "x = self.layers['layer1'](x)\nx = self.layers['layer2'](x)\nreturn x", description: "Python code for the forward method (x = input tensor)" },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `class _FunctionalModel(nn.Module):
    def __init__(self, layers_dict):
        super().__init__()
        self.layers = nn.ModuleDict(layers_dict)
    def forward(self, x):
        {{params.forward_code}}

{{outputs.model}} = _FunctionalModel({{inputs.layers}})`,
      outputBindings: { model: "func_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 37. Custom Layer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.custom-layer",
    name: "Custom Layer",
    category: "neural-networks",
    description: "User-defined nn.Module layer with custom init and forward code",
    tags: ["layer", "custom", "user-defined", "pytorch"],
    inputs: [
      { id: "tensor_in", name: "Input Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Output Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "init_code", name: "Init Code", type: "code", default: "self.linear = nn.Linear(256, 128)", description: "Code inside __init__ (self and super().__init__() already called)" },
      { id: "forward_code", name: "Forward Code", type: "code", default: "return self.linear(x)", description: "Code inside forward(self, x)" },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn"],
      body: `class _CustomLayer(nn.Module):
    def __init__(self):
        super().__init__()
        {{params.init_code}}
    def forward(self, x):
        {{params.forward_code}}

_custom = _CustomLayer()
{{outputs.tensor_out}} = _custom({{inputs.tensor_in}})`,
      outputBindings: { tensor_out: "custom_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 38. Attention Layer (Bahdanau)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.attention-bahdanau",
    name: "Attention Layer (Bahdanau)",
    category: "neural-networks",
    description: "Additive (Bahdanau) attention mechanism — computes alignment via a learned MLP",
    tags: ["layer", "attention", "bahdanau", "additive", "seq2seq", "pytorch"],
    inputs: [
      { id: "query", name: "Query", type: "tensor", required: true, description: "Decoder hidden state: (batch, query_dim)" },
      { id: "keys", name: "Keys", type: "tensor", required: true, description: "Encoder outputs: (batch, seq_len, key_dim)" },
    ],
    outputs: [
      { id: "context", name: "Context Vector", type: "tensor", required: true },
      { id: "weights", name: "Attention Weights", type: "tensor", required: false },
    ],
    parameters: [
      { id: "query_dim", name: "Query Dim", type: "number", default: 256, min: 1, step: 1 },
      { id: "key_dim", name: "Key Dim", type: "number", default: 256, min: 1, step: 1 },
      { id: "hidden_dim", name: "Hidden Dim", type: "number", default: 128, min: 1, step: 1, description: "Alignment network hidden size" },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn", "import torch.nn.functional as F"],
      body: `class _BahdanauAttention(nn.Module):
    def __init__(self, query_dim, key_dim, hidden_dim):
        super().__init__()
        self.W_q = nn.Linear(query_dim, hidden_dim, bias=False)
        self.W_k = nn.Linear(key_dim, hidden_dim, bias=False)
        self.V = nn.Linear(hidden_dim, 1, bias=False)
    def forward(self, query, keys):
        # query: (B, query_dim) -> (B, 1, hidden)
        q = self.W_q(query).unsqueeze(1)
        k = self.W_k(keys)  # (B, T, hidden)
        energy = self.V(torch.tanh(q + k)).squeeze(-1)  # (B, T)
        weights = F.softmax(energy, dim=-1)  # (B, T)
        context = torch.bmm(weights.unsqueeze(1), keys).squeeze(1)  # (B, key_dim)
        return context, weights

_attn = _BahdanauAttention({{params.query_dim}}, {{params.key_dim}}, {{params.hidden_dim}})
{{outputs.context}}, {{outputs.weights}} = _attn({{inputs.query}}, {{inputs.keys}})`,
      outputBindings: { context: "bahdanau_ctx", weights: "bahdanau_weights" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 39. Attention Layer (Luong)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "neural-networks.attention-luong",
    name: "Attention Layer (Luong)",
    category: "neural-networks",
    description: "Multiplicative (Luong) attention — computes alignment via dot product or bilinear form",
    tags: ["layer", "attention", "luong", "multiplicative", "seq2seq", "pytorch"],
    inputs: [
      { id: "query", name: "Query", type: "tensor", required: true, description: "Decoder hidden state: (batch, query_dim)" },
      { id: "keys", name: "Keys", type: "tensor", required: true, description: "Encoder outputs: (batch, seq_len, key_dim)" },
    ],
    outputs: [
      { id: "context", name: "Context Vector", type: "tensor", required: true },
      { id: "weights", name: "Attention Weights", type: "tensor", required: false },
    ],
    parameters: [
      { id: "query_dim", name: "Query Dim", type: "number", default: 256, min: 1, step: 1 },
      { id: "key_dim", name: "Key Dim", type: "number", default: 256, min: 1, step: 1 },
      { id: "method", name: "Method", type: "select", default: "dot", options: [{ label: "Dot Product", value: "dot" }, { label: "General (bilinear)", value: "general" }, { label: "Concat", value: "concat" }] },
    ],
    codeTemplate: {
      imports: ["import torch", "import torch.nn as nn", "import torch.nn.functional as F"],
      body: `class _LuongAttention(nn.Module):
    def __init__(self, query_dim, key_dim, method):
        super().__init__()
        self.method = method
        if method == "general":
            self.W = nn.Linear(key_dim, query_dim, bias=False)
        elif method == "concat":
            self.W = nn.Linear(query_dim + key_dim, query_dim, bias=False)
            self.V = nn.Linear(query_dim, 1, bias=False)
    def forward(self, query, keys):
        # query: (B, query_dim), keys: (B, T, key_dim)
        if self.method == "dot":
            energy = torch.bmm(keys, query.unsqueeze(2)).squeeze(2)  # (B, T)
        elif self.method == "general":
            energy = torch.bmm(self.W(keys), query.unsqueeze(2)).squeeze(2)
        else:  # concat
            T = keys.size(1)
            q_exp = query.unsqueeze(1).expand(-1, T, -1)
            energy = self.V(torch.tanh(self.W(torch.cat([q_exp, keys], dim=2)))).squeeze(2)
        weights = F.softmax(energy, dim=-1)
        context = torch.bmm(weights.unsqueeze(1), keys).squeeze(1)
        return context, weights

_attn = _LuongAttention({{params.query_dim}}, {{params.key_dim}}, "{{params.method}}")
{{outputs.context}}, {{outputs.weights}} = _attn({{inputs.query}}, {{inputs.keys}})`,
      outputBindings: { context: "luong_ctx", weights: "luong_weights" },
    },
  },
];
