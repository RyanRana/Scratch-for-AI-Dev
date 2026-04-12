"""
aiblocks.data_io — Data I/O

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def load_csv(file_path='data.csv', separator=',', encoding='utf-8', header=0):
    """Load a CSV file into a pandas DataFrame
    
    Dependencies: pip install pandas
    
    Parameters:
        file_path (string, default='data.csv'): 
        separator (string, default=','): 
        encoding (select, default='utf-8'): 
        header (number, default=0): Row number to use as column names (set -1 for no header)
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '{{outputs.dataframe}} = pd.read_csv("{{params.file_path}}", sep="{{params.separator}}", encoding="{{params.encoding}}")'
    
    _code = _code.replace("{{params.file_path}}", str(file_path))
    _code = _code.replace("{{params.separator}}", str(separator))
    _code = _code.replace("{{params.encoding}}", str(encoding))
    _code = _code.replace("{{params.header}}", str(header))
    _code = _code.replace("{{outputs.dataframe}}", "_out_dataframe")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_dataframe")


def load_json(file_path='data.json', orient='records', lines=False):
    """Load a JSON file into a pandas DataFrame or Python dict
    
    Dependencies: pip install pandas
    
    Parameters:
        file_path (string, default='data.json'): 
        orient (select, default='records'): 
        lines (boolean, default=False): Read file as one JSON object per line
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '{{outputs.dataframe}} = pd.read_json("{{params.file_path}}", orient="{{params.orient}}", lines={{params.lines}})'
    
    _code = _code.replace("{{params.file_path}}", str(file_path))
    _code = _code.replace("{{params.orient}}", str(orient))
    _code = _code.replace("{{params.lines}}", str(lines))
    _code = _code.replace("{{outputs.dataframe}}", "_out_dataframe")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_dataframe")


def load_parquet(file_path='data.parquet', columns='', engine='pyarrow'):
    """Load a Parquet file into a pandas DataFrame with efficient columnar storage
    
    Dependencies: pip install pandas
    
    Parameters:
        file_path (string, default='data.parquet'): 
        columns (string, default=''): Comma-separated column names to load (empty = all)
        engine (select, default='pyarrow'): 
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '_columns = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or None\n{{outputs.dataframe}} = pd.read_parquet("{{params.file_path}}", engine="{{params.engine}}", columns=_columns)'
    
    _code = _code.replace("{{params.file_path}}", str(file_path))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.engine}}", str(engine))
    _code = _code.replace("{{outputs.dataframe}}", "_out_dataframe")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_dataframe")


def load_image(file_path='image.png', mode='RGB', resize_w=0, resize_h=0):
    """Load an image file using PIL and optionally convert to a NumPy array
    
    Dependencies: pip install Pillow
    
    Parameters:
        file_path (string, default='image.png'): 
        mode (select, default='RGB'): 
        resize_w (number, default=0): Target width in pixels (0 = keep original)
        resize_h (number, default=0): Target height in pixels (0 = keep original)
    
    Returns:
        image: 
    """
    _imports = ['from PIL import Image']
    _code = '{{outputs.image}} = Image.open("{{params.file_path}}").convert("{{params.mode}}")\nif {{params.resize_w}} > 0 and {{params.resize_h}} > 0:\n    {{outputs.image}} = {{outputs.image}}.resize(({{params.resize_w}}, {{params.resize_h}}))'
    
    _code = _code.replace("{{params.file_path}}", str(file_path))
    _code = _code.replace("{{params.mode}}", str(mode))
    _code = _code.replace("{{params.resize_w}}", str(resize_w))
    _code = _code.replace("{{params.resize_h}}", str(resize_h))
    _code = _code.replace("{{outputs.image}}", "_out_image")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_image")


def load_audio(file_path='audio.wav', mono=True, target_sr=16000):
    """Load an audio file into a waveform tensor and sample rate using torchaudio
    
    Dependencies: pip install torchaudio
    
    Parameters:
        file_path (string, default='audio.wav'): 
        mono (boolean, default=True): 
        target_sr (number, default=16000): Resample to this rate (0 = keep original)
    
    Returns:
        dict with keys:
            waveform (tensor): 
            sample_rate (number): 
    """
    _imports = ['import torchaudio', 'import torchaudio.transforms as T']
    _code = '{{outputs.waveform}}, {{outputs.sample_rate}} = torchaudio.load("{{params.file_path}}")\nif {{params.mono}} and {{outputs.waveform}}.shape[0] > 1:\n    {{outputs.waveform}} = {{outputs.waveform}}.mean(dim=0, keepdim=True)\nif {{params.target_sr}} > 0 and {{outputs.sample_rate}} != {{params.target_sr}}:\n    {{outputs.waveform}} = T.Resample({{outputs.sample_rate}}, {{params.target_sr}})({{outputs.waveform}})\n    {{outputs.sample_rate}} = {{params.target_sr}}'
    
    _code = _code.replace("{{params.file_path}}", str(file_path))
    _code = _code.replace("{{params.mono}}", str(mono))
    _code = _code.replace("{{params.target_sr}}", str(target_sr))
    _code = _code.replace("{{outputs.waveform}}", "_out_waveform")
    _code = _code.replace("{{outputs.sample_rate}}", "_out_sample_rate")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"waveform": _ns.get("_out_waveform"), "sample_rate": _ns.get("_out_sample_rate")}


def load_video(file_path='video.mp4', max_frames=0, resize_w=0, resize_h=0):
    """Load video frames from a file using OpenCV into a NumPy array
    
    Dependencies: pip install numpy opencv-python
    
    Parameters:
        file_path (string, default='video.mp4'): 
        max_frames (number, default=0): Maximum frames to load (0 = all)
        resize_w (number, default=0): Resize frame width (0 = original)
        resize_h (number, default=0): Resize frame height (0 = original)
    
    Returns:
        dict with keys:
            frames (tensor): 
            fps (number): 
    """
    _imports = ['import cv2', 'import numpy as np']
    _code = '_cap = cv2.VideoCapture("{{params.file_path}}")\n{{outputs.fps}} = _cap.get(cv2.CAP_PROP_FPS)\n_frame_list = []\nwhile _cap.isOpened():\n    _ret, _frame = _cap.read()\n    if not _ret:\n        break\n    _frame = cv2.cvtColor(_frame, cv2.COLOR_BGR2RGB)\n    if {{params.resize_w}} > 0 and {{params.resize_h}} > 0:\n        _frame = cv2.resize(_frame, ({{params.resize_w}}, {{params.resize_h}}))\n    _frame_list.append(_frame)\n    if {{params.max_frames}} > 0 and len(_frame_list) >= {{params.max_frames}}:\n        break\n_cap.release()\n{{outputs.frames}} = np.stack(_frame_list)'
    
    _code = _code.replace("{{params.file_path}}", str(file_path))
    _code = _code.replace("{{params.max_frames}}", str(max_frames))
    _code = _code.replace("{{params.resize_w}}", str(resize_w))
    _code = _code.replace("{{params.resize_h}}", str(resize_h))
    _code = _code.replace("{{outputs.frames}}", "_out_frames")
    _code = _code.replace("{{outputs.fps}}", "_out_fps")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"frames": _ns.get("_out_frames"), "fps": _ns.get("_out_fps")}


def load_pdf(file_path='document.pdf', start_page=0, end_page=-1):
    """Extract text content from a PDF file using PyMuPDF (fitz)
    
    Dependencies: pip install fitz
    
    Parameters:
        file_path (string, default='document.pdf'): 
        start_page (number, default=0): First page to extract (0-indexed)
        end_page (number, default=-1): Last page to extract (-1 = all)
    
    Returns:
        dict with keys:
            text (text): 
            pages (list): 
    """
    _imports = ['import fitz  # PyMuPDF']
    _code = '_doc = fitz.open("{{params.file_path}}")\n_end = {{params.end_page}} if {{params.end_page}} >= 0 else len(_doc)\n{{outputs.pages}} = [_doc[i].get_text() for i in range({{params.start_page}}, _end)]\n{{outputs.text}} = "\\\\n\\\\n".join({{outputs.pages}})\n_doc.close()'
    
    _code = _code.replace("{{params.file_path}}", str(file_path))
    _code = _code.replace("{{params.start_page}}", str(start_page))
    _code = _code.replace("{{params.end_page}}", str(end_page))
    _code = _code.replace("{{outputs.text}}", "_out_text")
    _code = _code.replace("{{outputs.pages}}", "_out_pages")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"text": _ns.get("_out_text"), "pages": _ns.get("_out_pages")}


def load_from_db(connection_string='sqlite:///data.db', query='SELECT * FROM table_name LIMIT 1000', params={}):
    """Execute a SQL query and load results into a pandas DataFrame via SQLAlchemy
    
    Dependencies: pip install pandas sqlalchemy
    
    Parameters:
        connection_string (string, default='sqlite:///data.db'): 
        query (code, default='SELECT * FROM table_name LIMIT 1000'): 
        params (json, default={}): Dict of bind parameters for the query
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd', 'from sqlalchemy import create_engine']
    _code = '_engine = create_engine("{{params.connection_string}}")\n{{outputs.dataframe}} = pd.read_sql("{{params.query}}", _engine, params={{params.params}})\n_engine.dispose()'
    
    _code = _code.replace("{{params.connection_string}}", str(connection_string))
    _code = _code.replace("{{params.query}}", str(query))
    _code = _code.replace("{{params.params}}", str(params))
    _code = _code.replace("{{outputs.dataframe}}", "_out_dataframe")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_dataframe")


def load_from_api(url='https://api.example.com/data', method='GET', headers={}, body={}, timeout=30):
    """Fetch data from a REST API endpoint using the requests library
    
    Dependencies: pip install requests
    
    Parameters:
        url (string, default='https://api.example.com/data'): 
        method (select, default='GET'): 
        headers (json, default={}): HTTP headers as a JSON object
        body (json, default={}): JSON body for POST/PUT/PATCH
        timeout (number, default=30): 
    
    Returns:
        dict with keys:
            response_data (dict): 
            status_code (number): 
    """
    _imports = ['import requests']
    _code = '_response = requests.request(\n    method="{{params.method}}",\n    url="{{params.url}}",\n    headers={{params.headers}},\n    json={{params.body}} if "{{params.method}}" in ("POST", "PUT", "PATCH") else None,\n    timeout={{params.timeout}}\n)\n_response.raise_for_status()\n{{outputs.status_code}} = _response.status_code\n{{outputs.response_data}} = _response.json()'
    
    _code = _code.replace("{{params.url}}", str(url))
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.headers}}", str(headers))
    _code = _code.replace("{{params.body}}", str(body))
    _code = _code.replace("{{params.timeout}}", str(timeout))
    _code = _code.replace("{{outputs.response_data}}", "_out_response_data")
    _code = _code.replace("{{outputs.status_code}}", "_out_status_code")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"response_data": _ns.get("_out_response_data"), "status_code": _ns.get("_out_status_code")}


def stream_input(file_path='-', batch_size=100, max_lines=0):
    """Read streaming data line-by-line from a file or stdin, yielding chunks
    
    Parameters:
        file_path (string, default='-'): Path to file or '-' for stdin
        batch_size (number, default=100): Number of lines per batch
        max_lines (number, default=0): Maximum lines to read (0 = unlimited)
    
    Returns:
        list: 
    """
    _imports = ['import sys']
    _code = '_source = open("{{params.file_path}}", "r") if "{{params.file_path}}" != "-" else sys.stdin\n{{outputs.lines}} = []\n_count = 0\nfor _line in _source:\n    {{outputs.lines}}.append(_line.rstrip("\\\\n"))\n    _count += 1\n    if {{params.max_lines}} > 0 and _count >= {{params.max_lines}}:\n        break\nif "{{params.file_path}}" != "-":\n    _source.close()'
    
    _code = _code.replace("{{params.file_path}}", str(file_path))
    _code = _code.replace("{{params.batch_size}}", str(batch_size))
    _code = _code.replace("{{params.max_lines}}", str(max_lines))
    _code = _code.replace("{{outputs.lines}}", "_out_lines")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_lines")


def save_to_file(dataframe=None, file_path='output.csv', format='csv', index=False):
    """Save a pandas DataFrame to CSV, JSON, or Parquet format
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        file_path (string, default='output.csv'): 
        format (select, default='csv'): 
        index (boolean, default=False): 
    
    Returns:
        path: 
    """
    _imports = ['import pandas as pd']
    _code = '{{outputs.file_path}} = "{{params.file_path}}"\nif "{{params.format}}" == "csv":\n    {{inputs.dataframe}}.to_csv({{outputs.file_path}}, index={{params.index}})\nelif "{{params.format}}" == "json":\n    {{inputs.dataframe}}.to_json({{outputs.file_path}}, orient="records", indent=2)\nelif "{{params.format}}" == "parquet":\n    {{inputs.dataframe}}.to_parquet({{outputs.file_path}}, index={{params.index}})\nelif "{{params.format}}" == "excel":\n    {{inputs.dataframe}}.to_excel({{outputs.file_path}}, index={{params.index}})'
    
    _code = _code.replace("{{params.file_path}}", str(file_path))
    _code = _code.replace("{{params.format}}", str(format))
    _code = _code.replace("{{params.index}}", str(index))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.file_path}}", "_out_file_path")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_file_path")


def save_to_db(dataframe=None, connection_string='sqlite:///data.db', table_name='output_table', if_exists='replace', index=False, chunk_size=1000):
    """Write a pandas DataFrame to a SQL database table via SQLAlchemy
    
    Dependencies: pip install pandas sqlalchemy
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        connection_string (string, default='sqlite:///data.db'): 
        table_name (string, default='output_table'): 
        if_exists (select, default='replace'): 
        index (boolean, default=False): 
        chunk_size (number, default=1000): Rows per INSERT batch
    
    Returns:
        number: 
    """
    _imports = ['import pandas as pd', 'from sqlalchemy import create_engine']
    _code = '_engine = create_engine("{{params.connection_string}}")\n{{inputs.dataframe}}.to_sql(\n    "{{params.table_name}}",\n    _engine,\n    if_exists="{{params.if_exists}}",\n    index={{params.index}},\n    chunksize={{params.chunk_size}}\n)\n{{outputs.row_count}} = len({{inputs.dataframe}})\n_engine.dispose()'
    
    _code = _code.replace("{{params.connection_string}}", str(connection_string))
    _code = _code.replace("{{params.table_name}}", str(table_name))
    _code = _code.replace("{{params.if_exists}}", str(if_exists))
    _code = _code.replace("{{params.index}}", str(index))
    _code = _code.replace("{{params.chunk_size}}", str(chunk_size))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.row_count}}", "_out_row_count")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_row_count")


def upload_to_s3(file_path=None, bucket='my-bucket', key='data/output.csv', region='us-east-1', extra_args={}):
    """Upload a local file to an AWS S3 bucket using boto3
    
    Dependencies: pip install boto3
    
    Args:
        file_path (path) (required): 
    
    Parameters:
        bucket (string, default='my-bucket'): 
        key (string, default='data/output.csv'): 
        region (string, default='us-east-1'): 
        extra_args (json, default={}): Extra arguments for upload (e.g. ACL, ContentType)
    
    Returns:
        text: 
    """
    _imports = ['import boto3']
    _code = '_s3 = boto3.client("s3", region_name="{{params.region}}")\n_s3.upload_file(\n    {{inputs.file_path}},\n    "{{params.bucket}}",\n    "{{params.key}}",\n    ExtraArgs={{params.extra_args}} or None\n)\n{{outputs.s3_uri}} = f"s3://{{params.bucket}}/{{params.key}}"'
    
    _code = _code.replace("{{params.bucket}}", str(bucket))
    _code = _code.replace("{{params.key}}", str(key))
    _code = _code.replace("{{params.region}}", str(region))
    _code = _code.replace("{{params.extra_args}}", str(extra_args))
    _code = _code.replace("{{inputs.file_path}}", "file_path")
    _code = _code.replace("{{outputs.s3_uri}}", "_out_s3_uri")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["file_path"] = file_path
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_s3_uri")


def download_url(url='https://example.com/file.zip', save_path='downloaded_file', chunk_size=8192, timeout=60):
    """Download a file from a URL and save it to disk with streaming support
    
    Dependencies: pip install requests
    
    Parameters:
        url (string, default='https://example.com/file.zip'): 
        save_path (string, default='downloaded_file'): 
        chunk_size (number, default=8192): Download chunk size in bytes
        timeout (number, default=60): 
    
    Returns:
        dict with keys:
            file_path (path): 
            size_bytes (number): 
    """
    _imports = ['import requests', 'import os']
    _code = '_response = requests.get("{{params.url}}", stream=True, timeout={{params.timeout}})\n_response.raise_for_status()\n{{outputs.file_path}} = "{{params.save_path}}"\nwith open({{outputs.file_path}}, "wb") as _f:\n    for _chunk in _response.iter_content(chunk_size={{params.chunk_size}}):\n        _f.write(_chunk)\n{{outputs.size_bytes}} = os.path.getsize({{outputs.file_path}})'
    
    _code = _code.replace("{{params.url}}", str(url))
    _code = _code.replace("{{params.save_path}}", str(save_path))
    _code = _code.replace("{{params.chunk_size}}", str(chunk_size))
    _code = _code.replace("{{params.timeout}}", str(timeout))
    _code = _code.replace("{{outputs.file_path}}", "_out_file_path")
    _code = _code.replace("{{outputs.size_bytes}}", "_out_size_bytes")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"file_path": _ns.get("_out_file_path"), "size_bytes": _ns.get("_out_size_bytes")}


def websocket_input(url='ws://localhost:8765', max_messages=100, timeout=30, headers={}):
    """Connect to a WebSocket endpoint and collect incoming messages
    
    Dependencies: pip install asyncio websockets
    
    Parameters:
        url (string, default='ws://localhost:8765'): 
        max_messages (number, default=100): Stop after receiving this many messages
        timeout (number, default=30): Connection timeout in seconds
        headers (json, default={}): Additional HTTP headers for the handshake
    
    Returns:
        list: 
    """
    _imports = ['import asyncio', 'import websockets', 'import json']
    _code = 'async def _ws_receive():\n    _msgs = []\n    async with websockets.connect("{{params.url}}", extra_headers={{params.headers}}) as _ws:\n        for _ in range({{params.max_messages}}):\n "try":\n                _msg = await asyncio.wait_for(_ws.recv(), timeout={{params.timeout}})\n "try":\n                    _msgs.append(json.loads(_msg))\n                except json.JSONDecodeError:\n                    _msgs.append(_msg)\n            except asyncio.TimeoutError:\n                break\n    return _msgs\n\n{{outputs.messages}} = asyncio.run(_ws_receive())'
    
    _code = _code.replace("{{params.url}}", str(url))
    _code = _code.replace("{{params.max_messages}}", str(max_messages))
    _code = _code.replace("{{params.timeout}}", str(timeout))
    _code = _code.replace("{{params.headers}}", str(headers))
    _code = _code.replace("{{outputs.messages}}", "_out_messages")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_messages")


def kafka_consumer(topic='my-topic', bootstrap_servers='localhost:9092', group_id='my-group', max_messages=100, timeout_ms=5000, auto_offset_reset='earliest'):
    """Consume messages from an Apache Kafka topic using kafka-python
    
    Dependencies: pip install kafka-python
    
    Parameters:
        topic (string, default='my-topic'): 
        bootstrap_servers (string, default='localhost:9092'): 
        group_id (string, default='my-group'): 
        max_messages (number, default=100): Maximum messages to consume
        timeout_ms (number, default=5000): 
        auto_offset_reset (select, default='earliest'): 
    
    Returns:
        list: 
    """
    _imports = ['from kafka import KafkaConsumer', 'import json']
    _code = '_consumer = KafkaConsumer(\n    "{{params.topic}}",\n    bootstrap_servers="{{params.bootstrap_servers}}",\n    group_id="{{params.group_id}}",\n    auto_offset_reset="{{params.auto_offset_reset}}",\n    consumer_timeout_ms={{params.timeout_ms}},\n    value_deserializer=lambda m: json.loads(m.decode("utf-8"))\n)\n{{outputs.messages}} = []\nfor _msg in _consumer:\n    {{outputs.messages}}.append(_msg.value)\n    if len({{outputs.messages}}) >= {{params.max_messages}}:\n        break\n_consumer.close()'
    
    _code = _code.replace("{{params.topic}}", str(topic))
    _code = _code.replace("{{params.bootstrap_servers}}", str(bootstrap_servers))
    _code = _code.replace("{{params.group_id}}", str(group_id))
    _code = _code.replace("{{params.max_messages}}", str(max_messages))
    _code = _code.replace("{{params.timeout_ms}}", str(timeout_ms))
    _code = _code.replace("{{params.auto_offset_reset}}", str(auto_offset_reset))
    _code = _code.replace("{{outputs.messages}}", "_out_messages")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_messages")


def kafka_producer(messages=None, topic='my-topic', bootstrap_servers='localhost:9092', key='', flush_timeout=30):
    """Publish messages to an Apache Kafka topic using kafka-python
    
    Dependencies: pip install kafka-python
    
    Args:
        messages (list) (required): 
    
    Parameters:
        topic (string, default='my-topic'): 
        bootstrap_servers (string, default='localhost:9092'): 
        key (string, default=''): Optional key for partitioning (empty = none)
        flush_timeout (number, default=30): 
    
    Returns:
        number: 
    """
    _imports = ['from kafka import KafkaProducer', 'import json']
    _code = '_producer = KafkaProducer(\n    bootstrap_servers="{{params.bootstrap_servers}}",\n    value_serializer=lambda v: json.dumps(v).encode("utf-8"),\n    key_serializer=lambda k: k.encode("utf-8") if k else None\n)\n{{outputs.sent_count}} = 0\n_key = "{{params.key}}" or None\nfor _msg in {{inputs.messages}}:\n    _producer.send("{{params.topic}}", value=_msg, key=_key)\n    {{outputs.sent_count}} += 1\n_producer.flush(timeout={{params.flush_timeout}})\n_producer.close()'
    
    _code = _code.replace("{{params.topic}}", str(topic))
    _code = _code.replace("{{params.bootstrap_servers}}", str(bootstrap_servers))
    _code = _code.replace("{{params.key}}", str(key))
    _code = _code.replace("{{params.flush_timeout}}", str(flush_timeout))
    _code = _code.replace("{{inputs.messages}}", "messages")
    _code = _code.replace("{{outputs.sent_count}}", "_out_sent_count")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["messages"] = messages
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_sent_count")


def grpc_call(request_data=None, target='localhost:50051', service='mypackage.MyService', method='MyMethod', proto_path='service.proto', use_tls=False, timeout=10):
    """Make a unary gRPC call to a remote service using grpcio and protobuf
    
    Dependencies: pip install google grpc_tools grpcio importlib
    
    Args:
        request_data (dict) (required): 
    
    Parameters:
        target (string, default='localhost:50051'): 
        service (string, default='mypackage.MyService'): 
        method (string, default='MyMethod'): 
        proto_path (string, default='service.proto'): 
        use_tls (boolean, default=False): 
        timeout (number, default=10): 
    
    Returns:
        dict: 
    """
    _imports = ['import grpc', 'from grpc_tools import protoc', 'from google.protobuf.json_format import MessageToDict, ParseDict', 'import importlib']
    _code = '# Compile proto and import generated stubs\nprotoc.main(["grpc_tools.protoc", "-I.", "--python_out=.", "--grpc_python_out=.", "{{params.proto_path}}"])\n_proto_module = "{{params.proto_path}}".replace(".proto", "_pb2")\n_grpc_module = "{{params.proto_path}}".replace(".proto", "_pb2_grpc")\n_pb2 = importlib.import_module(_proto_module)\n_pb2_grpc = importlib.import_module(_grpc_module)\n\n# Establish channel\nif {{params.use_tls}}:\n    _channel = grpc.secure_channel("{{params.target}}", grpc.ssl_channel_credentials())\n "else":\n    _channel = grpc.insecure_channel("{{params.target}}")\n\n# Build stub and make call\n_stub_class = getattr(_pb2_grpc, "{{params.service}}".split(".")[-1] + "Stub")\n_stub = _stub_class(_channel)\n_request_class = getattr(_pb2, "{{params.method}}Request")\n_request = ParseDict({{inputs.request_data}}, _request_class())\n_response = getattr(_stub, "{{params.method}}")(_request, timeout={{params.timeout}})\n{{outputs.response_data}} = MessageToDict(_response)\n_channel.close()'
    
    _code = _code.replace("{{params.target}}", str(target))
    _code = _code.replace("{{params.service}}", str(service))
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.proto_path}}", str(proto_path))
    _code = _code.replace("{{params.use_tls}}", str(use_tls))
    _code = _code.replace("{{params.timeout}}", str(timeout))
    _code = _code.replace("{{inputs.request_data}}", "request_data")
    _code = _code.replace("{{outputs.response_data}}", "_out_response_data")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["request_data"] = request_data
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_response_data")

