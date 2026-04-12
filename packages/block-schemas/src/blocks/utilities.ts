import type { BlockDefinition } from "../types.js";

export const utilitiesBlocks: BlockDefinition[] = [
  // ── 1. Variable ───────────────────────────────────────────────────────
  {
    id: "utilities.variable",
    name: "Variable",
    category: "utilities",
    description: "Declares a named variable with an initial value that can be referenced downstream",
    tags: ["variable", "assign", "store", "state", "python"],
    inputs: [
      { id: "value", name: "Initial Value", type: "any", required: false },
    ],
    outputs: [
      { id: "value", name: "Value", type: "any", required: true },
    ],
    parameters: [
      { id: "name", name: "Variable Name", type: "string", default: "my_var" },
      { id: "default_value", name: "Default Value", type: "code", default: "None" },
    ],
    codeTemplate: {
      imports: [],
      body: `{{params.name}} = {{inputs.value}} if {{inputs.value}} is not None else {{params.default_value}}
{{outputs.value}} = {{params.name}}`,
      outputBindings: { value: "var_value" },
    },
  },

  // ── 2. Constant ───────────────────────────────────────────────────────
  {
    id: "utilities.constant",
    name: "Constant",
    category: "utilities",
    description: "Declares an immutable constant value",
    tags: ["constant", "immutable", "literal", "fixed", "python"],
    inputs: [],
    outputs: [
      { id: "value", name: "Value", type: "any", required: true },
    ],
    parameters: [
      { id: "name", name: "Constant Name", type: "string", default: "MY_CONST" },
      { id: "value", name: "Value", type: "code", default: "42" },
    ],
    codeTemplate: {
      imports: [],
      body: `{{params.name}} = {{params.value}}
{{outputs.value}} = {{params.name}}`,
      outputBindings: { value: "const_value" },
    },
  },

  // ── 3. List ───────────────────────────────────────────────────────────
  {
    id: "utilities.list",
    name: "List",
    category: "utilities",
    description: "Creates or manipulates a Python list with append, extend, slice, and filter operations",
    tags: ["list", "array", "collection", "append", "python"],
    inputs: [
      { id: "items", name: "Items", type: "list", required: false },
    ],
    outputs: [
      { id: "result", name: "Result List", type: "list", required: true },
    ],
    parameters: [
      { id: "initial", name: "Initial Items", type: "json", default: [] },
      { id: "operation", name: "Operation", type: "select", default: "create", options: [{ label: "Create", value: "create" }, { label: "Append", value: "append" }, { label: "Extend", value: "extend" }, { label: "Filter", value: "filter" }, { label: "Sort", value: "sort" }] },
    ],
    codeTemplate: {
      imports: [],
      body: `{{outputs.result}} = list({{params.initial}})
if "{{params.operation}}" == "append" and {{inputs.items}} is not None:
    {{outputs.result}}.append({{inputs.items}})
elif "{{params.operation}}" == "extend" and {{inputs.items}} is not None:
    {{outputs.result}}.extend({{inputs.items}})
elif "{{params.operation}}" == "sort":
    {{outputs.result}}.sort()`,
      outputBindings: { result: "list_result" },
    },
  },

  // ── 4. Dict ───────────────────────────────────────────────────────────
  {
    id: "utilities.dict",
    name: "Dict",
    category: "utilities",
    description: "Creates or manipulates a Python dictionary with get, set, merge, and filter operations",
    tags: ["dict", "dictionary", "map", "key-value", "python"],
    inputs: [
      { id: "data", name: "Input Dict", type: "dict", required: false },
    ],
    outputs: [
      { id: "result", name: "Result Dict", type: "dict", required: true },
    ],
    parameters: [
      { id: "initial", name: "Initial Dict", type: "json", default: {} },
      { id: "operation", name: "Operation", type: "select", default: "create", options: [{ label: "Create", value: "create" }, { label: "Merge", value: "merge" }, { label: "Filter Keys", value: "filter_keys" }] },
      { id: "keys", name: "Keys (for filter)", type: "json", default: [], advanced: true },
    ],
    codeTemplate: {
      imports: [],
      body: `{{outputs.result}} = dict({{params.initial}})
if "{{params.operation}}" == "merge" and {{inputs.data}}:
    {{outputs.result}}.update({{inputs.data}})
elif "{{params.operation}}" == "filter_keys":
    {{outputs.result}} = {k: v for k, v in {{outputs.result}}.items() if k in {{params.keys}}}`,
      outputBindings: { result: "dict_result" },
    },
  },

  // ── 5. Set ────────────────────────────────────────────────────────────
  {
    id: "utilities.set",
    name: "Set",
    category: "utilities",
    description: "Creates a Python set and performs union, intersection, or difference operations",
    tags: ["set", "unique", "union", "intersection", "python"],
    inputs: [
      { id: "other", name: "Other Set", type: "list", required: false },
    ],
    outputs: [
      { id: "result", name: "Result Set", type: "list", required: true },
    ],
    parameters: [
      { id: "initial", name: "Initial Items", type: "json", default: [] },
      { id: "operation", name: "Operation", type: "select", default: "create", options: [{ label: "Create", value: "create" }, { label: "Union", value: "union" }, { label: "Intersection", value: "intersection" }, { label: "Difference", value: "difference" }] },
    ],
    codeTemplate: {
      imports: [],
      body: `_set = set({{params.initial}})
if "{{params.operation}}" == "union" and {{inputs.other}}:
    _set = _set | set({{inputs.other}})
elif "{{params.operation}}" == "intersection" and {{inputs.other}}:
    _set = _set & set({{inputs.other}})
elif "{{params.operation}}" == "difference" and {{inputs.other}}:
    _set = _set - set({{inputs.other}})
{{outputs.result}} = list(_set)`,
      outputBindings: { result: "set_result" },
    },
  },

  // ── 6. Tuple ──────────────────────────────────────────────────────────
  {
    id: "utilities.tuple",
    name: "Tuple",
    category: "utilities",
    description: "Creates an immutable tuple from input values",
    tags: ["tuple", "immutable", "pair", "pack", "python"],
    inputs: [
      { id: "items", name: "Items", type: "list", required: false },
    ],
    outputs: [
      { id: "result", name: "Tuple", type: "list", required: true },
    ],
    parameters: [
      { id: "values", name: "Values", type: "json", default: [] },
    ],
    codeTemplate: {
      imports: [],
      body: `{{outputs.result}} = tuple({{inputs.items}} or {{params.values}})`,
      outputBindings: { result: "tuple_result" },
    },
  },

  // ── 7. String Format ──────────────────────────────────────────────────
  {
    id: "utilities.string-format",
    name: "String Format",
    category: "utilities",
    description: "Formats a string using Python f-string, .format(), or % style substitution",
    tags: ["string", "format", "template", "interpolate", "python"],
    inputs: [
      { id: "variables", name: "Variables", type: "dict", required: true },
    ],
    outputs: [
      { id: "result", name: "Formatted String", type: "text", required: true },
    ],
    parameters: [
      { id: "template", name: "Template", type: "string", default: "Hello, {name}!" },
      { id: "method", name: "Method", type: "select", default: "format", options: [{ label: ".format()", value: "format" }, { label: "% style", value: "percent" }] },
    ],
    codeTemplate: {
      imports: [],
      body: `if "{{params.method}}" == "format":
    {{outputs.result}} = "{{params.template}}".format(**{{inputs.variables}})
else:
    {{outputs.result}} = "{{params.template}}" % {{inputs.variables}}`,
      outputBindings: { result: "formatted_string" },
    },
  },

  // ── 8. Regex Match ────────────────────────────────────────────────────
  {
    id: "utilities.regex-match",
    name: "Regex Match",
    category: "utilities",
    description: "Matches a regular expression against input text and returns matches or groups",
    tags: ["regex", "match", "pattern", "search", "re", "python"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "matches", name: "Matches", type: "list", required: true },
      { id: "matched", name: "Has Match", type: "boolean", required: true },
    ],
    parameters: [
      { id: "pattern", name: "Pattern", type: "string", default: "\\w+" },
      { id: "mode", name: "Mode", type: "select", default: "findall", options: [{ label: "Find All", value: "findall" }, { label: "Search", value: "search" }, { label: "Match", value: "match" }, { label: "Split", value: "split" }] },
      { id: "flags", name: "Flags", type: "multiselect", default: [], options: [{ label: "Ignore Case", value: "IGNORECASE" }, { label: "Multiline", value: "MULTILINE" }, { label: "Dotall", value: "DOTALL" }] },
    ],
    codeTemplate: {
      imports: ["import re"],
      body: `_flags = 0
for _f in {{params.flags}}:
    _flags |= getattr(re, _f)
if "{{params.mode}}" == "findall":
    {{outputs.matches}} = re.findall(r"{{params.pattern}}", {{inputs.text}}, _flags)
elif "{{params.mode}}" == "search":
    _m = re.search(r"{{params.pattern}}", {{inputs.text}}, _flags)
    {{outputs.matches}} = [_m.group()] if _m else []
elif "{{params.mode}}" == "match":
    _m = re.match(r"{{params.pattern}}", {{inputs.text}}, _flags)
    {{outputs.matches}} = [_m.group()] if _m else []
else:
    {{outputs.matches}} = re.split(r"{{params.pattern}}", {{inputs.text}}, flags=_flags)
{{outputs.matched}} = len({{outputs.matches}}) > 0`,
      outputBindings: { matches: "regex_matches", matched: "regex_matched" },
    },
  },

  // ── 9. Math Op ────────────────────────────────────────────────────────
  {
    id: "utilities.math-op",
    name: "Math Op",
    category: "utilities",
    description: "Performs a mathematical operation on one or two numeric inputs",
    tags: ["math", "arithmetic", "calculate", "number", "python"],
    inputs: [
      { id: "a", name: "A", type: "number", required: true },
      { id: "b", name: "B", type: "number", required: false },
    ],
    outputs: [
      { id: "result", name: "Result", type: "number", required: true },
    ],
    parameters: [
      { id: "operation", name: "Operation", type: "select", default: "add", options: [{ label: "Add", value: "add" }, { label: "Subtract", value: "subtract" }, { label: "Multiply", value: "multiply" }, { label: "Divide", value: "divide" }, { label: "Power", value: "power" }, { label: "Modulo", value: "modulo" }, { label: "Abs", value: "abs" }, { label: "Log", value: "log" }] },
    ],
    codeTemplate: {
      imports: ["import math"],
      body: `_ops = {"add": lambda a, b: a + b, "subtract": lambda a, b: a - b, "multiply": lambda a, b: a * b, "divide": lambda a, b: a / b, "power": lambda a, b: a ** b, "modulo": lambda a, b: a % b, "abs": lambda a, b: abs(a), "log": lambda a, b: math.log(a)}
{{outputs.result}} = _ops["{{params.operation}}"]({{inputs.a}}, {{inputs.b}} or 0)`,
      outputBindings: { result: "math_result" },
    },
  },

  // ── 10. Random Seed ───────────────────────────────────────────────────
  {
    id: "utilities.random-seed",
    name: "Random Seed",
    category: "utilities",
    description: "Sets the random seed for Python, NumPy, and PyTorch for reproducibility",
    tags: ["random", "seed", "reproducible", "deterministic", "python"],
    inputs: [],
    outputs: [
      { id: "seed", name: "Seed", type: "number", required: true },
    ],
    parameters: [
      { id: "seed", name: "Seed Value", type: "number", default: 42, min: 0, max: 4294967295 },
      { id: "set_numpy", name: "Set NumPy", type: "boolean", default: true },
      { id: "set_torch", name: "Set PyTorch", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import random"],
      body: `random.seed({{params.seed}})
if {{params.set_numpy}}:
    import numpy as np; np.random.seed({{params.seed}})
if {{params.set_torch}}:
    import torch; torch.manual_seed({{params.seed}})
{{outputs.seed}} = {{params.seed}}`,
      outputBindings: { seed: "random_seed" },
    },
  },

  // ── 11. UUID Generate ─────────────────────────────────────────────────
  {
    id: "utilities.uuid-generate",
    name: "UUID Generate",
    category: "utilities",
    description: "Generates a universally unique identifier (UUID v4 or v5)",
    tags: ["uuid", "unique", "identifier", "generate", "python"],
    inputs: [],
    outputs: [
      { id: "uuid", name: "UUID", type: "text", required: true },
    ],
    parameters: [
      { id: "version", name: "UUID Version", type: "select", default: "4", options: [{ label: "v4 (Random)", value: "4" }, { label: "v5 (Namespace)", value: "5" }] },
      { id: "namespace_name", name: "Namespace Name", type: "string", default: "", advanced: true, description: "Name for UUID v5 generation" },
    ],
    codeTemplate: {
      imports: ["import uuid"],
      body: `if "{{params.version}}" == "4":
    {{outputs.uuid}} = str(uuid.uuid4())
else:
    {{outputs.uuid}} = str(uuid.uuid5(uuid.NAMESPACE_DNS, "{{params.namespace_name}}"))`,
      outputBindings: { uuid: "generated_uuid" },
    },
  },

  // ── 12. Timestamp ─────────────────────────────────────────────────────
  {
    id: "utilities.timestamp",
    name: "Timestamp",
    category: "utilities",
    description: "Returns the current timestamp in various formats (ISO 8601, Unix epoch, custom)",
    tags: ["timestamp", "time", "date", "now", "python"],
    inputs: [],
    outputs: [
      { id: "timestamp", name: "Timestamp", type: "text", required: true },
      { id: "epoch", name: "Unix Epoch", type: "number", required: true },
    ],
    parameters: [
      { id: "format", name: "Format", type: "select", default: "iso", options: [{ label: "ISO 8601", value: "iso" }, { label: "Unix Epoch", value: "epoch" }, { label: "Custom", value: "custom" }] },
      { id: "custom_format", name: "Custom Format", type: "string", default: "%Y-%m-%d %H:%M:%S", advanced: true },
      { id: "utc", name: "Use UTC", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from datetime import datetime, timezone", "import time"],
      body: `_now = datetime.now(timezone.utc) if {{params.utc}} else datetime.now()
{{outputs.epoch}} = time.time()
if "{{params.format}}" == "iso":
    {{outputs.timestamp}} = _now.isoformat()
elif "{{params.format}}" == "epoch":
    {{outputs.timestamp}} = str({{outputs.epoch}})
else:
    {{outputs.timestamp}} = _now.strftime("{{params.custom_format}}")`,
      outputBindings: { timestamp: "current_timestamp", epoch: "unix_epoch" },
    },
  },

  // ── 13. Parse Date ────────────────────────────────────────────────────
  {
    id: "utilities.parse-date",
    name: "Parse Date",
    category: "utilities",
    description: "Parses a date string into a datetime object using a specified format",
    tags: ["parse", "date", "datetime", "strptime", "python"],
    inputs: [
      { id: "date_string", name: "Date String", type: "text", required: true },
    ],
    outputs: [
      { id: "datetime", name: "Datetime", type: "any", required: true },
      { id: "epoch", name: "Unix Epoch", type: "number", required: true },
    ],
    parameters: [
      { id: "format", name: "Date Format", type: "string", default: "%Y-%m-%d", description: "strptime format string" },
    ],
    codeTemplate: {
      imports: ["from datetime import datetime"],
      body: `{{outputs.datetime}} = datetime.strptime({{inputs.date_string}}, "{{params.format}}")
{{outputs.epoch}} = {{outputs.datetime}}.timestamp()`,
      outputBindings: { datetime: "parsed_datetime", epoch: "parsed_epoch" },
    },
  },

  // ── 14. HTTP Request ──────────────────────────────────────────────────
  {
    id: "utilities.http-request",
    name: "HTTP Request",
    category: "utilities",
    description: "Makes an HTTP request (GET, POST, PUT, DELETE) and returns the response",
    tags: ["http", "request", "api", "fetch", "requests", "rest"],
    inputs: [
      { id: "body", name: "Request Body", type: "dict", required: false },
      { id: "headers", name: "Headers", type: "dict", required: false },
    ],
    outputs: [
      { id: "response", name: "Response Body", type: "any", required: true },
      { id: "status_code", name: "Status Code", type: "number", required: true },
    ],
    parameters: [
      { id: "url", name: "URL", type: "string", default: "https://httpbin.org/get" },
      { id: "method", name: "Method", type: "select", default: "GET", options: [{ label: "GET", value: "GET" }, { label: "POST", value: "POST" }, { label: "PUT", value: "PUT" }, { label: "DELETE", value: "DELETE" }] },
      { id: "timeout", name: "Timeout (s)", type: "number", default: 30, min: 1, max: 300 },
    ],
    codeTemplate: {
      imports: ["import requests"],
      body: `_resp = requests.request("{{params.method}}", "{{params.url}}", json={{inputs.body}}, headers={{inputs.headers}} or {}, timeout={{params.timeout}})
{{outputs.status_code}} = _resp.status_code
try:
    {{outputs.response}} = _resp.json()
except ValueError:
    {{outputs.response}} = _resp.text`,
      outputBindings: { response: "http_response", status_code: "http_status" },
    },
  },

  // ── 15. JSON Parse ────────────────────────────────────────────────────
  {
    id: "utilities.json-parse",
    name: "JSON Parse",
    category: "utilities",
    description: "Parses a JSON string into a Python object (dict, list, etc.)",
    tags: ["json", "parse", "deserialize", "decode", "python"],
    inputs: [
      { id: "text", name: "JSON String", type: "text", required: true },
    ],
    outputs: [
      { id: "data", name: "Parsed Data", type: "any", required: true },
    ],
    parameters: [
      { id: "strict", name: "Strict Mode", type: "boolean", default: true, description: "Raise error on invalid JSON" },
    ],
    codeTemplate: {
      imports: ["import json"],
      body: `try:
    {{outputs.data}} = json.loads({{inputs.text}})
except json.JSONDecodeError:
    if {{params.strict}}:
        raise
    {{outputs.data}} = None`,
      outputBindings: { data: "parsed_json" },
    },
  },

  // ── 16. JSON Stringify ────────────────────────────────────────────────
  {
    id: "utilities.json-stringify",
    name: "JSON Stringify",
    category: "utilities",
    description: "Serializes a Python object to a JSON string",
    tags: ["json", "stringify", "serialize", "encode", "python"],
    inputs: [
      { id: "data", name: "Data", type: "any", required: true },
    ],
    outputs: [
      { id: "text", name: "JSON String", type: "text", required: true },
    ],
    parameters: [
      { id: "indent", name: "Indent", type: "number", default: 2, min: 0, max: 8 },
      { id: "sort_keys", name: "Sort Keys", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import json"],
      body: `{{outputs.text}} = json.dumps({{inputs.data}}, indent={{params.indent}} or None, sort_keys={{params.sort_keys}}, default=str)`,
      outputBindings: { text: "json_string" },
    },
  },

  // ── 17. Base64 Encode ─────────────────────────────────────────────────
  {
    id: "utilities.base64-encode",
    name: "Base64 Encode",
    category: "utilities",
    description: "Encodes data to Base64 string or decodes a Base64 string back to bytes",
    tags: ["base64", "encode", "decode", "binary", "python"],
    inputs: [
      { id: "data", name: "Data", type: "any", required: true },
    ],
    outputs: [
      { id: "result", name: "Result", type: "text", required: true },
    ],
    parameters: [
      { id: "mode", name: "Mode", type: "select", default: "encode", options: [{ label: "Encode", value: "encode" }, { label: "Decode", value: "decode" }] },
      { id: "url_safe", name: "URL Safe", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import base64"],
      body: `if "{{params.mode}}" == "encode":
    _data = {{inputs.data}}.encode() if isinstance({{inputs.data}}, str) else {{inputs.data}}
    {{outputs.result}} = (base64.urlsafe_b64encode(_data) if {{params.url_safe}} else base64.b64encode(_data)).decode()
else:
    {{outputs.result}} = (base64.urlsafe_b64decode({{inputs.data}}) if {{params.url_safe}} else base64.b64decode({{inputs.data}})).decode()`,
      outputBindings: { result: "base64_result" },
    },
  },

  // ── 18. Hash Block ────────────────────────────────────────────────────
  {
    id: "utilities.hash",
    name: "Hash Block",
    category: "utilities",
    description: "Computes a cryptographic hash (MD5, SHA-256, etc.) of the input data",
    tags: ["hash", "sha256", "md5", "checksum", "crypto", "python"],
    inputs: [
      { id: "data", name: "Data", type: "any", required: true },
    ],
    outputs: [
      { id: "hash", name: "Hash", type: "text", required: true },
    ],
    parameters: [
      { id: "algorithm", name: "Algorithm", type: "select", default: "sha256", options: [{ label: "SHA-256", value: "sha256" }, { label: "SHA-512", value: "sha512" }, { label: "MD5", value: "md5" }, { label: "SHA-1", value: "sha1" }] },
    ],
    codeTemplate: {
      imports: ["import hashlib"],
      body: `_data = {{inputs.data}}.encode() if isinstance({{inputs.data}}, str) else str({{inputs.data}}).encode()
{{outputs.hash}} = hashlib.{{params.algorithm}}(_data).hexdigest()`,
      outputBindings: { hash: "hash_value" },
    },
  },

  // ── 19. Zip Files ─────────────────────────────────────────────────────
  {
    id: "utilities.zip-files",
    name: "Zip Files",
    category: "utilities",
    description: "Compresses files or directories into a ZIP archive",
    tags: ["zip", "compress", "archive", "files", "python"],
    inputs: [
      { id: "file_paths", name: "File Paths", type: "list", required: true },
    ],
    outputs: [
      { id: "zip_path", name: "ZIP Path", type: "path", required: true },
    ],
    parameters: [
      { id: "output_path", name: "Output Path", type: "string", default: "./archive.zip" },
      { id: "compression", name: "Compression", type: "select", default: "deflated", options: [{ label: "Deflated", value: "deflated" }, { label: "Stored", value: "stored" }, { label: "BZIP2", value: "bzip2" }, { label: "LZMA", value: "lzma" }] },
    ],
    codeTemplate: {
      imports: ["import zipfile", "from pathlib import Path"],
      body: `_comp = {"deflated": zipfile.ZIP_DEFLATED, "stored": zipfile.ZIP_STORED, "bzip2": zipfile.ZIP_BZIP2, "lzma": zipfile.ZIP_LZMA}
with zipfile.ZipFile("{{params.output_path}}", "w", _comp["{{params.compression}}"]) as _zf:
    for _fp in {{inputs.file_paths}}:
        _p = Path(_fp)
        if _p.is_dir():
            for _f in _p.rglob("*"):
                _zf.write(_f, _f.relative_to(_p.parent))
        else:
            _zf.write(_p, _p.name)
{{outputs.zip_path}} = "{{params.output_path}}"`,
      outputBindings: { zip_path: "zip_file_path" },
    },
  },

  // ── 20. Unzip Files ───────────────────────────────────────────────────
  {
    id: "utilities.unzip-files",
    name: "Unzip Files",
    category: "utilities",
    description: "Extracts files from a ZIP archive to a target directory",
    tags: ["unzip", "extract", "decompress", "archive", "python"],
    inputs: [
      { id: "zip_path", name: "ZIP Path", type: "path", required: true },
    ],
    outputs: [
      { id: "extracted_dir", name: "Extracted Directory", type: "path", required: true },
      { id: "file_list", name: "File List", type: "list", required: true },
    ],
    parameters: [
      { id: "output_dir", name: "Output Directory", type: "string", default: "./extracted" },
    ],
    codeTemplate: {
      imports: ["import zipfile", "from pathlib import Path"],
      body: `with zipfile.ZipFile({{inputs.zip_path}}, "r") as _zf:
    _zf.extractall("{{params.output_dir}}")
    {{outputs.file_list}} = _zf.namelist()
{{outputs.extracted_dir}} = "{{params.output_dir}}"`,
      outputBindings: { extracted_dir: "extracted_directory", file_list: "extracted_files" },
    },
  },

  // ── 21. Environment Var ───────────────────────────────────────────────
  {
    id: "utilities.environment-var",
    name: "Environment Var",
    category: "utilities",
    description: "Reads or sets an environment variable with an optional default fallback",
    tags: ["env", "environment", "variable", "config", "os", "python"],
    inputs: [],
    outputs: [
      { id: "value", name: "Value", type: "text", required: true },
    ],
    parameters: [
      { id: "name", name: "Variable Name", type: "string", default: "API_KEY" },
      { id: "default", name: "Default Value", type: "string", default: "" },
      { id: "required", name: "Required", type: "boolean", default: false, description: "Raise error if not set and no default" },
    ],
    codeTemplate: {
      imports: ["import os"],
      body: `{{outputs.value}} = os.environ.get("{{params.name}}", "{{params.default}}")
if {{params.required}} and not {{outputs.value}}:
    raise EnvironmentError(f"Required environment variable '{{params.name}}' is not set")`,
      outputBindings: { value: "env_value" },
    },
  },

  // ── 22. Config Load (YAML) ────────────────────────────────────────────
  {
    id: "utilities.config-load-yaml",
    name: "Config Load (YAML)",
    category: "utilities",
    description: "Loads a YAML configuration file into a Python dictionary",
    tags: ["config", "yaml", "load", "parse", "settings"],
    inputs: [
      { id: "file_path", name: "File Path", type: "path", required: false },
    ],
    outputs: [
      { id: "config", name: "Config", type: "dict", required: true },
    ],
    parameters: [
      { id: "path", name: "Config Path", type: "string", default: "./config.yaml" },
      { id: "safe_load", name: "Safe Load", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import yaml", "from pathlib import Path"],
      body: `_path = {{inputs.file_path}} or "{{params.path}}"
with open(_path, "r") as f:
    {{outputs.config}} = yaml.safe_load(f) if {{params.safe_load}} else yaml.load(f, Loader=yaml.FullLoader)`,
      outputBindings: { config: "yaml_config" },
    },
  },

  // ── 23. Config Load (TOML) ────────────────────────────────────────────
  {
    id: "utilities.config-load-toml",
    name: "Config Load (TOML)",
    category: "utilities",
    description: "Loads a TOML configuration file into a Python dictionary",
    tags: ["config", "toml", "load", "parse", "settings"],
    inputs: [
      { id: "file_path", name: "File Path", type: "path", required: false },
    ],
    outputs: [
      { id: "config", name: "Config", type: "dict", required: true },
    ],
    parameters: [
      { id: "path", name: "Config Path", type: "string", default: "./config.toml" },
    ],
    codeTemplate: {
      imports: ["import toml"],
      body: `_path = {{inputs.file_path}} or "{{params.path}}"
with open(_path, "r") as f:
    {{outputs.config}} = toml.load(f)`,
      outputBindings: { config: "toml_config" },
    },
  },

  // ── 24. Subprocess Run ────────────────────────────────────────────────
  {
    id: "utilities.subprocess-run",
    name: "Subprocess Run",
    category: "utilities",
    description: "Executes a shell command as a subprocess and captures stdout, stderr, and return code",
    tags: ["subprocess", "shell", "command", "exec", "os", "python"],
    inputs: [],
    outputs: [
      { id: "stdout", name: "Stdout", type: "text", required: true },
      { id: "stderr", name: "Stderr", type: "text", required: true },
      { id: "returncode", name: "Return Code", type: "number", required: true },
    ],
    parameters: [
      { id: "command", name: "Command", type: "code", default: "echo Hello World" },
      { id: "shell", name: "Use Shell", type: "boolean", default: true },
      { id: "timeout", name: "Timeout (s)", type: "number", default: 60, min: 1, max: 3600 },
      { id: "check", name: "Check Return Code", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import subprocess"],
      body: `_result = subprocess.run({{params.command}} if not {{params.shell}} else "{{params.command}}", shell={{params.shell}}, capture_output=True, text=True, timeout={{params.timeout}}, check={{params.check}})
{{outputs.stdout}} = _result.stdout
{{outputs.stderr}} = _result.stderr
{{outputs.returncode}} = _result.returncode`,
      outputBindings: { stdout: "cmd_stdout", stderr: "cmd_stderr", returncode: "cmd_returncode" },
    },
  },

  // ── 25. Parallel Map ──────────────────────────────────────────────────
  {
    id: "utilities.parallel-map",
    name: "Parallel Map",
    category: "utilities",
    description: "Applies a function to each item in a list in parallel using a process or thread pool",
    tags: ["parallel", "map", "concurrent", "multiprocessing", "python"],
    inputs: [
      { id: "items", name: "Items", type: "list", required: true },
      { id: "fn", name: "Function", type: "any", required: true },
    ],
    outputs: [
      { id: "results", name: "Results", type: "list", required: true },
    ],
    parameters: [
      { id: "max_workers", name: "Max Workers", type: "number", default: 4, min: 1, max: 64 },
      { id: "backend", name: "Backend", type: "select", default: "thread", options: [{ label: "Thread Pool", value: "thread" }, { label: "Process Pool", value: "process" }] },
    ],
    codeTemplate: {
      imports: ["from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor"],
      body: `_PoolClass = ThreadPoolExecutor if "{{params.backend}}" == "thread" else ProcessPoolExecutor
with _PoolClass(max_workers={{params.max_workers}}) as _pool:
    {{outputs.results}} = list(_pool.map({{inputs.fn}}, {{inputs.items}}))`,
      outputBindings: { results: "parallel_results" },
    },
  },

  // ── 26. Thread Pool ───────────────────────────────────────────────────
  {
    id: "utilities.thread-pool",
    name: "Thread Pool",
    category: "utilities",
    description: "Creates a reusable thread pool executor for submitting concurrent tasks",
    tags: ["thread", "pool", "concurrent", "executor", "python"],
    inputs: [],
    outputs: [
      { id: "executor", name: "Executor", type: "any", required: true },
    ],
    parameters: [
      { id: "max_workers", name: "Max Workers", type: "number", default: 4, min: 1, max: 64 },
      { id: "thread_name_prefix", name: "Thread Name Prefix", type: "string", default: "worker", advanced: true },
    ],
    codeTemplate: {
      imports: ["from concurrent.futures import ThreadPoolExecutor"],
      body: `{{outputs.executor}} = ThreadPoolExecutor(max_workers={{params.max_workers}}, thread_name_prefix="{{params.thread_name_prefix}}")`,
      outputBindings: { executor: "thread_pool_executor" },
    },
  },

  // ── 27. Python Snippet (import / arbitrary code) ───────────────────────
  {
    id: "utilities.python-snippet",
    name: "Python Snippet",
    category: "utilities",
    description:
      "Arbitrary Python source. Use sequence ports only to enforce order between multiple snippets when importing a .py file.",
    tags: ["python", "code", "import", "script", "snippet"],
    inputs: [
      {
        id: "order_in",
        name: "Sequence",
        type: "any",
        required: false,
        description: "Optional — connect from the previous snippet’s sequence output to preserve top-to-bottom order",
      },
    ],
    outputs: [
      {
        id: "order_out",
        name: "Sequence",
        type: "any",
        required: true,
        description: "Connect to the next snippet’s sequence input to preserve order",
      },
    ],
    parameters: [
      {
        id: "source",
        name: "Python",
        type: "code",
        default: "pass",
        description: "Python statements executed in pipeline order",
      },
    ],
    codeTemplate: {
      imports: [],
      body: "{{params.source}}",
      outputBindings: { order_out: "None" },
    },
  },
];
