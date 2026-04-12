import type { BlockDefinition } from "../types.js";

export const visionBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Image Resize
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.image-resize",
    name: "Image Resize",
    category: "vision",
    description: "Resize an image to target dimensions using PIL or torchvision",
    tags: ["image", "resize", "preprocessing", "torchvision", "pil"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "image_out", name: "Resized Image", type: "image", required: true },
    ],
    parameters: [
      { id: "width", name: "Width", type: "number", default: 256, min: 1, step: 1 },
      { id: "height", name: "Height", type: "number", default: 256, min: 1, step: 1 },
      { id: "interpolation", name: "Interpolation", type: "select", default: "bilinear", options: [{ label: "Bilinear", value: "bilinear" }, { label: "Nearest", value: "nearest" }, { label: "Bicubic", value: "bicubic" }, { label: "Lanczos", value: "lanczos" }] },
    ],
    codeTemplate: {
      imports: ["from torchvision import transforms", "from PIL import Image"],
      body: `_interp_map = {"bilinear": Image.BILINEAR, "nearest": Image.NEAREST, "bicubic": Image.BICUBIC, "lanczos": Image.LANCZOS}
_resize = transforms.Resize(({{params.height}}, {{params.width}}), interpolation=_interp_map["{{params.interpolation}}"])
{{outputs.image_out}} = _resize({{inputs.image}})`,
      outputBindings: { image_out: "resized_img" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Image Crop
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.image-crop",
    name: "Image Crop",
    category: "vision",
    description: "Center-crop or random-crop an image to a target size",
    tags: ["image", "crop", "preprocessing", "torchvision"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "image_out", name: "Cropped Image", type: "image", required: true },
    ],
    parameters: [
      { id: "size", name: "Crop Size", type: "number", default: 224, min: 1, step: 1 },
      { id: "mode", name: "Crop Mode", type: "select", default: "center", options: [{ label: "Center Crop", value: "center" }, { label: "Random Crop", value: "random" }] },
    ],
    codeTemplate: {
      imports: ["from torchvision import transforms"],
      body: `_crop = transforms.CenterCrop({{params.size}}) if "{{params.mode}}" == "center" else transforms.RandomCrop({{params.size}})
{{outputs.image_out}} = _crop({{inputs.image}})`,
      outputBindings: { image_out: "cropped_img" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Image Augment
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.image-augment",
    name: "Image Augment",
    category: "vision",
    description: "Apply random augmentations (flip, rotation, color jitter) for training data diversity",
    tags: ["image", "augmentation", "training", "torchvision"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "image_out", name: "Augmented Image", type: "image", required: true },
    ],
    parameters: [
      { id: "horizontal_flip", name: "Random Horizontal Flip", type: "boolean", default: true },
      { id: "vertical_flip", name: "Random Vertical Flip", type: "boolean", default: false },
      { id: "rotation_degrees", name: "Max Rotation Degrees", type: "number", default: 15, min: 0, max: 180, step: 1 },
      { id: "color_jitter", name: "Color Jitter", type: "boolean", default: true },
      { id: "brightness", name: "Brightness", type: "number", default: 0.2, min: 0, max: 1, step: 0.05 },
      { id: "contrast", name: "Contrast", type: "number", default: 0.2, min: 0, max: 1, step: 0.05 },
      { id: "saturation", name: "Saturation", type: "number", default: 0.2, min: 0, max: 1, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["from torchvision import transforms"],
      body: `_augment_ops = []
if {{params.horizontal_flip}}:
    _augment_ops.append(transforms.RandomHorizontalFlip())
if {{params.vertical_flip}}:
    _augment_ops.append(transforms.RandomVerticalFlip())
if {{params.rotation_degrees}} > 0:
    _augment_ops.append(transforms.RandomRotation({{params.rotation_degrees}}))
if {{params.color_jitter}}:
    _augment_ops.append(transforms.ColorJitter(
        brightness={{params.brightness}}, contrast={{params.contrast}}, saturation={{params.saturation}}
    ))
_augment = transforms.Compose(_augment_ops)
{{outputs.image_out}} = _augment({{inputs.image}})`,
      outputBindings: { image_out: "augmented_img" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Image Normalize
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.image-normalize",
    name: "Image Normalize",
    category: "vision",
    description: "Normalize image tensor with mean and std (ImageNet defaults)",
    tags: ["image", "normalize", "preprocessing", "torchvision"],
    inputs: [
      { id: "image", name: "Input Image Tensor", type: "tensor", required: true },
    ],
    outputs: [
      { id: "tensor_out", name: "Normalized Tensor", type: "tensor", required: true },
    ],
    parameters: [
      { id: "mean", name: "Mean (comma-separated)", type: "string", default: "0.485,0.456,0.406", description: "Per-channel mean values" },
      { id: "std", name: "Std (comma-separated)", type: "string", default: "0.229,0.224,0.225", description: "Per-channel std values" },
    ],
    codeTemplate: {
      imports: ["from torchvision import transforms"],
      body: `_mean = [float(x.strip()) for x in "{{params.mean}}".split(",")]
_std = [float(x.strip()) for x in "{{params.std}}".split(",")]
_normalize = transforms.Normalize(mean=_mean, std=_std)
{{outputs.tensor_out}} = _normalize({{inputs.image}})`,
      outputBindings: { tensor_out: "normalized_img" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. ResNet Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.resnet-block",
    name: "ResNet Block",
    category: "vision",
    description: "Load a pretrained ResNet model for feature extraction or classification",
    tags: ["resnet", "cnn", "classification", "backbone", "torchvision"],
    inputs: [
      { id: "image_batch", name: "Image Batch", type: "image_batch", required: true, description: "Shape: (batch, 3, H, W) normalized" },
    ],
    outputs: [
      { id: "logits", name: "Logits", type: "tensor", required: true },
      { id: "features", name: "Features", type: "tensor", required: true },
    ],
    parameters: [
      { id: "variant", name: "Variant", type: "select", default: "resnet50", options: [{ label: "ResNet-18", value: "resnet18" }, { label: "ResNet-34", value: "resnet34" }, { label: "ResNet-50", value: "resnet50" }, { label: "ResNet-101", value: "resnet101" }, { label: "ResNet-152", value: "resnet152" }] },
      { id: "pretrained", name: "Pretrained (ImageNet)", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import torch", "import torchvision.models as models"],
      body: `_weights = "IMAGENET1K_V2" if {{params.pretrained}} else None
_resnet = models.get_model("{{params.variant}}", weights=_weights)
_resnet.eval()

# Extract features from the penultimate layer
_children = list(_resnet.children())
_feature_extractor = torch.nn.Sequential(*_children[:-1])
with torch.no_grad():
    {{outputs.features}} = _feature_extractor({{inputs.image_batch}}).flatten(1)
    {{outputs.logits}} = _resnet({{inputs.image_batch}})`,
      outputBindings: { logits: "resnet_logits", features: "resnet_features" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. EfficientNet Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.efficientnet-block",
    name: "EfficientNet Block",
    category: "vision",
    description: "Load a pretrained EfficientNet model for efficient image classification",
    tags: ["efficientnet", "cnn", "classification", "efficient", "torchvision"],
    inputs: [
      { id: "image_batch", name: "Image Batch", type: "image_batch", required: true },
    ],
    outputs: [
      { id: "logits", name: "Logits", type: "tensor", required: true },
      { id: "features", name: "Features", type: "tensor", required: true },
    ],
    parameters: [
      { id: "variant", name: "Variant", type: "select", default: "efficientnet_b0", options: [{ label: "EfficientNet-B0", value: "efficientnet_b0" }, { label: "EfficientNet-B1", value: "efficientnet_b1" }, { label: "EfficientNet-B2", value: "efficientnet_b2" }, { label: "EfficientNet-B3", value: "efficientnet_b3" }, { label: "EfficientNet-B4", value: "efficientnet_b4" }, { label: "EfficientNet-V2-S", value: "efficientnet_v2_s" }, { label: "EfficientNet-V2-M", value: "efficientnet_v2_m" }] },
      { id: "pretrained", name: "Pretrained (ImageNet)", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import torch", "import torchvision.models as models"],
      body: `_weights = "IMAGENET1K_V1" if {{params.pretrained}} else None
_effnet = models.get_model("{{params.variant}}", weights=_weights)
_effnet.eval()
with torch.no_grad():
    {{outputs.features}} = _effnet.features({{inputs.image_batch}})
    {{outputs.features}} = _effnet.avgpool({{outputs.features}}).flatten(1)
    {{outputs.logits}} = _effnet({{inputs.image_batch}})`,
      outputBindings: { logits: "effnet_logits", features: "effnet_features" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. MobileNet Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.mobilenet-block",
    name: "MobileNet Block",
    category: "vision",
    description: "Load a pretrained MobileNet model optimized for mobile / edge deployment",
    tags: ["mobilenet", "cnn", "classification", "mobile", "edge", "torchvision"],
    inputs: [
      { id: "image_batch", name: "Image Batch", type: "image_batch", required: true },
    ],
    outputs: [
      { id: "logits", name: "Logits", type: "tensor", required: true },
      { id: "features", name: "Features", type: "tensor", required: true },
    ],
    parameters: [
      { id: "variant", name: "Variant", type: "select", default: "mobilenet_v3_small", options: [{ label: "MobileNet V2", value: "mobilenet_v2" }, { label: "MobileNet V3 Small", value: "mobilenet_v3_small" }, { label: "MobileNet V3 Large", value: "mobilenet_v3_large" }] },
      { id: "pretrained", name: "Pretrained (ImageNet)", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import torch", "import torchvision.models as models"],
      body: `_weights = "IMAGENET1K_V1" if {{params.pretrained}} else None
_mobilenet = models.get_model("{{params.variant}}", weights=_weights)
_mobilenet.eval()
with torch.no_grad():
    {{outputs.features}} = _mobilenet.features({{inputs.image_batch}})
    {{outputs.features}} = torch.nn.functional.adaptive_avg_pool2d({{outputs.features}}, 1).flatten(1)
    {{outputs.logits}} = _mobilenet({{inputs.image_batch}})`,
      outputBindings: { logits: "mobilenet_logits", features: "mobilenet_features" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Image Classifier
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.image-classifier",
    name: "Image Classifier",
    category: "vision",
    description: "General-purpose image classifier using a HuggingFace pipeline",
    tags: ["classification", "image", "pipeline", "huggingface", "transformers"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "predictions", name: "Predictions", type: "list", required: true, description: "List of {label, score} dicts" },
      { id: "top_label", name: "Top Label", type: "text", required: true },
      { id: "top_score", name: "Top Score", type: "number", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "google/vit-base-patch16-224", placeholder: "HuggingFace image classification model" },
      { id: "top_k", name: "Top K", type: "number", default: 5, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["from transformers import pipeline"],
      body: `_classifier = pipeline("image-classification", model="{{params.model_name}}")
{{outputs.predictions}} = _classifier({{inputs.image}}, top_k={{params.top_k}})
{{outputs.top_label}} = {{outputs.predictions}}[0]["label"]
{{outputs.top_score}} = {{outputs.predictions}}[0]["score"]`,
      outputBindings: { predictions: "cls_preds", top_label: "cls_top_label", top_score: "cls_top_score" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Object Detector (YOLO)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.object-detector-yolo",
    name: "Object Detector (YOLO)",
    category: "vision",
    description: "Run YOLOv8 object detection using the Ultralytics library",
    tags: ["detection", "yolo", "object-detection", "ultralytics", "real-time"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "results", name: "Detection Results", type: "any", required: true },
      { id: "boxes", name: "Bounding Boxes", type: "tensor", required: true },
      { id: "scores", name: "Confidence Scores", type: "tensor", required: true },
      { id: "classes", name: "Class IDs", type: "tensor", required: true },
    ],
    parameters: [
      { id: "model_size", name: "Model Size", type: "select", default: "yolov8n.pt", options: [{ label: "Nano (YOLOv8n)", value: "yolov8n.pt" }, { label: "Small (YOLOv8s)", value: "yolov8s.pt" }, { label: "Medium (YOLOv8m)", value: "yolov8m.pt" }, { label: "Large (YOLOv8l)", value: "yolov8l.pt" }, { label: "XLarge (YOLOv8x)", value: "yolov8x.pt" }] },
      { id: "conf_threshold", name: "Confidence Threshold", type: "number", default: 0.25, min: 0, max: 1, step: 0.05 },
      { id: "iou_threshold", name: "IoU Threshold (NMS)", type: "number", default: 0.45, min: 0, max: 1, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["from ultralytics import YOLO"],
      body: `_yolo = YOLO("{{params.model_size}}")
{{outputs.results}} = _yolo({{inputs.image}}, conf={{params.conf_threshold}}, iou={{params.iou_threshold}})[0]
{{outputs.boxes}} = {{outputs.results}}.boxes.xyxy
{{outputs.scores}} = {{outputs.results}}.boxes.conf
{{outputs.classes}} = {{outputs.results}}.boxes.cls`,
      outputBindings: { results: "yolo_results", boxes: "yolo_boxes", scores: "yolo_scores", classes: "yolo_classes" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Object Detector (DETR)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.object-detector-detr",
    name: "Object Detector (DETR)",
    category: "vision",
    description: "DEtection TRansformer — end-to-end object detection with a transformer",
    tags: ["detection", "detr", "transformer", "object-detection", "huggingface"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "results", name: "Detection Results", type: "list", required: true },
      { id: "boxes", name: "Bounding Boxes", type: "tensor", required: true },
      { id: "scores", name: "Scores", type: "tensor", required: true },
      { id: "labels", name: "Labels", type: "tensor", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "facebook/detr-resnet-50" },
      { id: "threshold", name: "Score Threshold", type: "number", default: 0.7, min: 0, max: 1, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "from transformers import DetrForObjectDetection, DetrImageProcessor"],
      body: `_detr_processor = DetrImageProcessor.from_pretrained("{{params.model_name}}")
_detr_model = DetrForObjectDetection.from_pretrained("{{params.model_name}}")
_detr_inputs = _detr_processor(images={{inputs.image}}, return_tensors="pt")
with torch.no_grad():
    _detr_outputs = _detr_model(**_detr_inputs)
_target_sizes = torch.tensor([{{inputs.image}}.size[::-1]])
{{outputs.results}} = _detr_processor.post_process_object_detection(
    _detr_outputs, target_sizes=_target_sizes, threshold={{params.threshold}}
)[0]
{{outputs.boxes}} = {{outputs.results}}["boxes"]
{{outputs.scores}} = {{outputs.results}}["scores"]
{{outputs.labels}} = {{outputs.results}}["labels"]`,
      outputBindings: { results: "detr_results", boxes: "detr_boxes", scores: "detr_scores", labels: "detr_labels" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Semantic Segmenter
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.semantic-segmenter",
    name: "Semantic Segmenter",
    category: "vision",
    description: "Per-pixel semantic segmentation using a HuggingFace model (SegFormer, etc.)",
    tags: ["segmentation", "semantic", "pixel", "huggingface", "transformers"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "segmentation_map", name: "Segmentation Map", type: "tensor", required: true, description: "Per-pixel class IDs" },
      { id: "logits", name: "Logits", type: "tensor", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "nvidia/segformer-b0-finetuned-ade-512-512" },
    ],
    codeTemplate: {
      imports: ["import torch", "from transformers import SegformerForSemanticSegmentation, SegformerImageProcessor"],
      body: `_seg_processor = SegformerImageProcessor.from_pretrained("{{params.model_name}}")
_seg_model = SegformerForSemanticSegmentation.from_pretrained("{{params.model_name}}")
_seg_inputs = _seg_processor(images={{inputs.image}}, return_tensors="pt")
with torch.no_grad():
    {{outputs.logits}} = _seg_model(**_seg_inputs).logits
_upsampled = torch.nn.functional.interpolate(
    {{outputs.logits}}, size={{inputs.image}}.size[::-1], mode="bilinear", align_corners=False,
)
{{outputs.segmentation_map}} = _upsampled.argmax(dim=1).squeeze(0)`,
      outputBindings: { segmentation_map: "seg_map", logits: "seg_logits" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Instance Segmenter (Mask RCNN)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.instance-segmenter-mask-rcnn",
    name: "Instance Segmenter (Mask RCNN)",
    category: "vision",
    description: "Instance segmentation using Mask R-CNN from torchvision",
    tags: ["segmentation", "instance", "mask-rcnn", "detection", "torchvision"],
    inputs: [
      { id: "image_batch", name: "Image Batch", type: "image_batch", required: true, description: "Normalized tensor (batch, 3, H, W)" },
    ],
    outputs: [
      { id: "boxes", name: "Bounding Boxes", type: "tensor", required: true },
      { id: "masks", name: "Instance Masks", type: "tensor", required: true },
      { id: "labels", name: "Labels", type: "tensor", required: true },
      { id: "scores", name: "Scores", type: "tensor", required: true },
    ],
    parameters: [
      { id: "pretrained", name: "Pretrained (COCO)", type: "boolean", default: true },
      { id: "score_threshold", name: "Score Threshold", type: "number", default: 0.5, min: 0, max: 1, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torchvision.models.detection as det_models"],
      body: `_weights = "COCO_V1" if {{params.pretrained}} else None
_mask_rcnn = det_models.maskrcnn_resnet50_fpn(weights=_weights)
_mask_rcnn.eval()
with torch.no_grad():
    _predictions = _mask_rcnn({{inputs.image_batch}})[0]
_keep = _predictions["scores"] > {{params.score_threshold}}
{{outputs.boxes}} = _predictions["boxes"][_keep]
{{outputs.masks}} = _predictions["masks"][_keep]
{{outputs.labels}} = _predictions["labels"][_keep]
{{outputs.scores}} = _predictions["scores"][_keep]`,
      outputBindings: { boxes: "mrcnn_boxes", masks: "mrcnn_masks", labels: "mrcnn_labels", scores: "mrcnn_scores" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. Panoptic Segmenter
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.panoptic-segmenter",
    name: "Panoptic Segmenter",
    category: "vision",
    description: "Panoptic segmentation combining semantic and instance segmentation (Mask2Former)",
    tags: ["segmentation", "panoptic", "mask2former", "huggingface", "transformers"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "panoptic_map", name: "Panoptic Map", type: "tensor", required: true },
      { id: "segments_info", name: "Segments Info", type: "list", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "facebook/mask2former-swin-base-coco-panoptic" },
    ],
    codeTemplate: {
      imports: ["import torch", "from transformers import AutoImageProcessor, Mask2FormerForUniversalSegmentation"],
      body: `_pan_processor = AutoImageProcessor.from_pretrained("{{params.model_name}}")
_pan_model = Mask2FormerForUniversalSegmentation.from_pretrained("{{params.model_name}}")
_pan_inputs = _pan_processor(images={{inputs.image}}, return_tensors="pt")
with torch.no_grad():
    _pan_outputs = _pan_model(**_pan_inputs)
_pan_result = _pan_processor.post_process_panoptic_segmentation(
    _pan_outputs, target_sizes=[{{inputs.image}}.size[::-1]]
)[0]
{{outputs.panoptic_map}} = _pan_result["segmentation"]
{{outputs.segments_info}} = _pan_result["segments_info"]`,
      outputBindings: { panoptic_map: "panoptic_seg", segments_info: "panoptic_info" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Depth Estimator
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.depth-estimator",
    name: "Depth Estimator",
    category: "vision",
    description: "Monocular depth estimation using a HuggingFace model (DPT, Depth Anything)",
    tags: ["depth", "estimation", "monocular", "dpt", "huggingface", "transformers"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "depth_map", name: "Depth Map", type: "tensor", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "Intel/dpt-large", placeholder: "e.g. Intel/dpt-large, LiheYoung/depth-anything-base-hf" },
    ],
    codeTemplate: {
      imports: ["import torch", "from transformers import pipeline"],
      body: `_depth_pipe = pipeline("depth-estimation", model="{{params.model_name}}")
_depth_result = _depth_pipe({{inputs.image}})
{{outputs.depth_map}} = _depth_result["predicted_depth"]`,
      outputBindings: { depth_map: "depth_output" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Optical Flow
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.optical-flow",
    name: "Optical Flow",
    category: "vision",
    description: "Compute dense optical flow between two frames using RAFT from torchvision",
    tags: ["optical-flow", "motion", "video", "raft", "torchvision"],
    inputs: [
      { id: "frame1", name: "Frame 1", type: "tensor", required: true, description: "Shape: (batch, 3, H, W)" },
      { id: "frame2", name: "Frame 2", type: "tensor", required: true, description: "Shape: (batch, 3, H, W)" },
    ],
    outputs: [
      { id: "flow", name: "Flow Field", type: "tensor", required: true, description: "Shape: (batch, 2, H, W)" },
    ],
    parameters: [
      { id: "model_variant", name: "Model Variant", type: "select", default: "raft_small", options: [{ label: "RAFT Small", value: "raft_small" }, { label: "RAFT Large", value: "raft_large" }] },
    ],
    codeTemplate: {
      imports: ["import torch", "from torchvision.models.optical_flow import raft_small, raft_large, Raft_Small_Weights, Raft_Large_Weights"],
      body: `if "{{params.model_variant}}" == "raft_small":
    _flow_model = raft_small(weights=Raft_Small_Weights.DEFAULT)
else:
    _flow_model = raft_large(weights=Raft_Large_Weights.DEFAULT)
_flow_model.eval()
with torch.no_grad():
    _flow_preds = _flow_model({{inputs.frame1}}, {{inputs.frame2}})
{{outputs.flow}} = _flow_preds[-1]  # Last refinement iteration`,
      outputBindings: { flow: "optical_flow" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. Keypoint Detector
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.keypoint-detector",
    name: "Keypoint Detector",
    category: "vision",
    description: "Detect human body keypoints using Keypoint R-CNN from torchvision",
    tags: ["keypoint", "pose", "detection", "human", "torchvision"],
    inputs: [
      { id: "image_batch", name: "Image Batch", type: "image_batch", required: true },
    ],
    outputs: [
      { id: "keypoints", name: "Keypoints", type: "tensor", required: true, description: "Shape: (num_people, 17, 3) — x, y, score" },
      { id: "boxes", name: "Bounding Boxes", type: "tensor", required: true },
      { id: "scores", name: "Person Scores", type: "tensor", required: true },
    ],
    parameters: [
      { id: "pretrained", name: "Pretrained (COCO)", type: "boolean", default: true },
      { id: "score_threshold", name: "Score Threshold", type: "number", default: 0.7, min: 0, max: 1, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torchvision.models.detection as det_models"],
      body: `_weights = "COCO_V1" if {{params.pretrained}} else None
_kp_model = det_models.keypointrcnn_resnet50_fpn(weights=_weights)
_kp_model.eval()
with torch.no_grad():
    _kp_preds = _kp_model({{inputs.image_batch}})[0]
_kp_keep = _kp_preds["scores"] > {{params.score_threshold}}
{{outputs.keypoints}} = _kp_preds["keypoints"][_kp_keep]
{{outputs.boxes}} = _kp_preds["boxes"][_kp_keep]
{{outputs.scores}} = _kp_preds["scores"][_kp_keep]`,
      outputBindings: { keypoints: "kp_points", boxes: "kp_boxes", scores: "kp_scores" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. Face Detector
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.face-detector",
    name: "Face Detector",
    category: "vision",
    description: "Detect faces in images using OpenCV DNN or a HuggingFace pipeline",
    tags: ["face", "detection", "opencv", "dnn"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "faces", name: "Face Bounding Boxes", type: "list", required: true, description: "List of (x, y, w, h) tuples" },
      { id: "num_faces", name: "Number of Faces", type: "number", required: true },
    ],
    parameters: [
      { id: "backend", name: "Backend", type: "select", default: "opencv", options: [{ label: "OpenCV Haar Cascade", value: "opencv" }, { label: "OpenCV DNN (Caffe)", value: "opencv_dnn" }] },
      { id: "scale_factor", name: "Scale Factor (Haar)", type: "number", default: 1.1, min: 1.01, max: 2.0, step: 0.05 },
      { id: "min_neighbors", name: "Min Neighbors (Haar)", type: "number", default: 5, min: 1, step: 1 },
      { id: "confidence", name: "Confidence (DNN)", type: "number", default: 0.5, min: 0, max: 1, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import cv2", "import numpy as np"],
      body: `_img_array = np.array({{inputs.image}})
_gray = cv2.cvtColor(_img_array, cv2.COLOR_RGB2GRAY)

if "{{params.backend}}" == "opencv":
    _face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    _detections = _face_cascade.detectMultiScale(_gray, scaleFactor={{params.scale_factor}}, minNeighbors={{params.min_neighbors}})
    {{outputs.faces}} = [tuple(map(int, d)) for d in _detections]
else:
    _net = cv2.dnn.readNetFromCaffe(
        "deploy.prototxt", "res10_300x300_ssd_iter_140000.caffemodel"
    )
    _blob = cv2.dnn.blobFromImage(_img_array, 1.0, (300, 300), (104.0, 177.0, 123.0))
    _net.setInput(_blob)
    _dnn_detections = _net.forward()
    h, w = _img_array.shape[:2]
    {{outputs.faces}} = []
    for i in range(_dnn_detections.shape[2]):
        conf = _dnn_detections[0, 0, i, 2]
        if conf > {{params.confidence}}:
            box = _dnn_detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            x1, y1, x2, y2 = box.astype(int)
            {{outputs.faces}}.append((int(x1), int(y1), int(x2 - x1), int(y2 - y1)))

{{outputs.num_faces}} = len({{outputs.faces}})`,
      outputBindings: { faces: "face_boxes", num_faces: "face_count" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. OCR Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.ocr-block",
    name: "OCR Block",
    category: "vision",
    description: "Extract text from images using a TrOCR pipeline or EasyOCR",
    tags: ["ocr", "text-recognition", "trocr", "huggingface"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "text", name: "Extracted Text", type: "text", required: true },
      { id: "results", name: "Detailed Results", type: "list", required: true },
    ],
    parameters: [
      { id: "engine", name: "OCR Engine", type: "select", default: "trocr", options: [{ label: "TrOCR (HuggingFace)", value: "trocr" }, { label: "EasyOCR", value: "easyocr" }] },
      { id: "model_name", name: "TrOCR Model", type: "string", default: "microsoft/trocr-base-printed", placeholder: "HuggingFace TrOCR model" },
      { id: "languages", name: "Languages (EasyOCR)", type: "string", default: "en", placeholder: "Comma-separated: en,fr,de" },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `if "{{params.engine}}" == "trocr":
    from transformers import TrOCRProcessor, VisionEncoderDecoderModel
    _ocr_processor = TrOCRProcessor.from_pretrained("{{params.model_name}}")
    _ocr_model = VisionEncoderDecoderModel.from_pretrained("{{params.model_name}}")
    _ocr_inputs = _ocr_processor(images={{inputs.image}}, return_tensors="pt")
    with torch.no_grad():
        _gen_ids = _ocr_model.generate(**_ocr_inputs)
    {{outputs.text}} = _ocr_processor.batch_decode(_gen_ids, skip_special_tokens=True)[0]
    {{outputs.results}} = [{"text": {{outputs.text}}, "confidence": 1.0}]
else:
    import easyocr
    _reader = easyocr.Reader([l.strip() for l in "{{params.languages}}".split(",")])
    import numpy as np
    _ocr_detections = _reader.readtext(np.array({{inputs.image}}))
    {{outputs.results}} = [{"bbox": d[0], "text": d[1], "confidence": d[2]} for d in _ocr_detections]
    {{outputs.text}} = " ".join(d[1] for d in _ocr_detections)`,
      outputBindings: { text: "ocr_text", results: "ocr_results" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. CLIP Encoder (Image)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.clip-encoder-image",
    name: "CLIP Encoder (Image)",
    category: "vision",
    description: "Encode images into CLIP embedding space for cross-modal similarity",
    tags: ["clip", "encoder", "image", "embedding", "multimodal", "huggingface"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "embedding", name: "Image Embedding", type: "embedding", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "openai/clip-vit-base-patch32" },
    ],
    codeTemplate: {
      imports: ["import torch", "from transformers import CLIPProcessor, CLIPModel"],
      body: `_clip_model = CLIPModel.from_pretrained("{{params.model_name}}")
_clip_processor = CLIPProcessor.from_pretrained("{{params.model_name}}")
_clip_inputs = _clip_processor(images={{inputs.image}}, return_tensors="pt")
with torch.no_grad():
    {{outputs.embedding}} = _clip_model.get_image_features(**_clip_inputs)
{{outputs.embedding}} = {{outputs.embedding}} / {{outputs.embedding}}.norm(p=2, dim=-1, keepdim=True)`,
      outputBindings: { embedding: "clip_img_emb" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. CLIP Encoder (Text)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.clip-encoder-text",
    name: "CLIP Encoder (Text)",
    category: "vision",
    description: "Encode text into CLIP embedding space for cross-modal similarity",
    tags: ["clip", "encoder", "text", "embedding", "multimodal", "huggingface"],
    inputs: [
      { id: "text", name: "Input Text", type: "text", required: true },
    ],
    outputs: [
      { id: "embedding", name: "Text Embedding", type: "embedding", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "openai/clip-vit-base-patch32" },
    ],
    codeTemplate: {
      imports: ["import torch", "from transformers import CLIPProcessor, CLIPModel"],
      body: `_clip_model = CLIPModel.from_pretrained("{{params.model_name}}")
_clip_processor = CLIPProcessor.from_pretrained("{{params.model_name}}")
_clip_inputs = _clip_processor(text={{inputs.text}}, return_tensors="pt", padding=True)
with torch.no_grad():
    {{outputs.embedding}} = _clip_model.get_text_features(**_clip_inputs)
{{outputs.embedding}} = {{outputs.embedding}} / {{outputs.embedding}}.norm(p=2, dim=-1, keepdim=True)`,
      outputBindings: { embedding: "clip_txt_emb" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. SAM (Segment Anything)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.sam",
    name: "SAM (Segment Anything)",
    category: "vision",
    description: "Meta's Segment Anything Model for zero-shot segmentation with point or box prompts",
    tags: ["sam", "segmentation", "zero-shot", "foundation", "huggingface", "meta"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
      { id: "input_points", name: "Input Points", type: "list", required: false, description: "List of [x, y] prompt points" },
      { id: "input_boxes", name: "Input Boxes", type: "list", required: false, description: "List of [x1, y1, x2, y2] prompt boxes" },
    ],
    outputs: [
      { id: "masks", name: "Predicted Masks", type: "tensor", required: true },
      { id: "scores", name: "IoU Scores", type: "tensor", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "facebook/sam-vit-base", placeholder: "e.g. facebook/sam-vit-base, facebook/sam-vit-huge" },
    ],
    codeTemplate: {
      imports: ["import torch", "from transformers import SamModel, SamProcessor"],
      body: `_sam_model = SamModel.from_pretrained("{{params.model_name}}")
_sam_processor = SamProcessor.from_pretrained("{{params.model_name}}")
_sam_inputs = _sam_processor(
    {{inputs.image}},
    input_points={{inputs.input_points}},
    input_boxes={{inputs.input_boxes}},
    return_tensors="pt",
)
with torch.no_grad():
    _sam_outputs = _sam_model(**_sam_inputs)
{{outputs.masks}} = _sam_processor.image_processor.post_process_masks(
    _sam_outputs.pred_masks, _sam_inputs["original_sizes"], _sam_inputs["reshaped_input_sizes"]
)[0]
{{outputs.scores}} = _sam_outputs.iou_scores.squeeze()`,
      outputBindings: { masks: "sam_masks", scores: "sam_scores" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. Stable Diffusion Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.stable-diffusion",
    name: "Stable Diffusion Block",
    category: "vision",
    description: "Generate images from text prompts using Stable Diffusion",
    tags: ["diffusion", "generation", "text-to-image", "stable-diffusion", "huggingface"],
    inputs: [
      { id: "prompt", name: "Prompt", type: "text", required: true },
      { id: "negative_prompt", name: "Negative Prompt", type: "text", required: false },
    ],
    outputs: [
      { id: "image", name: "Generated Image", type: "image", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "stabilityai/stable-diffusion-2-1", placeholder: "HuggingFace diffusion model" },
      { id: "num_inference_steps", name: "Inference Steps", type: "number", default: 50, min: 1, max: 200, step: 1 },
      { id: "guidance_scale", name: "Guidance Scale (CFG)", type: "number", default: 7.5, min: 1, max: 30, step: 0.5 },
      { id: "height", name: "Height", type: "number", default: 512, min: 64, step: 64 },
      { id: "width", name: "Width", type: "number", default: 512, min: 64, step: 64 },
      { id: "seed", name: "Seed (-1 = random)", type: "number", default: -1, min: -1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "from diffusers import StableDiffusionPipeline"],
      body: `_sd_pipe = StableDiffusionPipeline.from_pretrained("{{params.model_name}}", torch_dtype=torch.float16)
_sd_pipe = _sd_pipe.to("cuda")
_generator = None if {{params.seed}} < 0 else torch.Generator("cuda").manual_seed({{params.seed}})
_sd_result = _sd_pipe(
    prompt={{inputs.prompt}},
    negative_prompt={{inputs.negative_prompt}},
    num_inference_steps={{params.num_inference_steps}},
    guidance_scale={{params.guidance_scale}},
    height={{params.height}},
    width={{params.width}},
    generator=_generator,
)
{{outputs.image}} = _sd_result.images[0]`,
      outputBindings: { image: "sd_image" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 23. ControlNet Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.controlnet",
    name: "ControlNet Block",
    category: "vision",
    description: "Condition Stable Diffusion generation with a ControlNet (edges, depth, pose, etc.)",
    tags: ["controlnet", "diffusion", "conditional", "generation", "huggingface"],
    inputs: [
      { id: "prompt", name: "Prompt", type: "text", required: true },
      { id: "control_image", name: "Control Image", type: "image", required: true, description: "Edge map, depth map, pose, etc." },
      { id: "negative_prompt", name: "Negative Prompt", type: "text", required: false },
    ],
    outputs: [
      { id: "image", name: "Generated Image", type: "image", required: true },
    ],
    parameters: [
      { id: "sd_model", name: "Stable Diffusion Model", type: "string", default: "stabilityai/stable-diffusion-2-1" },
      { id: "controlnet_model", name: "ControlNet Model", type: "string", default: "lllyasviel/control_v11p_sd15_canny", placeholder: "e.g. lllyasviel/control_v11p_sd15_canny" },
      { id: "num_inference_steps", name: "Inference Steps", type: "number", default: 30, min: 1, max: 200, step: 1 },
      { id: "guidance_scale", name: "Guidance Scale", type: "number", default: 7.5, min: 1, max: 30, step: 0.5 },
      { id: "controlnet_conditioning_scale", name: "ControlNet Scale", type: "number", default: 1.0, min: 0, max: 2, step: 0.1 },
    ],
    codeTemplate: {
      imports: ["import torch", "from diffusers import StableDiffusionControlNetPipeline, ControlNetModel"],
      body: `_controlnet = ControlNetModel.from_pretrained("{{params.controlnet_model}}", torch_dtype=torch.float16)
_cn_pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "{{params.sd_model}}", controlnet=_controlnet, torch_dtype=torch.float16,
)
_cn_pipe = _cn_pipe.to("cuda")
_cn_result = _cn_pipe(
    prompt={{inputs.prompt}},
    negative_prompt={{inputs.negative_prompt}},
    image={{inputs.control_image}},
    num_inference_steps={{params.num_inference_steps}},
    guidance_scale={{params.guidance_scale}},
    controlnet_conditioning_scale={{params.controlnet_conditioning_scale}},
)
{{outputs.image}} = _cn_result.images[0]`,
      outputBindings: { image: "controlnet_image" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 24. DINO Features
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.dino-features",
    name: "DINO Features",
    category: "vision",
    description: "Extract self-supervised visual features using DINOv2 from Meta",
    tags: ["dino", "features", "self-supervised", "foundation", "huggingface", "meta"],
    inputs: [
      { id: "image", name: "Input Image", type: "image", required: true },
    ],
    outputs: [
      { id: "features", name: "Patch Features", type: "tensor", required: true },
      { id: "cls_token", name: "CLS Token", type: "embedding", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model Name", type: "string", default: "facebook/dinov2-base", placeholder: "e.g. facebook/dinov2-base, facebook/dinov2-large" },
    ],
    codeTemplate: {
      imports: ["import torch", "from transformers import AutoImageProcessor, AutoModel"],
      body: `_dino_processor = AutoImageProcessor.from_pretrained("{{params.model_name}}")
_dino_model = AutoModel.from_pretrained("{{params.model_name}}")
_dino_inputs = _dino_processor(images={{inputs.image}}, return_tensors="pt")
with torch.no_grad():
    _dino_outputs = _dino_model(**_dino_inputs)
{{outputs.features}} = _dino_outputs.last_hidden_state[:, 1:, :]  # Patch tokens
{{outputs.cls_token}} = _dino_outputs.last_hidden_state[:, 0, :]   # CLS token`,
      outputBindings: { features: "dino_features", cls_token: "dino_cls" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 25. Feature Pyramid Network (FPN)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.fpn",
    name: "Feature Pyramid Network (FPN)",
    category: "vision",
    description: "Build multi-scale feature maps from a backbone for detection / segmentation",
    tags: ["fpn", "feature-pyramid", "multi-scale", "detection", "torchvision"],
    inputs: [
      { id: "features", name: "Backbone Feature Maps", type: "dict", required: true, description: "OrderedDict of feature maps at different scales" },
    ],
    outputs: [
      { id: "fpn_features", name: "FPN Feature Maps", type: "dict", required: true },
    ],
    parameters: [
      { id: "in_channels_list", name: "In Channels (comma-separated)", type: "string", default: "256,512,1024,2048", description: "Channel counts for each input level" },
      { id: "out_channels", name: "Out Channels", type: "number", default: 256, min: 1, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torch", "from torchvision.ops import FeaturePyramidNetwork"],
      body: `_in_channels = [int(c.strip()) for c in "{{params.in_channels_list}}".split(",")]
_fpn = FeaturePyramidNetwork(in_channels_list=_in_channels, out_channels={{params.out_channels}})
{{outputs.fpn_features}} = _fpn({{inputs.features}})`,
      outputBindings: { fpn_features: "fpn_out" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 26. NMS (Non-Max Suppression)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "vision.nms",
    name: "NMS (Non-Max Suppression)",
    category: "vision",
    description: "Apply non-maximum suppression to filter overlapping detections",
    tags: ["nms", "non-max-suppression", "post-processing", "detection", "torchvision"],
    inputs: [
      { id: "boxes", name: "Bounding Boxes", type: "tensor", required: true, description: "Shape: (N, 4) in xyxy format" },
      { id: "scores", name: "Confidence Scores", type: "tensor", required: true, description: "Shape: (N,)" },
    ],
    outputs: [
      { id: "keep_indices", name: "Keep Indices", type: "tensor", required: true },
      { id: "filtered_boxes", name: "Filtered Boxes", type: "tensor", required: true },
      { id: "filtered_scores", name: "Filtered Scores", type: "tensor", required: true },
    ],
    parameters: [
      { id: "iou_threshold", name: "IoU Threshold", type: "number", default: 0.5, min: 0, max: 1, step: 0.05 },
      { id: "score_threshold", name: "Score Threshold", type: "number", default: 0.0, min: 0, max: 1, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "from torchvision.ops import nms"],
      body: `_score_mask = {{inputs.scores}} > {{params.score_threshold}}
_nms_boxes = {{inputs.boxes}}[_score_mask]
_nms_scores = {{inputs.scores}}[_score_mask]
{{outputs.keep_indices}} = nms(_nms_boxes, _nms_scores, iou_threshold={{params.iou_threshold}})
{{outputs.filtered_boxes}} = _nms_boxes[{{outputs.keep_indices}}]
{{outputs.filtered_scores}} = _nms_scores[{{outputs.keep_indices}}]`,
      outputBindings: { keep_indices: "nms_keep", filtered_boxes: "nms_boxes", filtered_scores: "nms_scores" },
    },
  },
];
