#!/usr/bin/env python3
"""
generate-package.py — Generate a pip-installable `aiblocks` Python package
from blocks-api.json. Each category becomes a submodule, each block a function.

Usage:
    python tools/generate-package.py

Output:
    aiblocks/              (package root)
    aiblocks/__init__.py
    aiblocks/<category>.py (one per category)
    setup.py
"""

import json
import re
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JSON_FILE = ROOT / "apps" / "web" / "public" / "blocks-api.json"
PKG_DIR = ROOT / "aiblocks"


def slug(text: str) -> str:
    """Convert 'data-io' or 'Some Name' to a valid Python identifier."""
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


PYTHON_KEYWORDS = {
    "False", "None", "True", "and", "as", "assert", "async", "await",
    "break", "class", "continue", "def", "del", "elif", "else", "except",
    "finally", "for", "from", "global", "if", "import", "in", "is",
    "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
    "try", "while", "with", "yield",
}


def block_fn_name(block_id: str) -> str:
    """Convert 'data-io.load-csv' -> 'load_csv'. Avoids Python keywords."""
    part = block_id.split(".", 1)[-1]
    name = slug(part)
    if name in PYTHON_KEYWORDS:
        name = f"{name}_block"
    return name


def py_default(val, ptype: str) -> str:
    """Render a default value as a Python literal."""
    if val is None:
        return "None"
    if isinstance(val, bool):
        return "True" if val else "False"
    if isinstance(val, (int, float)):
        return repr(val)
    if isinstance(val, str):
        return repr(val)
    return repr(val)


def build_function(block: dict) -> str:
    """Generate a Python function for a single block.

    Uses exec-based approach: the function builds the code string at runtime,
    substitutes parameters, and executes it. This avoids all template/syntax issues.
    """
    fname = block_fn_name(block["id"])
    desc = block.get("description", "")
    inputs = block.get("inputs", [])
    outputs = block.get("outputs", [])
    params = block.get("parameters", [])
    code = block.get("code", {})
    imports_list = code.get("imports", [])
    body_template = code.get("body", "pass")
    pip = block.get("pip", [])

    # Build function signature
    sig_parts = []
    for inp in inputs:
        sig_parts.append(f"{inp['id']}=None")
    for p in params:
        sig_parts.append(f"{p['id']}={py_default(p.get('default'), p.get('type', 'string'))}")
    sig = ", ".join(sig_parts)

    # Build docstring
    doc_lines = [desc]
    if pip:
        doc_lines.append("")
        doc_lines.append(f"Dependencies: pip install {' '.join(pip)}")
    if inputs:
        doc_lines.append("")
        doc_lines.append("Args:")
        for inp in inputs:
            req = " (required)" if inp.get("required") else ""
            idesc = inp.get("description", "")
            doc_lines.append(f"    {inp['id']} ({inp['type']}){req}: {idesc}")
    if params:
        doc_lines.append("")
        doc_lines.append("Parameters:")
        for p in params:
            pdesc = p.get("description", "")
            pdef = p.get("default")
            doc_lines.append(f"    {p['id']} ({p['type']}, default={py_default(pdef, p.get('type',''))}): {pdesc}")
    if outputs:
        doc_lines.append("")
        if len(outputs) == 1:
            o = outputs[0]
            odesc = o.get("description", "")
            doc_lines.append(f"Returns:")
            doc_lines.append(f"    {o['type']}: {odesc}")
        else:
            doc_lines.append("Returns:")
            doc_lines.append("    dict with keys:")
            for o in outputs:
                odesc = o.get("description", "")
                doc_lines.append(f"        {o['id']} ({o['type']}): {odesc}")

    docstring = "\n    ".join(doc_lines)

    # Build the code template string — keep it as a raw string constant
    # At runtime we substitute {{params.x}}, {{inputs.x}}, {{outputs.x}}
    # This avoids any Python syntax issues with the template

    # Escape the template for embedding in a Python triple-quoted string
    escaped_body = body_template.replace("\\", "\\\\").replace('"""', '\\"\\"\\"')
    escaped_imports = imports_list

    # Build output var names
    output_ids = [o["id"] for o in outputs]
    input_ids = [i["id"] for i in inputs]
    param_ids = [p["id"] for p in params]

    # The function uses string replacement + exec at runtime
    fn_body_lines = []
    fn_body_lines.append(f"_imports = {repr(escaped_imports)}")
    fn_body_lines.append(f"_code = {repr(body_template)}")
    fn_body_lines.append("")

    # Substitute params
    for p in params:
        fn_body_lines.append(f'_code = _code.replace("{{{{params.{p["id"]}}}}}", str({p["id"]}))')
    # Substitute inputs
    for inp in inputs:
        fn_body_lines.append(f'_code = _code.replace("{{{{inputs.{inp["id"]}}}}}", "{inp["id"]}")')
    # Substitute outputs
    for o in outputs:
        fn_body_lines.append(f'_code = _code.replace("{{{{outputs.{o["id"]}}}}}", "_out_{o["id"]}")')
    # Kill remaining template placeholders
    fn_body_lines.append('import re as _re')
    fn_body_lines.append('_code = _re.sub(r"\\{\\{[^}]*\\}\\}", "None", _code)')

    fn_body_lines.append("")
    fn_body_lines.append("# Execute")
    fn_body_lines.append("_ns = {}")

    # Pass inputs into namespace
    for inp in inputs:
        fn_body_lines.append(f'_ns["{inp["id"]}"] = {inp["id"]}')

    fn_body_lines.append("for _imp in _imports:")
    fn_body_lines.append("    exec(_imp, _ns)")
    fn_body_lines.append("exec(_code, _ns)")

    # Return
    if len(outputs) == 1:
        fn_body_lines.append(f'return _ns.get("_out_{outputs[0]["id"]}")')
    elif len(outputs) > 1:
        ret_items = ", ".join(f'"{o["id"]}": _ns.get("_out_{o["id"]}")' for o in outputs)
        fn_body_lines.append(f'return {{{ret_items}}}')
    else:
        fn_body_lines.append("return None")

    fn_body = "\n    ".join(fn_body_lines)

    return f'''def {fname}({sig}):
    """{docstring}
    """
    {fn_body}
'''


def build_category_module(cat_id: str, cat_name: str, blocks: list[dict]) -> str:
    """Generate a full Python module for a category."""
    mod_lines = [
        f'"""',
        f'aiblocks.{slug(cat_id)} — {cat_name}',
        f'',
        f'Auto-generated from AI Blocks definitions.',
        f'Each function corresponds to one visual block.',
        f'"""',
        f'',
    ]

    for block in blocks:
        try:
            fn_code = build_function(block)
            mod_lines.append(fn_code)
            mod_lines.append("")
        except Exception as e:
            mod_lines.append(f"# Could not generate {block['id']}: {e}\n")

    return "\n".join(mod_lines)


def main():
    data = json.load(JSON_FILE.open())
    categories = data["categories"]
    blocks = data["blocks"]

    # Group blocks by category
    by_cat: dict[str, list[dict]] = {}
    for b in blocks:
        by_cat.setdefault(b["category"], []).append(b)

    # Create package directory
    PKG_DIR.mkdir(exist_ok=True)

    # Generate category modules
    module_names = []
    for cat in categories:
        cat_id = cat["id"]
        mod_name = slug(cat_id)
        module_names.append((mod_name, cat["name"], cat_id))
        cat_blocks = by_cat.get(cat_id, [])
        mod_code = build_category_module(cat_id, cat["name"], cat_blocks)
        (PKG_DIR / f"{mod_name}.py").write_text(mod_code, encoding="utf-8")
        print(f"  ✓ aiblocks/{mod_name}.py — {len(cat_blocks)} functions")

    # Generate __init__.py
    init_lines = [
        '"""',
        'AI Blocks — Python API',
        '',
        'Call any block as a function:',
        '    import aiblocks',
        '    df = aiblocks.data_io.load_csv(file_path="data.csv")',
        '    model = aiblocks.classical_ml.random_forest(train_data=df)',
        '"""',
        '',
    ]
    for mod_name, cat_name, cat_id in module_names:
        init_lines.append(f"from aiblocks import {mod_name}")
    init_lines.append("")

    # Build __all__
    init_lines.append("__all__ = [")
    for mod_name, _, _ in module_names:
        init_lines.append(f'    "{mod_name}",')
    init_lines.append("]")
    init_lines.append("")

    # Version
    init_lines.append('__version__ = "0.1.0"')
    init_lines.append("")

    (PKG_DIR / "__init__.py").write_text("\n".join(init_lines), encoding="utf-8")

    # Generate setup.py
    setup_code = '''"""AI Blocks — visual AI/ML blocks as a Python API."""
from setuptools import setup, find_packages

setup(
    name="aiblocks",
    version="0.1.0",
    description="AI Blocks: 500+ AI/ML building blocks as callable Python functions",
    long_description=open("README.md").read() if __import__("os").path.exists("README.md") else "",
    long_description_content_type="text/markdown",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=[
        "pandas",
        "numpy",
    ],
    extras_require={
        "ml": ["scikit-learn", "xgboost", "lightgbm"],
        "dl": ["torch", "torchvision", "torchaudio"],
        "llm": ["transformers", "openai", "anthropic", "langchain"],
        "vision": ["opencv-python", "Pillow", "ultralytics"],
        "audio": ["librosa", "soundfile"],
        "all": [
            "scikit-learn", "xgboost", "lightgbm",
            "torch", "torchvision", "torchaudio",
            "transformers", "openai", "anthropic", "langchain",
            "opencv-python", "Pillow", "ultralytics",
            "librosa", "soundfile",
            "mlflow", "wandb",
            "fastapi", "uvicorn",
        ],
    },
)
'''
    (ROOT / "setup.py").write_text(setup_code, encoding="utf-8")

    total = sum(len(v) for v in by_cat.values())
    print(f"\n✓ Generated aiblocks/ package: {total} functions across {len(categories)} modules")
    print(f"  Install: pip install -e .")
    print(f"  Usage:   import aiblocks; aiblocks.data_io.load_csv()")


if __name__ == "__main__":
    main()
