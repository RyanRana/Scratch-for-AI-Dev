#!/usr/bin/env python3
"""
generate-docs.py — Parse all AI Blocks TypeScript definitions and produce
a single JSON documentation + API reference consumed by the web app.

Usage:
    python tools/generate-docs.py

Output:
    apps/web/public/blocks-api.json
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOCKS_DIR = ROOT / "packages" / "block-schemas" / "src" / "blocks"
TYPES_FILE = ROOT / "packages" / "block-schemas" / "src" / "types.ts"
OUT_FILE = ROOT / "apps" / "web" / "public" / "blocks-api.json"

# ── Category metadata (mirrors CATEGORIES in types.ts) ─────────────────────

CATEGORIES = {
    "control-flow":          {"name": "Control Flow",              "color": "#6B7280", "icon": "workflow",        "description": "Logic & program structure"},
    "data-io":               {"name": "Data I/O",                  "color": "#3B82F6", "icon": "database",        "description": "Load, save, stream data"},
    "data-processing":       {"name": "Data Processing",           "color": "#22C55E", "icon": "filter",          "description": "Transform, clean, reshape"},
    "text-nlp":              {"name": "Text & NLP",                "color": "#8B5CF6", "icon": "type",            "description": "Tokenize, embed, parse"},
    "embeddings-retrieval":  {"name": "Embeddings & Retrieval",    "color": "#7C3AED", "icon": "search",          "description": "Vector search & RAG"},
    "classical-ml":          {"name": "Classical ML",              "color": "#16A34A", "icon": "trending-up",     "description": "Linear regression to ensembles"},
    "neural-networks":       {"name": "Neural Networks",           "color": "#F59E0B", "icon": "cpu",             "description": "Layers, activations, architectures"},
    "transformers-llms":     {"name": "Transformers & LLMs",       "color": "#A855F7", "icon": "brain",           "description": "Attention, heads, modern architectures"},
    "vision":                {"name": "Vision Models",             "color": "#F87171", "icon": "eye",             "description": "CNNs, detectors, segmenters"},
    "audio-speech":          {"name": "Audio & Speech",            "color": "#14B8A6", "icon": "music",           "description": "ASR, TTS, audio features"},
    "training":              {"name": "Training",                  "color": "#2563EB", "icon": "zap",             "description": "Optimizers, losses, schedulers"},
    "fine-tuning":           {"name": "Fine-Tuning",               "color": "#EC4899", "icon": "sliders",         "description": "Adapt pretrained models"},
    "distillation":          {"name": "Distillation & Compression","color": "#D97706", "icon": "minimize",        "description": "Make models smaller and faster"},
    "evaluation":            {"name": "Evaluation & Metrics",      "color": "#EF4444", "icon": "bar-chart",       "description": "Measure model performance"},
    "experiment-tracking":   {"name": "Experiment Tracking",       "color": "#059669", "icon": "clipboard",       "description": "Log, compare, reproduce"},
    "agents":                {"name": "Agents & Orchestration",    "color": "#6D28D9", "icon": "bot",             "description": "LLM agents, tools, workflows"},
    "prompt-engineering":    {"name": "Prompt Engineering",        "color": "#9333EA", "icon": "message-square",  "description": "Build & optimize prompts"},
    "deployment":            {"name": "Deployment & Serving",      "color": "#1D4ED8", "icon": "cloud",           "description": "Package, serve, scale"},
    "monitoring":            {"name": "Monitoring & Observability", "color": "#DB2777", "icon": "activity",        "description": "Track production quality & drift"},
    "utilities":             {"name": "Utilities & Variables",     "color": "#4B5563", "icon": "wrench",          "description": "General programming helpers"},
}

# ── TS → JSON parser ───────────────────────────────────────────────────────

def strip_ts_comments(text: str) -> str:
    """Remove // and /* */ comments outside of strings."""
    result = []
    i = 0
    in_string = None
    while i < len(text):
        ch = text[i]
        # Track string boundaries
        if ch in ('"', "'", "`") and (i == 0 or text[i - 1] != "\\"):
            if in_string is None:
                in_string = ch
            elif in_string == ch:
                in_string = None
            result.append(ch)
            i += 1
            continue
        if in_string:
            result.append(ch)
            i += 1
            continue
        # Line comment
        if ch == "/" and i + 1 < len(text) and text[i + 1] == "/":
            while i < len(text) and text[i] != "\n":
                i += 1
            continue
        # Block comment
        if ch == "/" and i + 1 < len(text) and text[i + 1] == "*":
            i += 2
            while i + 1 < len(text) and not (text[i] == "*" and text[i + 1] == "/"):
                i += 1
            i += 2
            continue
        result.append(ch)
        i += 1
    return "".join(result)


def ts_to_json(text: str) -> str:
    """Convert TypeScript object literal syntax into valid JSON."""
    # Remove type imports and export preamble — get just the array
    match = re.search(r"=\s*\[", text)
    if not match:
        return "[]"
    text = text[match.start() + 1:]  # from the '['

    # Strip comments
    text = strip_ts_comments(text)

    # Remove trailing commas before } or ]
    text = re.sub(r",\s*([}\]])", r"\1", text)

    # Quote unquoted keys:  key: -> "key":
    text = re.sub(r'(?<=[{,\n])\s*(\w+)\s*:', r' "\1":', text)

    # Convert single-quoted strings to double-quoted
    # Careful: only outside existing double-quoted strings
    out = []
    i = 0
    while i < len(text):
        if text[i] == '"':
            j = i + 1
            while j < len(text) and text[j] != '"':
                if text[j] == '\\':
                    j += 1
                j += 1
            out.append(text[i:j + 1])
            i = j + 1
        elif text[i] == "'":
            j = i + 1
            while j < len(text) and text[j] != "'":
                if text[j] == '\\':
                    j += 1
                j += 1
            content = text[i + 1:j].replace('"', '\\"')
            out.append(f'"{content}"')
            i = j + 1
        elif text[i] == '`':
            # Template literal → double-quoted, collapse newlines
            j = i + 1
            while j < len(text) and text[j] != '`':
                if text[j] == '\\':
                    j += 1
                j += 1
            content = text[i + 1:j]
            content = content.replace('\\', '\\\\').replace('"', '\\"')
            content = content.replace('\n', '\\n').replace('\r', '')
            out.append(f'"{content}"')
            i = j + 1
        else:
            # Replace TS booleans/null
            out.append(text[i])
            i += 1
    text = "".join(out)

    # true/false/null are already valid JSON — leave them
    # But handle `True`/`False` from Python-style defaults (shouldn't exist but be safe)
    text = text.replace(": True", ": true").replace(": False", ": false")

    # Replace JS-only values that are not valid JSON
    text = text.replace(": Infinity", ": null").replace(": -Infinity", ": null")
    text = text.replace(": NaN", ": null").replace(": undefined", ": null")

    return text


def parse_block_file(filepath: Path) -> list[dict]:
    """Parse a single .ts block definition file into a list of block dicts."""
    raw = filepath.read_text(encoding="utf-8")
    json_text = ts_to_json(raw)

    try:
        blocks = json.loads(json_text)
    except json.JSONDecodeError as exc:
        print(f"  ⚠ JSON parse error in {filepath.name}: {exc}", file=sys.stderr)
        # Try to salvage with a more lenient approach: grab individual objects
        blocks = []
        # Find all top-level objects in the array
        depth = 0
        start = None
        for i, ch in enumerate(json_text):
            if ch == '{':
                if depth == 0:
                    start = i
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0 and start is not None:
                    snippet = json_text[start:i + 1]
                    try:
                        blocks.append(json.loads(snippet))
                    except json.JSONDecodeError:
                        pass
                    start = None
        if not blocks:
            print(f"  ✗ Could not parse any blocks from {filepath.name}", file=sys.stderr)
    return blocks


# ── Import → pip package mapping ───────────────────────────────────────────

IMPORT_TO_PIP: dict[str, str] = {
    "pandas": "pandas",
    "numpy": "numpy",
    "torch": "torch",
    "torchvision": "torchvision",
    "torchaudio": "torchaudio",
    "sklearn": "scikit-learn",
    "scipy": "scipy",
    "cv2": "opencv-python",
    "PIL": "Pillow",
    "transformers": "transformers",
    "datasets": "datasets",
    "tokenizers": "tokenizers",
    "peft": "peft",
    "trl": "trl",
    "accelerate": "accelerate",
    "bitsandbytes": "bitsandbytes",
    "langchain": "langchain",
    "langchain_openai": "langchain-openai",
    "langchain_community": "langchain-community",
    "openai": "openai",
    "anthropic": "anthropic",
    "mlflow": "mlflow",
    "wandb": "wandb",
    "comet_ml": "comet-ml",
    "optuna": "optuna",
    "ray": "ray[tune]",
    "fastapi": "fastapi",
    "uvicorn": "uvicorn",
    "flask": "flask",
    "requests": "requests",
    "httpx": "httpx",
    "websockets": "websockets",
    "kafka": "kafka-python",
    "grpc": "grpcio",
    "librosa": "librosa",
    "soundfile": "soundfile",
    "whisper": "openai-whisper",
    "spacy": "spacy",
    "nltk": "nltk",
    "gensim": "gensim",
    "textblob": "textblob",
    "xgboost": "xgboost",
    "lightgbm": "lightgbm",
    "catboost": "catboost",
    "onnx": "onnx",
    "onnxruntime": "onnxruntime",
    "tensorrt": "tensorrt",
    "jinja2": "Jinja2",
    "yaml": "pyyaml",
    "toml": "toml",
    "faiss": "faiss-cpu",
    "chromadb": "chromadb",
    "pinecone": "pinecone-client",
    "weaviate": "weaviate-client",
    "qdrant_client": "qdrant-client",
    "matplotlib": "matplotlib",
    "seaborn": "seaborn",
    "rouge_score": "rouge-score",
    "bert_score": "bert-score",
    "evaluate": "evaluate",
    "dspy": "dspy-ai",
    "docker": "docker",
    "boto3": "boto3",
    "opentelemetry": "opentelemetry-api",
    "auto_gptq": "auto-gptq",
    "awq": "autoawq",
    "safetensors": "safetensors",
    "ultralytics": "ultralytics",
    "detectron2": "detectron2",
    "segment_anything": "segment-anything",
}


def imports_to_pip(imports: list[str]) -> list[str]:
    """Derive pip package names from Python import statements."""
    pkgs: set[str] = set()
    for imp in imports:
        # "from foo.bar import baz" → "foo"
        # "import foo" → "foo"
        m = re.match(r"(?:from\s+(\S+)|import\s+(\S+))", imp)
        if not m:
            continue
        module = (m.group(1) or m.group(2)).split(".")[0]
        # Skip stdlib
        if module in ("sys", "os", "json", "re", "time", "datetime", "math",
                       "random", "hashlib", "base64", "uuid", "subprocess",
                       "pathlib", "collections", "typing", "functools",
                       "itertools", "threading", "concurrent", "copy",
                       "logging", "io", "struct", "abc", "dataclasses",
                       "contextlib", "warnings", "statistics", "csv",
                       "string", "textwrap", "shutil", "tempfile", "glob"):
            continue
        pip = IMPORT_TO_PIP.get(module, module)
        pkgs.add(pip)
    return sorted(pkgs)


def build_block_doc(block: dict) -> dict:
    """Transform a raw parsed block into a clean documentation entry."""
    code = block.get("codeTemplate", {})

    inputs = []
    for port in block.get("inputs", []):
        inputs.append({
            "id": port["id"],
            "name": port["name"],
            "type": port["type"],
            "required": port.get("required", False),
            "description": port.get("description", ""),
        })

    outputs = []
    for port in block.get("outputs", []):
        outputs.append({
            "id": port["id"],
            "name": port["name"],
            "type": port["type"],
            "description": port.get("description", ""),
        })

    parameters = []
    for param in block.get("parameters", []):
        p = {
            "id": param["id"],
            "name": param["name"],
            "type": param["type"],
            "default": param.get("default"),
            "description": param.get("description", ""),
        }
        if "options" in param:
            p["options"] = [o["value"] for o in param["options"]]
        if "min" in param:
            p["min"] = param["min"]
        if "max" in param:
            p["max"] = param["max"]
        if param.get("advanced"):
            p["advanced"] = True
        parameters.append(p)

    raw_imports = code.get("imports", [])
    pip = imports_to_pip(raw_imports)

    # Build API function call name
    PYTHON_KW = {"break", "continue", "pass", "return", "raise", "assert",
                 "try", "if", "else", "for", "while", "class", "def",
                 "import", "from", "with", "yield", "lambda", "global",
                 "nonlocal", "not", "and", "or", "in", "is", "del",
                 "except", "finally", "elif", "as", "async", "await",
                 "True", "False", "None"}
    cat_slug = re.sub(r"[^a-z0-9]+", "_", block["category"].lower()).strip("_")
    fn_slug = re.sub(r"[^a-z0-9]+", "_", block["id"].split(".", 1)[-1].lower()).strip("_")
    if fn_slug in PYTHON_KW:
        fn_slug = f"{fn_slug}_block"
    api_call = f"aiblocks.{cat_slug}.{fn_slug}"

    # Build example call with default params
    call_args = []
    for inp in block.get("inputs", []):
        call_args.append(f"{inp['id']}=...")
    for p in block.get("parameters", []):
        if not p.get("advanced"):
            val = p.get("default")
            if isinstance(val, str):
                call_args.append(f"{p['id']}={repr(val)}")
            elif val is not None:
                call_args.append(f"{p['id']}={val}")
    api_example = f"{api_call}({', '.join(call_args)})"

    return {
        "id": block["id"],
        "name": block["name"],
        "category": block["category"],
        "description": block.get("description", ""),
        "tags": block.get("tags", []),
        "inputs": inputs,
        "outputs": outputs,
        "parameters": parameters,
        "pip": pip,
        "apiCall": api_call,
        "apiExample": api_example,
        "code": {
            "imports": raw_imports,
            "body": code.get("body", ""),
        },
    }


def main():
    print("AI Blocks Documentation Generator")
    print("=" * 50)

    block_files = sorted(BLOCKS_DIR.glob("*.ts"))
    block_files = [f for f in block_files if f.name != "index.ts"]

    all_blocks = []
    category_counts = {}

    for filepath in block_files:
        blocks = parse_block_file(filepath)
        print(f"  ✓ {filepath.name}: {len(blocks)} blocks")
        for b in blocks:
            doc = build_block_doc(b)
            all_blocks.append(doc)
            cat = doc["category"]
            category_counts[cat] = category_counts.get(cat, 0) + 1

    # Build categories list (only those with blocks)
    categories = []
    for cat_id, meta in CATEGORIES.items():
        count = category_counts.get(cat_id, 0)
        if count > 0:
            categories.append({
                "id": cat_id,
                "name": meta["name"],
                "description": meta["description"],
                "color": meta["color"],
                "icon": meta["icon"],
                "blockCount": count,
            })

    doc = {
        "version": "1.0.0",
        "totalBlocks": len(all_blocks),
        "categories": categories,
        "blocks": all_blocks,
    }

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(doc, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\n✓ Generated {len(all_blocks)} blocks across {len(categories)} categories")
    print(f"  → {OUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
