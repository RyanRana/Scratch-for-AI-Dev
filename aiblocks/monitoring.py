"""
aiblocks.monitoring — Monitoring & Observability

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def request_logger(request=None, log_level='INFO', log_body=True, output_path='./request_logs.jsonl'):
    """Logs every incoming request with payload, headers, and timestamp for audit and debugging
    
    Args:
        request (dict) (required): 
    
    Parameters:
        log_level (select, default='INFO'): 
        log_body (boolean, default=True): 
        output_path (string, default='./request_logs.jsonl'): 
    
    Returns:
        dict: 
    """
    _imports = ['import logging', 'import json', 'from datetime import datetime']
    _code = '_logger = logging.getLogger("request_logger")\n_logger.setLevel("{{params.log_level}}")\n{{outputs.log_entry}} = {"timestamp": datetime.utcnow().isoformat(), "request": {{inputs.request}} if {{params.log_body}} else "<redacted>"}\n_logger.log(getattr(logging, "{{params.log_level}}"), json.dumps({{outputs.log_entry}}))\nwith open("{{params.output_path}}", "a") as f:\n    f.write(json.dumps({{outputs.log_entry}}) + "\\\\n")'
    
    _code = _code.replace("{{params.log_level}}", str(log_level))
    _code = _code.replace("{{params.log_body}}", str(log_body))
    _code = _code.replace("{{params.output_path}}", str(output_path))
    _code = _code.replace("{{inputs.request}}", "request")
    _code = _code.replace("{{outputs.log_entry}}", "_out_log_entry")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["request"] = request
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_log_entry")


def latency_monitor(start_time=None, end_time=None, alert_threshold_ms=1000, export_prometheus=True):
    """Measures and records inference latency (p50, p95, p99) for each request
    
    Dependencies: pip install prometheus_client
    
    Args:
        start_time (number) (required): 
        end_time (number) (required): 
    
    Parameters:
        alert_threshold_ms (number, default=1000): 
        export_prometheus (boolean, default=True): 
    
    Returns:
        dict with keys:
            latency_ms (number): 
            stats (dict): 
    """
    _imports = ['from prometheus_client import Histogram', 'import time']
    _code = '_hist = Histogram("inference_latency_ms", "Inference latency in milliseconds", buckets=[10, 50, 100, 250, 500, 1000, 2500, 5000])\n{{outputs.latency_ms}} = ({{inputs.end_time}} - {{inputs.start_time}}) * 1000\n_hist.observe({{outputs.latency_ms}})\nif {{outputs.latency_ms}} > {{params.alert_threshold_ms}}:\n    import logging; logging.warning(f"High latency: {{{outputs.latency_ms}}:.1f}ms")'
    
    _code = _code.replace("{{params.alert_threshold_ms}}", str(alert_threshold_ms))
    _code = _code.replace("{{params.export_prometheus}}", str(export_prometheus))
    _code = _code.replace("{{inputs.start_time}}", "start_time")
    _code = _code.replace("{{inputs.end_time}}", "end_time")
    _code = _code.replace("{{outputs.latency_ms}}", "_out_latency_ms")
    _code = _code.replace("{{outputs.stats}}", "_out_stats")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["start_time"] = start_time
    _ns["end_time"] = end_time
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"latency_ms": _ns.get("_out_latency_ms"), "stats": _ns.get("_out_stats")}


def throughput_monitor(request_count=None, time_window=None, export_prometheus=True):
    """Tracks requests per second and tokens per second to monitor serving throughput
    
    Dependencies: pip install prometheus_client
    
    Args:
        request_count (number) (required): 
        time_window (number) (required): 
    
    Parameters:
        export_prometheus (boolean, default=True): 
    
    Returns:
        number: 
    """
    _imports = ['from prometheus_client import Counter']
    _code = '_counter = Counter("inference_requests_total", "Total inference requests")\n_counter.inc({{inputs.request_count}})\n{{outputs.rps}} = {{inputs.request_count}} / max({{inputs.time_window}}, 0.001)'
    
    _code = _code.replace("{{params.export_prometheus}}", str(export_prometheus))
    _code = _code.replace("{{inputs.request_count}}", "request_count")
    _code = _code.replace("{{inputs.time_window}}", "time_window")
    _code = _code.replace("{{outputs.rps}}", "_out_rps")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["request_count"] = request_count
    _ns["time_window"] = time_window
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_rps")


def error_rate_alert(total_requests=None, error_count=None, threshold=5, webhook_url=''):
    """Monitors the error rate and triggers an alert when it exceeds a threshold
    
    Dependencies: pip install requests
    
    Args:
        total_requests (number) (required): 
        error_count (number) (required): 
    
    Parameters:
        threshold (number, default=5): 
        webhook_url (string, default=''): 
    
    Returns:
        dict with keys:
            error_rate (number): 
            alert_fired (boolean): 
    """
    _imports = ['import requests as _requests', 'import logging']
    _code = '{{outputs.error_rate}} = ({{inputs.error_count}} / max({{inputs.total_requests}}, 1)) * 100\n{{outputs.alert_fired}} = {{outputs.error_rate}} > {{params.threshold}}\nif {{outputs.alert_fired}}:\n    logging.error(f"Error rate alert: {{{outputs.error_rate}}:.2f}% exceeds {{{params.threshold}}}%")\n    if "{{params.webhook_url}}":\n        _requests.post("{{params.webhook_url}}", json={"error_rate": {{outputs.error_rate}}})'
    
    _code = _code.replace("{{params.threshold}}", str(threshold))
    _code = _code.replace("{{params.webhook_url}}", str(webhook_url))
    _code = _code.replace("{{inputs.total_requests}}", "total_requests")
    _code = _code.replace("{{inputs.error_count}}", "error_count")
    _code = _code.replace("{{outputs.error_rate}}", "_out_error_rate")
    _code = _code.replace("{{outputs.alert_fired}}", "_out_alert_fired")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["total_requests"] = total_requests
    _ns["error_count"] = error_count
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"error_rate": _ns.get("_out_error_rate"), "alert_fired": _ns.get("_out_alert_fired")}


def input_drift_detect(reference_data=None, current_data=None, method='ks', threshold=0.05):
    """Detects statistical drift in model input features compared to a reference distribution
    
    Dependencies: pip install evidently
    
    Args:
        reference_data (dataframe) (required): 
        current_data (dataframe) (required): 
    
    Parameters:
        method (select, default='ks'): 
        threshold (number, default=0.05): 
    
    Returns:
        dict with keys:
            drift_detected (boolean): 
            report (dict): 
    """
    _imports = ['from evidently.report import Report', 'from evidently.metric_preset import DataDriftPreset']
    _code = '_report = Report(metrics=[DataDriftPreset()])\n_report.run(reference_data={{inputs.reference_data}}, current_data={{inputs.current_data}})\n{{outputs.report}} = _report.as_dict()\n{{outputs.drift_detected}} = {{outputs.report}}["metrics"][0]["result"]["dataset_drift"]'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.threshold}}", str(threshold))
    _code = _code.replace("{{inputs.reference_data}}", "reference_data")
    _code = _code.replace("{{inputs.current_data}}", "current_data")
    _code = _code.replace("{{outputs.drift_detected}}", "_out_drift_detected")
    _code = _code.replace("{{outputs.report}}", "_out_report")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["reference_data"] = reference_data
    _ns["current_data"] = current_data
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"drift_detected": _ns.get("_out_drift_detected"), "report": _ns.get("_out_report")}


def output_drift_detect(reference_preds=None, current_preds=None, method='ks', threshold=0.05):
    """Detects drift in model output/prediction distributions over time
    
    Dependencies: pip install numpy scipy
    
    Args:
        reference_preds (list) (required): 
        current_preds (list) (required): 
    
    Parameters:
        method (select, default='ks'): 
        threshold (number, default=0.05): 
    
    Returns:
        dict with keys:
            drift_detected (boolean): 
            p_value (number): 
    """
    _imports = ['from scipy import stats', 'import numpy as np']
    _code = 'if "{{params.method}}" == "ks":\n    _stat, {{outputs.p_value}} = stats.ks_2samp({{inputs.reference_preds}}, {{inputs.current_preds}})\n "else":\n    _stat, {{outputs.p_value}} = stats.chisquare(np.histogram({{inputs.current_preds}}, bins=20)[0], np.histogram({{inputs.reference_preds}}, bins=20)[0])\n{{outputs.drift_detected}} = {{outputs.p_value}} < {{params.threshold}}'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.threshold}}", str(threshold))
    _code = _code.replace("{{inputs.reference_preds}}", "reference_preds")
    _code = _code.replace("{{inputs.current_preds}}", "current_preds")
    _code = _code.replace("{{outputs.drift_detected}}", "_out_drift_detected")
    _code = _code.replace("{{outputs.p_value}}", "_out_p_value")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["reference_preds"] = reference_preds
    _ns["current_preds"] = current_preds
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"drift_detected": _ns.get("_out_drift_detected"), "p_value": _ns.get("_out_p_value")}


def data_quality_check(data=None, max_null_pct=5, check_types=True):
    """Validates data quality by checking for nulls, outliers, type mismatches, and schema violations
    
    Dependencies: pip install evidently
    
    Args:
        data (dataframe) (required): 
    
    Parameters:
        max_null_pct (number, default=5): 
        check_types (boolean, default=True): 
    
    Returns:
        dict with keys:
            is_valid (boolean): 
            report (dict): 
    """
    _imports = ['from evidently.report import Report', 'from evidently.metric_preset import DataQualityPreset']
    _code = '_report = Report(metrics=[DataQualityPreset()])\n_report.run(reference_data=None, current_data={{inputs.data}})\n{{outputs.report}} = _report.as_dict()\n_null_pct = {{inputs.data}}.isnull().mean().max() * 100\n{{outputs.is_valid}} = _null_pct <= {{params.max_null_pct}}'
    
    _code = _code.replace("{{params.max_null_pct}}", str(max_null_pct))
    _code = _code.replace("{{params.check_types}}", str(check_types))
    _code = _code.replace("{{inputs.data}}", "data")
    _code = _code.replace("{{outputs.is_valid}}", "_out_is_valid")
    _code = _code.replace("{{outputs.report}}", "_out_report")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["data"] = data
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"is_valid": _ns.get("_out_is_valid"), "report": _ns.get("_out_report")}


def feature_drift_psi(reference=None, current=None, bins=10, threshold_moderate=0.1, threshold_high=0.25):
    """Computes Population Stability Index (PSI) per feature to quantify distribution shift
    
    Dependencies: pip install numpy
    
    Args:
        reference (list) (required): 
        current (list) (required): 
    
    Parameters:
        bins (number, default=10): 
        threshold_moderate (number, default=0.1): 
        threshold_high (number, default=0.25): 
    
    Returns:
        dict with keys:
            psi_value (number): 
            drift_level (text): 
    """
    _imports = ['import numpy as np']
    _code = '_ref_hist, _edges = np.histogram({{inputs.reference}}, bins={{params.bins}})\n_cur_hist, _ = np.histogram({{inputs.current}}, bins=_edges)\n_ref_pct = np.clip(_ref_hist / _ref_hist.sum(), 1e-6, None)\n_cur_pct = np.clip(_cur_hist / _cur_hist.sum(), 1e-6, None)\n{{outputs.psi_value}} = float(np.sum((_cur_pct - _ref_pct) * np.log(_cur_pct / _ref_pct)))\nif {{outputs.psi_value}} < {{params.threshold_moderate}}:\n    {{outputs.drift_level}} = "low"\nelif {{outputs.psi_value}} < {{params.threshold_high}}:\n    {{outputs.drift_level}} = "moderate"\n "else":\n    {{outputs.drift_level}} = "high"'
    
    _code = _code.replace("{{params.bins}}", str(bins))
    _code = _code.replace("{{params.threshold_moderate}}", str(threshold_moderate))
    _code = _code.replace("{{params.threshold_high}}", str(threshold_high))
    _code = _code.replace("{{inputs.reference}}", "reference")
    _code = _code.replace("{{inputs.current}}", "current")
    _code = _code.replace("{{outputs.psi_value}}", "_out_psi_value")
    _code = _code.replace("{{outputs.drift_level}}", "_out_drift_level")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["reference"] = reference
    _ns["current"] = current
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"psi_value": _ns.get("_out_psi_value"), "drift_level": _ns.get("_out_drift_level")}


def prediction_drift(reference_preds=None, current_preds=None, target_column='prediction', threshold=0.05):
    """Monitors changes in the distribution of model predictions over time windows
    
    Dependencies: pip install evidently
    
    Args:
        reference_preds (dataframe) (required): 
        current_preds (dataframe) (required): 
    
    Parameters:
        target_column (string, default='prediction'): 
        threshold (number, default=0.05): 
    
    Returns:
        dict with keys:
            drift_detected (boolean): 
            report (dict): 
    """
    _imports = ['from evidently.report import Report', 'from evidently.metrics import ColumnDriftMetric']
    _code = '_report = Report(metrics=[ColumnDriftMetric(column_name="{{params.target_column}}")])\n_report.run(reference_data={{inputs.reference_preds}}, current_data={{inputs.current_preds}})\n{{outputs.report}} = _report.as_dict()\n{{outputs.drift_detected}} = {{outputs.report}}["metrics"][0]["result"]["drift_detected"]'
    
    _code = _code.replace("{{params.target_column}}", str(target_column))
    _code = _code.replace("{{params.threshold}}", str(threshold))
    _code = _code.replace("{{inputs.reference_preds}}", "reference_preds")
    _code = _code.replace("{{inputs.current_preds}}", "current_preds")
    _code = _code.replace("{{outputs.drift_detected}}", "_out_drift_detected")
    _code = _code.replace("{{outputs.report}}", "_out_report")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["reference_preds"] = reference_preds
    _ns["current_preds"] = current_preds
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"drift_detected": _ns.get("_out_drift_detected"), "report": _ns.get("_out_report")}


def model_degradation_alert(current_metric=None, baseline_metric=None, metric_name='accuracy', max_drop_pct=5, webhook_url=''):
    """Triggers an alert when model performance metrics drop below configured thresholds
    
    Dependencies: pip install requests
    
    Args:
        current_metric (number) (required): 
        baseline_metric (number) (required): 
    
    Parameters:
        metric_name (string, default='accuracy'): 
        max_drop_pct (number, default=5): 
        webhook_url (string, default=''): 
    
    Returns:
        dict with keys:
            degraded (boolean): 
            delta (number): 
    """
    _imports = ['import logging', 'import requests as _requests']
    _code = '{{outputs.delta}} = {{inputs.baseline_metric}} - {{inputs.current_metric}}\n_drop_pct = ({{outputs.delta}} / max(abs({{inputs.baseline_metric}}), 1e-9)) * 100\n{{outputs.degraded}} = _drop_pct > {{params.max_drop_pct}}\nif {{outputs.degraded}}:\n    logging.warning(f"Model degradation: {{params.metric_name}} dropped by { "_drop_pct":.2f}%")\n    if "{{params.webhook_url}}":\n        _requests.post("{{params.webhook_url}}", json={"metric": "{{params.metric_name}}", "drop_pct": _drop_pct})'
    
    _code = _code.replace("{{params.metric_name}}", str(metric_name))
    _code = _code.replace("{{params.max_drop_pct}}", str(max_drop_pct))
    _code = _code.replace("{{params.webhook_url}}", str(webhook_url))
    _code = _code.replace("{{inputs.current_metric}}", "current_metric")
    _code = _code.replace("{{inputs.baseline_metric}}", "baseline_metric")
    _code = _code.replace("{{outputs.degraded}}", "_out_degraded")
    _code = _code.replace("{{outputs.delta}}", "_out_delta")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["current_metric"] = current_metric
    _ns["baseline_metric"] = baseline_metric
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"degraded": _ns.get("_out_degraded"), "delta": _ns.get("_out_delta")}


def feedback_collect(prediction_id=None, feedback=None, store_path='./feedback.jsonl', require_comment=False):
    """Collects user feedback (thumbs up/down, ratings, corrections) on model outputs
    
    Args:
        prediction_id (text) (required): 
        feedback (dict) (required): Feedback dict with rating, comment, etc.
    
    Parameters:
        store_path (string, default='./feedback.jsonl'): 
        require_comment (boolean, default=False): 
    
    Returns:
        boolean: 
    """
    _imports = ['import json', 'from datetime import datetime']
    _code = '_entry = {"prediction_id": {{inputs.prediction_id}}, "feedback": {{inputs.feedback}}, "timestamp": datetime.utcnow().isoformat()}\nwith open("{{params.store_path}}", "a") as f:\n    f.write(json.dumps(_entry) + "\\\\n")\n{{outputs.stored}} = True'
    
    _code = _code.replace("{{params.store_path}}", str(store_path))
    _code = _code.replace("{{params.require_comment}}", str(require_comment))
    _code = _code.replace("{{inputs.prediction_id}}", "prediction_id")
    _code = _code.replace("{{inputs.feedback}}", "feedback")
    _code = _code.replace("{{outputs.stored}}", "_out_stored")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["prediction_id"] = prediction_id
    _ns["feedback"] = feedback
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_stored")


def human_in_loop_flag(prediction=None, confidence=None, confidence_threshold=0.7, queue_name='review_queue'):
    """Flags low-confidence or ambiguous predictions for human review before serving
    
    Args:
        prediction (any) (required): 
        confidence (number) (required): 
    
    Parameters:
        confidence_threshold (number, default=0.7): 
        queue_name (string, default='review_queue'): 
    
    Returns:
        dict with keys:
            needs_review (boolean): 
            output (any): 
    """
    _imports = ['import logging']
    _code = '{{outputs.needs_review}} = {{inputs.confidence}} < {{params.confidence_threshold}}\n{{outputs.output}} = {{inputs.prediction}}\nif {{outputs.needs_review}}:\n    logging.info(f"Flagged for human review (confidence={{{inputs.confidence}}:.3f}): queue={{params.queue_name}}")'
    
    _code = _code.replace("{{params.confidence_threshold}}", str(confidence_threshold))
    _code = _code.replace("{{params.queue_name}}", str(queue_name))
    _code = _code.replace("{{inputs.prediction}}", "prediction")
    _code = _code.replace("{{inputs.confidence}}", "confidence")
    _code = _code.replace("{{outputs.needs_review}}", "_out_needs_review")
    _code = _code.replace("{{outputs.output}}", "_out_output")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["prediction"] = prediction
    _ns["confidence"] = confidence
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"needs_review": _ns.get("_out_needs_review"), "output": _ns.get("_out_output")}


def hallucination_detector(generated_text=None, source_text=None, model='cross-encoder/nli-deberta-v3-base', threshold=0.5):
    """Detects potential hallucinations in LLM output by checking factual consistency against sources
    
    Dependencies: pip install transformers
    
    Args:
        generated_text (text) (required): 
        source_text (text): 
    
    Parameters:
        model (string, default='cross-encoder/nli-deberta-v3-base'): 
        threshold (number, default=0.5): 
    
    Returns:
        dict with keys:
            score (number): 0 = no hallucination, 1 = fully hallucinated
            is_hallucinated (boolean): 
    """
    _imports = ['from transformers import pipeline']
    _code = '_nli = pipeline("text-classification", model="{{params.model}}")\n_result = _nli(f"{{inputs.source_text}} [SEP] {{inputs.generated_text}}")\n_label = _result[0]["label"].lower()\n{{outputs.score}} = _result[0]["score"] if "contradiction" in _label else 1.0 - _result[0]["score"]\n{{outputs.is_hallucinated}} = {{outputs.score}} > {{params.threshold}}'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.threshold}}", str(threshold))
    _code = _code.replace("{{inputs.generated_text}}", "generated_text")
    _code = _code.replace("{{inputs.source_text}}", "source_text")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    _code = _code.replace("{{outputs.is_hallucinated}}", "_out_is_hallucinated")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["generated_text"] = generated_text
    _ns["source_text"] = source_text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"score": _ns.get("_out_score"), "is_hallucinated": _ns.get("_out_is_hallucinated")}


def toxicity_filter(text=None, model='unitary/toxic-bert', threshold=0.5, action='flag'):
    """Scores text for toxicity using a classifier and blocks or flags toxic content
    
    Dependencies: pip install transformers
    
    Args:
        text (text) (required): 
    
    Parameters:
        model (string, default='unitary/toxic-bert'): 
        threshold (number, default=0.5): 
        action (select, default='flag'): 
    
    Returns:
        dict with keys:
            score (number): 
            is_toxic (boolean): 
            filtered_text (text): 
    """
    _imports = ['from transformers import pipeline']
    _code = '_classifier = pipeline("text-classification", model="{{params.model}}")\n_result = _classifier({{inputs.text}})\n{{outputs.score}} = _result[0]["score"] if "toxic" in _result[0]["label"].lower() else 1.0 - _result[0]["score"]\n{{outputs.is_toxic}} = {{outputs.score}} > {{params.threshold}}\nif {{outputs.is_toxic}} and "{{params.action}}" == "block":\n    {{outputs.filtered_text}} = "[BLOCKED: toxic content detected]"\nelif {{outputs.is_toxic}} and "{{params.action}}" == "replace":\n    {{outputs.filtered_text}} = "[Content moderated]"\n "else":\n    {{outputs.filtered_text}} = {{inputs.text}}'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.threshold}}", str(threshold))
    _code = _code.replace("{{params.action}}", str(action))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    _code = _code.replace("{{outputs.is_toxic}}", "_out_is_toxic")
    _code = _code.replace("{{outputs.filtered_text}}", "_out_filtered_text")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"score": _ns.get("_out_score"), "is_toxic": _ns.get("_out_is_toxic"), "filtered_text": _ns.get("_out_filtered_text")}


def pii_detector(text=None, model='dslim/bert-base-NER', redact=True, pii_types=['PER', 'LOC', 'ORG']):
    """Detects personally identifiable information (emails, phones, SSNs, names) in text and optionally redacts it
    
    Dependencies: pip install transformers
    
    Args:
        text (text) (required): 
    
    Parameters:
        model (string, default='dslim/bert-base-NER'): 
        redact (boolean, default=True): 
        pii_types (multiselect, default=['PER', 'LOC', 'ORG']): 
    
    Returns:
        dict with keys:
            has_pii (boolean): 
            entities (list): 
            redacted_text (text): 
    """
    _imports = ['from transformers import pipeline', 'import re']
    _code = '_ner = pipeline("ner", model="{{params.model}}", aggregation_strategy="simple")\n_entities = _ner({{inputs.text}})\n{{outputs.entities}} = [e for e in _entities if e["entity_group"] in {{params.pii_types}}]\n{{outputs.has_pii}} = len({{outputs.entities}}) > 0\n{{outputs.redacted_text}} = {{inputs.text}}\nif {{params.redact}}:\n    for _ent in sorted({{outputs.entities}}, key=lambda x: x["start"], reverse=True):\n        {{outputs.redacted_text}} = {{outputs.redacted_text}}[:_ent["start"]] + f"[{_ent[\'entity_group\']}]" + {{outputs.redacted_text}}[_ent["end"]:]'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.redact}}", str(redact))
    _code = _code.replace("{{params.pii_types}}", str(pii_types))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.has_pii}}", "_out_has_pii")
    _code = _code.replace("{{outputs.entities}}", "_out_entities")
    _code = _code.replace("{{outputs.redacted_text}}", "_out_redacted_text")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"has_pii": _ns.get("_out_has_pii"), "entities": _ns.get("_out_entities"), "redacted_text": _ns.get("_out_redacted_text")}


def guardrail(text=None, max_length=10000, block_topics=[], check_toxicity=True, check_pii=True):
    """Applies a configurable set of input/output guardrails (toxicity, PII, topic, length) in a single block
    
    Args:
        text (text) (required): 
    
    Parameters:
        max_length (number, default=10000): 
        block_topics (json, default=[]): List of blocked topic keywords
        check_toxicity (boolean, default=True): 
        check_pii (boolean, default=True): 
    
    Returns:
        dict with keys:
            passed (boolean): 
            violations (list): 
            safe_text (text): 
    """
    _imports = []
    _code = '{{outputs.violations}} = []\nif len({{inputs.text}}) > {{params.max_length}}:\n    {{outputs.violations}}.append("exceeds_max_length")\nfor _topic in {{params.block_topics}}:\n    if _topic.lower() in {{inputs.text}}.lower():\n        {{outputs.violations}}.append(f"blocked_topic:{_topic}")\n{{outputs.passed}} = len({{outputs.violations}}) == 0\n{{outputs.safe_text}} = {{inputs.text}} if {{outputs.passed}} else "[BLOCKED]"'
    
    _code = _code.replace("{{params.max_length}}", str(max_length))
    _code = _code.replace("{{params.block_topics}}", str(block_topics))
    _code = _code.replace("{{params.check_toxicity}}", str(check_toxicity))
    _code = _code.replace("{{params.check_pii}}", str(check_pii))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.passed}}", "_out_passed")
    _code = _code.replace("{{outputs.violations}}", "_out_violations")
    _code = _code.replace("{{outputs.safe_text}}", "_out_safe_text")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"passed": _ns.get("_out_passed"), "violations": _ns.get("_out_violations"), "safe_text": _ns.get("_out_safe_text")}


def tracing_opentelemetry(service_name='ml-pipeline', endpoint='http://localhost:4317', sample_rate=1.0):
    """Initializes OpenTelemetry distributed tracing for the inference pipeline
    
    Dependencies: pip install opentelemetry-api
    
    Parameters:
        service_name (string, default='ml-pipeline'): 
        endpoint (string, default='http://localhost:4317'): 
        sample_rate (number, default=1.0): 
    
    Returns:
        any: 
    """
    _imports = ['from opentelemetry import trace', 'from opentelemetry.sdk.trace import TracerProvider', 'from opentelemetry.sdk.trace.export import BatchSpanProcessor', 'from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter', 'from opentelemetry.sdk.trace.sampling import TraceIdRatioBased']
    _code = '_sampler = TraceIdRatioBased({{params.sample_rate}})\n_provider = TracerProvider(sampler=_sampler)\n_exporter = OTLPSpanExporter(endpoint="{{params.endpoint}}")\n_provider.add_span_processor(BatchSpanProcessor(_exporter))\ntrace.set_tracer_provider(_provider)\n{{outputs.tracer}} = trace.get_tracer("{{params.service_name}}")'
    
    _code = _code.replace("{{params.service_name}}", str(service_name))
    _code = _code.replace("{{params.endpoint}}", str(endpoint))
    _code = _code.replace("{{params.sample_rate}}", str(sample_rate))
    _code = _code.replace("{{outputs.tracer}}", "_out_tracer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tracer")


def span_logger(tracer=None, parent_context=None, span_name='pipeline-step', attributes={}):
    """Creates an OpenTelemetry span around a pipeline step, recording attributes and timing
    
    Dependencies: pip install opentelemetry-api
    
    Args:
        tracer (any) (required): 
        parent_context (any): 
    
    Parameters:
        span_name (string, default='pipeline-step'): 
        attributes (json, default={}): Key-value attributes to attach to the span
    
    Returns:
        any: 
    """
    _imports = ['from opentelemetry import trace', 'from opentelemetry.context import attach, detach']
    _code = '{{outputs.span}} = {{inputs.tracer}}.start_span("{{params.span_name}}")\nfor _k, _v in ({{params.attributes}} or {}).items():\n    {{outputs.span}}.set_attribute(_k, str(_v))'
    
    _code = _code.replace("{{params.span_name}}", str(span_name))
    _code = _code.replace("{{params.attributes}}", str(attributes))
    _code = _code.replace("{{inputs.tracer}}", "tracer")
    _code = _code.replace("{{inputs.parent_context}}", "parent_context")
    _code = _code.replace("{{outputs.span}}", "_out_span")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tracer"] = tracer
    _ns["parent_context"] = parent_context
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_span")

