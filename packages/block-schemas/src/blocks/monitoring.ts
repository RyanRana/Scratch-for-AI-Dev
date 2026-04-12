import type { BlockDefinition } from "../types.js";

export const monitoringBlocks: BlockDefinition[] = [
  // ── 1. Request Logger ─────────────────────────────────────────────────
  {
    id: "monitoring.request-logger",
    name: "Request Logger",
    category: "monitoring",
    description: "Logs every incoming request with payload, headers, and timestamp for audit and debugging",
    tags: ["logging", "request", "audit", "trace", "opentelemetry"],
    inputs: [
      { id: "request", name: "Request", type: "dict", required: true },
    ],
    outputs: [
      { id: "log_entry", name: "Log Entry", type: "dict", required: true },
    ],
    parameters: [
      { id: "log_level", name: "Log Level", type: "select", default: "INFO", options: [{ label: "DEBUG", value: "DEBUG" }, { label: "INFO", value: "INFO" }, { label: "WARNING", value: "WARNING" }] },
      { id: "log_body", name: "Log Request Body", type: "boolean", default: true },
      { id: "output_path", name: "Log File Path", type: "string", default: "./request_logs.jsonl", advanced: true },
    ],
    codeTemplate: {
      imports: ["import logging", "import json", "from datetime import datetime"],
      body: `_logger = logging.getLogger("request_logger")
_logger.setLevel("{{params.log_level}}")
{{outputs.log_entry}} = {"timestamp": datetime.utcnow().isoformat(), "request": {{inputs.request}} if {{params.log_body}} else "<redacted>"}
_logger.log(getattr(logging, "{{params.log_level}}"), json.dumps({{outputs.log_entry}}))
with open("{{params.output_path}}", "a") as f:
    f.write(json.dumps({{outputs.log_entry}}) + "\\n")`,
      outputBindings: { log_entry: "request_log_entry" },
    },
  },

  // ── 2. Latency Monitor ────────────────────────────────────────────────
  {
    id: "monitoring.latency-monitor",
    name: "Latency Monitor",
    category: "monitoring",
    description: "Measures and records inference latency (p50, p95, p99) for each request",
    tags: ["latency", "performance", "timing", "prometheus", "metrics"],
    inputs: [
      { id: "start_time", name: "Start Time", type: "number", required: true },
      { id: "end_time", name: "End Time", type: "number", required: true },
    ],
    outputs: [
      { id: "latency_ms", name: "Latency (ms)", type: "number", required: true },
      { id: "stats", name: "Stats", type: "dict", required: false },
    ],
    parameters: [
      { id: "alert_threshold_ms", name: "Alert Threshold (ms)", type: "number", default: 1000, min: 1, max: 60000 },
      { id: "export_prometheus", name: "Export to Prometheus", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from prometheus_client import Histogram", "import time"],
      body: `_hist = Histogram("inference_latency_ms", "Inference latency in milliseconds", buckets=[10, 50, 100, 250, 500, 1000, 2500, 5000])
{{outputs.latency_ms}} = ({{inputs.end_time}} - {{inputs.start_time}}) * 1000
_hist.observe({{outputs.latency_ms}})
if {{outputs.latency_ms}} > {{params.alert_threshold_ms}}:
    import logging; logging.warning(f"High latency: {{{outputs.latency_ms}}:.1f}ms")`,
      outputBindings: { latency_ms: "latency_ms", stats: "latency_stats" },
    },
  },

  // ── 3. Throughput Monitor ─────────────────────────────────────────────
  {
    id: "monitoring.throughput-monitor",
    name: "Throughput Monitor",
    category: "monitoring",
    description: "Tracks requests per second and tokens per second to monitor serving throughput",
    tags: ["throughput", "rps", "tps", "performance", "prometheus"],
    inputs: [
      { id: "request_count", name: "Request Count", type: "number", required: true },
      { id: "time_window", name: "Time Window (s)", type: "number", required: true },
    ],
    outputs: [
      { id: "rps", name: "Requests/Second", type: "number", required: true },
    ],
    parameters: [
      { id: "export_prometheus", name: "Export to Prometheus", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from prometheus_client import Counter"],
      body: `_counter = Counter("inference_requests_total", "Total inference requests")
_counter.inc({{inputs.request_count}})
{{outputs.rps}} = {{inputs.request_count}} / max({{inputs.time_window}}, 0.001)`,
      outputBindings: { rps: "requests_per_second" },
    },
  },

  // ── 4. Error Rate Alert ───────────────────────────────────────────────
  {
    id: "monitoring.error-rate-alert",
    name: "Error Rate Alert",
    category: "monitoring",
    description: "Monitors the error rate and triggers an alert when it exceeds a threshold",
    tags: ["error", "alert", "rate", "threshold", "prometheus"],
    inputs: [
      { id: "total_requests", name: "Total Requests", type: "number", required: true },
      { id: "error_count", name: "Error Count", type: "number", required: true },
    ],
    outputs: [
      { id: "error_rate", name: "Error Rate", type: "number", required: true },
      { id: "alert_fired", name: "Alert Fired", type: "boolean", required: true },
    ],
    parameters: [
      { id: "threshold", name: "Threshold %", type: "number", default: 5, min: 0, max: 100, step: 0.5 },
      { id: "webhook_url", name: "Alert Webhook URL", type: "string", default: "", advanced: true },
    ],
    codeTemplate: {
      imports: ["import requests as _requests", "import logging"],
      body: `{{outputs.error_rate}} = ({{inputs.error_count}} / max({{inputs.total_requests}}, 1)) * 100
{{outputs.alert_fired}} = {{outputs.error_rate}} > {{params.threshold}}
if {{outputs.alert_fired}}:
    logging.error(f"Error rate alert: {{{outputs.error_rate}}:.2f}% exceeds {{{params.threshold}}}%")
    if "{{params.webhook_url}}":
        _requests.post("{{params.webhook_url}}", json={"error_rate": {{outputs.error_rate}}})`,
      outputBindings: { error_rate: "error_rate_pct", alert_fired: "error_alert_fired" },
    },
  },

  // ── 5. Input Drift Detect ─────────────────────────────────────────────
  {
    id: "monitoring.input-drift-detect",
    name: "Input Drift Detect",
    category: "monitoring",
    description: "Detects statistical drift in model input features compared to a reference distribution",
    tags: ["drift", "input", "data", "distribution", "evidently"],
    inputs: [
      { id: "reference_data", name: "Reference Data", type: "dataframe", required: true },
      { id: "current_data", name: "Current Data", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "drift_detected", name: "Drift Detected", type: "boolean", required: true },
      { id: "report", name: "Drift Report", type: "dict", required: true },
    ],
    parameters: [
      { id: "method", name: "Drift Method", type: "select", default: "ks", options: [{ label: "Kolmogorov-Smirnov", value: "ks" }, { label: "PSI", value: "psi" }, { label: "Wasserstein", value: "wasserstein" }] },
      { id: "threshold", name: "P-Value Threshold", type: "number", default: 0.05, min: 0.001, max: 0.5, step: 0.005 },
    ],
    codeTemplate: {
      imports: ["from evidently.report import Report", "from evidently.metric_preset import DataDriftPreset"],
      body: `_report = Report(metrics=[DataDriftPreset()])
_report.run(reference_data={{inputs.reference_data}}, current_data={{inputs.current_data}})
{{outputs.report}} = _report.as_dict()
{{outputs.drift_detected}} = {{outputs.report}}["metrics"][0]["result"]["dataset_drift"]`,
      outputBindings: { drift_detected: "input_drift_detected", report: "input_drift_report" },
    },
  },

  // ── 6. Output Drift Detect ────────────────────────────────────────────
  {
    id: "monitoring.output-drift-detect",
    name: "Output Drift Detect",
    category: "monitoring",
    description: "Detects drift in model output/prediction distributions over time",
    tags: ["drift", "output", "prediction", "distribution", "evidently"],
    inputs: [
      { id: "reference_preds", name: "Reference Predictions", type: "list", required: true },
      { id: "current_preds", name: "Current Predictions", type: "list", required: true },
    ],
    outputs: [
      { id: "drift_detected", name: "Drift Detected", type: "boolean", required: true },
      { id: "p_value", name: "P-Value", type: "number", required: false },
    ],
    parameters: [
      { id: "method", name: "Drift Method", type: "select", default: "ks", options: [{ label: "Kolmogorov-Smirnov", value: "ks" }, { label: "Chi-Squared", value: "chi2" }] },
      { id: "threshold", name: "P-Value Threshold", type: "number", default: 0.05, min: 0.001, max: 0.5, step: 0.005 },
    ],
    codeTemplate: {
      imports: ["from scipy import stats", "import numpy as np"],
      body: `if "{{params.method}}" == "ks":
    _stat, {{outputs.p_value}} = stats.ks_2samp({{inputs.reference_preds}}, {{inputs.current_preds}})
else:
    _stat, {{outputs.p_value}} = stats.chisquare(np.histogram({{inputs.current_preds}}, bins=20)[0], np.histogram({{inputs.reference_preds}}, bins=20)[0])
{{outputs.drift_detected}} = {{outputs.p_value}} < {{params.threshold}}`,
      outputBindings: { drift_detected: "output_drift_detected", p_value: "output_drift_pvalue" },
    },
  },

  // ── 7. Data Quality Check ─────────────────────────────────────────────
  {
    id: "monitoring.data-quality-check",
    name: "Data Quality Check",
    category: "monitoring",
    description: "Validates data quality by checking for nulls, outliers, type mismatches, and schema violations",
    tags: ["data-quality", "validation", "null", "outlier", "evidently"],
    inputs: [
      { id: "data", name: "Data", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "is_valid", name: "Is Valid", type: "boolean", required: true },
      { id: "report", name: "Quality Report", type: "dict", required: true },
    ],
    parameters: [
      { id: "max_null_pct", name: "Max Null %", type: "number", default: 5, min: 0, max: 100, step: 1 },
      { id: "check_types", name: "Check Column Types", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from evidently.report import Report", "from evidently.metric_preset import DataQualityPreset"],
      body: `_report = Report(metrics=[DataQualityPreset()])
_report.run(reference_data=None, current_data={{inputs.data}})
{{outputs.report}} = _report.as_dict()
_null_pct = {{inputs.data}}.isnull().mean().max() * 100
{{outputs.is_valid}} = _null_pct <= {{params.max_null_pct}}`,
      outputBindings: { is_valid: "data_quality_valid", report: "data_quality_report" },
    },
  },

  // ── 8. Feature Drift (PSI) ────────────────────────────────────────────
  {
    id: "monitoring.feature-drift-psi",
    name: "Feature Drift (PSI)",
    category: "monitoring",
    description: "Computes Population Stability Index (PSI) per feature to quantify distribution shift",
    tags: ["psi", "drift", "feature", "stability", "distribution"],
    inputs: [
      { id: "reference", name: "Reference Distribution", type: "list", required: true },
      { id: "current", name: "Current Distribution", type: "list", required: true },
    ],
    outputs: [
      { id: "psi_value", name: "PSI Value", type: "number", required: true },
      { id: "drift_level", name: "Drift Level", type: "text", required: true },
    ],
    parameters: [
      { id: "bins", name: "Number of Bins", type: "number", default: 10, min: 2, max: 100 },
      { id: "threshold_moderate", name: "Moderate Threshold", type: "number", default: 0.1, min: 0, max: 1, step: 0.01 },
      { id: "threshold_high", name: "High Threshold", type: "number", default: 0.25, min: 0, max: 1, step: 0.01 },
    ],
    codeTemplate: {
      imports: ["import numpy as np"],
      body: `_ref_hist, _edges = np.histogram({{inputs.reference}}, bins={{params.bins}})
_cur_hist, _ = np.histogram({{inputs.current}}, bins=_edges)
_ref_pct = np.clip(_ref_hist / _ref_hist.sum(), 1e-6, None)
_cur_pct = np.clip(_cur_hist / _cur_hist.sum(), 1e-6, None)
{{outputs.psi_value}} = float(np.sum((_cur_pct - _ref_pct) * np.log(_cur_pct / _ref_pct)))
if {{outputs.psi_value}} < {{params.threshold_moderate}}:
    {{outputs.drift_level}} = "low"
elif {{outputs.psi_value}} < {{params.threshold_high}}:
    {{outputs.drift_level}} = "moderate"
else:
    {{outputs.drift_level}} = "high"`,
      outputBindings: { psi_value: "psi_value", drift_level: "drift_level" },
    },
  },

  // ── 9. Prediction Drift ───────────────────────────────────────────────
  {
    id: "monitoring.prediction-drift",
    name: "Prediction Drift",
    category: "monitoring",
    description: "Monitors changes in the distribution of model predictions over time windows",
    tags: ["prediction", "drift", "monitoring", "evidently", "distribution"],
    inputs: [
      { id: "reference_preds", name: "Reference Predictions", type: "dataframe", required: true },
      { id: "current_preds", name: "Current Predictions", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "drift_detected", name: "Drift Detected", type: "boolean", required: true },
      { id: "report", name: "Drift Report", type: "dict", required: true },
    ],
    parameters: [
      { id: "target_column", name: "Target Column", type: "string", default: "prediction" },
      { id: "threshold", name: "Threshold", type: "number", default: 0.05, min: 0.001, max: 0.5, step: 0.005 },
    ],
    codeTemplate: {
      imports: ["from evidently.report import Report", "from evidently.metrics import ColumnDriftMetric"],
      body: `_report = Report(metrics=[ColumnDriftMetric(column_name="{{params.target_column}}")])
_report.run(reference_data={{inputs.reference_preds}}, current_data={{inputs.current_preds}})
{{outputs.report}} = _report.as_dict()
{{outputs.drift_detected}} = {{outputs.report}}["metrics"][0]["result"]["drift_detected"]`,
      outputBindings: { drift_detected: "prediction_drift_detected", report: "prediction_drift_report" },
    },
  },

  // ── 10. Model Degradation Alert ───────────────────────────────────────
  {
    id: "monitoring.model-degradation-alert",
    name: "Model Degradation Alert",
    category: "monitoring",
    description: "Triggers an alert when model performance metrics drop below configured thresholds",
    tags: ["degradation", "alert", "performance", "threshold", "monitoring"],
    inputs: [
      { id: "current_metric", name: "Current Metric Value", type: "number", required: true },
      { id: "baseline_metric", name: "Baseline Metric Value", type: "number", required: true },
    ],
    outputs: [
      { id: "degraded", name: "Degraded", type: "boolean", required: true },
      { id: "delta", name: "Delta", type: "number", required: true },
    ],
    parameters: [
      { id: "metric_name", name: "Metric Name", type: "string", default: "accuracy" },
      { id: "max_drop_pct", name: "Max Drop %", type: "number", default: 5, min: 0, max: 100, step: 0.5 },
      { id: "webhook_url", name: "Alert Webhook", type: "string", default: "", advanced: true },
    ],
    codeTemplate: {
      imports: ["import logging", "import requests as _requests"],
      body: `{{outputs.delta}} = {{inputs.baseline_metric}} - {{inputs.current_metric}}
_drop_pct = ({{outputs.delta}} / max(abs({{inputs.baseline_metric}}), 1e-9)) * 100
{{outputs.degraded}} = _drop_pct > {{params.max_drop_pct}}
if {{outputs.degraded}}:
    logging.warning(f"Model degradation: {{params.metric_name}} dropped by {_drop_pct:.2f}%")
    if "{{params.webhook_url}}":
        _requests.post("{{params.webhook_url}}", json={"metric": "{{params.metric_name}}", "drop_pct": _drop_pct})`,
      outputBindings: { degraded: "model_degraded", delta: "metric_delta" },
    },
  },

  // ── 11. Feedback Collect ──────────────────────────────────────────────
  {
    id: "monitoring.feedback-collect",
    name: "Feedback Collect",
    category: "monitoring",
    description: "Collects user feedback (thumbs up/down, ratings, corrections) on model outputs",
    tags: ["feedback", "user", "rating", "collect", "human"],
    inputs: [
      { id: "prediction_id", name: "Prediction ID", type: "text", required: true },
      { id: "feedback", name: "Feedback", type: "dict", required: true, description: "Feedback dict with rating, comment, etc." },
    ],
    outputs: [
      { id: "stored", name: "Stored", type: "boolean", required: true },
    ],
    parameters: [
      { id: "store_path", name: "Store Path", type: "string", default: "./feedback.jsonl" },
      { id: "require_comment", name: "Require Comment", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import json", "from datetime import datetime"],
      body: `_entry = {"prediction_id": {{inputs.prediction_id}}, "feedback": {{inputs.feedback}}, "timestamp": datetime.utcnow().isoformat()}
with open("{{params.store_path}}", "a") as f:
    f.write(json.dumps(_entry) + "\\n")
{{outputs.stored}} = True`,
      outputBindings: { stored: "feedback_stored" },
    },
  },

  // ── 12. Human-in-Loop Flag ────────────────────────────────────────────
  {
    id: "monitoring.human-in-loop-flag",
    name: "Human-in-Loop Flag",
    category: "monitoring",
    description: "Flags low-confidence or ambiguous predictions for human review before serving",
    tags: ["human-in-loop", "flag", "review", "confidence", "escalation"],
    inputs: [
      { id: "prediction", name: "Prediction", type: "any", required: true },
      { id: "confidence", name: "Confidence Score", type: "number", required: true },
    ],
    outputs: [
      { id: "needs_review", name: "Needs Review", type: "boolean", required: true },
      { id: "output", name: "Output", type: "any", required: true },
    ],
    parameters: [
      { id: "confidence_threshold", name: "Confidence Threshold", type: "number", default: 0.7, min: 0, max: 1, step: 0.05 },
      { id: "queue_name", name: "Review Queue", type: "string", default: "review_queue" },
    ],
    codeTemplate: {
      imports: ["import logging"],
      body: `{{outputs.needs_review}} = {{inputs.confidence}} < {{params.confidence_threshold}}
{{outputs.output}} = {{inputs.prediction}}
if {{outputs.needs_review}}:
    logging.info(f"Flagged for human review (confidence={{{inputs.confidence}}:.3f}): queue={{params.queue_name}}")`,
      outputBindings: { needs_review: "needs_human_review", output: "reviewed_output" },
    },
  },

  // ── 13. Hallucination Detector ────────────────────────────────────────
  {
    id: "monitoring.hallucination-detector",
    name: "Hallucination Detector",
    category: "monitoring",
    description: "Detects potential hallucinations in LLM output by checking factual consistency against sources",
    tags: ["hallucination", "factuality", "detect", "verify", "transformers"],
    inputs: [
      { id: "generated_text", name: "Generated Text", type: "text", required: true },
      { id: "source_text", name: "Source/Context", type: "text", required: false },
    ],
    outputs: [
      { id: "score", name: "Hallucination Score", type: "number", required: true, description: "0 = no hallucination, 1 = fully hallucinated" },
      { id: "is_hallucinated", name: "Is Hallucinated", type: "boolean", required: true },
    ],
    parameters: [
      { id: "model", name: "NLI Model", type: "string", default: "cross-encoder/nli-deberta-v3-base" },
      { id: "threshold", name: "Threshold", type: "number", default: 0.5, min: 0, max: 1, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["from transformers import pipeline"],
      body: `_nli = pipeline("text-classification", model="{{params.model}}")
_result = _nli(f"{{inputs.source_text}} [SEP] {{inputs.generated_text}}")
_label = _result[0]["label"].lower()
{{outputs.score}} = _result[0]["score"] if "contradiction" in _label else 1.0 - _result[0]["score"]
{{outputs.is_hallucinated}} = {{outputs.score}} > {{params.threshold}}`,
      outputBindings: { score: "hallucination_score", is_hallucinated: "is_hallucinated" },
    },
  },

  // ── 14. Toxicity Filter ───────────────────────────────────────────────
  {
    id: "monitoring.toxicity-filter",
    name: "Toxicity Filter",
    category: "monitoring",
    description: "Scores text for toxicity using a classifier and blocks or flags toxic content",
    tags: ["toxicity", "filter", "safety", "moderation", "transformers"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "score", name: "Toxicity Score", type: "number", required: true },
      { id: "is_toxic", name: "Is Toxic", type: "boolean", required: true },
      { id: "filtered_text", name: "Filtered Text", type: "text", required: true },
    ],
    parameters: [
      { id: "model", name: "Model", type: "string", default: "unitary/toxic-bert" },
      { id: "threshold", name: "Threshold", type: "number", default: 0.5, min: 0, max: 1, step: 0.05 },
      { id: "action", name: "Action", type: "select", default: "flag", options: [{ label: "Flag Only", value: "flag" }, { label: "Block", value: "block" }, { label: "Replace", value: "replace" }] },
    ],
    codeTemplate: {
      imports: ["from transformers import pipeline"],
      body: `_classifier = pipeline("text-classification", model="{{params.model}}")
_result = _classifier({{inputs.text}})
{{outputs.score}} = _result[0]["score"] if "toxic" in _result[0]["label"].lower() else 1.0 - _result[0]["score"]
{{outputs.is_toxic}} = {{outputs.score}} > {{params.threshold}}
if {{outputs.is_toxic}} and "{{params.action}}" == "block":
    {{outputs.filtered_text}} = "[BLOCKED: toxic content detected]"
elif {{outputs.is_toxic}} and "{{params.action}}" == "replace":
    {{outputs.filtered_text}} = "[Content moderated]"
else:
    {{outputs.filtered_text}} = {{inputs.text}}`,
      outputBindings: { score: "toxicity_score", is_toxic: "is_toxic", filtered_text: "filtered_text" },
    },
  },

  // ── 15. PII Detector ──────────────────────────────────────────────────
  {
    id: "monitoring.pii-detector",
    name: "PII Detector",
    category: "monitoring",
    description: "Detects personally identifiable information (emails, phones, SSNs, names) in text and optionally redacts it",
    tags: ["pii", "privacy", "detect", "redact", "transformers", "ner"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "has_pii", name: "Has PII", type: "boolean", required: true },
      { id: "entities", name: "PII Entities", type: "list", required: true },
      { id: "redacted_text", name: "Redacted Text", type: "text", required: true },
    ],
    parameters: [
      { id: "model", name: "NER Model", type: "string", default: "dslim/bert-base-NER" },
      { id: "redact", name: "Redact PII", type: "boolean", default: true },
      { id: "pii_types", name: "PII Types", type: "multiselect", default: ["PER", "LOC", "ORG"], options: [{ label: "Person Names", value: "PER" }, { label: "Locations", value: "LOC" }, { label: "Organizations", value: "ORG" }] },
    ],
    codeTemplate: {
      imports: ["from transformers import pipeline", "import re"],
      body: `_ner = pipeline("ner", model="{{params.model}}", aggregation_strategy="simple")
_entities = _ner({{inputs.text}})
{{outputs.entities}} = [e for e in _entities if e["entity_group"] in {{params.pii_types}}]
{{outputs.has_pii}} = len({{outputs.entities}}) > 0
{{outputs.redacted_text}} = {{inputs.text}}
if {{params.redact}}:
    for _ent in sorted({{outputs.entities}}, key=lambda x: x["start"], reverse=True):
        {{outputs.redacted_text}} = {{outputs.redacted_text}}[:_ent["start"]] + f"[{_ent['entity_group']}]" + {{outputs.redacted_text}}[_ent["end"]:]`,
      outputBindings: { has_pii: "has_pii", entities: "pii_entities", redacted_text: "redacted_text" },
    },
  },

  // ── 16. Guardrail Block ───────────────────────────────────────────────
  {
    id: "monitoring.guardrail",
    name: "Guardrail Block",
    category: "monitoring",
    description: "Applies a configurable set of input/output guardrails (toxicity, PII, topic, length) in a single block",
    tags: ["guardrail", "safety", "filter", "validate", "gateway"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "passed", name: "Passed", type: "boolean", required: true },
      { id: "violations", name: "Violations", type: "list", required: true },
      { id: "safe_text", name: "Safe Text", type: "text", required: true },
    ],
    parameters: [
      { id: "max_length", name: "Max Length", type: "number", default: 10000, min: 1, max: 1000000 },
      { id: "block_topics", name: "Blocked Topics", type: "json", default: [], description: "List of blocked topic keywords" },
      { id: "check_toxicity", name: "Check Toxicity", type: "boolean", default: true },
      { id: "check_pii", name: "Check PII", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: [],
      body: `{{outputs.violations}} = []
if len({{inputs.text}}) > {{params.max_length}}:
    {{outputs.violations}}.append("exceeds_max_length")
for _topic in {{params.block_topics}}:
    if _topic.lower() in {{inputs.text}}.lower():
        {{outputs.violations}}.append(f"blocked_topic:{_topic}")
{{outputs.passed}} = len({{outputs.violations}}) == 0
{{outputs.safe_text}} = {{inputs.text}} if {{outputs.passed}} else "[BLOCKED]"`,
      outputBindings: { passed: "guardrail_passed", violations: "guardrail_violations", safe_text: "safe_text" },
    },
  },

  // ── 17. Tracing (OpenTelemetry) ───────────────────────────────────────
  {
    id: "monitoring.tracing-opentelemetry",
    name: "Tracing (OpenTelemetry)",
    category: "monitoring",
    description: "Initializes OpenTelemetry distributed tracing for the inference pipeline",
    tags: ["tracing", "opentelemetry", "otel", "distributed", "observability"],
    inputs: [],
    outputs: [
      { id: "tracer", name: "Tracer", type: "any", required: true },
    ],
    parameters: [
      { id: "service_name", name: "Service Name", type: "string", default: "ml-pipeline" },
      { id: "endpoint", name: "OTLP Endpoint", type: "string", default: "http://localhost:4317" },
      { id: "sample_rate", name: "Sample Rate", type: "number", default: 1.0, min: 0, max: 1, step: 0.01 },
    ],
    codeTemplate: {
      imports: ["from opentelemetry import trace", "from opentelemetry.sdk.trace import TracerProvider", "from opentelemetry.sdk.trace.export import BatchSpanProcessor", "from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter", "from opentelemetry.sdk.trace.sampling import TraceIdRatioBased"],
      body: `_sampler = TraceIdRatioBased({{params.sample_rate}})
_provider = TracerProvider(sampler=_sampler)
_exporter = OTLPSpanExporter(endpoint="{{params.endpoint}}")
_provider.add_span_processor(BatchSpanProcessor(_exporter))
trace.set_tracer_provider(_provider)
{{outputs.tracer}} = trace.get_tracer("{{params.service_name}}")`,
      outputBindings: { tracer: "otel_tracer" },
    },
  },

  // ── 18. Span Logger ───────────────────────────────────────────────────
  {
    id: "monitoring.span-logger",
    name: "Span Logger",
    category: "monitoring",
    description: "Creates an OpenTelemetry span around a pipeline step, recording attributes and timing",
    tags: ["span", "trace", "opentelemetry", "logging", "timing"],
    inputs: [
      { id: "tracer", name: "Tracer", type: "any", required: true },
      { id: "parent_context", name: "Parent Context", type: "any", required: false },
    ],
    outputs: [
      { id: "span", name: "Span", type: "any", required: true },
    ],
    parameters: [
      { id: "span_name", name: "Span Name", type: "string", default: "pipeline-step" },
      { id: "attributes", name: "Attributes", type: "json", default: {}, description: "Key-value attributes to attach to the span" },
    ],
    codeTemplate: {
      imports: ["from opentelemetry import trace", "from opentelemetry.context import attach, detach"],
      body: `{{outputs.span}} = {{inputs.tracer}}.start_span("{{params.span_name}}")
for _k, _v in ({{params.attributes}} or {}).items():
    {{outputs.span}}.set_attribute(_k, str(_v))`,
      outputBindings: { span: "otel_span" },
    },
  },
];
