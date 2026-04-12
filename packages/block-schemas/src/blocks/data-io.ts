import type { BlockDefinition } from "../types.js";

export const dataIoBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Load CSV
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.load-csv",
    name: "Load CSV",
    category: "data-io",
    description: "Load a CSV file into a pandas DataFrame",
    tags: ["csv", "load", "pandas", "dataframe", "read", "tabular"],
    inputs: [],
    outputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "file_path", name: "File Path", type: "string", default: "data.csv", placeholder: "path/to/file.csv" },
      { id: "separator", name: "Separator", type: "string", default: ",", advanced: true },
      {
        id: "encoding",
        name: "Encoding",
        type: "select",
        default: "utf-8",
        options: [
          { label: "UTF-8", value: "utf-8" },
          { label: "Latin-1", value: "latin-1" },
          { label: "ASCII", value: "ascii" },
        ],
        advanced: true,
      },
      { id: "header", name: "Header Row", type: "number", default: 0, description: "Row number to use as column names (set -1 for no header)", advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: '{{outputs.dataframe}} = pd.read_csv("{{params.file_path}}", sep="{{params.separator}}", encoding="{{params.encoding}}")',
      outputBindings: { dataframe: "df" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Load JSON
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.load-json",
    name: "Load JSON",
    category: "data-io",
    description: "Load a JSON file into a pandas DataFrame or Python dict",
    tags: ["json", "load", "pandas", "dataframe", "read", "parse"],
    inputs: [],
    outputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "file_path", name: "File Path", type: "string", default: "data.json", placeholder: "path/to/file.json" },
      {
        id: "orient",
        name: "Orientation",
        type: "select",
        default: "records",
        options: [
          { label: "Records", value: "records" },
          { label: "Columns", value: "columns" },
          { label: "Index", value: "index" },
          { label: "Split", value: "split" },
          { label: "Values", value: "values" },
        ],
        advanced: true,
      },
      { id: "lines", name: "JSON Lines", type: "boolean", default: false, description: "Read file as one JSON object per line", advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: '{{outputs.dataframe}} = pd.read_json("{{params.file_path}}", orient="{{params.orient}}", lines={{params.lines}})',
      outputBindings: { dataframe: "df" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Load Parquet
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.load-parquet",
    name: "Load Parquet",
    category: "data-io",
    description: "Load a Parquet file into a pandas DataFrame with efficient columnar storage",
    tags: ["parquet", "load", "pandas", "dataframe", "columnar", "arrow"],
    inputs: [],
    outputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "file_path", name: "File Path", type: "string", default: "data.parquet", placeholder: "path/to/file.parquet" },
      { id: "columns", name: "Columns", type: "string", default: "", description: "Comma-separated column names to load (empty = all)", advanced: true },
      {
        id: "engine",
        name: "Engine",
        type: "select",
        default: "pyarrow",
        options: [
          { label: "PyArrow", value: "pyarrow" },
          { label: "fastparquet", value: "fastparquet" },
        ],
        advanced: true,
      },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `_columns = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or None
{{outputs.dataframe}} = pd.read_parquet("{{params.file_path}}", engine="{{params.engine}}", columns=_columns)`,
      outputBindings: { dataframe: "df" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Load Image
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.load-image",
    name: "Load Image",
    category: "data-io",
    description: "Load an image file using PIL and optionally convert to a NumPy array",
    tags: ["image", "load", "pillow", "pil", "read", "picture", "photo"],
    inputs: [],
    outputs: [
      { id: "image", name: "Image", type: "image", required: true },
    ],
    parameters: [
      { id: "file_path", name: "File Path", type: "string", default: "image.png", placeholder: "path/to/image.png" },
      {
        id: "mode",
        name: "Color Mode",
        type: "select",
        default: "RGB",
        options: [
          { label: "RGB", value: "RGB" },
          { label: "Grayscale", value: "L" },
          { label: "RGBA", value: "RGBA" },
        ],
      },
      { id: "resize_w", name: "Resize Width", type: "number", default: 0, description: "Target width in pixels (0 = keep original)", advanced: true },
      { id: "resize_h", name: "Resize Height", type: "number", default: 0, description: "Target height in pixels (0 = keep original)", advanced: true },
    ],
    codeTemplate: {
      imports: ["from PIL import Image"],
      body: `{{outputs.image}} = Image.open("{{params.file_path}}").convert("{{params.mode}}")
if {{params.resize_w}} > 0 and {{params.resize_h}} > 0:
    {{outputs.image}} = {{outputs.image}}.resize(({{params.resize_w}}, {{params.resize_h}}))`,
      outputBindings: { image: "img" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Load Audio
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.load-audio",
    name: "Load Audio",
    category: "data-io",
    description: "Load an audio file into a waveform tensor and sample rate using torchaudio",
    tags: ["audio", "load", "torchaudio", "wav", "mp3", "waveform", "sound"],
    inputs: [],
    outputs: [
      { id: "waveform", name: "Waveform", type: "tensor", required: true },
      { id: "sample_rate", name: "Sample Rate", type: "number", required: true },
    ],
    parameters: [
      { id: "file_path", name: "File Path", type: "string", default: "audio.wav", placeholder: "path/to/audio.wav" },
      { id: "mono", name: "Convert to Mono", type: "boolean", default: true },
      { id: "target_sr", name: "Target Sample Rate", type: "number", default: 16000, description: "Resample to this rate (0 = keep original)", advanced: true },
    ],
    codeTemplate: {
      imports: ["import torchaudio", "import torchaudio.transforms as T"],
      body: `{{outputs.waveform}}, {{outputs.sample_rate}} = torchaudio.load("{{params.file_path}}")
if {{params.mono}} and {{outputs.waveform}}.shape[0] > 1:
    {{outputs.waveform}} = {{outputs.waveform}}.mean(dim=0, keepdim=True)
if {{params.target_sr}} > 0 and {{outputs.sample_rate}} != {{params.target_sr}}:
    {{outputs.waveform}} = T.Resample({{outputs.sample_rate}}, {{params.target_sr}})({{outputs.waveform}})
    {{outputs.sample_rate}} = {{params.target_sr}}`,
      outputBindings: { waveform: "waveform", sample_rate: "sr" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Load Video
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.load-video",
    name: "Load Video",
    category: "data-io",
    description: "Load video frames from a file using OpenCV into a NumPy array",
    tags: ["video", "load", "opencv", "cv2", "frames", "mp4"],
    inputs: [],
    outputs: [
      { id: "frames", name: "Frames", type: "tensor", required: true },
      { id: "fps", name: "FPS", type: "number", required: true },
    ],
    parameters: [
      { id: "file_path", name: "File Path", type: "string", default: "video.mp4", placeholder: "path/to/video.mp4" },
      { id: "max_frames", name: "Max Frames", type: "number", default: 0, description: "Maximum frames to load (0 = all)", advanced: true },
      { id: "resize_w", name: "Resize Width", type: "number", default: 0, description: "Resize frame width (0 = original)", advanced: true },
      { id: "resize_h", name: "Resize Height", type: "number", default: 0, description: "Resize frame height (0 = original)", advanced: true },
    ],
    codeTemplate: {
      imports: ["import cv2", "import numpy as np"],
      body: `_cap = cv2.VideoCapture("{{params.file_path}}")
{{outputs.fps}} = _cap.get(cv2.CAP_PROP_FPS)
_frame_list = []
while _cap.isOpened():
    _ret, _frame = _cap.read()
    if not _ret:
        break
    _frame = cv2.cvtColor(_frame, cv2.COLOR_BGR2RGB)
    if {{params.resize_w}} > 0 and {{params.resize_h}} > 0:
        _frame = cv2.resize(_frame, ({{params.resize_w}}, {{params.resize_h}}))
    _frame_list.append(_frame)
    if {{params.max_frames}} > 0 and len(_frame_list) >= {{params.max_frames}}:
        break
_cap.release()
{{outputs.frames}} = np.stack(_frame_list)`,
      outputBindings: { frames: "frames", fps: "fps" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Load PDF
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.load-pdf",
    name: "Load PDF",
    category: "data-io",
    description: "Extract text content from a PDF file using PyMuPDF (fitz)",
    tags: ["pdf", "load", "text", "extract", "document", "fitz", "pymupdf"],
    inputs: [],
    outputs: [
      { id: "text", name: "Text", type: "text", required: true },
      { id: "pages", name: "Pages", type: "list", required: true },
    ],
    parameters: [
      { id: "file_path", name: "File Path", type: "string", default: "document.pdf", placeholder: "path/to/document.pdf" },
      { id: "start_page", name: "Start Page", type: "number", default: 0, description: "First page to extract (0-indexed)", advanced: true },
      { id: "end_page", name: "End Page", type: "number", default: -1, description: "Last page to extract (-1 = all)", advanced: true },
    ],
    codeTemplate: {
      imports: ["import fitz  # PyMuPDF"],
      body: `_doc = fitz.open("{{params.file_path}}")
_end = {{params.end_page}} if {{params.end_page}} >= 0 else len(_doc)
{{outputs.pages}} = [_doc[i].get_text() for i in range({{params.start_page}}, _end)]
{{outputs.text}} = "\\n\\n".join({{outputs.pages}})
_doc.close()`,
      outputBindings: { text: "pdf_text", pages: "pdf_pages" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Load from DB
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.load-from-db",
    name: "Load from DB",
    category: "data-io",
    description: "Execute a SQL query and load results into a pandas DataFrame via SQLAlchemy",
    tags: ["database", "sql", "load", "query", "sqlalchemy", "postgres", "mysql", "sqlite"],
    inputs: [],
    outputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    parameters: [
      { id: "connection_string", name: "Connection String", type: "string", default: "sqlite:///data.db", placeholder: "postgresql://user:pass@host:5432/db" },
      { id: "query", name: "SQL Query", type: "code", default: "SELECT * FROM table_name LIMIT 1000" },
      { id: "params", name: "Query Params", type: "json", default: {}, description: "Dict of bind parameters for the query", advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "from sqlalchemy import create_engine"],
      body: `_engine = create_engine("{{params.connection_string}}")
{{outputs.dataframe}} = pd.read_sql("{{params.query}}", _engine, params={{params.params}})
_engine.dispose()`,
      outputBindings: { dataframe: "df" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Load from API
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.load-from-api",
    name: "Load from API",
    category: "data-io",
    description: "Fetch data from a REST API endpoint using the requests library",
    tags: ["api", "rest", "http", "get", "requests", "fetch", "load"],
    inputs: [],
    outputs: [
      { id: "response_data", name: "Response Data", type: "dict", required: true },
      { id: "status_code", name: "Status Code", type: "number", required: true },
    ],
    parameters: [
      { id: "url", name: "URL", type: "string", default: "https://api.example.com/data", placeholder: "https://api.example.com/endpoint" },
      {
        id: "method",
        name: "HTTP Method",
        type: "select",
        default: "GET",
        options: [
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
          { label: "PATCH", value: "PATCH" },
          { label: "DELETE", value: "DELETE" },
        ],
      },
      { id: "headers", name: "Headers", type: "json", default: {}, description: "HTTP headers as a JSON object", advanced: true },
      { id: "body", name: "Request Body", type: "json", default: {}, description: "JSON body for POST/PUT/PATCH", advanced: true },
      { id: "timeout", name: "Timeout (s)", type: "number", default: 30, advanced: true },
    ],
    codeTemplate: {
      imports: ["import requests"],
      body: `_response = requests.request(
    method="{{params.method}}",
    url="{{params.url}}",
    headers={{params.headers}},
    json={{params.body}} if "{{params.method}}" in ("POST", "PUT", "PATCH") else None,
    timeout={{params.timeout}}
)
_response.raise_for_status()
{{outputs.status_code}} = _response.status_code
{{outputs.response_data}} = _response.json()`,
      outputBindings: { response_data: "api_data", status_code: "status_code" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Stream Input
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.stream-input",
    name: "Stream Input",
    category: "data-io",
    description: "Read streaming data line-by-line from a file or stdin, yielding chunks",
    tags: ["stream", "input", "generator", "readline", "stdin", "iterator"],
    inputs: [],
    outputs: [
      { id: "lines", name: "Lines", type: "list", required: true },
    ],
    parameters: [
      { id: "file_path", name: "File Path", type: "string", default: "-", description: "Path to file or '-' for stdin" },
      { id: "batch_size", name: "Batch Size", type: "number", default: 100, description: "Number of lines per batch" },
      { id: "max_lines", name: "Max Lines", type: "number", default: 0, description: "Maximum lines to read (0 = unlimited)", advanced: true },
    ],
    codeTemplate: {
      imports: ["import sys"],
      body: `_source = open("{{params.file_path}}", "r") if "{{params.file_path}}" != "-" else sys.stdin
{{outputs.lines}} = []
_count = 0
for _line in _source:
    {{outputs.lines}}.append(_line.rstrip("\\n"))
    _count += 1
    if {{params.max_lines}} > 0 and _count >= {{params.max_lines}}:
        break
if "{{params.file_path}}" != "-":
    _source.close()`,
      outputBindings: { lines: "lines" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Save to File
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.save-to-file",
    name: "Save to File",
    category: "data-io",
    description: "Save a pandas DataFrame to CSV, JSON, or Parquet format",
    tags: ["save", "write", "export", "csv", "json", "parquet", "file"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "file_path", name: "Saved Path", type: "path", required: true },
    ],
    parameters: [
      { id: "file_path", name: "File Path", type: "string", default: "output.csv", placeholder: "path/to/output.csv" },
      {
        id: "format",
        name: "Format",
        type: "select",
        default: "csv",
        options: [
          { label: "CSV", value: "csv" },
          { label: "JSON", value: "json" },
          { label: "Parquet", value: "parquet" },
          { label: "Excel", value: "excel" },
        ],
      },
      { id: "index", name: "Include Index", type: "boolean", default: false, advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd"],
      body: `{{outputs.file_path}} = "{{params.file_path}}"
if "{{params.format}}" == "csv":
    {{inputs.dataframe}}.to_csv({{outputs.file_path}}, index={{params.index}})
elif "{{params.format}}" == "json":
    {{inputs.dataframe}}.to_json({{outputs.file_path}}, orient="records", indent=2)
elif "{{params.format}}" == "parquet":
    {{inputs.dataframe}}.to_parquet({{outputs.file_path}}, index={{params.index}})
elif "{{params.format}}" == "excel":
    {{inputs.dataframe}}.to_excel({{outputs.file_path}}, index={{params.index}})`,
      outputBindings: { file_path: "saved_path" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Save to DB
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.save-to-db",
    name: "Save to DB",
    category: "data-io",
    description: "Write a pandas DataFrame to a SQL database table via SQLAlchemy",
    tags: ["database", "sql", "save", "write", "sqlalchemy", "insert", "table"],
    inputs: [
      { id: "dataframe", name: "DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "row_count", name: "Rows Written", type: "number", required: true },
    ],
    parameters: [
      { id: "connection_string", name: "Connection String", type: "string", default: "sqlite:///data.db", placeholder: "postgresql://user:pass@host:5432/db" },
      { id: "table_name", name: "Table Name", type: "string", default: "output_table" },
      {
        id: "if_exists",
        name: "If Table Exists",
        type: "select",
        default: "replace",
        options: [
          { label: "Replace", value: "replace" },
          { label: "Append", value: "append" },
          { label: "Fail", value: "fail" },
        ],
      },
      { id: "index", name: "Write Index", type: "boolean", default: false, advanced: true },
      { id: "chunk_size", name: "Chunk Size", type: "number", default: 1000, description: "Rows per INSERT batch", advanced: true },
    ],
    codeTemplate: {
      imports: ["import pandas as pd", "from sqlalchemy import create_engine"],
      body: `_engine = create_engine("{{params.connection_string}}")
{{inputs.dataframe}}.to_sql(
    "{{params.table_name}}",
    _engine,
    if_exists="{{params.if_exists}}",
    index={{params.index}},
    chunksize={{params.chunk_size}}
)
{{outputs.row_count}} = len({{inputs.dataframe}})
_engine.dispose()`,
      outputBindings: { row_count: "rows_written" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. Upload to S3
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.upload-to-s3",
    name: "Upload to S3",
    category: "data-io",
    description: "Upload a local file to an AWS S3 bucket using boto3",
    tags: ["s3", "aws", "upload", "cloud", "boto3", "storage", "bucket"],
    inputs: [
      { id: "file_path", name: "Local File", type: "path", required: true },
    ],
    outputs: [
      { id: "s3_uri", name: "S3 URI", type: "text", required: true },
    ],
    parameters: [
      { id: "bucket", name: "Bucket Name", type: "string", default: "my-bucket" },
      { id: "key", name: "S3 Key", type: "string", default: "data/output.csv", placeholder: "prefix/filename.ext" },
      { id: "region", name: "AWS Region", type: "string", default: "us-east-1", advanced: true },
      { id: "extra_args", name: "Extra Args", type: "json", default: {}, description: "Extra arguments for upload (e.g. ACL, ContentType)", advanced: true },
    ],
    codeTemplate: {
      imports: ["import boto3"],
      body: `_s3 = boto3.client("s3", region_name="{{params.region}}")
_s3.upload_file(
    {{inputs.file_path}},
    "{{params.bucket}}",
    "{{params.key}}",
    ExtraArgs={{params.extra_args}} or None
)
{{outputs.s3_uri}} = f"s3://{{params.bucket}}/{{params.key}}"`,
      outputBindings: { s3_uri: "s3_uri" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Download URL
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.download-url",
    name: "Download URL",
    category: "data-io",
    description: "Download a file from a URL and save it to disk with streaming support",
    tags: ["download", "url", "http", "fetch", "file", "requests"],
    inputs: [],
    outputs: [
      { id: "file_path", name: "Saved Path", type: "path", required: true },
      { id: "size_bytes", name: "Size (bytes)", type: "number", required: true },
    ],
    parameters: [
      { id: "url", name: "URL", type: "string", default: "https://example.com/file.zip", placeholder: "https://example.com/file.ext" },
      { id: "save_path", name: "Save Path", type: "string", default: "downloaded_file", placeholder: "path/to/save" },
      { id: "chunk_size", name: "Chunk Size", type: "number", default: 8192, description: "Download chunk size in bytes", advanced: true },
      { id: "timeout", name: "Timeout (s)", type: "number", default: 60, advanced: true },
    ],
    codeTemplate: {
      imports: ["import requests", "import os"],
      body: `_response = requests.get("{{params.url}}", stream=True, timeout={{params.timeout}})
_response.raise_for_status()
{{outputs.file_path}} = "{{params.save_path}}"
with open({{outputs.file_path}}, "wb") as _f:
    for _chunk in _response.iter_content(chunk_size={{params.chunk_size}}):
        _f.write(_chunk)
{{outputs.size_bytes}} = os.path.getsize({{outputs.file_path}})`,
      outputBindings: { file_path: "downloaded_path", size_bytes: "file_size" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Websocket Input
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.websocket-input",
    name: "Websocket Input",
    category: "data-io",
    description: "Connect to a WebSocket endpoint and collect incoming messages",
    tags: ["websocket", "ws", "streaming", "realtime", "socket", "input"],
    inputs: [],
    outputs: [
      { id: "messages", name: "Messages", type: "list", required: true },
    ],
    parameters: [
      { id: "url", name: "WebSocket URL", type: "string", default: "ws://localhost:8765", placeholder: "ws://host:port/path" },
      { id: "max_messages", name: "Max Messages", type: "number", default: 100, description: "Stop after receiving this many messages" },
      { id: "timeout", name: "Timeout (s)", type: "number", default: 30, description: "Connection timeout in seconds" },
      { id: "headers", name: "Headers", type: "json", default: {}, description: "Additional HTTP headers for the handshake", advanced: true },
    ],
    codeTemplate: {
      imports: ["import asyncio", "import websockets", "import json"],
      body: `async def _ws_receive():
    _msgs = []
    async with websockets.connect("{{params.url}}", extra_headers={{params.headers}}) as _ws:
        for _ in range({{params.max_messages}}):
            try:
                _msg = await asyncio.wait_for(_ws.recv(), timeout={{params.timeout}})
                try:
                    _msgs.append(json.loads(_msg))
                except json.JSONDecodeError:
                    _msgs.append(_msg)
            except asyncio.TimeoutError:
                break
    return _msgs

{{outputs.messages}} = asyncio.run(_ws_receive())`,
      outputBindings: { messages: "ws_messages" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. Kafka Consumer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.kafka-consumer",
    name: "Kafka Consumer",
    category: "data-io",
    description: "Consume messages from an Apache Kafka topic using kafka-python",
    tags: ["kafka", "consumer", "streaming", "message", "queue", "subscribe"],
    inputs: [],
    outputs: [
      { id: "messages", name: "Messages", type: "list", required: true },
    ],
    parameters: [
      { id: "topic", name: "Topic", type: "string", default: "my-topic" },
      { id: "bootstrap_servers", name: "Bootstrap Servers", type: "string", default: "localhost:9092" },
      { id: "group_id", name: "Consumer Group", type: "string", default: "my-group" },
      { id: "max_messages", name: "Max Messages", type: "number", default: 100, description: "Maximum messages to consume" },
      { id: "timeout_ms", name: "Poll Timeout (ms)", type: "number", default: 5000, advanced: true },
      {
        id: "auto_offset_reset",
        name: "Offset Reset",
        type: "select",
        default: "earliest",
        options: [
          { label: "Earliest", value: "earliest" },
          { label: "Latest", value: "latest" },
        ],
        advanced: true,
      },
    ],
    codeTemplate: {
      imports: ["from kafka import KafkaConsumer", "import json"],
      body: `_consumer = KafkaConsumer(
    "{{params.topic}}",
    bootstrap_servers="{{params.bootstrap_servers}}",
    group_id="{{params.group_id}}",
    auto_offset_reset="{{params.auto_offset_reset}}",
    consumer_timeout_ms={{params.timeout_ms}},
    value_deserializer=lambda m: json.loads(m.decode("utf-8"))
)
{{outputs.messages}} = []
for _msg in _consumer:
    {{outputs.messages}}.append(_msg.value)
    if len({{outputs.messages}}) >= {{params.max_messages}}:
        break
_consumer.close()`,
      outputBindings: { messages: "kafka_messages" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. Kafka Producer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.kafka-producer",
    name: "Kafka Producer",
    category: "data-io",
    description: "Publish messages to an Apache Kafka topic using kafka-python",
    tags: ["kafka", "producer", "streaming", "message", "queue", "publish", "send"],
    inputs: [
      { id: "messages", name: "Messages", type: "list", required: true },
    ],
    outputs: [
      { id: "sent_count", name: "Messages Sent", type: "number", required: true },
    ],
    parameters: [
      { id: "topic", name: "Topic", type: "string", default: "my-topic" },
      { id: "bootstrap_servers", name: "Bootstrap Servers", type: "string", default: "localhost:9092" },
      { id: "key", name: "Message Key", type: "string", default: "", description: "Optional key for partitioning (empty = none)", advanced: true },
      { id: "flush_timeout", name: "Flush Timeout (s)", type: "number", default: 30, advanced: true },
    ],
    codeTemplate: {
      imports: ["from kafka import KafkaProducer", "import json"],
      body: `_producer = KafkaProducer(
    bootstrap_servers="{{params.bootstrap_servers}}",
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    key_serializer=lambda k: k.encode("utf-8") if k else None
)
{{outputs.sent_count}} = 0
_key = "{{params.key}}" or None
for _msg in {{inputs.messages}}:
    _producer.send("{{params.topic}}", value=_msg, key=_key)
    {{outputs.sent_count}} += 1
_producer.flush(timeout={{params.flush_timeout}})
_producer.close()`,
      outputBindings: { sent_count: "sent_count" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. gRPC Call
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "data-io.grpc-call",
    name: "gRPC Call",
    category: "data-io",
    description: "Make a unary gRPC call to a remote service using grpcio and protobuf",
    tags: ["grpc", "rpc", "protobuf", "call", "service", "remote"],
    inputs: [
      { id: "request_data", name: "Request Data", type: "dict", required: true },
    ],
    outputs: [
      { id: "response_data", name: "Response Data", type: "dict", required: true },
    ],
    parameters: [
      { id: "target", name: "Server Target", type: "string", default: "localhost:50051", placeholder: "host:port" },
      { id: "service", name: "Service Name", type: "string", default: "mypackage.MyService" },
      { id: "method", name: "Method Name", type: "string", default: "MyMethod" },
      { id: "proto_path", name: "Proto File Path", type: "string", default: "service.proto", placeholder: "path/to/service.proto" },
      { id: "use_tls", name: "Use TLS", type: "boolean", default: false, advanced: true },
      { id: "timeout", name: "Timeout (s)", type: "number", default: 10, advanced: true },
    ],
    codeTemplate: {
      imports: [
        "import grpc",
        "from grpc_tools import protoc",
        "from google.protobuf.json_format import MessageToDict, ParseDict",
        "import importlib",
      ],
      body: `# Compile proto and import generated stubs
protoc.main(["grpc_tools.protoc", "-I.", "--python_out=.", "--grpc_python_out=.", "{{params.proto_path}}"])
_proto_module = "{{params.proto_path}}".replace(".proto", "_pb2")
_grpc_module = "{{params.proto_path}}".replace(".proto", "_pb2_grpc")
_pb2 = importlib.import_module(_proto_module)
_pb2_grpc = importlib.import_module(_grpc_module)

# Establish channel
if {{params.use_tls}}:
    _channel = grpc.secure_channel("{{params.target}}", grpc.ssl_channel_credentials())
else:
    _channel = grpc.insecure_channel("{{params.target}}")

# Build stub and make call
_stub_class = getattr(_pb2_grpc, "{{params.service}}".split(".")[-1] + "Stub")
_stub = _stub_class(_channel)
_request_class = getattr(_pb2, "{{params.method}}Request")
_request = ParseDict({{inputs.request_data}}, _request_class())
_response = getattr(_stub, "{{params.method}}")(_request, timeout={{params.timeout}})
{{outputs.response_data}} = MessageToDict(_response)
_channel.close()`,
      outputBindings: { response_data: "grpc_response" },
    },
  },
];
