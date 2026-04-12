#!/usr/bin/env python3
"""
Benchmark: Block-based code assembly vs Vanilla Claude Code

Runs 20 ML engineering challenges through both approaches using Claude Opus 4.6,
tracking latency, token usage, and code quality metrics.

Usage:
    export ANTHROPIC_API_KEY=sk-ant-...
    python benchmark/run_benchmark.py [--challenges 1,2,3] [--method both|blocks|vanilla]
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

import anthropic

from block_engine import (
    BlockIndex,
    PIPELINE_SKELETONS,
    assemble_python,
    build_assembly_prompt,
    build_stage1_prompt,
    build_stage2_prompt,
    compact_catalog,
    full_block_detail,
    load_catalog,
)
from challenges import CHALLENGES

MODEL = "claude-opus-4-6"
RESULTS_DIR = Path(__file__).parent / "results"
RESULTS_DIR.mkdir(exist_ok=True)


# ── API Wrapper with Metrics ──────────────────────────────────────────────

class TrackedClient:
    """Wraps the Anthropic client to track latency and token usage per call."""

    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.calls: list[dict] = []

    def create_message(self, system: str, user_prompt: str,
                       max_tokens: int = 8192, temperature: float = 0.0) -> tuple[str, dict]:
        """Returns (response_text, metrics_dict)."""
        t0 = time.perf_counter()

        resp = self.client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            messages=[{"role": "user", "content": user_prompt}],
        )

        latency = time.perf_counter() - t0
        text = resp.content[0].text if resp.content else ""

        metrics = {
            "latency_s": round(latency, 3),
            "input_tokens": resp.usage.input_tokens,
            "output_tokens": resp.usage.output_tokens,
            "total_tokens": resp.usage.input_tokens + resp.usage.output_tokens,
            "model": MODEL,
            "stop_reason": resp.stop_reason,
        }
        self.calls.append(metrics)
        return text, metrics

    def total_metrics(self) -> dict:
        return {
            "total_calls": len(self.calls),
            "total_latency_s": round(sum(c["latency_s"] for c in self.calls), 3),
            "total_input_tokens": sum(c["input_tokens"] for c in self.calls),
            "total_output_tokens": sum(c["output_tokens"] for c in self.calls),
            "total_tokens": sum(c["total_tokens"] for c in self.calls),
            "per_call": self.calls,
        }

    def reset(self):
        self.calls.clear()


# ── Vanilla Claude Approach ───────────────────────────────────────────────

def run_vanilla(client: TrackedClient, challenge: dict) -> dict:
    """Run a challenge using vanilla Claude (no blocks, just prompt → code)."""
    client.reset()

    system = (
        "You are an expert ML engineer. Write complete, production-quality Python code. "
        "Include all imports, handle edge cases, and add brief comments. "
        "Output ONLY a Python code block — no explanation outside the code block."
    )

    text, _ = client.create_message(system, challenge["prompt"], max_tokens=8192)

    code = extract_code(text)
    metrics = client.total_metrics()

    return {
        "method": "vanilla",
        "challenge_id": challenge["id"],
        "code": code,
        "raw_response": text,
        "metrics": metrics,
        "quality": evaluate_code(code, challenge),
    }


# ── Block-Based Approach (Optimized Two-Stage) ───────────────────────────

def run_blocks(client: TrackedClient, challenge: dict,
               block_index: BlockIndex) -> dict:
    """Run a challenge using optimized block-based assembly."""
    client.reset()
    stage_details = {}

    # ── Stage 1: Classify & retrieve ──────────────────────────────────────
    s1_prompt = build_stage1_prompt(
        challenge["prompt"],
        challenge.get("category_hint"),
    )

    s1_text, s1_metrics = client.create_message(
        "You are an ML pipeline classifier. Respond with valid JSON only.",
        s1_prompt,
        max_tokens=512,
        temperature=0.0,
    )

    try:
        s1_data = json.loads(extract_json(s1_text))
    except (json.JSONDecodeError, TypeError):
        # Fallback: use category hints from challenge
        s1_data = {
            "categories": challenge.get("category_hint", []),
            "pattern": "custom",
            "search_terms": [],
        }

    stage_details["stage1"] = {
        "categories": s1_data.get("categories", []),
        "pattern": s1_data.get("pattern", "custom"),
        "search_terms": s1_data.get("search_terms", []),
        "metrics": s1_metrics,
    }

    # ── Retrieve relevant blocks ──────────────────────────────────────────
    categories = s1_data.get("categories", [])
    search_terms = s1_data.get("search_terms", [])
    pattern = s1_data.get("pattern", "custom")

    # TF-IDF search with combined query
    search_query = challenge["prompt"] + " " + " ".join(search_terms)
    tfidf_blocks = block_index.search(search_query, top_k=40, categories=categories if categories else None)

    # Also get category-based blocks as fallback
    if categories:
        cat_blocks = block_index.get_by_categories(categories)
        # Merge, dedup by id, prefer TF-IDF order
        seen = {b["id"] for b in tfidf_blocks}
        for b in cat_blocks:
            if b["id"] not in seen and len(tfidf_blocks) < 60:
                tfidf_blocks.append(b)
                seen.add(b["id"])

    filtered_blocks = tfidf_blocks
    catalog_str = compact_catalog(filtered_blocks)

    # Pipeline skeleton hint
    skeleton_hint = None
    if pattern in PIPELINE_SKELETONS:
        skeleton = PIPELINE_SKELETONS[pattern]
        skeleton_hint = " → ".join(skeleton)

    stage_details["retrieval"] = {
        "blocks_retrieved": len(filtered_blocks),
        "catalog_chars": len(catalog_str),
        "pattern": pattern,
    }

    # ── Stage 2: Block selection & wiring ─────────────────────────────────
    s2_prompt = build_stage2_prompt(
        challenge["prompt"], catalog_str, skeleton_hint
    )

    s2_text, s2_metrics = client.create_message(
        "You are an ML pipeline builder. Select blocks and wire them. Respond with valid JSON only.",
        s2_prompt,
        max_tokens=4096,
        temperature=0.0,
    )

    try:
        s2_data = json.loads(extract_json(s2_text))
    except (json.JSONDecodeError, TypeError):
        s2_data = {"blocks": [], "wiring": [], "extra_code": "", "explanation": "parse error"}

    stage_details["stage2"] = {
        "blocks_selected": len(s2_data.get("blocks", [])),
        "wiring_count": len(s2_data.get("wiring", [])),
        "metrics": s2_metrics,
    }

    # ── Stage 3: Assemble code ────────────────────────────────────────────
    selected_block_defs = []
    for sel in s2_data.get("blocks", []):
        block_def = block_index.block_by_id.get(sel.get("blockId"))
        if block_def:
            enriched = dict(block_def)
            enriched["_ref"] = sel.get("ref", sel.get("blockId"))
            selected_block_defs.append(enriched)

    if selected_block_defs:
        # Try template-based assembly first
        param_overrides = {}
        for sel in s2_data.get("blocks", []):
            if sel.get("params"):
                param_overrides[sel.get("ref", sel.get("blockId"))] = sel["params"]

        try:
            assembled = assemble_python(
                selected_block_defs,
                s2_data.get("wiring", []),
                param_overrides,
            )
        except Exception as e:
            assembled = f"# Assembly error: {e}\n"

        # If assembly is too sparse, use LLM to polish
        extra_code = s2_data.get("extra_code", "")
        if extra_code:
            assembled = assembled.rstrip() + "\n\n# Additional logic\n" + extra_code + "\n"

        # ── Stage 3b: LLM polish pass ────────────────────────────────────
        # Use the LLM to fix any assembly issues and fill gaps
        block_details_str = "\n\n".join(full_block_detail(b) for b in selected_block_defs)

        polish_prompt = build_assembly_prompt(
            challenge["prompt"],
            block_details_str,
            json.dumps(s2_data, indent=2),
        )

        polish_text, polish_metrics = client.create_message(
            "You are a Python code assembler. Output only clean, runnable Python code.",
            f"{polish_prompt}\n\nHere is the template-assembled code as a starting point (fix and complete it):\n```python\n{assembled}\n```",
            max_tokens=8192,
            temperature=0.0,
        )

        code = extract_code(polish_text)
        stage_details["stage3_polish"] = {"metrics": polish_metrics}
    else:
        # Fallback: no blocks matched, use vanilla
        code = ""
        stage_details["stage3_polish"] = {"fallback": True}

    metrics = client.total_metrics()

    return {
        "method": "blocks",
        "challenge_id": challenge["id"],
        "code": code,
        "raw_stages": stage_details,
        "metrics": metrics,
        "quality": evaluate_code(code, challenge),
    }


# ── Code Quality Evaluation ──────────────────────────────────────────────

def evaluate_code(code: str, challenge: dict) -> dict:
    """Evaluate generated code quality with static checks."""
    if not code:
        return {"score": 0, "has_imports": False, "has_keywords": False,
                "keyword_hits": [], "keyword_misses": list(challenge.get("eval_keywords", [])),
                "lines": 0, "syntax_valid": False, "completeness": 0.0}

    # Check syntax
    syntax_valid = True
    try:
        compile(code, "<generated>", "exec")
    except SyntaxError:
        syntax_valid = False

    # Check expected imports
    expected = challenge.get("expected_imports", [])
    has_imports = all(imp in code for imp in expected)

    # Check expected keywords
    keywords = challenge.get("eval_keywords", [])
    hits = [kw for kw in keywords if kw in code]
    misses = [kw for kw in keywords if kw not in code]
    keyword_ratio = len(hits) / max(len(keywords), 1)

    # Line count (non-empty)
    lines = len([l for l in code.split("\n") if l.strip()])

    # Completeness score (0-1)
    completeness = (
        (0.3 if syntax_valid else 0.0) +
        (0.2 if has_imports else 0.0) +
        (0.4 * keyword_ratio) +
        (0.1 if lines > 10 else 0.05 if lines > 5 else 0.0)
    )

    return {
        "score": round(completeness, 3),
        "has_imports": has_imports,
        "has_keywords": keyword_ratio > 0.7,
        "keyword_hits": hits,
        "keyword_misses": misses,
        "keyword_ratio": round(keyword_ratio, 3),
        "lines": lines,
        "syntax_valid": syntax_valid,
        "completeness": round(completeness, 3),
    }


# ── Helpers ───────────────────────────────────────────────────────────────

def extract_code(text: str) -> str:
    """Extract Python code from markdown code blocks or raw text."""
    # Try ```python ... ```
    m = re.search(r'```python\s*\n(.*?)```', text, re.DOTALL)
    if m:
        return m.group(1).strip()
    # Try ``` ... ```
    m = re.search(r'```\s*\n(.*?)```', text, re.DOTALL)
    if m:
        return m.group(1).strip()
    # If the entire response looks like code, return it
    if text.strip().startswith(("import ", "from ", "#", "def ", "class ")):
        return text.strip()
    return text.strip()


def extract_json(text: str) -> str:
    """Extract JSON from markdown code blocks or raw text."""
    m = re.search(r'```json\s*\n(.*?)```', text, re.DOTALL)
    if m:
        return m.group(1).strip()
    m = re.search(r'```\s*\n(.*?)```', text, re.DOTALL)
    if m:
        return m.group(1).strip()
    # Try to find raw JSON
    m = re.search(r'\{.*\}', text, re.DOTALL)
    if m:
        return m.group(0)
    return text.strip()


# ── Main Runner ───────────────────────────────────────────────────────────

def run_benchmark(api_key: str, challenge_ids: list[int] | None = None,
                  method: str = "both") -> dict:
    """Run the full benchmark suite."""
    client = TrackedClient(api_key)
    catalog = load_catalog()
    block_index = BlockIndex(catalog)

    print(f"Loaded {len(catalog)} blocks into index")
    print(f"Model: {MODEL}")
    print(f"Method: {method}")
    print(f"Challenges: {len(CHALLENGES) if not challenge_ids else len(challenge_ids)}")
    print("=" * 70)

    results = {
        "meta": {
            "model": MODEL,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_blocks": len(catalog),
            "method": method,
        },
        "challenges": [],
    }

    challenges_to_run = CHALLENGES
    if challenge_ids:
        challenges_to_run = [CHALLENGES[i] for i in challenge_ids if i < len(CHALLENGES)]

    for i, challenge in enumerate(challenges_to_run):
        print(f"\n[{i+1}/{len(challenges_to_run)}] {challenge['title']}")
        print(f"  ID: {challenge['id']}")

        challenge_result = {
            "id": challenge["id"],
            "title": challenge["title"],
            "prompt": challenge["prompt"],
        }

        # Run block-based approach
        if method in ("both", "blocks"):
            print("  Running BLOCKS method...", end=" ", flush=True)
            try:
                blocks_result = run_blocks(client, challenge, block_index)
                challenge_result["blocks"] = blocks_result
                bm = blocks_result["metrics"]
                bq = blocks_result["quality"]
                print(f"OK  {bm['total_latency_s']}s  {bm['total_tokens']}tok  "
                      f"score={bq['completeness']}  calls={bm['total_calls']}")
            except Exception as e:
                print(f"ERROR: {e}")
                challenge_result["blocks"] = {"error": str(e)}

        # Run vanilla approach
        if method in ("both", "vanilla"):
            print("  Running VANILLA method...", end=" ", flush=True)
            try:
                vanilla_result = run_vanilla(client, challenge)
                challenge_result["vanilla"] = vanilla_result
                vm = vanilla_result["metrics"]
                vq = vanilla_result["quality"]
                print(f"OK  {vm['total_latency_s']}s  {vm['total_tokens']}tok  "
                      f"score={vq['completeness']}")
            except Exception as e:
                print(f"ERROR: {e}")
                challenge_result["vanilla"] = {"error": str(e)}

        results["challenges"].append(challenge_result)

        # Save incrementally
        save_results(results)

    print("\n" + "=" * 70)
    print_summary(results)
    return results


def save_results(results: dict):
    ts = results["meta"]["timestamp"].replace(":", "-").replace(".", "-")[:19]
    path = RESULTS_DIR / f"benchmark_{ts}.json"
    with open(path, "w") as f:
        json.dump(results, f, indent=2)


def print_summary(results: dict):
    """Print comparison summary table."""
    print("\n BENCHMARK SUMMARY")
    print("=" * 100)
    print(f"{'Challenge':<35} {'Method':<10} {'Latency':>8} {'Tokens':>8} "
          f"{'Calls':>6} {'Score':>6} {'Syntax':>7} {'KW%':>5}")
    print("-" * 100)

    blocks_scores, vanilla_scores = [], []
    blocks_tokens, vanilla_tokens = [], []
    blocks_latency, vanilla_latency = [], []

    for ch in results["challenges"]:
        for method_key, label in [("blocks", "BLOCKS"), ("vanilla", "VANILLA")]:
            r = ch.get(method_key, {})
            if "error" in r:
                print(f"{ch['title']:<35} {label:<10} {'ERROR':>8}")
                continue
            if not r:
                continue
            m = r.get("metrics", {})
            q = r.get("quality", {})
            print(f"{ch['title']:<35} {label:<10} "
                  f"{m.get('total_latency_s', 0):>7.1f}s "
                  f"{m.get('total_tokens', 0):>7d} "
                  f"{m.get('total_calls', 0):>5d} "
                  f"{q.get('completeness', 0):>6.3f} "
                  f"{'Y' if q.get('syntax_valid') else 'N':>6} "
                  f"{q.get('keyword_ratio', 0)*100:>4.0f}%")

            if method_key == "blocks":
                blocks_scores.append(q.get("completeness", 0))
                blocks_tokens.append(m.get("total_tokens", 0))
                blocks_latency.append(m.get("total_latency_s", 0))
            else:
                vanilla_scores.append(q.get("completeness", 0))
                vanilla_tokens.append(m.get("total_tokens", 0))
                vanilla_latency.append(m.get("total_latency_s", 0))

    print("=" * 100)

    if blocks_scores and vanilla_scores:
        print(f"\n  AVERAGES:")
        print(f"  {'Metric':<25} {'BLOCKS':>12} {'VANILLA':>12} {'Delta':>12}")
        print(f"  {'-'*25} {'-'*12} {'-'*12} {'-'*12}")

        avg_bs = sum(blocks_scores)/len(blocks_scores)
        avg_vs = sum(vanilla_scores)/len(vanilla_scores)
        print(f"  {'Quality Score':<25} {avg_bs:>11.3f} {avg_vs:>11.3f} "
              f"{avg_bs - avg_vs:>+11.3f}")

        avg_bt = sum(blocks_tokens)/len(blocks_tokens)
        avg_vt = sum(vanilla_tokens)/len(vanilla_tokens)
        print(f"  {'Tokens/challenge':<25} {avg_bt:>11.0f} {avg_vt:>11.0f} "
              f"{avg_bt - avg_vt:>+11.0f}")

        avg_bl = sum(blocks_latency)/len(blocks_latency)
        avg_vl = sum(vanilla_latency)/len(vanilla_latency)
        print(f"  {'Latency (s)':<25} {avg_bl:>11.1f} {avg_vl:>11.1f} "
              f"{avg_bl - avg_vl:>+11.1f}")

        print(f"  {'Total tokens':<25} {sum(blocks_tokens):>11d} {sum(vanilla_tokens):>11d} "
              f"{sum(blocks_tokens) - sum(vanilla_tokens):>+11d}")


# ── CLI Entry Point ───────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="AI Blocks Benchmark")
    parser.add_argument("--challenges", type=str, default=None,
                        help="Comma-separated 0-indexed challenge numbers (e.g., 0,1,5)")
    parser.add_argument("--method", choices=["both", "blocks", "vanilla"],
                        default="both", help="Which method(s) to run")
    parser.add_argument("--api-key", type=str, default=None,
                        help="Anthropic API key (or set ANTHROPIC_API_KEY env var)")
    args = parser.parse_args()

    api_key = args.api_key or os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: Set ANTHROPIC_API_KEY or pass --api-key")
        sys.exit(1)

    challenge_ids = None
    if args.challenges:
        challenge_ids = [int(x.strip()) for x in args.challenges.split(",")]

    run_benchmark(api_key, challenge_ids, args.method)


if __name__ == "__main__":
    main()
