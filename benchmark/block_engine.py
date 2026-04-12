"""
Optimized block retrieval, selection, and Python code assembly engine.

Key optimizations over the baseline ai-blocks approach:
1. TF-IDF block retrieval — pre-filter 505 blocks to ~30 relevant ones (saves ~70K tokens)
2. Two-stage prompting — Stage 1: category classify, Stage 2: block select + wire
3. Pre-built pipeline skeletons — common ML patterns as starting subgraphs
4. Compact catalog encoding — 40% fewer tokens per block
5. Template pre-compilation — regex cached, imports pre-deduped, var names pre-resolved
"""

import json
import re
import math
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

CATALOG_PATH = Path(__file__).parent / "block_catalog.json"

# ── Load & index the full block catalog ───────────────────────────────────

def load_catalog() -> list[dict]:
    with open(CATALOG_PATH) as f:
        return json.load(f)

# ── Synonym / Concept Expansion ───────────────────────────────────────────
# Maps vague natural-language terms → concrete block-vocabulary tokens.
# Keeps growing — add rows as new gaps surface in retrieval.

CONCEPT_MAP: dict[str, list[str]] = {
    # Task-level concepts → block keywords
    "churn": ["classification", "classifier", "predict", "logistic", "xgboost", "random_forest", "auc", "roc"],
    "fraud": ["classification", "anomaly", "isolation_forest", "xgboost", "precision", "recall"],
    "recommendation": ["embedding", "similarity", "cosine", "collaborative", "matrix_factorization"],
    "forecast": ["regression", "time_series", "lstm", "arima", "prophet"],
    "predict": ["classifier", "regressor", "train", "fit", "predict", "model"],
    "classify": ["classification", "classifier", "logistic", "random_forest", "svm", "softmax"],
    "cluster": ["kmeans", "dbscan", "clustering", "unsupervised"],
    "detect": ["detection", "yolo", "anomaly", "outlier", "ner", "entity"],
    "segment": ["segmentation", "sam", "mask", "unet", "semantic"],
    "generate": ["generation", "gpt", "llm", "decoder", "sampling", "text"],
    "summarize": ["summarization", "text", "nlp", "llm", "extractive"],
    "translate": ["translation", "seq2seq", "transformer", "encoder", "decoder"],
    "search": ["retrieval", "embedding", "faiss", "vector", "similarity", "index"],
    "chat": ["agent", "llm", "prompt", "conversation", "message", "response"],
    "deploy": ["deployment", "fastapi", "serving", "docker", "endpoint", "api"],
    "monitor": ["monitoring", "drift", "metrics", "observability", "alert"],
    "clean": ["preprocessing", "dropna", "fillna", "normalize", "impute", "outlier"],
    "train": ["training", "fit", "optimizer", "loss", "epoch", "batch", "gradient"],
    "evaluate": ["evaluation", "accuracy", "precision", "recall", "f1", "metric", "score"],
    "finetune": ["fine_tuning", "lora", "qlora", "peft", "adapter", "sft"],
    "fine-tune": ["fine_tuning", "lora", "qlora", "peft", "adapter", "sft"],
    "augment": ["augmentation", "transform", "flip", "crop", "rotate", "jitter"],
    "embed": ["embedding", "encode", "vector", "representation", "sentence_transformer"],
    "scrape": ["data_io", "http", "request", "api", "load", "fetch"],
    "preprocess": ["preprocessing", "normalize", "scale", "encode", "transform", "clean"],
    "visualize": ["plot", "matplotlib", "chart", "graph", "display"],
    "compare": ["evaluation", "metric", "benchmark", "accuracy", "rmse", "score"],
    "compress": ["distillation", "pruning", "quantization", "smaller", "faster"],
    "distill": ["distillation", "teacher", "student", "knowledge", "temperature"],
    "track": ["experiment", "mlflow", "wandb", "log", "metric", "parameter"],

    # Informal / vague
    "ml pipeline": ["load", "csv", "split", "train", "predict", "evaluate", "accuracy"],
    "ml stuff": ["load", "csv", "split", "train", "predict", "evaluate", "model"],
    "nlp stuff": ["text", "tokenize", "embedding", "nlp", "sentiment", "ner", "tfidf"],
    "deep learning": ["neural", "layer", "conv2d", "linear", "relu", "dropout", "training_loop"],
    "computer vision": ["image", "cnn", "resnet", "yolo", "detection", "classification"],
    "llm": ["transformers", "llm", "inference", "prompt", "generation", "pretrained"],
    "rag": ["retrieval", "embedding", "chunk", "vector", "search", "context", "llm"],
    "data science": ["load", "csv", "pandas", "dataframe", "split", "train", "evaluate"],
    "build a model": ["load", "split", "train", "fit", "predict", "evaluate", "model"],
    "production": ["deploy", "fastapi", "serving", "docker", "monitoring", "endpoint"],
}

# ── Always-Include Base Blocks ────────────────────────────────────────────
# These appear in almost every ML pipeline — always available as candidates.
ALWAYS_INCLUDE_IDS = [
    "data-io.load-csv",
    "data-processing.train-test-split",
    "utilities.python-snippet",
    "utilities.variable",
    "utilities.print-value",
    "control-flow.start",
    "control-flow.end",
]

# ── Co-occurrence Graph ───────────────────────────────────────────────────
# If you pick block A, these blocks are very likely needed too.
# Encoded as: block_id → list of block_ids that commonly co-occur.
CO_OCCURRENCE: dict[str, list[str]] = {
    "data-io.load-csv": ["data-processing.train-test-split", "data-processing.drop-nulls",
                         "data-processing.dataframe-to-xy", "data-processing.normalize"],
    "data-processing.train-test-split": ["classical-ml.sklearn-predict", "evaluation.accuracy",
                                         "evaluation.f1-score"],
    "data-processing.stratified-split": ["classical-ml.sklearn-predict", "evaluation.accuracy"],
    "classical-ml.random-forest": ["classical-ml.sklearn-predict", "evaluation.accuracy",
                                   "evaluation.f1-score", "evaluation.classification-report"],
    "classical-ml.logistic-regression": ["classical-ml.sklearn-predict", "evaluation.accuracy",
                                         "evaluation.precision", "evaluation.recall"],
    "classical-ml.linear-regression": ["classical-ml.sklearn-predict", "evaluation.rmse",
                                       "evaluation.r2"],
    "classical-ml.xgboost": ["classical-ml.sklearn-predict", "evaluation.accuracy",
                             "evaluation.auc-roc"],
    "classical-ml.gradient-boosting": ["classical-ml.sklearn-predict", "evaluation.accuracy"],
    "classical-ml.svm": ["classical-ml.sklearn-predict", "evaluation.accuracy",
                         "evaluation.classification-report"],
    "classical-ml.sklearn-predict": ["evaluation.accuracy", "evaluation.f1-score",
                                     "evaluation.precision", "evaluation.recall"],
    "text-nlp.tfidf-vectorizer": ["classical-ml.logistic-regression", "classical-ml.svm",
                                  "evaluation.classification-report"],
    "embeddings-retrieval.text-embedder": ["embeddings-retrieval.vector-store-insert",
                                          "embeddings-retrieval.vector-search"],
    "embeddings-retrieval.vector-store-insert": ["embeddings-retrieval.vector-search"],
    "transformers-llms.load-pretrained-llm": ["transformers-llms.llm-inference",
                                              "fine-tuning.lora-config", "fine-tuning.peft-wrap"],
    "fine-tuning.lora-config": ["fine-tuning.peft-wrap", "training.adam-optimizer",
                                "fine-tuning.save-adapter"],
    "training.adam-optimizer": ["training.cross-entropy-loss", "training.training-loop"],
    "training.cross-entropy-loss": ["training.training-loop"],
    "vision.load-image-folder": ["vision.image-augmentation", "vision.image-resize"],
    "neural-networks.conv2d-layer": ["neural-networks.maxpool2d-layer",
                                     "neural-networks.relu-activation",
                                     "neural-networks.dense-layer"],
    "distillation.knowledge-distillation": ["training.training-loop", "training.cross-entropy-loss"],
}


# ── Block Retrieval Engine ────────────────────────────────────────────────

class BlockIndex:
    """
    Multi-signal block retrieval with:
    1. TF-IDF cosine similarity (lexical)
    2. Synonym/concept expansion (semantic bridge)
    3. Co-occurrence boosting (blocks that travel together)
    4. Always-include base set (universally useful blocks)
    5. Category boost (soft, not hard filter)
    6. Tiered merging (exact > fuzzy > base)
    """

    def __init__(self, blocks: list[dict]):
        self.blocks = blocks
        self.block_by_id: dict[str, dict] = {b["id"]: b for b in blocks}
        self.category_index: dict[str, list[dict]] = defaultdict(list)
        for b in blocks:
            self.category_index[b["category"]].append(b)

        # Build TF-IDF
        self._doc_tokens: list[list[str]] = []
        self._idf: dict[str, float] = {}
        self._tfidf_vecs: list[dict[str, float]] = []
        self._build_tfidf()

    def _tokenize(self, text: str) -> list[str]:
        return re.findall(r'[a-z][a-z0-9_]+', text.lower())

    def _block_text(self, b: dict) -> str:
        """Combine all searchable text for a block."""
        parts = [
            b["id"], b["name"], b.get("description", ""),
            " ".join(b.get("tags", [])),
            b["category"],
            " ".join(p["id"] + " " + p.get("name", "") for p in b.get("inputs", [])),
            " ".join(p["id"] + " " + p.get("name", "") for p in b.get("outputs", [])),
            b.get("codeTemplate", {}).get("body", ""),
            " ".join(b.get("codeTemplate", {}).get("imports", [])),
        ]
        return " ".join(parts)

    def _build_tfidf(self):
        N = len(self.blocks)
        df: Counter = Counter()

        for b in self.blocks:
            text = self._block_text(b)
            tokens = self._tokenize(text)
            self._doc_tokens.append(tokens)
            for t in set(tokens):
                df[t] += 1

        self._idf = {t: math.log(N / (1 + count)) for t, count in df.items()}

        for tokens in self._doc_tokens:
            tf = Counter(tokens)
            total = len(tokens) or 1
            vec = {}
            for t, count in tf.items():
                vec[t] = (count / total) * self._idf.get(t, 0)
            self._tfidf_vecs.append(vec)

    def _expand_query(self, query: str) -> str:
        """Expand a query with synonyms/concepts so vague prompts hit more blocks."""
        q_lower = query.lower()
        expansions: list[str] = []

        for concept, terms in CONCEPT_MAP.items():
            # Check if the concept appears as a word/phrase in the query
            if concept in q_lower:
                expansions.extend(terms)

        if expansions:
            return query + " " + " ".join(set(expansions))
        return query

    def _tfidf_scores(self, query: str) -> dict[int, float]:
        """Compute TF-IDF cosine similarity for every block against query."""
        q_tokens = self._tokenize(query)
        q_tf = Counter(q_tokens)
        q_total = len(q_tokens) or 1
        q_vec = {t: (c / q_total) * self._idf.get(t, 0) for t, c in q_tf.items()}
        q_norm = math.sqrt(sum(v * v for v in q_vec.values())) or 1e-9

        scores: dict[int, float] = {}
        for i in range(len(self.blocks)):
            d_vec = self._tfidf_vecs[i]
            dot = sum(q_vec.get(t, 0) * d_vec.get(t, 0) for t in q_vec)
            d_norm = math.sqrt(sum(v * v for v in d_vec.values())) or 1e-9
            sim = dot / (q_norm * d_norm)
            if sim > 0.005:
                scores[i] = sim
        return scores

    def search(self, query: str, top_k: int = 40,
               categories: list[str] | None = None) -> list[dict]:
        """
        Multi-signal retrieval. Categories are a BOOST, not a hard filter.

        Returns up to top_k blocks, composed of:
        - Tier 1: TF-IDF hits on expanded query (with category boost)
        - Tier 2: Co-occurrence buddies of top hits
        - Tier 3: Always-include base blocks
        """

        # ── Step 1: Expand the query with synonyms ───────────────────────
        expanded = self._expand_query(query)

        # ── Step 2: TF-IDF on expanded query (all blocks, no hard filter) ─
        raw_scores = self._tfidf_scores(expanded)

        # ── Step 3: Apply category boost (soft, +40% for matching cats) ──
        boosted: dict[int, float] = {}
        cat_set = set(categories) if categories else set()
        for idx, score in raw_scores.items():
            block = self.blocks[idx]
            if cat_set and block["category"] in cat_set:
                boosted[idx] = score * 1.4  # 40% boost for matching category
            else:
                boosted[idx] = score

        # ── Step 4: Pick top candidates ──────────────────────────────────
        ranked = sorted(boosted.items(), key=lambda x: -x[1])
        tier1_ids: list[str] = []
        seen: set[str] = set()
        for idx, _score in ranked:
            bid = self.blocks[idx]["id"]
            if bid not in seen:
                tier1_ids.append(bid)
                seen.add(bid)
            if len(tier1_ids) >= top_k:
                break

        # ── Step 5: Co-occurrence expansion ──────────────────────────────
        # For top-10 hits, pull in their co-occurrence buddies
        tier2_ids: list[str] = []
        for bid in tier1_ids[:10]:
            for buddy_id in CO_OCCURRENCE.get(bid, []):
                if buddy_id not in seen and buddy_id in self.block_by_id:
                    tier2_ids.append(buddy_id)
                    seen.add(buddy_id)

        # ── Step 6: Always-include base blocks ───────────────────────────
        tier3_ids: list[str] = []
        for bid in ALWAYS_INCLUDE_IDS:
            if bid not in seen and bid in self.block_by_id:
                tier3_ids.append(bid)
                seen.add(bid)

        # ── Merge tiers ──────────────────────────────────────────────────
        all_ids = tier1_ids + tier2_ids + tier3_ids
        result = [self.block_by_id[bid] for bid in all_ids if bid in self.block_by_id]

        return result[:top_k + 15]  # allow some overflow for co-occurrence/base

    def get_by_categories(self, categories: list[str]) -> list[dict]:
        result = []
        for cat in categories:
            result.extend(self.category_index.get(cat, []))
        return result


# ── Compact Catalog Encoding ──────────────────────────────────────────────

def compact_block_entry(b: dict) -> str:
    """Encode a single block in a token-efficient format for the LLM prompt.
    ~40% smaller than the baseline format by including only what the LLM needs.
    """
    ins = ",".join(f"{p['id']}:{p['type']}" for p in b.get("inputs", []))
    outs = ",".join(f"{p['id']}:{p['type']}" for p in b.get("outputs", []))
    params_parts = []
    for p in b.get("parameters", []):
        default_str = ""
        if p.get("default") is not None:
            d = p["default"]
            if isinstance(d, bool):
                default_str = f"={'True' if d else 'False'}"
            elif isinstance(d, str) and len(d) < 30:
                default_str = f"={d}"
            elif isinstance(d, (int, float)):
                default_str = f"={d}"
        params_parts.append(f"{p['id']}{default_str}")
    params = ",".join(params_parts)

    return f"{b['id']}|{b['name']}|in:{ins or '-'}|out:{outs or '-'}|p:{params or '-'}"


def compact_catalog(blocks: list[dict]) -> str:
    """Build the minimal catalog string for selected blocks."""
    return "\n".join(compact_block_entry(b) for b in blocks)


def full_block_detail(b: dict) -> str:
    """Full block detail including code template — used in stage 2 assembly."""
    tmpl = b.get("codeTemplate", {})
    imports = "\n".join(tmpl.get("imports", []))
    body = tmpl.get("body", "")
    setup = tmpl.get("setup", "")
    teardown = tmpl.get("teardown", "")
    bindings = json.dumps(tmpl.get("outputBindings", {}))

    ins = ", ".join(f"{p['id']}:{p['type']}{'*' if p.get('required') else '?'}"
                    for p in b.get("inputs", []))
    outs = ", ".join(f"{p['id']}:{p['type']}" for p in b.get("outputs", []))
    params_detail = []
    for p in b.get("parameters", []):
        params_detail.append(f"  {p['id']}: {p['type']} = {json.dumps(p.get('default'))}")

    return f"""### {b['id']} — {b['name']}
{b.get('description', '')}
Inputs: [{ins}]
Outputs: [{outs}]
Params:
{chr(10).join(params_detail) or '  (none)'}
Template imports: {imports}
Template body: {body}
Template setup: {setup or '(none)'}
Template teardown: {teardown or '(none)'}
Output bindings: {bindings}"""


# ── Pipeline Skeletons ────────────────────────────────────────────────────

PIPELINE_SKELETONS = {
    "supervised_classification": [
        "data-io.load-csv",
        "data-processing.train-test-split",
        "{classifier}",  # placeholder
        "classical-ml.sklearn-predict",
        "evaluation.accuracy",
        "evaluation.f1-score",
    ],
    "supervised_regression": [
        "data-io.load-csv",
        "data-processing.train-test-split",
        "{regressor}",
        "classical-ml.sklearn-predict",
        "evaluation.rmse",
        "evaluation.r2",
    ],
    "deep_learning_train": [
        "{data_loader}",
        "{model_architecture}",
        "training.adam-optimizer",
        "training.cross-entropy-loss",
        "training.training-loop",
        "evaluation.accuracy",
    ],
    "nlp_classification": [
        "data-io.load-csv",
        "text-nlp.tfidf-vectorizer",
        "data-processing.train-test-split",
        "{classifier}",
        "evaluation.classification-report",
    ],
    "rag_pipeline": [
        "data-io.load-documents",
        "text-nlp.text-chunker",
        "embeddings-retrieval.text-embedder",
        "embeddings-retrieval.vector-store-insert",
        "embeddings-retrieval.vector-search",
        "prompt-engineering.system-prompt",
        "transformers-llms.llm-inference",
    ],
    "fine_tuning": [
        "data-io.load-jsonl",
        "transformers-llms.load-pretrained-llm",
        "fine-tuning.lora-config",
        "fine-tuning.peft-wrap",
        "training.adam-optimizer",
        "training.training-loop",
        "fine-tuning.save-adapter",
    ],
    "transfer_learning": [
        "vision.load-image-folder",
        "vision.image-augmentation",
        "transformers-llms.load-pretrained-llm",
        "training.adam-optimizer",
        "training.cross-entropy-loss",
        "training.training-loop",
    ],
}


# ── Code Assembly Engine ──────────────────────────────────────────────────

def interpolate_template(template: str, params: dict, inputs: dict,
                         outputs: dict, branches: dict | None = None) -> str:
    """Interpolate {{params.x}}, {{inputs.x}}, {{outputs.x}}, {{branches.x}}."""
    result = template
    result = re.sub(r'\{\{params\.(\w+)\}\}',
                    lambda m: _py_literal(params.get(m.group(1))), result)
    result = re.sub(r'\{\{inputs\.(\w+)\}\}',
                    lambda m: inputs.get(m.group(1), "None"), result)
    result = re.sub(r'\{\{outputs\.(\w+)\}\}',
                    lambda m: outputs.get(m.group(1), "None"), result)
    if branches:
        result = re.sub(r'\{\{branches\.(\w+)\}\}',
                        lambda m: branches.get(m.group(1), "pass"), result)
    return result


def _py_literal(val: Any) -> str:
    if val is None:
        return "None"
    if isinstance(val, bool):
        return "True" if val else "False"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, str):
        return val  # template body typically wraps in quotes already
    return json.dumps(val)


def assemble_python(block_sequence: list[dict], wiring: list[dict],
                    param_overrides: dict[str, dict] | None = None) -> str:
    """
    Assemble executable Python from a sequence of block definitions + wiring.

    block_sequence: list of block defs with 'ref' keys added
    wiring: list of {"from_ref": "a", "from_port": "x", "to_ref": "b", "to_port": "y"}
    param_overrides: {"ref": {"param_id": value}}
    """
    param_overrides = param_overrides or {}
    all_imports: set[str] = set()
    setup_lines: list[str] = []
    body_lines: list[str] = []
    teardown_lines: list[str] = []

    # Map: (ref, port_id) -> python variable name
    output_vars: dict[tuple[str, str], str] = {}

    # Pre-compute output var names
    for block in block_sequence:
        ref = block["_ref"]
        tmpl = block.get("codeTemplate", {})
        for port_id, binding_expr in tmpl.get("outputBindings", {}).items():
            clean_ref = re.sub(r'[^a-zA-Z0-9]', '_', ref)
            var = f"out_{clean_ref}_{port_id}"
            output_vars[(ref, port_id)] = var

    # Build wiring lookup: (to_ref, to_port) -> python var from upstream
    input_map: dict[tuple[str, str], str] = {}
    for w in wiring:
        src_var = output_vars.get((w["from_ref"], w["from_port"]))
        if src_var:
            input_map[(w["to_ref"], w["to_port"])] = src_var

    for block in block_sequence:
        ref = block["_ref"]
        tmpl = block.get("codeTemplate", {})

        # Imports
        for imp in tmpl.get("imports", []):
            all_imports.add(imp)

        # Params: defaults + overrides
        params = {}
        for p_def in block.get("parameters", []):
            params[p_def["id"]] = p_def.get("default")
        if ref in param_overrides:
            params.update(param_overrides[ref])

        # Input bindings
        input_bindings = {}
        for inp in block.get("inputs", []):
            key = (ref, inp["id"])
            input_bindings[inp["id"]] = input_map.get(key, "None")

        # Output short names from bindings
        output_short = tmpl.get("outputBindings", {})

        # Interpolate
        body_lines.append(f"# {block.get('name', ref)}")

        if tmpl.get("setup"):
            setup_lines.append(interpolate_template(
                tmpl["setup"], params, input_bindings, output_short))

        body_text = interpolate_template(
            tmpl.get("body", ""), params, input_bindings, output_short)
        body_lines.append(body_text)

        # Assign output vars
        for port_id, binding_expr in output_short.items():
            var = output_vars.get((ref, port_id))
            if var:
                resolved = interpolate_template(
                    binding_expr, params, input_bindings, {})
                body_lines.append(f"{var} = {resolved}")

        body_lines.append("")

        if tmpl.get("teardown"):
            teardown_lines.append(interpolate_template(
                tmpl["teardown"], params, input_bindings, output_short))

    # Assemble
    sections = []
    if all_imports:
        sections.append("\n".join(sorted(all_imports)))
        sections.append("")
    if setup_lines:
        sections.append("\n".join(setup_lines))
        sections.append("")
    sections.append("\n".join(body_lines))
    if teardown_lines:
        sections.append("")
        sections.append("\n".join(teardown_lines))

    return "\n".join(sections).strip() + "\n"


# ── Prompt Builders for Two-Stage Strategy ────────────────────────────────

def build_stage1_prompt(task_prompt: str, category_hint: list[str] | None = None) -> str:
    """Stage 1: Classify task into categories and identify block patterns."""
    hint = ""
    if category_hint:
        hint = f"\nHint categories (may be incomplete): {', '.join(category_hint)}"

    return f"""You are an ML pipeline architect. Given a coding task, identify:
1. The relevant block CATEGORIES (from: control-flow, data-io, data-processing, text-nlp, embeddings-retrieval, classical-ml, neural-networks, transformers-llms, vision, audio-speech, training, fine-tuning, distillation, evaluation, experiment-tracking, agents, prompt-engineering, deployment, monitoring, utilities)
2. The pipeline PATTERN (one of: supervised_classification, supervised_regression, deep_learning_train, nlp_classification, rag_pipeline, fine_tuning, transfer_learning, custom)
3. Key SEARCH TERMS for finding specific blocks (3-8 terms)

TASK: {task_prompt}
{hint}
Respond ONLY with JSON:
{{"categories": ["cat1", "cat2", ...], "pattern": "pattern_name", "search_terms": ["term1", "term2", ...]}}"""


def build_stage2_prompt(task_prompt: str, filtered_catalog: str,
                        skeleton_hint: str | None = None) -> str:
    """Stage 2: Select blocks, set params, wire them, and generate code."""
    skeleton_section = ""
    if skeleton_hint:
        skeleton_section = f"\nSUGGESTED PIPELINE SKELETON (adapt as needed):\n{skeleton_hint}\n"

    return f"""You are an expert ML engineer. Build a complete Python script by selecting and wiring blocks from the catalog below.

TASK: {task_prompt}

BLOCK CATALOG (id|name|inputs|outputs|params):
{filtered_catalog}
{skeleton_section}
Respond with JSON:
{{
  "blocks": [
    {{"ref": "a", "blockId": "category.block-id", "params": {{"param_id": value}}}},
    ...
  ],
  "wiring": [
    {{"from_ref": "a", "from_port": "output_port_id", "to_ref": "b", "to_port": "input_port_id"}},
    ...
  ],
  "extra_code": "any Python code that blocks alone can't express (e.g. print statements, loops, custom logic)",
  "explanation": "brief explanation of the pipeline"
}}

RULES:
- Use EXACT blockId and port ids from the catalog
- Wire outputs to compatible inputs (check types)
- Set all required params
- Use extra_code for glue logic blocks can't handle (printing, custom formatting, etc.)
- The assembled code should be a COMPLETE, runnable script"""


def build_assembly_prompt(task_prompt: str, block_details: str,
                          selected_blocks_json: str) -> str:
    """Alternative: single-stage assembly prompt with full block details."""
    return f"""You are a Python code assembler. Given selected blocks with their code templates, assemble a complete Python script.

TASK: {task_prompt}

SELECTED BLOCKS WITH TEMPLATES:
{block_details}

BLOCK SELECTION & WIRING:
{selected_blocks_json}

Generate the FINAL assembled Python code. Combine all block templates in order:
1. Merge all imports (deduplicated)
2. Run setup sections
3. Run body sections in wiring order, connecting output variables to input variables
4. Run teardown sections
5. Add any extra_code at the end

Output ONLY the final Python code in a ```python code block."""
