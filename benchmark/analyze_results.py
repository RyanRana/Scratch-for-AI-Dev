#!/usr/bin/env python3
"""
Analyze benchmark results and generate comparison report.

Usage:
    python benchmark/analyze_results.py [results_file.json]
    python benchmark/analyze_results.py --latest
"""

import json
import sys
from pathlib import Path

RESULTS_DIR = Path(__file__).parent / "results"


def load_latest() -> dict:
    files = sorted(RESULTS_DIR.glob("benchmark_*.json"))
    if not files:
        print("No results found in", RESULTS_DIR)
        sys.exit(1)
    path = files[-1]
    print(f"Loading: {path.name}")
    with open(path) as f:
        return json.load(f)


def analyze(results: dict):
    challenges = results["challenges"]
    print(f"\nModel: {results['meta']['model']}")
    print(f"Timestamp: {results['meta']['timestamp']}")
    print(f"Challenges: {len(challenges)}")

    # ── Per-challenge comparison ──────────────────────────────────────────
    print("\n" + "=" * 120)
    print(f"{'#':<4} {'Challenge':<35} {'Method':<8} {'Latency':>8} {'InTok':>7} "
          f"{'OutTok':>7} {'Calls':>5} {'Score':>6} {'Syn':>4} {'KW%':>5} {'Lines':>5}")
    print("-" * 120)

    blocks_data = {"scores": [], "tokens_in": [], "tokens_out": [],
                   "latency": [], "lines": [], "syntax": [], "kw_ratio": []}
    vanilla_data = {"scores": [], "tokens_in": [], "tokens_out": [],
                    "latency": [], "lines": [], "syntax": [], "kw_ratio": []}

    for i, ch in enumerate(challenges):
        for method_key, label, collector in [
            ("blocks", "BLK", blocks_data),
            ("vanilla", "VAN", vanilla_data),
        ]:
            r = ch.get(method_key)
            if not r or "error" in r:
                continue
            m = r.get("metrics", {})
            q = r.get("quality", {})

            collector["scores"].append(q.get("completeness", 0))
            collector["tokens_in"].append(m.get("total_input_tokens", 0))
            collector["tokens_out"].append(m.get("total_output_tokens", 0))
            collector["latency"].append(m.get("total_latency_s", 0))
            collector["lines"].append(q.get("lines", 0))
            collector["syntax"].append(1 if q.get("syntax_valid") else 0)
            collector["kw_ratio"].append(q.get("keyword_ratio", 0))

            print(f"{i:<4} {ch['title']:<35} {label:<8} "
                  f"{m.get('total_latency_s', 0):>7.1f}s "
                  f"{m.get('total_input_tokens', 0):>6d} "
                  f"{m.get('total_output_tokens', 0):>6d} "
                  f"{m.get('total_calls', 0):>5d} "
                  f"{q.get('completeness', 0):>6.3f} "
                  f"{'Y' if q.get('syntax_valid') else 'N':>3} "
                  f"{q.get('keyword_ratio', 0)*100:>4.0f}% "
                  f"{q.get('lines', 0):>5d}")

    # ── Aggregate stats ──────────────────────────────────────────────────
    print("\n" + "=" * 80)
    print(" AGGREGATE COMPARISON")
    print("=" * 80)

    def avg(lst):
        return sum(lst) / len(lst) if lst else 0

    def total(lst):
        return sum(lst)

    metrics = [
        ("Quality Score (avg)", avg(blocks_data["scores"]), avg(vanilla_data["scores"])),
        ("Syntax Valid (%)", avg(blocks_data["syntax"]) * 100, avg(vanilla_data["syntax"]) * 100),
        ("Keyword Coverage (%)", avg(blocks_data["kw_ratio"]) * 100, avg(vanilla_data["kw_ratio"]) * 100),
        ("Avg Latency (s)", avg(blocks_data["latency"]), avg(vanilla_data["latency"])),
        ("Avg Input Tokens", avg(blocks_data["tokens_in"]), avg(vanilla_data["tokens_in"])),
        ("Avg Output Tokens", avg(blocks_data["tokens_out"]), avg(vanilla_data["tokens_out"])),
        ("Total Input Tokens", total(blocks_data["tokens_in"]), total(vanilla_data["tokens_in"])),
        ("Total Output Tokens", total(blocks_data["tokens_out"]), total(vanilla_data["tokens_out"])),
        ("Avg Code Lines", avg(blocks_data["lines"]), avg(vanilla_data["lines"])),
    ]

    print(f"\n  {'Metric':<30} {'BLOCKS':>12} {'VANILLA':>12} {'Delta':>12} {'Winner':>10}")
    print(f"  {'-'*30} {'-'*12} {'-'*12} {'-'*12} {'-'*10}")

    for name, bv, vv in metrics:
        delta = bv - vv
        # For tokens and latency, lower is better
        lower_better = "token" in name.lower() or "latency" in name.lower()
        if lower_better:
            winner = "BLOCKS" if bv < vv else "VANILLA" if vv < bv else "TIE"
        else:
            winner = "BLOCKS" if bv > vv else "VANILLA" if vv > bv else "TIE"

        fmt = ".1f" if "latency" in name.lower() or "%" in name else ".0f" if "token" in name.lower() or "lines" in name.lower() else ".3f"
        print(f"  {name:<30} {bv:>12{fmt}} {vv:>12{fmt}} {delta:>+12{fmt}} {winner:>10}")

    # ── Win/Loss/Tie breakdown ────────────────────────────────────────────
    print("\n  HEAD-TO-HEAD (by quality score):")
    wins = {"blocks": 0, "vanilla": 0, "tie": 0}
    for ch in challenges:
        b = ch.get("blocks", {}).get("quality", {}).get("completeness", -1)
        v = ch.get("vanilla", {}).get("quality", {}).get("completeness", -1)
        if b < 0 or v < 0:
            continue
        if b > v + 0.01:
            wins["blocks"] += 1
        elif v > b + 0.01:
            wins["vanilla"] += 1
        else:
            wins["tie"] += 1
    print(f"  BLOCKS wins: {wins['blocks']}  |  VANILLA wins: {wins['vanilla']}  |  Ties: {wins['tie']}")

    # ── Block method stage breakdown ──────────────────────────────────────
    print("\n  BLOCK METHOD STAGE BREAKDOWN:")
    stage_latencies = {"stage1": [], "stage2": [], "stage3": []}
    stage_tokens = {"stage1": [], "stage2": [], "stage3": []}

    for ch in challenges:
        r = ch.get("blocks", {})
        stages = r.get("raw_stages", {})
        if stages.get("stage1", {}).get("metrics"):
            m = stages["stage1"]["metrics"]
            stage_latencies["stage1"].append(m["latency_s"])
            stage_tokens["stage1"].append(m["total_tokens"])
        if stages.get("stage2", {}).get("metrics"):
            m = stages["stage2"]["metrics"]
            stage_latencies["stage2"].append(m["latency_s"])
            stage_tokens["stage2"].append(m["total_tokens"])
        if stages.get("stage3_polish", {}).get("metrics"):
            m = stages["stage3_polish"]["metrics"]
            stage_latencies["stage3"].append(m["latency_s"])
            stage_tokens["stage3"].append(m["total_tokens"])

    print(f"  {'Stage':<25} {'Avg Latency':>12} {'Avg Tokens':>12}")
    print(f"  {'-'*25} {'-'*12} {'-'*12}")
    for stage, name in [("stage1", "1: Classify"), ("stage2", "2: Select+Wire"), ("stage3", "3: Polish")]:
        if stage_latencies[stage]:
            print(f"  {name:<25} {avg(stage_latencies[stage]):>11.1f}s {avg(stage_tokens[stage]):>11.0f}")

    # ── Token efficiency ──────────────────────────────────────────────────
    if blocks_data["tokens_in"] and vanilla_data["tokens_in"]:
        block_total = total(blocks_data["tokens_in"]) + total(blocks_data["tokens_out"])
        vanilla_total = total(vanilla_data["tokens_in"]) + total(vanilla_data["tokens_out"])
        print(f"\n  TOKEN EFFICIENCY:")
        print(f"  Blocks total: {block_total:,} tokens")
        print(f"  Vanilla total: {vanilla_total:,} tokens")
        if vanilla_total > 0:
            ratio = block_total / vanilla_total
            print(f"  Ratio: {ratio:.2f}x ({'more' if ratio > 1 else 'fewer'} tokens for blocks)")

    # ── Per-challenge keyword analysis ────────────────────────────────────
    print("\n  KEYWORD COVERAGE DETAIL:")
    for ch in challenges:
        title = ch["title"]
        b_hits = ch.get("blocks", {}).get("quality", {}).get("keyword_hits", [])
        b_miss = ch.get("blocks", {}).get("quality", {}).get("keyword_misses", [])
        v_hits = ch.get("vanilla", {}).get("quality", {}).get("keyword_hits", [])
        v_miss = ch.get("vanilla", {}).get("quality", {}).get("keyword_misses", [])
        if b_miss or v_miss:
            print(f"  {title}:")
            if b_miss:
                print(f"    BLK missing: {', '.join(b_miss)}")
            if v_miss:
                print(f"    VAN missing: {', '.join(v_miss)}")


def main():
    if len(sys.argv) > 1 and sys.argv[1] != "--latest":
        path = Path(sys.argv[1])
        with open(path) as f:
            results = json.load(f)
    else:
        results = load_latest()

    analyze(results)


if __name__ == "__main__":
    main()
