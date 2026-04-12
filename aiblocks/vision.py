"""
aiblocks.vision — Vision Models

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def image_resize(image=None, width=256, height=256, interpolation='bilinear'):
    """Resize an image to target dimensions using PIL or torchvision
    
    Dependencies: pip install Pillow torchvision
    
    Args:
        image (image) (required): 
    
    Parameters:
        width (number, default=256): 
        height (number, default=256): 
        interpolation (select, default='bilinear'): 
    
    Returns:
        image: 
    """
    _imports = ['from torchvision import transforms', 'from PIL import Image']
    _code = '_interp_map = {"bilinear": Image.BILINEAR, "nearest": Image.NEAREST, "bicubic": Image.BICUBIC, "lanczos": Image.LANCZOS}\n_resize = transforms.Resize(({{params.height}}, {{params.width}}), interpolation=_interp_map["{{params.interpolation}}"])\n{{outputs.image_out}} = _resize({{inputs.image}})'
    
    _code = _code.replace("{{params.width}}", str(width))
    _code = _code.replace("{{params.height}}", str(height))
    _code = _code.replace("{{params.interpolation}}", str(interpolation))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.image_out}}", "_out_image_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_image_out")


def image_crop(image=None, size=224, mode='center'):
    """Center-crop or random-crop an image to a target size
    
    Dependencies: pip install torchvision
    
    Args:
        image (image) (required): 
    
    Parameters:
        size (number, default=224): 
        mode (select, default='center'): 
    
    Returns:
        image: 
    """
    _imports = ['from torchvision import transforms']
    _code = '_crop = transforms.CenterCrop({{params.size}}) if "{{params.mode}}" == "center" else transforms.RandomCrop({{params.size}})\n{{outputs.image_out}} = _crop({{inputs.image}})'
    
    _code = _code.replace("{{params.size}}", str(size))
    _code = _code.replace("{{params.mode}}", str(mode))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.image_out}}", "_out_image_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_image_out")


def image_augment(image=None, horizontal_flip=True, vertical_flip=False, rotation_degrees=15, color_jitter=True, brightness=0.2, contrast=0.2, saturation=0.2):
    """Apply random augmentations (flip, rotation, color jitter) for training data diversity
    
    Dependencies: pip install torchvision
    
    Args:
        image (image) (required): 
    
    Parameters:
        horizontal_flip (boolean, default=True): 
        vertical_flip (boolean, default=False): 
        rotation_degrees (number, default=15): 
        color_jitter (boolean, default=True): 
        brightness (number, default=0.2): 
        contrast (number, default=0.2): 
        saturation (number, default=0.2): 
    
    Returns:
        image: 
    """
    _imports = ['from torchvision import transforms']
    _code = '_augment_ops = []\nif {{params.horizontal_flip}}:\n    _augment_ops.append(transforms.RandomHorizontalFlip())\nif {{params.vertical_flip}}:\n    _augment_ops.append(transforms.RandomVerticalFlip())\nif {{params.rotation_degrees}} > 0:\n    _augment_ops.append(transforms.RandomRotation({{params.rotation_degrees}}))\nif {{params.color_jitter}}:\n    _augment_ops.append(transforms.ColorJitter(\n        brightness={{params.brightness}}, contrast={{params.contrast}}, saturation={{params.saturation}}\n    ))\n_augment = transforms.Compose(_augment_ops)\n{{outputs.image_out}} = _augment({{inputs.image}})'
    
    _code = _code.replace("{{params.horizontal_flip}}", str(horizontal_flip))
    _code = _code.replace("{{params.vertical_flip}}", str(vertical_flip))
    _code = _code.replace("{{params.rotation_degrees}}", str(rotation_degrees))
    _code = _code.replace("{{params.color_jitter}}", str(color_jitter))
    _code = _code.replace("{{params.brightness}}", str(brightness))
    _code = _code.replace("{{params.contrast}}", str(contrast))
    _code = _code.replace("{{params.saturation}}", str(saturation))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.image_out}}", "_out_image_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_image_out")


def image_normalize(image=None, mean='0.485,0.456,0.406', std='0.229,0.224,0.225'):
    """Normalize image tensor with mean and std (ImageNet defaults)
    
    Dependencies: pip install torchvision
    
    Args:
        image (tensor) (required): 
    
    Parameters:
        mean (string, default='0.485,0.456,0.406'): Per-channel mean values
        std (string, default='0.229,0.224,0.225'): Per-channel std values
    
    Returns:
        tensor: 
    """
    _imports = ['from torchvision import transforms']
    _code = '_mean = [float(x.strip()) for x in "{{params.mean}}".split(",")]\n_std = [float(x.strip()) for x in "{{params.std}}".split(",")]\n_normalize = transforms.Normalize(mean=_mean, std=_std)\n{{outputs.tensor_out}} = _normalize({{inputs.image}})'
    
    _code = _code.replace("{{params.mean}}", str(mean))
    _code = _code.replace("{{params.std}}", str(std))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.tensor_out}}", "_out_tensor_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tensor_out")


def resnet_block(image_batch=None, variant='resnet50', pretrained=True):
    """Load a pretrained ResNet model for feature extraction or classification
    
    Dependencies: pip install torch torchvision
    
    Args:
        image_batch (image_batch) (required): Shape: (batch, 3, H, W) normalized
    
    Parameters:
        variant (select, default='resnet50'): 
        pretrained (boolean, default=True): 
    
    Returns:
        dict with keys:
            logits (tensor): 
            features (tensor): 
    """
    _imports = ['import torch', 'import torchvision.models as models']
    _code = '_weights = "IMAGENET1K_V2" if {{params.pretrained}} else None\n_resnet = models.get_model("{{params.variant}}", weights=_weights)\n_resnet.eval()\n\n# Extract features from the penultimate layer\n_children = list(_resnet.children())\n_feature_extractor = torch.nn.Sequential(*_children[:-1])\nwith torch.no_grad():\n    {{outputs.features}} = _feature_extractor({{inputs.image_batch}}).flatten(1)\n    {{outputs.logits}} = _resnet({{inputs.image_batch}})'
    
    _code = _code.replace("{{params.variant}}", str(variant))
    _code = _code.replace("{{params.pretrained}}", str(pretrained))
    _code = _code.replace("{{inputs.image_batch}}", "image_batch")
    _code = _code.replace("{{outputs.logits}}", "_out_logits")
    _code = _code.replace("{{outputs.features}}", "_out_features")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image_batch"] = image_batch
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"logits": _ns.get("_out_logits"), "features": _ns.get("_out_features")}


def efficientnet_block(image_batch=None, variant='efficientnet_b0', pretrained=True):
    """Load a pretrained EfficientNet model for efficient image classification
    
    Dependencies: pip install torch torchvision
    
    Args:
        image_batch (image_batch) (required): 
    
    Parameters:
        variant (select, default='efficientnet_b0'): 
        pretrained (boolean, default=True): 
    
    Returns:
        dict with keys:
            logits (tensor): 
            features (tensor): 
    """
    _imports = ['import torch', 'import torchvision.models as models']
    _code = '_weights = "IMAGENET1K_V1" if {{params.pretrained}} else None\n_effnet = models.get_model("{{params.variant}}", weights=_weights)\n_effnet.eval()\nwith torch.no_grad():\n    {{outputs.features}} = _effnet.features({{inputs.image_batch}})\n    {{outputs.features}} = _effnet.avgpool({{outputs.features}}).flatten(1)\n    {{outputs.logits}} = _effnet({{inputs.image_batch}})'
    
    _code = _code.replace("{{params.variant}}", str(variant))
    _code = _code.replace("{{params.pretrained}}", str(pretrained))
    _code = _code.replace("{{inputs.image_batch}}", "image_batch")
    _code = _code.replace("{{outputs.logits}}", "_out_logits")
    _code = _code.replace("{{outputs.features}}", "_out_features")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image_batch"] = image_batch
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"logits": _ns.get("_out_logits"), "features": _ns.get("_out_features")}


def mobilenet_block(image_batch=None, variant='mobilenet_v3_small', pretrained=True):
    """Load a pretrained MobileNet model optimized for mobile / edge deployment
    
    Dependencies: pip install torch torchvision
    
    Args:
        image_batch (image_batch) (required): 
    
    Parameters:
        variant (select, default='mobilenet_v3_small'): 
        pretrained (boolean, default=True): 
    
    Returns:
        dict with keys:
            logits (tensor): 
            features (tensor): 
    """
    _imports = ['import torch', 'import torchvision.models as models']
    _code = '_weights = "IMAGENET1K_V1" if {{params.pretrained}} else None\n_mobilenet = models.get_model("{{params.variant}}", weights=_weights)\n_mobilenet.eval()\nwith torch.no_grad():\n    {{outputs.features}} = _mobilenet.features({{inputs.image_batch}})\n    {{outputs.features}} = torch.nn.functional.adaptive_avg_pool2d({{outputs.features}}, 1).flatten(1)\n    {{outputs.logits}} = _mobilenet({{inputs.image_batch}})'
    
    _code = _code.replace("{{params.variant}}", str(variant))
    _code = _code.replace("{{params.pretrained}}", str(pretrained))
    _code = _code.replace("{{inputs.image_batch}}", "image_batch")
    _code = _code.replace("{{outputs.logits}}", "_out_logits")
    _code = _code.replace("{{outputs.features}}", "_out_features")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image_batch"] = image_batch
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"logits": _ns.get("_out_logits"), "features": _ns.get("_out_features")}


def image_classifier(image=None, model_name='google/vit-base-patch16-224', top_k=5):
    """General-purpose image classifier using a HuggingFace pipeline
    
    Dependencies: pip install transformers
    
    Args:
        image (image) (required): 
    
    Parameters:
        model_name (string, default='google/vit-base-patch16-224'): 
        top_k (number, default=5): 
    
    Returns:
        dict with keys:
            predictions (list): List of {label, score} dicts
            top_label (text): 
            top_score (number): 
    """
    _imports = ['from transformers import pipeline']
    _code = '_classifier = pipeline("image-classification", model="{{params.model_name}}")\n{{outputs.predictions}} = _classifier({{inputs.image}}, top_k={{params.top_k}})\n{{outputs.top_label}} = {{outputs.predictions}}[0]["label"]\n{{outputs.top_score}} = {{outputs.predictions}}[0]["score"]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.predictions}}", "_out_predictions")
    _code = _code.replace("{{outputs.top_label}}", "_out_top_label")
    _code = _code.replace("{{outputs.top_score}}", "_out_top_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"predictions": _ns.get("_out_predictions"), "top_label": _ns.get("_out_top_label"), "top_score": _ns.get("_out_top_score")}


def object_detector_yolo(image=None, model_size='yolov8n.pt', conf_threshold=0.25, iou_threshold=0.45):
    """Run YOLOv8 object detection using the Ultralytics library
    
    Dependencies: pip install ultralytics
    
    Args:
        image (image) (required): 
    
    Parameters:
        model_size (select, default='yolov8n.pt'): 
        conf_threshold (number, default=0.25): 
        iou_threshold (number, default=0.45): 
    
    Returns:
        dict with keys:
            results (any): 
            boxes (tensor): 
            scores (tensor): 
            classes (tensor): 
    """
    _imports = ['from ultralytics import YOLO']
    _code = '_yolo = YOLO("{{params.model_size}}")\n{{outputs.results}} = _yolo({{inputs.image}}, conf={{params.conf_threshold}}, iou={{params.iou_threshold}})[0]\n{{outputs.boxes}} = {{outputs.results}}.boxes.xyxy\n{{outputs.scores}} = {{outputs.results}}.boxes.conf\n{{outputs.classes}} = {{outputs.results}}.boxes.cls'
    
    _code = _code.replace("{{params.model_size}}", str(model_size))
    _code = _code.replace("{{params.conf_threshold}}", str(conf_threshold))
    _code = _code.replace("{{params.iou_threshold}}", str(iou_threshold))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.results}}", "_out_results")
    _code = _code.replace("{{outputs.boxes}}", "_out_boxes")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    _code = _code.replace("{{outputs.classes}}", "_out_classes")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"results": _ns.get("_out_results"), "boxes": _ns.get("_out_boxes"), "scores": _ns.get("_out_scores"), "classes": _ns.get("_out_classes")}


def object_detector_detr(image=None, model_name='facebook/detr-resnet-50', threshold=0.7):
    """DEtection TRansformer — end-to-end object detection with a transformer
    
    Dependencies: pip install torch transformers
    
    Args:
        image (image) (required): 
    
    Parameters:
        model_name (string, default='facebook/detr-resnet-50'): 
        threshold (number, default=0.7): 
    
    Returns:
        dict with keys:
            results (list): 
            boxes (tensor): 
            scores (tensor): 
            labels (tensor): 
    """
    _imports = ['import torch', 'from transformers import DetrForObjectDetection, DetrImageProcessor']
    _code = '_detr_processor = DetrImageProcessor.from_pretrained("{{params.model_name}}")\n_detr_model = DetrForObjectDetection.from_pretrained("{{params.model_name}}")\n_detr_inputs = _detr_processor(images={{inputs.image}}, return_tensors="pt")\nwith torch.no_grad():\n    _detr_outputs = _detr_model(**_detr_inputs)\n_target_sizes = torch.tensor([{{inputs.image}}.size[::-1]])\n{{outputs.results}} = _detr_processor.post_process_object_detection(\n    _detr_outputs, target_sizes=_target_sizes, threshold={{params.threshold}}\n)[0]\n{{outputs.boxes}} = {{outputs.results}}["boxes"]\n{{outputs.scores}} = {{outputs.results}}["scores"]\n{{outputs.labels}} = {{outputs.results}}["labels"]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.threshold}}", str(threshold))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.results}}", "_out_results")
    _code = _code.replace("{{outputs.boxes}}", "_out_boxes")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    _code = _code.replace("{{outputs.labels}}", "_out_labels")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"results": _ns.get("_out_results"), "boxes": _ns.get("_out_boxes"), "scores": _ns.get("_out_scores"), "labels": _ns.get("_out_labels")}


def semantic_segmenter(image=None, model_name='nvidia/segformer-b0-finetuned-ade-512-512'):
    """Per-pixel semantic segmentation using a HuggingFace model (SegFormer, etc.)
    
    Dependencies: pip install torch transformers
    
    Args:
        image (image) (required): 
    
    Parameters:
        model_name (string, default='nvidia/segformer-b0-finetuned-ade-512-512'): 
    
    Returns:
        dict with keys:
            segmentation_map (tensor): Per-pixel class IDs
            logits (tensor): 
    """
    _imports = ['import torch', 'from transformers import SegformerForSemanticSegmentation, SegformerImageProcessor']
    _code = '_seg_processor = SegformerImageProcessor.from_pretrained("{{params.model_name}}")\n_seg_model = SegformerForSemanticSegmentation.from_pretrained("{{params.model_name}}")\n_seg_inputs = _seg_processor(images={{inputs.image}}, return_tensors="pt")\nwith torch.no_grad():\n    {{outputs.logits}} = _seg_model(**_seg_inputs).logits\n_upsampled = torch.nn.functional.interpolate(\n    {{outputs.logits}}, size={{inputs.image}}.size[::-1], mode="bilinear", align_corners=False,\n)\n{{outputs.segmentation_map}} = _upsampled.argmax(dim=1).squeeze(0)'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.segmentation_map}}", "_out_segmentation_map")
    _code = _code.replace("{{outputs.logits}}", "_out_logits")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"segmentation_map": _ns.get("_out_segmentation_map"), "logits": _ns.get("_out_logits")}


def instance_segmenter_mask_rcnn(image_batch=None, pretrained=True, score_threshold=0.5):
    """Instance segmentation using Mask R-CNN from torchvision
    
    Dependencies: pip install torch torchvision
    
    Args:
        image_batch (image_batch) (required): Normalized tensor (batch, 3, H, W)
    
    Parameters:
        pretrained (boolean, default=True): 
        score_threshold (number, default=0.5): 
    
    Returns:
        dict with keys:
            boxes (tensor): 
            masks (tensor): 
            labels (tensor): 
            scores (tensor): 
    """
    _imports = ['import torch', 'import torchvision.models.detection as det_models']
    _code = '_weights = "COCO_V1" if {{params.pretrained}} else None\n_mask_rcnn = det_models.maskrcnn_resnet50_fpn(weights=_weights)\n_mask_rcnn.eval()\nwith torch.no_grad():\n    _predictions = _mask_rcnn({{inputs.image_batch}})[0]\n_keep = _predictions["scores"] > {{params.score_threshold}}\n{{outputs.boxes}} = _predictions["boxes"][_keep]\n{{outputs.masks}} = _predictions["masks"][_keep]\n{{outputs.labels}} = _predictions["labels"][_keep]\n{{outputs.scores}} = _predictions["scores"][_keep]'
    
    _code = _code.replace("{{params.pretrained}}", str(pretrained))
    _code = _code.replace("{{params.score_threshold}}", str(score_threshold))
    _code = _code.replace("{{inputs.image_batch}}", "image_batch")
    _code = _code.replace("{{outputs.boxes}}", "_out_boxes")
    _code = _code.replace("{{outputs.masks}}", "_out_masks")
    _code = _code.replace("{{outputs.labels}}", "_out_labels")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image_batch"] = image_batch
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"boxes": _ns.get("_out_boxes"), "masks": _ns.get("_out_masks"), "labels": _ns.get("_out_labels"), "scores": _ns.get("_out_scores")}


def panoptic_segmenter(image=None, model_name='facebook/mask2former-swin-base-coco-panoptic'):
    """Panoptic segmentation combining semantic and instance segmentation (Mask2Former)
    
    Dependencies: pip install torch transformers
    
    Args:
        image (image) (required): 
    
    Parameters:
        model_name (string, default='facebook/mask2former-swin-base-coco-panoptic'): 
    
    Returns:
        dict with keys:
            panoptic_map (tensor): 
            segments_info (list): 
    """
    _imports = ['import torch', 'from transformers import AutoImageProcessor, Mask2FormerForUniversalSegmentation']
    _code = '_pan_processor = AutoImageProcessor.from_pretrained("{{params.model_name}}")\n_pan_model = Mask2FormerForUniversalSegmentation.from_pretrained("{{params.model_name}}")\n_pan_inputs = _pan_processor(images={{inputs.image}}, return_tensors="pt")\nwith torch.no_grad():\n    _pan_outputs = _pan_model(**_pan_inputs)\n_pan_result = _pan_processor.post_process_panoptic_segmentation(\n    _pan_outputs, target_sizes=[{{inputs.image}}.size[::-1]]\n)[0]\n{{outputs.panoptic_map}} = _pan_result["segmentation"]\n{{outputs.segments_info}} = _pan_result["segments_info"]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.panoptic_map}}", "_out_panoptic_map")
    _code = _code.replace("{{outputs.segments_info}}", "_out_segments_info")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"panoptic_map": _ns.get("_out_panoptic_map"), "segments_info": _ns.get("_out_segments_info")}


def depth_estimator(image=None, model_name='Intel/dpt-large'):
    """Monocular depth estimation using a HuggingFace model (DPT, Depth Anything)
    
    Dependencies: pip install torch transformers
    
    Args:
        image (image) (required): 
    
    Parameters:
        model_name (string, default='Intel/dpt-large'): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torch', 'from transformers import pipeline']
    _code = '_depth_pipe = pipeline("depth-estimation", model="{{params.model_name}}")\n_depth_result = _depth_pipe({{inputs.image}})\n{{outputs.depth_map}} = _depth_result["predicted_depth"]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.depth_map}}", "_out_depth_map")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_depth_map")


def optical_flow(frame1=None, frame2=None, model_variant='raft_small'):
    """Compute dense optical flow between two frames using RAFT from torchvision
    
    Dependencies: pip install torch torchvision
    
    Args:
        frame1 (tensor) (required): Shape: (batch, 3, H, W)
        frame2 (tensor) (required): Shape: (batch, 3, H, W)
    
    Parameters:
        model_variant (select, default='raft_small'): 
    
    Returns:
        tensor: Shape: (batch, 2, H, W)
    """
    _imports = ['import torch', 'from torchvision.models.optical_flow import raft_small, raft_large, Raft_Small_Weights, Raft_Large_Weights']
    _code = 'if "{{params.model_variant}}" == "raft_small":\n    _flow_model = raft_small(weights=Raft_Small_Weights.DEFAULT)\n "else":\n    _flow_model = raft_large(weights=Raft_Large_Weights.DEFAULT)\n_flow_model.eval()\nwith torch.no_grad():\n    _flow_preds = _flow_model({{inputs.frame1}}, {{inputs.frame2}})\n{{outputs.flow}} = _flow_preds[-1]  # Last refinement iteration'
    
    _code = _code.replace("{{params.model_variant}}", str(model_variant))
    _code = _code.replace("{{inputs.frame1}}", "frame1")
    _code = _code.replace("{{inputs.frame2}}", "frame2")
    _code = _code.replace("{{outputs.flow}}", "_out_flow")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["frame1"] = frame1
    _ns["frame2"] = frame2
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_flow")


def keypoint_detector(image_batch=None, pretrained=True, score_threshold=0.7):
    """Detect human body keypoints using Keypoint R-CNN from torchvision
    
    Dependencies: pip install torch torchvision
    
    Args:
        image_batch (image_batch) (required): 
    
    Parameters:
        pretrained (boolean, default=True): 
        score_threshold (number, default=0.7): 
    
    Returns:
        dict with keys:
            keypoints (tensor): Shape: (num_people, 17, 3) — x, y, score
            boxes (tensor): 
            scores (tensor): 
    """
    _imports = ['import torch', 'import torchvision.models.detection as det_models']
    _code = '_weights = "COCO_V1" if {{params.pretrained}} else None\n_kp_model = det_models.keypointrcnn_resnet50_fpn(weights=_weights)\n_kp_model.eval()\nwith torch.no_grad():\n    _kp_preds = _kp_model({{inputs.image_batch}})[0]\n_kp_keep = _kp_preds["scores"] > {{params.score_threshold}}\n{{outputs.keypoints}} = _kp_preds["keypoints"][_kp_keep]\n{{outputs.boxes}} = _kp_preds["boxes"][_kp_keep]\n{{outputs.scores}} = _kp_preds["scores"][_kp_keep]'
    
    _code = _code.replace("{{params.pretrained}}", str(pretrained))
    _code = _code.replace("{{params.score_threshold}}", str(score_threshold))
    _code = _code.replace("{{inputs.image_batch}}", "image_batch")
    _code = _code.replace("{{outputs.keypoints}}", "_out_keypoints")
    _code = _code.replace("{{outputs.boxes}}", "_out_boxes")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image_batch"] = image_batch
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"keypoints": _ns.get("_out_keypoints"), "boxes": _ns.get("_out_boxes"), "scores": _ns.get("_out_scores")}


def face_detector(image=None, backend='opencv', scale_factor=1.1, min_neighbors=5, confidence=0.5):
    """Detect faces in images using OpenCV DNN or a HuggingFace pipeline
    
    Dependencies: pip install numpy opencv-python
    
    Args:
        image (image) (required): 
    
    Parameters:
        backend (select, default='opencv'): 
        scale_factor (number, default=1.1): 
        min_neighbors (number, default=5): 
        confidence (number, default=0.5): 
    
    Returns:
        dict with keys:
            faces (list): List of (x, y, w, h) tuples
            num_faces (number): 
    """
    _imports = ['import cv2', 'import numpy as np']
    _code = '_img_array = np.array({{inputs.image}})\n_gray = cv2.cvtColor(_img_array, cv2.COLOR_RGB2GRAY)\n\nif "{{params.backend}}" == "opencv":\n    _face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")\n    _detections = _face_cascade.detectMultiScale(_gray, scaleFactor={{params.scale_factor}}, minNeighbors={{params.min_neighbors}})\n    {{outputs.faces}} = [tuple(map(int, d)) for d in _detections]\n "else":\n    _net = cv2.dnn.readNetFromCaffe(\n        "deploy.prototxt", "res10_300x300_ssd_iter_140000.caffemodel"\n    )\n    _blob = cv2.dnn.blobFromImage(_img_array, 1.0, (300, 300), (104.0, 177.0, 123.0))\n    _net.setInput(_blob)\n    _dnn_detections = _net.forward()\n    h, w = _img_array.shape[:2]\n    {{outputs.faces}} = []\n    for i in range(_dnn_detections.shape[2]):\n        conf = _dnn_detections[0, 0, i, 2]\n        if conf > {{params.confidence}}:\n            box = _dnn_detections[0, 0, i, "3":7] * np.array([w, h, w, h])\n            x1, y1, x2, y2 = box.astype(int)\n            {{outputs.faces}}.append((int(x1), int(y1), int(x2 - x1), int(y2 - y1)))\n\n{{outputs.num_faces}} = len({{outputs.faces}})'
    
    _code = _code.replace("{{params.backend}}", str(backend))
    _code = _code.replace("{{params.scale_factor}}", str(scale_factor))
    _code = _code.replace("{{params.min_neighbors}}", str(min_neighbors))
    _code = _code.replace("{{params.confidence}}", str(confidence))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.faces}}", "_out_faces")
    _code = _code.replace("{{outputs.num_faces}}", "_out_num_faces")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"faces": _ns.get("_out_faces"), "num_faces": _ns.get("_out_num_faces")}


def ocr_block(image=None, engine='trocr', model_name='microsoft/trocr-base-printed', languages='en'):
    """Extract text from images using a TrOCR pipeline or EasyOCR
    
    Dependencies: pip install torch
    
    Args:
        image (image) (required): 
    
    Parameters:
        engine (select, default='trocr'): 
        model_name (string, default='microsoft/trocr-base-printed'): 
        languages (string, default='en'): 
    
    Returns:
        dict with keys:
            text (text): 
            results (list): 
    """
    _imports = ['import torch']
    _code = 'if "{{params.engine}}" == "trocr":\n    from transformers import TrOCRProcessor, VisionEncoderDecoderModel\n    _ocr_processor = TrOCRProcessor.from_pretrained("{{params.model_name}}")\n    _ocr_model = VisionEncoderDecoderModel.from_pretrained("{{params.model_name}}")\n    _ocr_inputs = _ocr_processor(images={{inputs.image}}, return_tensors="pt")\n    with torch.no_grad():\n        _gen_ids = _ocr_model.generate(**_ocr_inputs)\n    {{outputs.text}} = _ocr_processor.batch_decode(_gen_ids, skip_special_tokens=True)[0]\n    {{outputs.results}} = [{"text": {{outputs.text}}, "confidence": 1.0}]\n "else":\n    import easyocr\n    _reader = easyocr.Reader([l.strip() for l in "{{params.languages}}".split(",")])\n    import numpy as np\n    _ocr_detections = _reader.readtext(np.array({{inputs.image}}))\n    {{outputs.results}} = [{"bbox": d[0], "text": d[1], "confidence": d[2]} for d in _ocr_detections]\n    {{outputs.text}} = " ".join(d[1] for d in _ocr_detections)'
    
    _code = _code.replace("{{params.engine}}", str(engine))
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.languages}}", str(languages))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.text}}", "_out_text")
    _code = _code.replace("{{outputs.results}}", "_out_results")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"text": _ns.get("_out_text"), "results": _ns.get("_out_results")}


def clip_encoder_image(image=None, model_name='openai/clip-vit-base-patch32'):
    """Encode images into CLIP embedding space for cross-modal similarity
    
    Dependencies: pip install torch transformers
    
    Args:
        image (image) (required): 
    
    Parameters:
        model_name (string, default='openai/clip-vit-base-patch32'): 
    
    Returns:
        embedding: 
    """
    _imports = ['import torch', 'from transformers import CLIPProcessor, CLIPModel']
    _code = '_clip_model = CLIPModel.from_pretrained("{{params.model_name}}")\n_clip_processor = CLIPProcessor.from_pretrained("{{params.model_name}}")\n_clip_inputs = _clip_processor(images={{inputs.image}}, return_tensors="pt")\nwith torch.no_grad():\n    {{outputs.embedding}} = _clip_model.get_image_features(**_clip_inputs)\n{{outputs.embedding}} = {{outputs.embedding}} / {{outputs.embedding}}.norm(p=2, dim=-1, keepdim=True)'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.embedding}}", "_out_embedding")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_embedding")


def clip_encoder_text(text=None, model_name='openai/clip-vit-base-patch32'):
    """Encode text into CLIP embedding space for cross-modal similarity
    
    Dependencies: pip install torch transformers
    
    Args:
        text (text) (required): 
    
    Parameters:
        model_name (string, default='openai/clip-vit-base-patch32'): 
    
    Returns:
        embedding: 
    """
    _imports = ['import torch', 'from transformers import CLIPProcessor, CLIPModel']
    _code = '_clip_model = CLIPModel.from_pretrained("{{params.model_name}}")\n_clip_processor = CLIPProcessor.from_pretrained("{{params.model_name}}")\n_clip_inputs = _clip_processor(text={{inputs.text}}, return_tensors="pt", padding=True)\nwith torch.no_grad():\n    {{outputs.embedding}} = _clip_model.get_text_features(**_clip_inputs)\n{{outputs.embedding}} = {{outputs.embedding}} / {{outputs.embedding}}.norm(p=2, dim=-1, keepdim=True)'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.embedding}}", "_out_embedding")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_embedding")


def sam(image=None, input_points=None, input_boxes=None, model_name='facebook/sam-vit-base'):
    """Meta's Segment Anything Model for zero-shot segmentation with point or box prompts
    
    Dependencies: pip install torch transformers
    
    Args:
        image (image) (required): 
        input_points (list): List of [x, y] prompt points
        input_boxes (list): List of [x1, y1, x2, y2] prompt boxes
    
    Parameters:
        model_name (string, default='facebook/sam-vit-base'): 
    
    Returns:
        dict with keys:
            masks (tensor): 
            scores (tensor): 
    """
    _imports = ['import torch', 'from transformers import SamModel, SamProcessor']
    _code = '_sam_model = SamModel.from_pretrained("{{params.model_name}}")\n_sam_processor = SamProcessor.from_pretrained("{{params.model_name}}")\n_sam_inputs = _sam_processor(\n    {{inputs.image}},\n    input_points={{inputs.input_points}},\n    input_boxes={{inputs.input_boxes}},\n    return_tensors="pt",\n)\nwith torch.no_grad():\n    _sam_outputs = _sam_model(**_sam_inputs)\n{{outputs.masks}} = _sam_processor.image_processor.post_process_masks(\n    _sam_outputs.pred_masks, _sam_inputs["original_sizes"], _sam_inputs["reshaped_input_sizes"]\n)[0]\n{{outputs.scores}} = _sam_outputs.iou_scores.squeeze()'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{inputs.input_points}}", "input_points")
    _code = _code.replace("{{inputs.input_boxes}}", "input_boxes")
    _code = _code.replace("{{outputs.masks}}", "_out_masks")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    _ns["input_points"] = input_points
    _ns["input_boxes"] = input_boxes
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"masks": _ns.get("_out_masks"), "scores": _ns.get("_out_scores")}


def stable_diffusion(prompt=None, negative_prompt=None, model_name='stabilityai/stable-diffusion-2-1', num_inference_steps=50, guidance_scale=7.5, height=512, width=512, seed=-1):
    """Generate images from text prompts using Stable Diffusion
    
    Dependencies: pip install diffusers torch
    
    Args:
        prompt (text) (required): 
        negative_prompt (text): 
    
    Parameters:
        model_name (string, default='stabilityai/stable-diffusion-2-1'): 
        num_inference_steps (number, default=50): 
        guidance_scale (number, default=7.5): 
        height (number, default=512): 
        width (number, default=512): 
        seed (number, default=-1): 
    
    Returns:
        image: 
    """
    _imports = ['import torch', 'from diffusers import StableDiffusionPipeline']
    _code = '_sd_pipe = StableDiffusionPipeline.from_pretrained("{{params.model_name}}", torch_dtype=torch.float16)\n_sd_pipe = _sd_pipe.to("cuda")\n_generator = None if {{params.seed}} < 0 else torch.Generator("cuda").manual_seed({{params.seed}})\n_sd_result = _sd_pipe(\n    prompt={{inputs.prompt}},\n    negative_prompt={{inputs.negative_prompt}},\n    num_inference_steps={{params.num_inference_steps}},\n    guidance_scale={{params.guidance_scale}},\n    height={{params.height}},\n    width={{params.width}},\n    generator=_generator,\n)\n{{outputs.image}} = _sd_result.images[0]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.num_inference_steps}}", str(num_inference_steps))
    _code = _code.replace("{{params.guidance_scale}}", str(guidance_scale))
    _code = _code.replace("{{params.height}}", str(height))
    _code = _code.replace("{{params.width}}", str(width))
    _code = _code.replace("{{params.seed}}", str(seed))
    _code = _code.replace("{{inputs.prompt}}", "prompt")
    _code = _code.replace("{{inputs.negative_prompt}}", "negative_prompt")
    _code = _code.replace("{{outputs.image}}", "_out_image")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["prompt"] = prompt
    _ns["negative_prompt"] = negative_prompt
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_image")


def controlnet(prompt=None, control_image=None, negative_prompt=None, sd_model='stabilityai/stable-diffusion-2-1', controlnet_model='lllyasviel/control_v11p_sd15_canny', num_inference_steps=30, guidance_scale=7.5, controlnet_conditioning_scale=1.0):
    """Condition Stable Diffusion generation with a ControlNet (edges, depth, pose, etc.)
    
    Dependencies: pip install diffusers torch
    
    Args:
        prompt (text) (required): 
        control_image (image) (required): Edge map, depth map, pose, etc.
        negative_prompt (text): 
    
    Parameters:
        sd_model (string, default='stabilityai/stable-diffusion-2-1'): 
        controlnet_model (string, default='lllyasviel/control_v11p_sd15_canny'): 
        num_inference_steps (number, default=30): 
        guidance_scale (number, default=7.5): 
        controlnet_conditioning_scale (number, default=1.0): 
    
    Returns:
        image: 
    """
    _imports = ['import torch', 'from diffusers import StableDiffusionControlNetPipeline, ControlNetModel']
    _code = '_controlnet = ControlNetModel.from_pretrained("{{params.controlnet_model}}", torch_dtype=torch.float16)\n_cn_pipe = StableDiffusionControlNetPipeline.from_pretrained(\n    "{{params.sd_model}}", controlnet=_controlnet, torch_dtype=torch.float16,\n)\n_cn_pipe = _cn_pipe.to("cuda")\n_cn_result = _cn_pipe(\n    prompt={{inputs.prompt}},\n    negative_prompt={{inputs.negative_prompt}},\n    image={{inputs.control_image}},\n    num_inference_steps={{params.num_inference_steps}},\n    guidance_scale={{params.guidance_scale}},\n    controlnet_conditioning_scale={{params.controlnet_conditioning_scale}},\n)\n{{outputs.image}} = _cn_result.images[0]'
    
    _code = _code.replace("{{params.sd_model}}", str(sd_model))
    _code = _code.replace("{{params.controlnet_model}}", str(controlnet_model))
    _code = _code.replace("{{params.num_inference_steps}}", str(num_inference_steps))
    _code = _code.replace("{{params.guidance_scale}}", str(guidance_scale))
    _code = _code.replace("{{params.controlnet_conditioning_scale}}", str(controlnet_conditioning_scale))
    _code = _code.replace("{{inputs.prompt}}", "prompt")
    _code = _code.replace("{{inputs.control_image}}", "control_image")
    _code = _code.replace("{{inputs.negative_prompt}}", "negative_prompt")
    _code = _code.replace("{{outputs.image}}", "_out_image")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["prompt"] = prompt
    _ns["control_image"] = control_image
    _ns["negative_prompt"] = negative_prompt
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_image")


def dino_features(image=None, model_name='facebook/dinov2-base'):
    """Extract self-supervised visual features using DINOv2 from Meta
    
    Dependencies: pip install torch transformers
    
    Args:
        image (image) (required): 
    
    Parameters:
        model_name (string, default='facebook/dinov2-base'): 
    
    Returns:
        dict with keys:
            features (tensor): 
            cls_token (embedding): 
    """
    _imports = ['import torch', 'from transformers import AutoImageProcessor, AutoModel']
    _code = '_dino_processor = AutoImageProcessor.from_pretrained("{{params.model_name}}")\n_dino_model = AutoModel.from_pretrained("{{params.model_name}}")\n_dino_inputs = _dino_processor(images={{inputs.image}}, return_tensors="pt")\nwith torch.no_grad():\n    _dino_outputs = _dino_model(**_dino_inputs)\n{{outputs.features}} = _dino_outputs.last_hidden_state[:, "1":, :]  # Patch tokens\n{{outputs.cls_token}} = _dino_outputs.last_hidden_state[:, 0, :]   # CLS token'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{inputs.image}}", "image")
    _code = _code.replace("{{outputs.features}}", "_out_features")
    _code = _code.replace("{{outputs.cls_token}}", "_out_cls_token")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["image"] = image
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"features": _ns.get("_out_features"), "cls_token": _ns.get("_out_cls_token")}


def fpn(features=None, in_channels_list='256,512,1024,2048', out_channels=256):
    """Build multi-scale feature maps from a backbone for detection / segmentation
    
    Dependencies: pip install torch torchvision
    
    Args:
        features (dict) (required): OrderedDict of feature maps at different scales
    
    Parameters:
        in_channels_list (string, default='256,512,1024,2048'): Channel counts for each input level
        out_channels (number, default=256): 
    
    Returns:
        dict: 
    """
    _imports = ['import torch', 'from torchvision.ops import FeaturePyramidNetwork']
    _code = '_in_channels = [int(c.strip()) for c in "{{params.in_channels_list}}".split(",")]\n_fpn = FeaturePyramidNetwork(in_channels_list=_in_channels, out_channels={{params.out_channels}})\n{{outputs.fpn_features}} = _fpn({{inputs.features}})'
    
    _code = _code.replace("{{params.in_channels_list}}", str(in_channels_list))
    _code = _code.replace("{{params.out_channels}}", str(out_channels))
    _code = _code.replace("{{inputs.features}}", "features")
    _code = _code.replace("{{outputs.fpn_features}}", "_out_fpn_features")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["features"] = features
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_fpn_features")


def nms(boxes=None, scores=None, iou_threshold=0.5, score_threshold=0.0):
    """Apply non-maximum suppression to filter overlapping detections
    
    Dependencies: pip install torch torchvision
    
    Args:
        boxes (tensor) (required): Shape: (N, 4) in xyxy format
        scores (tensor) (required): Shape: (N,)
    
    Parameters:
        iou_threshold (number, default=0.5): 
        score_threshold (number, default=0.0): 
    
    Returns:
        dict with keys:
            keep_indices (tensor): 
            filtered_boxes (tensor): 
            filtered_scores (tensor): 
    """
    _imports = ['import torch', 'from torchvision.ops import nms']
    _code = '_score_mask = {{inputs.scores}} > {{params.score_threshold}}\n_nms_boxes = {{inputs.boxes}}[_score_mask]\n_nms_scores = {{inputs.scores}}[_score_mask]\n{{outputs.keep_indices}} = nms(_nms_boxes, _nms_scores, iou_threshold={{params.iou_threshold}})\n{{outputs.filtered_boxes}} = _nms_boxes[{{outputs.keep_indices}}]\n{{outputs.filtered_scores}} = _nms_scores[{{outputs.keep_indices}}]'
    
    _code = _code.replace("{{params.iou_threshold}}", str(iou_threshold))
    _code = _code.replace("{{params.score_threshold}}", str(score_threshold))
    _code = _code.replace("{{inputs.boxes}}", "boxes")
    _code = _code.replace("{{inputs.scores}}", "scores")
    _code = _code.replace("{{outputs.keep_indices}}", "_out_keep_indices")
    _code = _code.replace("{{outputs.filtered_boxes}}", "_out_filtered_boxes")
    _code = _code.replace("{{outputs.filtered_scores}}", "_out_filtered_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["boxes"] = boxes
    _ns["scores"] = scores
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"keep_indices": _ns.get("_out_keep_indices"), "filtered_boxes": _ns.get("_out_filtered_boxes"), "filtered_scores": _ns.get("_out_filtered_scores")}

