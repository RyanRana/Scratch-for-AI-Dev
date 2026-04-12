"""
aiblocks.utilities — Utilities & Variables

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def variable(value=None, name='my_var', default_value='None'):
    """Declares a named variable with an initial value that can be referenced downstream
    
    Args:
        value (any): 
    
    Parameters:
        name (string, default='my_var'): 
        default_value (code, default='None'): 
    
    Returns:
        any: 
    """
    _imports = []
    _code = '{{params.name}} = {{inputs.value}} if {{inputs.value}} is not None else {{params.default_value}}\n{{outputs.value}} = {{params.name}}'
    
    _code = _code.replace("{{params.name}}", str(name))
    _code = _code.replace("{{params.default_value}}", str(default_value))
    _code = _code.replace("{{inputs.value}}", "value")
    _code = _code.replace("{{outputs.value}}", "_out_value")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["value"] = value
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_value")


def constant(name='MY_CONST', value='42'):
    """Declares an immutable constant value
    
    Parameters:
        name (string, default='MY_CONST'): 
        value (code, default='42'): 
    
    Returns:
        any: 
    """
    _imports = []
    _code = '{{params.name}} = {{params.value}}\n{{outputs.value}} = {{params.name}}'
    
    _code = _code.replace("{{params.name}}", str(name))
    _code = _code.replace("{{params.value}}", str(value))
    _code = _code.replace("{{outputs.value}}", "_out_value")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_value")


def list(items=None, initial=[], operation='create'):
    """Creates or manipulates a Python list with append, extend, slice, and filter operations
    
    Args:
        items (list): 
    
    Parameters:
        initial (json, default=[]): 
        operation (select, default='create'): 
    
    Returns:
        list: 
    """
    _imports = []
    _code = '{{outputs.result}} = list({{params.initial}})\nif "{{params.operation}}" == "append" and {{inputs.items}} is not None:\n    {{outputs.result}}.append({{inputs.items}})\nelif "{{params.operation}}" == "extend" and {{inputs.items}} is not None:\n    {{outputs.result}}.extend({{inputs.items}})\nelif "{{params.operation}}" == "sort":\n    {{outputs.result}}.sort()'
    
    _code = _code.replace("{{params.initial}}", str(initial))
    _code = _code.replace("{{params.operation}}", str(operation))
    _code = _code.replace("{{inputs.items}}", "items")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["items"] = items
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_result")


def dict(data=None, initial={}, operation='create', keys=[]):
    """Creates or manipulates a Python dictionary with get, set, merge, and filter operations
    
    Args:
        data (dict): 
    
    Parameters:
        initial (json, default={}): 
        operation (select, default='create'): 
        keys (json, default=[]): 
    
    Returns:
        dict: 
    """
    _imports = []
    _code = '{{outputs.result}} = dict({{params.initial}})\nif "{{params.operation}}" == "merge" and {{inputs.data}}:\n    {{outputs.result}}.update({{inputs.data}})\nelif "{{params.operation}}" == "filter_keys":\n    {{outputs.result}} = { "k": v for k, v in {{outputs.result}}.items() if k in {{params.keys}}}'
    
    _code = _code.replace("{{params.initial}}", str(initial))
    _code = _code.replace("{{params.operation}}", str(operation))
    _code = _code.replace("{{params.keys}}", str(keys))
    _code = _code.replace("{{inputs.data}}", "data")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["data"] = data
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_result")


def set(other=None, initial=[], operation='create'):
    """Creates a Python set and performs union, intersection, or difference operations
    
    Args:
        other (list): 
    
    Parameters:
        initial (json, default=[]): 
        operation (select, default='create'): 
    
    Returns:
        list: 
    """
    _imports = []
    _code = '_set = set({{params.initial}})\nif "{{params.operation}}" == "union" and {{inputs.other}}:\n    _set = _set | set({{inputs.other}})\nelif "{{params.operation}}" == "intersection" and {{inputs.other}}:\n    _set = _set & set({{inputs.other}})\nelif "{{params.operation}}" == "difference" and {{inputs.other}}:\n    _set = _set - set({{inputs.other}})\n{{outputs.result}} = list(_set)'
    
    _code = _code.replace("{{params.initial}}", str(initial))
    _code = _code.replace("{{params.operation}}", str(operation))
    _code = _code.replace("{{inputs.other}}", "other")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["other"] = other
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_result")


def tuple(items=None, values=[]):
    """Creates an immutable tuple from input values
    
    Args:
        items (list): 
    
    Parameters:
        values (json, default=[]): 
    
    Returns:
        list: 
    """
    _imports = []
    _code = '{{outputs.result}} = tuple({{inputs.items}} or {{params.values}})'
    
    _code = _code.replace("{{params.values}}", str(values))
    _code = _code.replace("{{inputs.items}}", "items")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["items"] = items
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_result")


def string_format(variables=None, template='Hello, {name}!', method='format'):
    """Formats a string using Python f-string, .format(), or % style substitution
    
    Args:
        variables (dict) (required): 
    
    Parameters:
        template (string, default='Hello, {name}!'): 
        method (select, default='format'): 
    
    Returns:
        text: 
    """
    _imports = []
    _code = 'if "{{params.method}}" == "format":\n    {{outputs.result}} = "{{params.template}}".format(**{{inputs.variables}})\n "else":\n    {{outputs.result}} = "{{params.template}}" % {{inputs.variables}}'
    
    _code = _code.replace("{{params.template}}", str(template))
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{inputs.variables}}", "variables")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["variables"] = variables
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_result")


def regex_match(text=None, pattern='\\w+', mode='findall', flags=[]):
    """Matches a regular expression against input text and returns matches or groups
    
    Args:
        text (text) (required): 
    
    Parameters:
        pattern (string, default='\\w+'): 
        mode (select, default='findall'): 
        flags (multiselect, default=[]): 
    
    Returns:
        dict with keys:
            matches (list): 
            matched (boolean): 
    """
    _imports = ['import re']
    _code = '_flags = 0\nfor _f in {{params.flags}}:\n    _flags |= getattr(re, _f)\nif "{{params.mode}}" == "findall":\n    {{outputs.matches}} = re.findall(r"{{params.pattern}}", {{inputs.text}}, _flags)\nelif "{{params.mode}}" == "search":\n    _m = re.search(r"{{params.pattern}}", {{inputs.text}}, _flags)\n    {{outputs.matches}} = [_m.group()] if _m else []\nelif "{{params.mode}}" == "match":\n    _m = re.match(r"{{params.pattern}}", {{inputs.text}}, _flags)\n    {{outputs.matches}} = [_m.group()] if _m else []\n "else":\n    {{outputs.matches}} = re.split(r"{{params.pattern}}", {{inputs.text}}, flags=_flags)\n{{outputs.matched}} = len({{outputs.matches}}) > 0'
    
    _code = _code.replace("{{params.pattern}}", str(pattern))
    _code = _code.replace("{{params.mode}}", str(mode))
    _code = _code.replace("{{params.flags}}", str(flags))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.matches}}", "_out_matches")
    _code = _code.replace("{{outputs.matched}}", "_out_matched")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"matches": _ns.get("_out_matches"), "matched": _ns.get("_out_matched")}


def math_op(a=None, b=None, operation='add'):
    """Performs a mathematical operation on one or two numeric inputs
    
    Args:
        a (number) (required): 
        b (number): 
    
    Parameters:
        operation (select, default='add'): 
    
    Returns:
        number: 
    """
    _imports = ['import math']
    _code = '_ops = {"add": lambda a, "b": a + b, "subtract": lambda a, "b": a - b, "multiply": lambda a, "b": a * b, "divide": lambda a, "b": a / b, "power": lambda a, "b": a ** b, "modulo": lambda a, "b": a % b, "abs": lambda a, "b": abs(a), "log": lambda a, "b": math.log(a)}\n{{outputs.result}} = _ops["{{params.operation}}"]({{inputs.a}}, {{inputs.b}} or 0)'
    
    _code = _code.replace("{{params.operation}}", str(operation))
    _code = _code.replace("{{inputs.a}}", "a")
    _code = _code.replace("{{inputs.b}}", "b")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["a"] = a
    _ns["b"] = b
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_result")


def random_seed(seed=42, set_numpy=True, set_torch=False):
    """Sets the random seed for Python, NumPy, and PyTorch for reproducibility
    
    Parameters:
        seed (number, default=42): 
        set_numpy (boolean, default=True): 
        set_torch (boolean, default=False): 
    
    Returns:
        number: 
    """
    _imports = ['import random']
    _code = 'random.seed({{params.seed}})\nif {{params.set_numpy}}:\n    import numpy as np; np.random.seed({{params.seed}})\nif {{params.set_torch}}:\n    import torch; torch.manual_seed({{params.seed}})\n{{outputs.seed}} = {{params.seed}}'
    
    _code = _code.replace("{{params.seed}}", str(seed))
    _code = _code.replace("{{params.set_numpy}}", str(set_numpy))
    _code = _code.replace("{{params.set_torch}}", str(set_torch))
    _code = _code.replace("{{outputs.seed}}", "_out_seed")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_seed")


def uuid_generate(version='4', namespace_name=''):
    """Generates a universally unique identifier (UUID v4 or v5)
    
    Parameters:
        version (select, default='4'): 
        namespace_name (string, default=''): Name for UUID v5 generation
    
    Returns:
        text: 
    """
    _imports = ['import uuid']
    _code = 'if "{{params.version}}" == "4":\n    {{outputs.uuid}} = str(uuid.uuid4())\n "else":\n    {{outputs.uuid}} = str(uuid.uuid5(uuid.NAMESPACE_DNS, "{{params.namespace_name}}"))'
    
    _code = _code.replace("{{params.version}}", str(version))
    _code = _code.replace("{{params.namespace_name}}", str(namespace_name))
    _code = _code.replace("{{outputs.uuid}}", "_out_uuid")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_uuid")


def timestamp(format='iso', custom_format='%Y-%m-%d %H:%M:%S', utc=True):
    """Returns the current timestamp in various formats (ISO 8601, Unix epoch, custom)
    
    Parameters:
        format (select, default='iso'): 
        custom_format (string, default='%Y-%m-%d %H:%M:%S'): 
        utc (boolean, default=True): 
    
    Returns:
        dict with keys:
            timestamp (text): 
            epoch (number): 
    """
    _imports = ['from datetime import datetime, timezone', 'import time']
    _code = '_now = datetime.now(timezone.utc) if {{params.utc}} else datetime.now()\n{{outputs.epoch}} = time.time()\nif "{{params.format}}" == "iso":\n    {{outputs.timestamp}} = _now.isoformat()\nelif "{{params.format}}" == "epoch":\n    {{outputs.timestamp}} = str({{outputs.epoch}})\n "else":\n    {{outputs.timestamp}} = _now.strftime("{{params.custom_format}}")'
    
    _code = _code.replace("{{params.format}}", str(format))
    _code = _code.replace("{{params.custom_format}}", str(custom_format))
    _code = _code.replace("{{params.utc}}", str(utc))
    _code = _code.replace("{{outputs.timestamp}}", "_out_timestamp")
    _code = _code.replace("{{outputs.epoch}}", "_out_epoch")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"timestamp": _ns.get("_out_timestamp"), "epoch": _ns.get("_out_epoch")}


def parse_date(date_string=None, format='%Y-%m-%d'):
    """Parses a date string into a datetime object using a specified format
    
    Args:
        date_string (text) (required): 
    
    Parameters:
        format (string, default='%Y-%m-%d'): strptime format string
    
    Returns:
        dict with keys:
            datetime (any): 
            epoch (number): 
    """
    _imports = ['from datetime import datetime']
    _code = '{{outputs.datetime}} = datetime.strptime({{inputs.date_string}}, "{{params.format}}")\n{{outputs.epoch}} = {{outputs.datetime}}.timestamp()'
    
    _code = _code.replace("{{params.format}}", str(format))
    _code = _code.replace("{{inputs.date_string}}", "date_string")
    _code = _code.replace("{{outputs.datetime}}", "_out_datetime")
    _code = _code.replace("{{outputs.epoch}}", "_out_epoch")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["date_string"] = date_string
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"datetime": _ns.get("_out_datetime"), "epoch": _ns.get("_out_epoch")}


def http_request(body=None, headers=None, url='https://httpbin.org/get', method='GET', timeout=30):
    """Makes an HTTP request (GET, POST, PUT, DELETE) and returns the response
    
    Dependencies: pip install requests
    
    Args:
        body (dict): 
        headers (dict): 
    
    Parameters:
        url (string, default='https://httpbin.org/get'): 
        method (select, default='GET'): 
        timeout (number, default=30): 
    
    Returns:
        dict with keys:
            response (any): 
            status_code (number): 
    """
    _imports = ['import requests']
    _code = '_resp = requests.request("{{params.method}}", "{{params.url}}", json={{inputs.body}}, headers={{inputs.headers}} or {}, timeout={{params.timeout}})\n{{outputs.status_code}} = _resp.status_code\n "try":\n    {{outputs.response}} = _resp.json()\nexcept ValueError:\n    {{outputs.response}} = _resp.text'
    
    _code = _code.replace("{{params.url}}", str(url))
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.timeout}}", str(timeout))
    _code = _code.replace("{{inputs.body}}", "body")
    _code = _code.replace("{{inputs.headers}}", "headers")
    _code = _code.replace("{{outputs.response}}", "_out_response")
    _code = _code.replace("{{outputs.status_code}}", "_out_status_code")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["body"] = body
    _ns["headers"] = headers
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"response": _ns.get("_out_response"), "status_code": _ns.get("_out_status_code")}


def json_parse(text=None, strict=True):
    """Parses a JSON string into a Python object (dict, list, etc.)
    
    Args:
        text (text) (required): 
    
    Parameters:
        strict (boolean, default=True): Raise error on invalid JSON
    
    Returns:
        any: 
    """
    _imports = ['import json']
    _code = 'try:\n    {{outputs.data}} = json.loads({{inputs.text}})\nexcept json.JSONDecodeError:\n    if {{params.strict}}:\n        raise\n    {{outputs.data}} = None'
    
    _code = _code.replace("{{params.strict}}", str(strict))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.data}}", "_out_data")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_data")


def json_stringify(data=None, indent=2, sort_keys=False):
    """Serializes a Python object to a JSON string
    
    Args:
        data (any) (required): 
    
    Parameters:
        indent (number, default=2): 
        sort_keys (boolean, default=False): 
    
    Returns:
        text: 
    """
    _imports = ['import json']
    _code = '{{outputs.text}} = json.dumps({{inputs.data}}, indent={{params.indent}} or None, sort_keys={{params.sort_keys}}, default=str)'
    
    _code = _code.replace("{{params.indent}}", str(indent))
    _code = _code.replace("{{params.sort_keys}}", str(sort_keys))
    _code = _code.replace("{{inputs.data}}", "data")
    _code = _code.replace("{{outputs.text}}", "_out_text")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["data"] = data
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_text")


def base64_encode(data=None, mode='encode', url_safe=False):
    """Encodes data to Base64 string or decodes a Base64 string back to bytes
    
    Args:
        data (any) (required): 
    
    Parameters:
        mode (select, default='encode'): 
        url_safe (boolean, default=False): 
    
    Returns:
        text: 
    """
    _imports = ['import base64']
    _code = 'if "{{params.mode}}" == "encode":\n    _data = {{inputs.data}}.encode() if isinstance({{inputs.data}}, str) else {{inputs.data}}\n    {{outputs.result}} = (base64.urlsafe_b64encode(_data) if {{params.url_safe}} else base64.b64encode(_data)).decode()\n "else":\n    {{outputs.result}} = (base64.urlsafe_b64decode({{inputs.data}}) if {{params.url_safe}} else base64.b64decode({{inputs.data}})).decode()'
    
    _code = _code.replace("{{params.mode}}", str(mode))
    _code = _code.replace("{{params.url_safe}}", str(url_safe))
    _code = _code.replace("{{inputs.data}}", "data")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["data"] = data
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_result")


def hash(data=None, algorithm='sha256'):
    """Computes a cryptographic hash (MD5, SHA-256, etc.) of the input data
    
    Args:
        data (any) (required): 
    
    Parameters:
        algorithm (select, default='sha256'): 
    
    Returns:
        text: 
    """
    _imports = ['import hashlib']
    _code = '_data = {{inputs.data}}.encode() if isinstance({{inputs.data}}, str) else str({{inputs.data}}).encode()\n{{outputs.hash}} = hashlib.{{params.algorithm}}(_data).hexdigest()'
    
    _code = _code.replace("{{params.algorithm}}", str(algorithm))
    _code = _code.replace("{{inputs.data}}", "data")
    _code = _code.replace("{{outputs.hash}}", "_out_hash")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["data"] = data
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_hash")


def zip_files(file_paths=None, output_path='./archive.zip', compression='deflated'):
    """Compresses files or directories into a ZIP archive
    
    Dependencies: pip install zipfile
    
    Args:
        file_paths (list) (required): 
    
    Parameters:
        output_path (string, default='./archive.zip'): 
        compression (select, default='deflated'): 
    
    Returns:
        path: 
    """
    _imports = ['import zipfile', 'from pathlib import Path']
    _code = '_comp = {"deflated": zipfile.ZIP_DEFLATED, "stored": zipfile.ZIP_STORED, "bzip2": zipfile.ZIP_BZIP2, "lzma": zipfile.ZIP_LZMA}\nwith zipfile.ZipFile("{{params.output_path}}", "w", _comp["{{params.compression}}"]) as _zf:\n    for _fp in {{inputs.file_paths}}:\n        _p = Path(_fp)\n        if _p.is_dir():\n            for _f in _p.rglob("*"):\n                _zf.write(_f, _f.relative_to(_p.parent))\n "else":\n            _zf.write(_p, _p.name)\n{{outputs.zip_path}} = "{{params.output_path}}"'
    
    _code = _code.replace("{{params.output_path}}", str(output_path))
    _code = _code.replace("{{params.compression}}", str(compression))
    _code = _code.replace("{{inputs.file_paths}}", "file_paths")
    _code = _code.replace("{{outputs.zip_path}}", "_out_zip_path")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["file_paths"] = file_paths
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_zip_path")


def unzip_files(zip_path=None, output_dir='./extracted'):
    """Extracts files from a ZIP archive to a target directory
    
    Dependencies: pip install zipfile
    
    Args:
        zip_path (path) (required): 
    
    Parameters:
        output_dir (string, default='./extracted'): 
    
    Returns:
        dict with keys:
            extracted_dir (path): 
            file_list (list): 
    """
    _imports = ['import zipfile', 'from pathlib import Path']
    _code = 'with zipfile.ZipFile({{inputs.zip_path}}, "r") as _zf:\n    _zf.extractall("{{params.output_dir}}")\n    {{outputs.file_list}} = _zf.namelist()\n{{outputs.extracted_dir}} = "{{params.output_dir}}"'
    
    _code = _code.replace("{{params.output_dir}}", str(output_dir))
    _code = _code.replace("{{inputs.zip_path}}", "zip_path")
    _code = _code.replace("{{outputs.extracted_dir}}", "_out_extracted_dir")
    _code = _code.replace("{{outputs.file_list}}", "_out_file_list")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["zip_path"] = zip_path
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"extracted_dir": _ns.get("_out_extracted_dir"), "file_list": _ns.get("_out_file_list")}


def environment_var(name='API_KEY', default='', required=False):
    """Reads or sets an environment variable with an optional default fallback
    
    Parameters:
        name (string, default='API_KEY'): 
        default (string, default=''): 
        required (boolean, default=False): Raise error if not set and no default
    
    Returns:
        text: 
    """
    _imports = ['import os']
    _code = '{{outputs.value}} = os.environ.get("{{params.name}}", "{{params.default}}")\nif {{params.required}} and not {{outputs.value}}:\n    raise EnvironmentError(f"Required environment variable \'{{params.name}}\' is not set")'
    
    _code = _code.replace("{{params.name}}", str(name))
    _code = _code.replace("{{params.default}}", str(default))
    _code = _code.replace("{{params.required}}", str(required))
    _code = _code.replace("{{outputs.value}}", "_out_value")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_value")


def config_load_yaml(file_path=None, path='./config.yaml', safe_load=True):
    """Loads a YAML configuration file into a Python dictionary
    
    Dependencies: pip install pyyaml
    
    Args:
        file_path (path): 
    
    Parameters:
        path (string, default='./config.yaml'): 
        safe_load (boolean, default=True): 
    
    Returns:
        dict: 
    """
    _imports = ['import yaml', 'from pathlib import Path']
    _code = '_path = {{inputs.file_path}} or "{{params.path}}"\nwith open(_path, "r") as f:\n    {{outputs.config}} = yaml.safe_load(f) if {{params.safe_load}} else yaml.load(f, Loader=yaml.FullLoader)'
    
    _code = _code.replace("{{params.path}}", str(path))
    _code = _code.replace("{{params.safe_load}}", str(safe_load))
    _code = _code.replace("{{inputs.file_path}}", "file_path")
    _code = _code.replace("{{outputs.config}}", "_out_config")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["file_path"] = file_path
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_config")


def config_load_toml(file_path=None, path='./config.toml'):
    """Loads a TOML configuration file into a Python dictionary
    
    Dependencies: pip install toml
    
    Args:
        file_path (path): 
    
    Parameters:
        path (string, default='./config.toml'): 
    
    Returns:
        dict: 
    """
    _imports = ['import toml']
    _code = '_path = {{inputs.file_path}} or "{{params.path}}"\nwith open(_path, "r") as f:\n    {{outputs.config}} = toml.load(f)'
    
    _code = _code.replace("{{params.path}}", str(path))
    _code = _code.replace("{{inputs.file_path}}", "file_path")
    _code = _code.replace("{{outputs.config}}", "_out_config")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["file_path"] = file_path
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_config")


def subprocess_run(command='echo Hello World', shell=True, timeout=60, check=False):
    """Executes a shell command as a subprocess and captures stdout, stderr, and return code
    
    Parameters:
        command (code, default='echo Hello World'): 
        shell (boolean, default=True): 
        timeout (number, default=60): 
        check (boolean, default=False): 
    
    Returns:
        dict with keys:
            stdout (text): 
            stderr (text): 
            returncode (number): 
    """
    _imports = ['import subprocess']
    _code = '_result = subprocess.run({{params.command}} if not {{params.shell}} else "{{params.command}}", shell={{params.shell}}, capture_output=True, text=True, timeout={{params.timeout}}, check={{params.check}})\n{{outputs.stdout}} = _result.stdout\n{{outputs.stderr}} = _result.stderr\n{{outputs.returncode}} = _result.returncode'
    
    _code = _code.replace("{{params.command}}", str(command))
    _code = _code.replace("{{params.shell}}", str(shell))
    _code = _code.replace("{{params.timeout}}", str(timeout))
    _code = _code.replace("{{params.check}}", str(check))
    _code = _code.replace("{{outputs.stdout}}", "_out_stdout")
    _code = _code.replace("{{outputs.stderr}}", "_out_stderr")
    _code = _code.replace("{{outputs.returncode}}", "_out_returncode")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"stdout": _ns.get("_out_stdout"), "stderr": _ns.get("_out_stderr"), "returncode": _ns.get("_out_returncode")}


def parallel_map(items=None, fn=None, max_workers=4, backend='thread'):
    """Applies a function to each item in a list in parallel using a process or thread pool
    
    Args:
        items (list) (required): 
        fn (any) (required): 
    
    Parameters:
        max_workers (number, default=4): 
        backend (select, default='thread'): 
    
    Returns:
        list: 
    """
    _imports = ['from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor']
    _code = '_PoolClass = ThreadPoolExecutor if "{{params.backend}}" == "thread" else ProcessPoolExecutor\nwith _PoolClass(max_workers={{params.max_workers}}) as _pool:\n    {{outputs.results}} = list(_pool.map({{inputs.fn}}, {{inputs.items}}))'
    
    _code = _code.replace("{{params.max_workers}}", str(max_workers))
    _code = _code.replace("{{params.backend}}", str(backend))
    _code = _code.replace("{{inputs.items}}", "items")
    _code = _code.replace("{{inputs.fn}}", "fn")
    _code = _code.replace("{{outputs.results}}", "_out_results")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["items"] = items
    _ns["fn"] = fn
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_results")


def thread_pool(max_workers=4, thread_name_prefix='worker'):
    """Creates a reusable thread pool executor for submitting concurrent tasks
    
    Parameters:
        max_workers (number, default=4): 
        thread_name_prefix (string, default='worker'): 
    
    Returns:
        any: 
    """
    _imports = ['from concurrent.futures import ThreadPoolExecutor']
    _code = '{{outputs.executor}} = ThreadPoolExecutor(max_workers={{params.max_workers}}, thread_name_prefix="{{params.thread_name_prefix}}")'
    
    _code = _code.replace("{{params.max_workers}}", str(max_workers))
    _code = _code.replace("{{params.thread_name_prefix}}", str(thread_name_prefix))
    _code = _code.replace("{{outputs.executor}}", "_out_executor")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_executor")


def python_snippet(order_in=None, source='pass'):
    """Arbitrary Python source. Use sequence ports only to enforce order between multiple snippets when importing a .py file.
    
    Args:
        order_in (any): Optional — connect from the previous snippet’s sequence output to preserve top-to-bottom order
    
    Parameters:
        source (code, default='pass'): Python statements executed in pipeline order
    
    Returns:
        any: Connect to the next snippet’s sequence input to preserve order
    """
    _imports = []
    _code = '{{params.source}}'
    
    _code = _code.replace("{{params.source}}", str(source))
    _code = _code.replace("{{inputs.order_in}}", "order_in")
    _code = _code.replace("{{outputs.order_out}}", "_out_order_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["order_in"] = order_in
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_order_out")

