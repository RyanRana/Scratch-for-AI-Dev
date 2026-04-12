"""
aiblocks.evaluation — Evaluation & Metrics

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def accuracy(y_true=None, y_pred=None, normalize=True):
    """Compute classification accuracy as the fraction of correct predictions
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
    
    Parameters:
        normalize (boolean, default=True): 
    
    Returns:
        number: 
    """
    _imports = ['from sklearn.metrics import accuracy_score']
    _code = '{{outputs.score}} = accuracy_score({{inputs.y_true}}, {{inputs.y_pred}}, normalize={{params.normalize}})'
    
    _code = _code.replace("{{params.normalize}}", str(normalize))
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def precision(y_true=None, y_pred=None, average='binary', zero_division=0):
    """Compute precision (positive predictive value) for classification
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
    
    Parameters:
        average (select, default='binary'): 
        zero_division (select, default=0): 
    
    Returns:
        number: 
    """
    _imports = ['from sklearn.metrics import precision_score']
    _code = '{{outputs.score}} = precision_score({{inputs.y_true}}, {{inputs.y_pred}}, average="{{params.average}}", zero_division={{params.zero_division}})'
    
    _code = _code.replace("{{params.average}}", str(average))
    _code = _code.replace("{{params.zero_division}}", str(zero_division))
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def recall(y_true=None, y_pred=None, average='binary', zero_division=0):
    """Compute recall (sensitivity / true positive rate) for classification
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
    
    Parameters:
        average (select, default='binary'): 
        zero_division (select, default=0): 
    
    Returns:
        number: 
    """
    _imports = ['from sklearn.metrics import recall_score']
    _code = '{{outputs.score}} = recall_score({{inputs.y_true}}, {{inputs.y_pred}}, average="{{params.average}}", zero_division={{params.zero_division}})'
    
    _code = _code.replace("{{params.average}}", str(average))
    _code = _code.replace("{{params.zero_division}}", str(zero_division))
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def f1_score(y_true=None, y_pred=None, average='binary'):
    """Compute the F1 score (harmonic mean of precision and recall)
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
    
    Parameters:
        average (select, default='binary'): 
    
    Returns:
        number: 
    """
    _imports = ['from sklearn.metrics import f1_score']
    _code = '{{outputs.score}} = f1_score({{inputs.y_true}}, {{inputs.y_pred}}, average="{{params.average}}")'
    
    _code = _code.replace("{{params.average}}", str(average))
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def auc_roc(y_true=None, y_score=None, multi_class='raise'):
    """Compute Area Under the Receiver Operating Characteristic curve
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_score (tensor) (required): 
    
    Parameters:
        multi_class (select, default='raise'): 
    
    Returns:
        dict with keys:
            score (number): 
            fpr (array): 
            tpr (array): 
    """
    _imports = ['from sklearn.metrics import roc_auc_score, roc_curve']
    _code = '{{outputs.score}} = roc_auc_score({{inputs.y_true}}, {{inputs.y_score}}, multi_class="{{params.multi_class}}")\n{{outputs.fpr}}, {{outputs.tpr}}, _ = roc_curve({{inputs.y_true}}, {{inputs.y_score}})'
    
    _code = _code.replace("{{params.multi_class}}", str(multi_class))
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_score}}", "y_score")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    _code = _code.replace("{{outputs.fpr}}", "_out_fpr")
    _code = _code.replace("{{outputs.tpr}}", "_out_tpr")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_score"] = y_score
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"score": _ns.get("_out_score"), "fpr": _ns.get("_out_fpr"), "tpr": _ns.get("_out_tpr")}


def auc_pr(y_true=None, y_score=None):
    """Compute Area Under the Precision-Recall curve
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_score (tensor) (required): 
    
    Returns:
        dict with keys:
            score (number): 
            precision_curve (array): 
            recall_curve (array): 
    """
    _imports = ['from sklearn.metrics import average_precision_score, precision_recall_curve']
    _code = '{{outputs.score}} = average_precision_score({{inputs.y_true}}, {{inputs.y_score}})\n{{outputs.precision_curve}}, {{outputs.recall_curve}}, _ = precision_recall_curve({{inputs.y_true}}, {{inputs.y_score}})'
    
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_score}}", "y_score")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    _code = _code.replace("{{outputs.precision_curve}}", "_out_precision_curve")
    _code = _code.replace("{{outputs.recall_curve}}", "_out_recall_curve")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_score"] = y_score
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"score": _ns.get("_out_score"), "precision_curve": _ns.get("_out_precision_curve"), "recall_curve": _ns.get("_out_recall_curve")}


def confusion_matrix(y_true=None, y_pred=None, normalize='none'):
    """Compute the confusion matrix for classification predictions
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
    
    Parameters:
        normalize (select, default='none'): 
    
    Returns:
        tensor: 
    """
    _imports = ['from sklearn.metrics import confusion_matrix']
    _code = '_norm = None if "{{params.normalize}}" == "none" else "{{params.normalize}}"\n{{outputs.matrix}} = confusion_matrix({{inputs.y_true}}, {{inputs.y_pred}}, normalize=_norm)'
    
    _code = _code.replace("{{params.normalize}}", str(normalize))
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{outputs.matrix}}", "_out_matrix")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_matrix")


def mcc(y_true=None, y_pred=None):
    """Compute Matthews Correlation Coefficient for balanced evaluation of binary classification
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
    
    Returns:
        number: 
    """
    _imports = ['from sklearn.metrics import matthews_corrcoef']
    _code = '{{outputs.score}} = matthews_corrcoef({{inputs.y_true}}, {{inputs.y_pred}})'
    
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def cohens_kappa(y_true=None, y_pred=None, weights='none'):
    """Compute Cohen's Kappa statistic measuring inter-rater agreement
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
    
    Parameters:
        weights (select, default='none'): 
    
    Returns:
        number: 
    """
    _imports = ['from sklearn.metrics import cohen_kappa_score']
    _code = '_w = None if "{{params.weights}}" == "none" else "{{params.weights}}"\n{{outputs.score}} = cohen_kappa_score({{inputs.y_true}}, {{inputs.y_pred}}, weights=_w)'
    
    _code = _code.replace("{{params.weights}}", str(weights))
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def rmse(y_true=None, y_pred=None):
    """Compute Root Mean Squared Error for regression tasks
    
    Dependencies: pip install numpy scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
    
    Returns:
        number: 
    """
    _imports = ['from sklearn.metrics import mean_squared_error', 'import numpy as np']
    _code = '{{outputs.score}} = np.sqrt(mean_squared_error({{inputs.y_true}}, {{inputs.y_pred}}))'
    
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def mae(y_true=None, y_pred=None):
    """Compute Mean Absolute Error for regression tasks
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
    
    Returns:
        number: 
    """
    _imports = ['from sklearn.metrics import mean_absolute_error']
    _code = '{{outputs.score}} = mean_absolute_error({{inputs.y_true}}, {{inputs.y_pred}})'
    
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def r2_score(y_true=None, y_pred=None):
    """Compute R-squared (coefficient of determination) for regression
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
    
    Returns:
        number: 
    """
    _imports = ['from sklearn.metrics import r2_score']
    _code = '{{outputs.score}} = r2_score({{inputs.y_true}}, {{inputs.y_pred}})'
    
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def mape(y_true=None, y_pred=None):
    """Compute Mean Absolute Percentage Error for regression tasks
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
    
    Returns:
        number: 
    """
    _imports = ['from sklearn.metrics import mean_absolute_percentage_error']
    _code = '{{outputs.score}} = mean_absolute_percentage_error({{inputs.y_true}}, {{inputs.y_pred}})'
    
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def explained_variance(y_true=None, y_pred=None):
    """Compute explained variance regression score
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
    
    Returns:
        number: 
    """
    _imports = ['from sklearn.metrics import explained_variance_score']
    _code = '{{outputs.score}} = explained_variance_score({{inputs.y_true}}, {{inputs.y_pred}})'
    
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def bleu_score(references=None, hypotheses=None, max_ngram=4, smoothing=True):
    """Compute BLEU score for evaluating machine translation and text generation quality
    
    Dependencies: pip install nltk
    
    Args:
        references (text_list) (required): 
        hypotheses (text_list) (required): 
    
    Parameters:
        max_ngram (select, default=4): 
        smoothing (boolean, default=True): 
    
    Returns:
        number: 
    """
    _imports = ['from nltk.translate.bleu_score import corpus_bleu, SmoothingFunction']
    _code = '_refs = [[r.split()] for r in {{inputs.references}}]\n_hyps = [h.split() for h in {{inputs.hypotheses}}]\n_smooth = SmoothingFunction().method1 if {{params.smoothing}} else None\n_weights = tuple([1.0 / {{params.max_ngram}}] * {{params.max_ngram}})\n{{outputs.score}} = corpus_bleu(_refs, _hyps, weights=_weights, smoothing_function=_smooth)'
    
    _code = _code.replace("{{params.max_ngram}}", str(max_ngram))
    _code = _code.replace("{{params.smoothing}}", str(smoothing))
    _code = _code.replace("{{inputs.references}}", "references")
    _code = _code.replace("{{inputs.hypotheses}}", "hypotheses")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["references"] = references
    _ns["hypotheses"] = hypotheses
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def rouge_score(references=None, hypotheses=None, rouge_types=['rouge1', 'rouge2', 'rougeL']):
    """Compute ROUGE scores (ROUGE-1, ROUGE-2, ROUGE-L) for summarization evaluation
    
    Dependencies: pip install rouge-score
    
    Args:
        references (text_list) (required): 
        hypotheses (text_list) (required): 
    
    Parameters:
        rouge_types (multiselect, default=['rouge1', 'rouge2', 'rougeL']): 
    
    Returns:
        dict: 
    """
    _imports = ['from rouge_score import rouge_scorer']
    _code = '_scorer = rouge_scorer.RougeScorer({{params.rouge_types}}, use_stemmer=True)\n_agg = { "k": [] for k in {{params.rouge_types}}}\nfor _ref, _hyp in zip({{inputs.references}}, {{inputs.hypotheses}}):\n    _s = _scorer.score(_ref, _hyp)\n    for _k in {{params.rouge_types}}:\n        _agg[_k].append(_s[_k].fmeasure)\n{{outputs.scores}} = { "_k": sum(_v) / len(_v) for _k, _v in _agg.items()}'
    
    _code = _code.replace("{{params.rouge_types}}", str(rouge_types))
    _code = _code.replace("{{inputs.references}}", "references")
    _code = _code.replace("{{inputs.hypotheses}}", "hypotheses")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["references"] = references
    _ns["hypotheses"] = hypotheses
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_scores")


def meteor_score(references=None, hypotheses=None):
    """Compute METEOR score for machine translation evaluation with synonym and stemming support
    
    Dependencies: pip install nltk
    
    Args:
        references (text_list) (required): 
        hypotheses (text_list) (required): 
    
    Returns:
        number: 
    """
    _imports = ['from nltk.translate.meteor_score import meteor_score', 'import nltk']
    _code = 'nltk.download("wordnet", quiet=True)\n_scores = [meteor_score([_r.split()], _h.split()) for _r, _h in zip({{inputs.references}}, {{inputs.hypotheses}})]\n{{outputs.score}} = sum(_scores) / len(_scores)'
    
    _code = _code.replace("{{inputs.references}}", "references")
    _code = _code.replace("{{inputs.hypotheses}}", "hypotheses")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["references"] = references
    _ns["hypotheses"] = hypotheses
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def bertscore(references=None, hypotheses=None, model_type='microsoft/deberta-xlarge-mnli', lang='en'):
    """Compute BERTScore using contextual embeddings for semantic text similarity evaluation
    
    Dependencies: pip install bert-score
    
    Args:
        references (text_list) (required): 
        hypotheses (text_list) (required): 
    
    Parameters:
        model_type (string, default='microsoft/deberta-xlarge-mnli'): 
        lang (string, default='en'): 
    
    Returns:
        dict with keys:
            precision (array): 
            recall (array): 
            f1 (array): 
    """
    _imports = ['from bert_score import score as bert_score_fn']
    _code = '{{outputs.precision}}, {{outputs.recall}}, {{outputs.f1}} = bert_score_fn({{inputs.hypotheses}}, {{inputs.references}}, model_type="{{params.model_type}}", lang="{{params.lang}}")\n{{outputs.precision}} = {{outputs.precision}}.tolist()\n{{outputs.recall}} = {{outputs.recall}}.tolist()\n{{outputs.f1}} = {{outputs.f1}}.tolist()'
    
    _code = _code.replace("{{params.model_type}}", str(model_type))
    _code = _code.replace("{{params.lang}}", str(lang))
    _code = _code.replace("{{inputs.references}}", "references")
    _code = _code.replace("{{inputs.hypotheses}}", "hypotheses")
    _code = _code.replace("{{outputs.precision}}", "_out_precision")
    _code = _code.replace("{{outputs.recall}}", "_out_recall")
    _code = _code.replace("{{outputs.f1}}", "_out_f1")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["references"] = references
    _ns["hypotheses"] = hypotheses
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"precision": _ns.get("_out_precision"), "recall": _ns.get("_out_recall"), "f1": _ns.get("_out_f1")}


def perplexity(model=None, tokenizer=None, texts=None, max_length=512):
    """Compute perplexity of a language model on a given text corpus
    
    Dependencies: pip install torch
    
    Args:
        model (model) (required): 
        tokenizer (tokenizer) (required): 
        texts (text_list) (required): 
    
    Parameters:
        max_length (number, default=512): 
    
    Returns:
        number: 
    """
    _imports = ['import torch', 'import math']
    _code = '{{inputs.model}}.eval()\n_total_loss, _total_tokens = 0.0, 0\nwith torch.no_grad():\n    for _text in {{inputs.texts}}:\n        _enc = {{inputs.tokenizer}}(_text, return_tensors="pt", truncation=True, max_length={{params.max_length}})\n        _ids = _enc.input_ids.to(next({{inputs.model}}.parameters()).device)\n        _out = {{inputs.model}}(_ids, labels=_ids)\n        _total_loss += _out.loss.item() * _ids.shape[1]\n        _total_tokens += _ids.shape[1]\n{{outputs.score}} = math.exp(_total_loss / _total_tokens)'
    
    _code = _code.replace("{{params.max_length}}", str(max_length))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{inputs.texts}}", "texts")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["tokenizer"] = tokenizer
    _ns["texts"] = texts
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def exact_match(references=None, predictions=None, normalize=True):
    """Compute the exact match accuracy between predicted and reference strings
    
    Args:
        references (text_list) (required): 
        predictions (text_list) (required): 
    
    Parameters:
        normalize (boolean, default=True): Lowercase and strip whitespace before comparison
    
    Returns:
        number: 
    """
    _imports = []
    _code = 'def _normalize(s):\n    return s.strip().lower() if {{params.normalize}} else s\n_matches = sum(1 for _r, _p in zip({{inputs.references}}, {{inputs.predictions}}) if _normalize(_r) == _normalize(_p))\n{{outputs.score}} = _matches / len({{inputs.references}})'
    
    _code = _code.replace("{{params.normalize}}", str(normalize))
    _code = _code.replace("{{inputs.references}}", "references")
    _code = _code.replace("{{inputs.predictions}}", "predictions")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["references"] = references
    _ns["predictions"] = predictions
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def pass_at_k(num_samples=None, num_correct=None, k=1):
    """Compute pass@k metric for code generation evaluation (probability at least one of k samples passes)
    
    Dependencies: pip install numpy
    
    Args:
        num_samples (array) (required): 
        num_correct (array) (required): 
    
    Parameters:
        k (number, default=1): 
    
    Returns:
        number: 
    """
    _imports = ['import numpy as np', 'from math import comb']
    _code = 'def _pass_at_k(n, c, k):\n    if n - c < k:\n        return 1.0\n    return 1.0 - comb(n - c, k) / comb(n, k)\n_scores = [_pass_at_k(int(n), int(c), {{params.k}}) for n, c in zip({{inputs.num_samples}}, {{inputs.num_correct}})]\n{{outputs.score}} = np.mean(_scores).item()'
    
    _code = _code.replace("{{params.k}}", str(k))
    _code = _code.replace("{{inputs.num_samples}}", "num_samples")
    _code = _code.replace("{{inputs.num_correct}}", "num_correct")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["num_samples"] = num_samples
    _ns["num_correct"] = num_correct
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def humaneval(model=None, tokenizer=None, num_samples=1, temperature=0.8, max_tokens=512):
    """Run the HumanEval benchmark for code generation models with sandboxed execution
    
    Dependencies: pip install human_eval
    
    Args:
        model (model) (required): 
        tokenizer (tokenizer) (required): 
    
    Parameters:
        num_samples (number, default=1): 
        temperature (number, default=0.8): 
        max_tokens (number, default=512): 
    
    Returns:
        dict: 
    """
    _imports = ['from human_eval.data import read_problems', 'from human_eval.evaluation import evaluate_functional_correctness', 'import json', 'import tempfile']
    _code = '_problems = read_problems()\n_samples = []\n{{inputs.model}}.eval()\nfor _task_id, _problem in _problems.items():\n    for _ in range({{params.num_samples}}):\n        _enc = {{inputs.tokenizer}}(_problem["prompt"], return_tensors="pt")\n        _out = {{inputs.model}}.generate(**_enc, max_new_tokens={{params.max_tokens}}, temperature={{params.temperature}}, do_sample=True)\n        _completion = {{inputs.tokenizer}}.decode(_out[0][_enc.input_ids.shape[1]:], skip_special_tokens=True)\n        _samples.append({"task_id": _task_id, "completion": _completion})\nwith tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False) as _f:\n    for _s in _samples:\n        _f.write(json.dumps(_s) + "\\\\n")\n    _sample_file = _f.name\n{{outputs.results}} = evaluate_functional_correctness(_sample_file)'
    
    _code = _code.replace("{{params.num_samples}}", str(num_samples))
    _code = _code.replace("{{params.temperature}}", str(temperature))
    _code = _code.replace("{{params.max_tokens}}", str(max_tokens))
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.tokenizer}}", "tokenizer")
    _code = _code.replace("{{outputs.results}}", "_out_results")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["tokenizer"] = tokenizer
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_results")


def map_object_detection(preds=None, targets=None, iou_thresholds='0.5,0.75'):
    """Compute mean Average Precision for object detection models
    
    Dependencies: pip install torchmetrics
    
    Args:
        preds (list) (required): List of dicts with boxes, scores, labels
        targets (list) (required): List of dicts with boxes, labels
    
    Parameters:
        iou_thresholds (string, default='0.5,0.75'): Comma-separated IoU thresholds
    
    Returns:
        dict with keys:
            map_score (number): 
            map_50 (number): 
    """
    _imports = ['from torchmetrics.detection.mean_ap import MeanAveragePrecision']
    _code = '_metric = MeanAveragePrecision()\n_metric.update({{inputs.preds}}, {{inputs.targets}})\n_result = _metric.compute()\n{{outputs.map_score}} = _result["map"].item()\n{{outputs.map_50}} = _result["map_50"].item()'
    
    _code = _code.replace("{{params.iou_thresholds}}", str(iou_thresholds))
    _code = _code.replace("{{inputs.preds}}", "preds")
    _code = _code.replace("{{inputs.targets}}", "targets")
    _code = _code.replace("{{outputs.map_score}}", "_out_map_score")
    _code = _code.replace("{{outputs.map_50}}", "_out_map_50")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["preds"] = preds
    _ns["targets"] = targets
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"map_score": _ns.get("_out_map_score"), "map_50": _ns.get("_out_map_50")}


def iou(preds=None, targets=None, num_classes=2, task='binary'):
    """Compute Intersection over Union for segmentation or detection evaluation
    
    Dependencies: pip install torchmetrics
    
    Args:
        preds (tensor) (required): 
        targets (tensor) (required): 
    
    Parameters:
        num_classes (number, default=2): 
        task (select, default='binary'): 
    
    Returns:
        number: 
    """
    _imports = ['from torchmetrics.classification import BinaryJaccardIndex, MulticlassJaccardIndex']
    _code = 'if "{{params.task}}" == "binary":\n    _metric = BinaryJaccardIndex()\n "else":\n    _metric = MulticlassJaccardIndex(num_classes={{params.num_classes}})\n{{outputs.iou_score}} = _metric({{inputs.preds}}, {{inputs.targets}}).item()'
    
    _code = _code.replace("{{params.num_classes}}", str(num_classes))
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{inputs.preds}}", "preds")
    _code = _code.replace("{{inputs.targets}}", "targets")
    _code = _code.replace("{{outputs.iou_score}}", "_out_iou_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["preds"] = preds
    _ns["targets"] = targets
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_iou_score")


def fid(real_images=None, fake_images=None, feature_dim=2048):
    """Compute Frechet Inception Distance to evaluate quality of generated images
    
    Dependencies: pip install torchmetrics
    
    Args:
        real_images (image_batch) (required): 
        fake_images (image_batch) (required): 
    
    Parameters:
        feature_dim (select, default=2048): 
    
    Returns:
        number: 
    """
    _imports = ['from torchmetrics.image.fid import FrechetInceptionDistance']
    _code = '_fid = FrechetInceptionDistance(feature={{params.feature_dim}})\n_fid.update({{inputs.real_images}}, real=True)\n_fid.update({{inputs.fake_images}}, real=False)\n{{outputs.fid_score}} = _fid.compute().item()'
    
    _code = _code.replace("{{params.feature_dim}}", str(feature_dim))
    _code = _code.replace("{{inputs.real_images}}", "real_images")
    _code = _code.replace("{{inputs.fake_images}}", "fake_images")
    _code = _code.replace("{{outputs.fid_score}}", "_out_fid_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["real_images"] = real_images
    _ns["fake_images"] = fake_images
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_fid_score")


def is_score(images=None, splits=10):
    """Compute Inception Score to evaluate diversity and quality of generated images
    
    Dependencies: pip install torchmetrics
    
    Args:
        images (image_batch) (required): 
    
    Parameters:
        splits (number, default=10): 
    
    Returns:
        dict with keys:
            is_mean (number): 
            is_std (number): 
    """
    _imports = ['from torchmetrics.image.inception import InceptionScore']
    _code = '_is_metric = InceptionScore(splits={{params.splits}})\n_is_metric.update({{inputs.images}})\n_mean, _std = _is_metric.compute()\n{{outputs.is_mean}} = _mean.item()\n{{outputs.is_std}} = _std.item()'
    
    _code = _code.replace("{{params.splits}}", str(splits))
    _code = _code.replace("{{inputs.images}}", "images")
    _code = _code.replace("{{outputs.is_mean}}", "_out_is_mean")
    _code = _code.replace("{{outputs.is_std}}", "_out_is_std")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["images"] = images
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"is_mean": _ns.get("_out_is_mean"), "is_std": _ns.get("_out_is_std")}


def clip_score(images=None, texts=None, model_name='openai/clip-vit-base-patch32'):
    """Compute CLIP Score measuring alignment between images and text descriptions
    
    Dependencies: pip install torchmetrics
    
    Args:
        images (image_batch) (required): 
        texts (text_list) (required): 
    
    Parameters:
        model_name (string, default='openai/clip-vit-base-patch32'): 
    
    Returns:
        number: 
    """
    _imports = ['from torchmetrics.multimodal.clip_score import CLIPScore']
    _code = '_clip = CLIPScore(model_name_or_path="{{params.model_name}}")\n{{outputs.score}} = _clip({{inputs.images}}, {{inputs.texts}}).item()'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{inputs.images}}", "images")
    _code = _code.replace("{{inputs.texts}}", "texts")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["images"] = images
    _ns["texts"] = texts
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def wer(references=None, predictions=None):
    """Compute Word Error Rate for speech recognition evaluation
    
    Dependencies: pip install torchmetrics
    
    Args:
        references (text_list) (required): 
        predictions (text_list) (required): 
    
    Returns:
        number: 
    """
    _imports = ['from torchmetrics.text import WordErrorRate']
    _code = '_wer = WordErrorRate()\n{{outputs.score}} = _wer({{inputs.predictions}}, {{inputs.references}}).item()'
    
    _code = _code.replace("{{inputs.references}}", "references")
    _code = _code.replace("{{inputs.predictions}}", "predictions")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["references"] = references
    _ns["predictions"] = predictions
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def cer(references=None, predictions=None):
    """Compute Character Error Rate for speech recognition and OCR evaluation
    
    Dependencies: pip install torchmetrics
    
    Args:
        references (text_list) (required): 
        predictions (text_list) (required): 
    
    Returns:
        number: 
    """
    _imports = ['from torchmetrics.text import CharErrorRate']
    _code = '_cer = CharErrorRate()\n{{outputs.score}} = _cer({{inputs.predictions}}, {{inputs.references}}).item()'
    
    _code = _code.replace("{{inputs.references}}", "references")
    _code = _code.replace("{{inputs.predictions}}", "predictions")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["references"] = references
    _ns["predictions"] = predictions
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_score")


def diarization_der(reference=None, hypothesis=None, collar=0.25, skip_overlap=False):
    """Compute Diarization Error Rate for speaker diarization evaluation
    
    Dependencies: pip install pyannote
    
    Args:
        reference (any) (required): 
        hypothesis (any) (required): 
    
    Parameters:
        collar (number, default=0.25): 
        skip_overlap (boolean, default=False): 
    
    Returns:
        dict with keys:
            der (number): 
            details (dict): 
    """
    _imports = ['from pyannote.metrics.diarization import DiarizationErrorRate']
    _code = '_metric = DiarizationErrorRate(collar={{params.collar}}, skip_overlap={{params.skip_overlap}})\n{{outputs.der}} = _metric({{inputs.reference}}, {{inputs.hypothesis}})\n_detail = _metric[{{inputs.reference}}.uri]\n{{outputs.details}} = {"false_alarm": _detail["false alarm"], "missed_detection": _detail["missed detection"], "confusion": _detail["confusion"]}'
    
    _code = _code.replace("{{params.collar}}", str(collar))
    _code = _code.replace("{{params.skip_overlap}}", str(skip_overlap))
    _code = _code.replace("{{inputs.reference}}", "reference")
    _code = _code.replace("{{inputs.hypothesis}}", "hypothesis")
    _code = _code.replace("{{outputs.der}}", "_out_der")
    _code = _code.replace("{{outputs.details}}", "_out_details")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["reference"] = reference
    _ns["hypothesis"] = hypothesis
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"der": _ns.get("_out_der"), "details": _ns.get("_out_details")}


def calibration_plot(y_true=None, y_prob=None, n_bins=10, strategy='uniform'):
    """Generate a reliability diagram (calibration curve) for probabilistic predictions
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_prob (tensor) (required): 
    
    Parameters:
        n_bins (number, default=10): 
        strategy (select, default='uniform'): 
    
    Returns:
        dict with keys:
            fraction_of_positives (array): 
            mean_predicted_value (array): 
    """
    _imports = ['from sklearn.calibration import calibration_curve']
    _code = '{{outputs.fraction_of_positives}}, {{outputs.mean_predicted_value}} = calibration_curve({{inputs.y_true}}, {{inputs.y_prob}}, n_bins={{params.n_bins}}, strategy="{{params.strategy}}")'
    
    _code = _code.replace("{{params.n_bins}}", str(n_bins))
    _code = _code.replace("{{params.strategy}}", str(strategy))
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_prob}}", "y_prob")
    _code = _code.replace("{{outputs.fraction_of_positives}}", "_out_fraction_of_positives")
    _code = _code.replace("{{outputs.mean_predicted_value}}", "_out_mean_predicted_value")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_prob"] = y_prob
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"fraction_of_positives": _ns.get("_out_fraction_of_positives"), "mean_predicted_value": _ns.get("_out_mean_predicted_value")}


def ece(y_true=None, y_prob=None, n_bins=15, norm='l1'):
    """Compute Expected Calibration Error measuring how well predicted probabilities match actual frequencies
    
    Dependencies: pip install torchmetrics
    
    Args:
        y_true (tensor) (required): 
        y_prob (tensor) (required): 
    
    Parameters:
        n_bins (number, default=15): 
        norm (select, default='l1'): 
    
    Returns:
        number: 
    """
    _imports = ['from torchmetrics.classification import BinaryCalibrationError']
    _code = '_metric = BinaryCalibrationError(n_bins={{params.n_bins}}, norm="{{params.norm}}")\n{{outputs.ece}} = _metric({{inputs.y_prob}}, {{inputs.y_true}}).item()'
    
    _code = _code.replace("{{params.n_bins}}", str(n_bins))
    _code = _code.replace("{{params.norm}}", str(norm))
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_prob}}", "y_prob")
    _code = _code.replace("{{outputs.ece}}", "_out_ece")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_prob"] = y_prob
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_ece")


def fairness_metrics(y_true=None, y_pred=None, sensitive_attr=None, privileged_value='1'):
    """Compute fairness metrics including demographic parity, equalized odds, and disparate impact
    
    Dependencies: pip install numpy
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
        sensitive_attr (array) (required): 
    
    Parameters:
        privileged_value (string, default='1'): 
    
    Returns:
        dict: 
    """
    _imports = ['import numpy as np']
    _code = '_y_true = np.array({{inputs.y_true}})\n_y_pred = np.array({{inputs.y_pred}})\n_sensitive = np.array({{inputs.sensitive_attr}})\n_priv_mask = _sensitive == {{params.privileged_value}}\n_unpriv_mask = ~_priv_mask\n_priv_rate = _y_pred[_priv_mask].mean()\n_unpriv_rate = _y_pred[_unpriv_mask].mean()\n_demographic_parity = abs(_priv_rate - _unpriv_rate)\n_disparate_impact = _unpriv_rate / _priv_rate if _priv_rate > 0 else 0.0\n_priv_tpr = _y_pred[_priv_mask & (_y_true == 1)].mean() if (_priv_mask & (_y_true == 1)).any() else 0.0\n_unpriv_tpr = _y_pred[_unpriv_mask & (_y_true == 1)].mean() if (_unpriv_mask & (_y_true == 1)).any() else 0.0\n_equal_opportunity_diff = abs(_priv_tpr - _unpriv_tpr)\n{{outputs.metrics}} = {"demographic_parity_diff": float(_demographic_parity), "disparate_impact": float(_disparate_impact), "equal_opportunity_diff": float(_equal_opportunity_diff), "privileged_selection_rate": float(_priv_rate), "unprivileged_selection_rate": float(_unpriv_rate)}'
    
    _code = _code.replace("{{params.privileged_value}}", str(privileged_value))
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{inputs.sensitive_attr}}", "sensitive_attr")
    _code = _code.replace("{{outputs.metrics}}", "_out_metrics")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    _ns["sensitive_attr"] = sensitive_attr
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_metrics")


def bias_audit(y_true=None, y_pred=None, sensitive_features=None, metrics=['accuracy', 'selection_rate']):
    """Perform a comprehensive bias audit across multiple sensitive attributes and generate a report
    
    Dependencies: pip install numpy scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
        sensitive_features (dataframe) (required): 
    
    Parameters:
        metrics (multiselect, default=['accuracy', 'selection_rate']): 
    
    Returns:
        dict: 
    """
    _imports = ['import numpy as np', 'from sklearn.metrics import accuracy_score']
    _code = '_y_true = np.array({{inputs.y_true}})\n_y_pred = np.array({{inputs.y_pred}})\n_report = {}\nfor _col in {{inputs.sensitive_features}}.columns:\n    _groups = {{inputs.sensitive_features}}[_col].unique()\n    _col_report = {}\n    for _g in _groups:\n        _mask = ({{inputs.sensitive_features}}[_col] == _g).values\n        _group_metrics = {}\n        if "accuracy" in {{params.metrics}}:\n            _group_metrics["accuracy"] = float(accuracy_score(_y_true[_mask], _y_pred[_mask]))\n        if "selection_rate" in {{params.metrics}}:\n            _group_metrics["selection_rate"] = float(_y_pred[_mask].mean())\n        if "tpr" in {{params.metrics}}:\n            _pos = _mask & (_y_true == 1)\n            _group_metrics["tpr"] = float(_y_pred[_pos].mean()) if _pos.any() else 0.0\n        if "fpr" in {{params.metrics}}:\n            _neg = _mask & (_y_true == 0)\n            _group_metrics["fpr"] = float(_y_pred[_neg].mean()) if _neg.any() else 0.0\n        _col_report[str(_g)] = _group_metrics\n    _report[_col] = _col_report\n{{outputs.report}} = _report'
    
    _code = _code.replace("{{params.metrics}}", str(metrics))
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{inputs.sensitive_features}}", "sensitive_features")
    _code = _code.replace("{{outputs.report}}", "_out_report")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    _ns["sensitive_features"] = sensitive_features
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_report")


def llm_as_judge(responses=None, prompts=None, references=None, model='gpt-4', criteria='helpfulness, correctness, clarity', scale_min=1, scale_max=5, api_key_env='OPENAI_API_KEY'):
    """Use a large language model to evaluate text quality, helpfulness, or correctness
    
    Dependencies: pip install openai
    
    Args:
        responses (text_list) (required): 
        prompts (text_list): 
        references (text_list): 
    
    Parameters:
        model (string, default='gpt-4'): 
        criteria (string, default='helpfulness, correctness, clarity'): 
        scale_min (number, default=1): 
        scale_max (number, default=5): 
        api_key_env (string, default='OPENAI_API_KEY'): 
    
    Returns:
        dict with keys:
            scores (array): 
            explanations (text_list): 
    """
    _imports = ['import openai', 'import os', 'import json']
    _code = '_client = openai.OpenAI(api_key=os.environ["{{params.api_key_env}}"])\n_scores, _explanations = [], []\nfor _idx, _resp in enumerate({{inputs.responses}}):\n    _prompt_ctx = f"Prompt: {{{inputs.prompts}}[_idx]}\\\\n" if {{inputs.prompts}} else ""\n    _ref_ctx = f"Reference: {{{inputs.references}}[_idx]}\\\\n" if {{inputs.references}} else ""\n    _msg = f"""{_prompt_ctx}{_ref_ctx}Response: {_resp}\n\nEvaluate this response on: {{params.criteria}}.\nReturn JSON: {{"score": <int {{params.scale_min}}-{{params.scale_max}}>, "explanation": "<brief reason>"}}"""\n    _completion = _client.chat.completions.create(model="{{params.model}}", messages=[{"role": "system", "content": "You are an impartial evaluator."}, {"role": "user", "content": _msg}], temperature=0)\n    _parsed = json.loads(_completion.choices[0].message.content)\n    _scores.append(_parsed["score"])\n    _explanations.append(_parsed["explanation"])\n{{outputs.scores}} = _scores\n{{outputs.explanations}} = _explanations'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.criteria}}", str(criteria))
    _code = _code.replace("{{params.scale_min}}", str(scale_min))
    _code = _code.replace("{{params.scale_max}}", str(scale_max))
    _code = _code.replace("{{params.api_key_env}}", str(api_key_env))
    _code = _code.replace("{{inputs.responses}}", "responses")
    _code = _code.replace("{{inputs.prompts}}", "prompts")
    _code = _code.replace("{{inputs.references}}", "references")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    _code = _code.replace("{{outputs.explanations}}", "_out_explanations")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["responses"] = responses
    _ns["prompts"] = prompts
    _ns["references"] = references
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"scores": _ns.get("_out_scores"), "explanations": _ns.get("_out_explanations")}


def human_eval_collect(annotations_path=None, agg_method='mean', format='json'):
    """Collect and aggregate human evaluation scores from annotators with inter-rater agreement
    
    Dependencies: pip install numpy scikit-learn
    
    Args:
        annotations_path (path) (required): 
    
    Parameters:
        agg_method (select, default='mean'): 
        format (select, default='json'): 
    
    Returns:
        dict with keys:
            aggregated (dict): 
            agreement (number): 
    """
    _imports = ['import json', 'import csv', 'import numpy as np', 'from sklearn.metrics import cohen_kappa_score']
    _code = 'if "{{params.format}}" == "json":\n    with open({{inputs.annotations_path}}) as _f:\n        _data = json.load(_f)\n "else":\n    with open({{inputs.annotations_path}}) as _f:\n        _data = list(csv.DictReader(_f))\n_by_item = {}\nfor _ann in _data:\n    _item_id = _ann["item_id"]\n    if _item_id not in _by_item:\n        _by_item[_item_id] = []\n    _by_item[_item_id].append(float(_ann["score"]))\n_agg = {}\nfor _item_id, _scores in _by_item.items():\n    if "{{params.agg_method}}" == "mean":\n        _agg[_item_id] = float(np.mean(_scores))\n    elif "{{params.agg_method}}" == "median":\n        _agg[_item_id] = float(np.median(_scores))\n "else":\n        _vals, _counts = np.unique(_scores, return_counts=True)\n        _agg[_item_id] = float(_vals[np.argmax(_counts)])\n_pairs = [(s[0], s[1]) for s in _by_item.values() if len(s) >= 2]\nif _pairs:\n    _a1, _a2 = zip(*_pairs)\n    {{outputs.agreement}} = float(cohen_kappa_score(np.round(_a1), np.round(_a2)))\n "else":\n    {{outputs.agreement}} = 0.0\n{{outputs.aggregated}} = _agg'
    
    _code = _code.replace("{{params.agg_method}}", str(agg_method))
    _code = _code.replace("{{params.format}}", str(format))
    _code = _code.replace("{{inputs.annotations_path}}", "annotations_path")
    _code = _code.replace("{{outputs.aggregated}}", "_out_aggregated")
    _code = _code.replace("{{outputs.agreement}}", "_out_agreement")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["annotations_path"] = annotations_path
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"aggregated": _ns.get("_out_aggregated"), "agreement": _ns.get("_out_agreement")}


def classification_report(y_true=None, y_pred=None, target_names='', digits=4):
    """Generate a comprehensive classification report with per-class precision, recall, and F1
    
    Dependencies: pip install scikit-learn
    
    Args:
        y_true (tensor) (required): 
        y_pred (tensor) (required): 
    
    Parameters:
        target_names (string, default=''): 
        digits (number, default=4): 
    
    Returns:
        dict with keys:
            report (dict): 
            report_str (text): 
    """
    _imports = ['from sklearn.metrics import classification_report']
    _code = '_names = [n.strip() for n in "{{params.target_names}}".split(",") if n.strip()] or None\n{{outputs.report_str}} = classification_report({{inputs.y_true}}, {{inputs.y_pred}}, target_names=_names, digits={{params.digits}})\n{{outputs.report}} = classification_report({{inputs.y_true}}, {{inputs.y_pred}}, target_names=_names, digits={{params.digits}}, output_dict=True)'
    
    _code = _code.replace("{{params.target_names}}", str(target_names))
    _code = _code.replace("{{params.digits}}", str(digits))
    _code = _code.replace("{{inputs.y_true}}", "y_true")
    _code = _code.replace("{{inputs.y_pred}}", "y_pred")
    _code = _code.replace("{{outputs.report}}", "_out_report")
    _code = _code.replace("{{outputs.report_str}}", "_out_report_str")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["y_true"] = y_true
    _ns["y_pred"] = y_pred
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"report": _ns.get("_out_report"), "report_str": _ns.get("_out_report_str")}

