import type { BlockDefinition } from "../types.js";

export const evaluationBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Accuracy
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.accuracy",
    name: "Accuracy",
    category: "evaluation",
    description: "Compute classification accuracy as the fraction of correct predictions",
    tags: ["evaluation", "classification", "accuracy", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Labels", type: "tensor", required: true },
    ],
    outputs: [
      { id: "score", name: "Accuracy Score", type: "number", required: true },
    ],
    parameters: [
      { id: "normalize", name: "Normalize (return fraction)", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.metrics import accuracy_score"],
      body: `{{outputs.score}} = accuracy_score({{inputs.y_true}}, {{inputs.y_pred}}, normalize={{params.normalize}})`,
      outputBindings: { score: "accuracy" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Precision
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.precision",
    name: "Precision",
    category: "evaluation",
    description: "Compute precision (positive predictive value) for classification",
    tags: ["evaluation", "classification", "precision", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Labels", type: "tensor", required: true },
    ],
    outputs: [
      { id: "score", name: "Precision Score", type: "number", required: true },
    ],
    parameters: [
      { id: "average", name: "Average", type: "select", default: "binary", options: [{ label: "Binary", value: "binary" }, { label: "Macro", value: "macro" }, { label: "Micro", value: "micro" }, { label: "Weighted", value: "weighted" }] },
      { id: "zero_division", name: "Zero Division", type: "select", default: 0, options: [{ label: "0", value: 0 }, { label: "1", value: 1 }] },
    ],
    codeTemplate: {
      imports: ["from sklearn.metrics import precision_score"],
      body: `{{outputs.score}} = precision_score({{inputs.y_true}}, {{inputs.y_pred}}, average="{{params.average}}", zero_division={{params.zero_division}})`,
      outputBindings: { score: "precision" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Recall
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.recall",
    name: "Recall",
    category: "evaluation",
    description: "Compute recall (sensitivity / true positive rate) for classification",
    tags: ["evaluation", "classification", "recall", "sensitivity", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Labels", type: "tensor", required: true },
    ],
    outputs: [
      { id: "score", name: "Recall Score", type: "number", required: true },
    ],
    parameters: [
      { id: "average", name: "Average", type: "select", default: "binary", options: [{ label: "Binary", value: "binary" }, { label: "Macro", value: "macro" }, { label: "Micro", value: "micro" }, { label: "Weighted", value: "weighted" }] },
      { id: "zero_division", name: "Zero Division", type: "select", default: 0, options: [{ label: "0", value: 0 }, { label: "1", value: 1 }] },
    ],
    codeTemplate: {
      imports: ["from sklearn.metrics import recall_score"],
      body: `{{outputs.score}} = recall_score({{inputs.y_true}}, {{inputs.y_pred}}, average="{{params.average}}", zero_division={{params.zero_division}})`,
      outputBindings: { score: "recall" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. F1 Score
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.f1-score",
    name: "F1 Score",
    category: "evaluation",
    description: "Compute the F1 score (harmonic mean of precision and recall)",
    tags: ["evaluation", "classification", "f1", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Labels", type: "tensor", required: true },
    ],
    outputs: [
      { id: "score", name: "F1 Score", type: "number", required: true },
    ],
    parameters: [
      { id: "average", name: "Average", type: "select", default: "binary", options: [{ label: "Binary", value: "binary" }, { label: "Macro", value: "macro" }, { label: "Micro", value: "micro" }, { label: "Weighted", value: "weighted" }] },
    ],
    codeTemplate: {
      imports: ["from sklearn.metrics import f1_score"],
      body: `{{outputs.score}} = f1_score({{inputs.y_true}}, {{inputs.y_pred}}, average="{{params.average}}")`,
      outputBindings: { score: "f1" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. AUC-ROC
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.auc-roc",
    name: "AUC-ROC",
    category: "evaluation",
    description: "Compute Area Under the Receiver Operating Characteristic curve",
    tags: ["evaluation", "classification", "auc", "roc", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_score", name: "Prediction Scores", type: "tensor", required: true },
    ],
    outputs: [
      { id: "score", name: "AUC-ROC Score", type: "number", required: true },
      { id: "fpr", name: "False Positive Rates", type: "array", required: true },
      { id: "tpr", name: "True Positive Rates", type: "array", required: true },
    ],
    parameters: [
      { id: "multi_class", name: "Multi-class Strategy", type: "select", default: "raise", options: [{ label: "Raise Error", value: "raise" }, { label: "OVR", value: "ovr" }, { label: "OVO", value: "ovo" }] },
    ],
    codeTemplate: {
      imports: ["from sklearn.metrics import roc_auc_score, roc_curve"],
      body: `{{outputs.score}} = roc_auc_score({{inputs.y_true}}, {{inputs.y_score}}, multi_class="{{params.multi_class}}")
{{outputs.fpr}}, {{outputs.tpr}}, _ = roc_curve({{inputs.y_true}}, {{inputs.y_score}})`,
      outputBindings: { score: "auc_roc", fpr: "roc_fpr", tpr: "roc_tpr" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. AUC-PR
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.auc-pr",
    name: "AUC-PR",
    category: "evaluation",
    description: "Compute Area Under the Precision-Recall curve",
    tags: ["evaluation", "classification", "auc", "precision-recall", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_score", name: "Prediction Scores", type: "tensor", required: true },
    ],
    outputs: [
      { id: "score", name: "AUC-PR Score", type: "number", required: true },
      { id: "precision_curve", name: "Precision Curve", type: "array", required: true },
      { id: "recall_curve", name: "Recall Curve", type: "array", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["from sklearn.metrics import average_precision_score, precision_recall_curve"],
      body: `{{outputs.score}} = average_precision_score({{inputs.y_true}}, {{inputs.y_score}})
{{outputs.precision_curve}}, {{outputs.recall_curve}}, _ = precision_recall_curve({{inputs.y_true}}, {{inputs.y_score}})`,
      outputBindings: { score: "auc_pr", precision_curve: "pr_precision", recall_curve: "pr_recall" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Confusion Matrix
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.confusion-matrix",
    name: "Confusion Matrix",
    category: "evaluation",
    description: "Compute the confusion matrix for classification predictions",
    tags: ["evaluation", "classification", "confusion-matrix", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Labels", type: "tensor", required: true },
    ],
    outputs: [
      { id: "matrix", name: "Confusion Matrix", type: "tensor", required: true },
    ],
    parameters: [
      { id: "normalize", name: "Normalize", type: "select", default: "none", options: [{ label: "None", value: "none" }, { label: "True (by row)", value: "true" }, { label: "Pred (by column)", value: "pred" }, { label: "All", value: "all" }] },
    ],
    codeTemplate: {
      imports: ["from sklearn.metrics import confusion_matrix"],
      body: `_norm = None if "{{params.normalize}}" == "none" else "{{params.normalize}}"
{{outputs.matrix}} = confusion_matrix({{inputs.y_true}}, {{inputs.y_pred}}, normalize=_norm)`,
      outputBindings: { matrix: "conf_matrix" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. MCC
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.mcc",
    name: "MCC",
    category: "evaluation",
    description: "Compute Matthews Correlation Coefficient for balanced evaluation of binary classification",
    tags: ["evaluation", "classification", "mcc", "matthews", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Labels", type: "tensor", required: true },
    ],
    outputs: [
      { id: "score", name: "MCC Score", type: "number", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["from sklearn.metrics import matthews_corrcoef"],
      body: `{{outputs.score}} = matthews_corrcoef({{inputs.y_true}}, {{inputs.y_pred}})`,
      outputBindings: { score: "mcc" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Cohen's Kappa
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.cohens-kappa",
    name: "Cohen's Kappa",
    category: "evaluation",
    description: "Compute Cohen's Kappa statistic measuring inter-rater agreement",
    tags: ["evaluation", "classification", "kappa", "agreement", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Labels", type: "tensor", required: true },
    ],
    outputs: [
      { id: "score", name: "Kappa Score", type: "number", required: true },
    ],
    parameters: [
      { id: "weights", name: "Weights", type: "select", default: "none", options: [{ label: "None", value: "none" }, { label: "Linear", value: "linear" }, { label: "Quadratic", value: "quadratic" }] },
    ],
    codeTemplate: {
      imports: ["from sklearn.metrics import cohen_kappa_score"],
      body: `_w = None if "{{params.weights}}" == "none" else "{{params.weights}}"
{{outputs.score}} = cohen_kappa_score({{inputs.y_true}}, {{inputs.y_pred}}, weights=_w)`,
      outputBindings: { score: "cohens_kappa" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. RMSE
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.rmse",
    name: "RMSE",
    category: "evaluation",
    description: "Compute Root Mean Squared Error for regression tasks",
    tags: ["evaluation", "regression", "rmse", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Values", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Values", type: "tensor", required: true },
    ],
    outputs: [
      { id: "score", name: "RMSE", type: "number", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["from sklearn.metrics import mean_squared_error", "import numpy as np"],
      body: `{{outputs.score}} = np.sqrt(mean_squared_error({{inputs.y_true}}, {{inputs.y_pred}}))`,
      outputBindings: { score: "rmse" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. MAE
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.mae",
    name: "MAE",
    category: "evaluation",
    description: "Compute Mean Absolute Error for regression tasks",
    tags: ["evaluation", "regression", "mae", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Values", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Values", type: "tensor", required: true },
    ],
    outputs: [
      { id: "score", name: "MAE", type: "number", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["from sklearn.metrics import mean_absolute_error"],
      body: `{{outputs.score}} = mean_absolute_error({{inputs.y_true}}, {{inputs.y_pred}})`,
      outputBindings: { score: "mae" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. R2 Score
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.r2-score",
    name: "R2 Score",
    category: "evaluation",
    description: "Compute R-squared (coefficient of determination) for regression",
    tags: ["evaluation", "regression", "r2", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Values", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Values", type: "tensor", required: true },
    ],
    outputs: [
      { id: "score", name: "R2 Score", type: "number", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["from sklearn.metrics import r2_score"],
      body: `{{outputs.score}} = r2_score({{inputs.y_true}}, {{inputs.y_pred}})`,
      outputBindings: { score: "r2" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. MAPE
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.mape",
    name: "MAPE",
    category: "evaluation",
    description: "Compute Mean Absolute Percentage Error for regression tasks",
    tags: ["evaluation", "regression", "mape", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Values", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Values", type: "tensor", required: true },
    ],
    outputs: [
      { id: "score", name: "MAPE", type: "number", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["from sklearn.metrics import mean_absolute_percentage_error"],
      body: `{{outputs.score}} = mean_absolute_percentage_error({{inputs.y_true}}, {{inputs.y_pred}})`,
      outputBindings: { score: "mape" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Explained Variance
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.explained-variance",
    name: "Explained Variance",
    category: "evaluation",
    description: "Compute explained variance regression score",
    tags: ["evaluation", "regression", "explained-variance", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Values", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Values", type: "tensor", required: true },
    ],
    outputs: [
      { id: "score", name: "Explained Variance", type: "number", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["from sklearn.metrics import explained_variance_score"],
      body: `{{outputs.score}} = explained_variance_score({{inputs.y_true}}, {{inputs.y_pred}})`,
      outputBindings: { score: "explained_variance" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. BLEU Score
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.bleu-score",
    name: "BLEU Score",
    category: "evaluation",
    description: "Compute BLEU score for evaluating machine translation and text generation quality",
    tags: ["evaluation", "nlp", "bleu", "translation", "nltk"],
    inputs: [
      { id: "references", name: "Reference Texts", type: "text_list", required: true },
      { id: "hypotheses", name: "Hypothesis Texts", type: "text_list", required: true },
    ],
    outputs: [
      { id: "score", name: "BLEU Score", type: "number", required: true },
    ],
    parameters: [
      { id: "max_ngram", name: "Max N-gram", type: "select", default: 4, options: [{ label: "1-gram", value: 1 }, { label: "2-gram", value: 2 }, { label: "3-gram", value: 3 }, { label: "4-gram", value: 4 }] },
      { id: "smoothing", name: "Smoothing", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from nltk.translate.bleu_score import corpus_bleu, SmoothingFunction"],
      body: `_refs = [[r.split()] for r in {{inputs.references}}]
_hyps = [h.split() for h in {{inputs.hypotheses}}]
_smooth = SmoothingFunction().method1 if {{params.smoothing}} else None
_weights = tuple([1.0 / {{params.max_ngram}}] * {{params.max_ngram}})
{{outputs.score}} = corpus_bleu(_refs, _hyps, weights=_weights, smoothing_function=_smooth)`,
      outputBindings: { score: "bleu_score" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. ROUGE Score
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.rouge-score",
    name: "ROUGE Score",
    category: "evaluation",
    description: "Compute ROUGE scores (ROUGE-1, ROUGE-2, ROUGE-L) for summarization evaluation",
    tags: ["evaluation", "nlp", "rouge", "summarization", "rouge_score"],
    inputs: [
      { id: "references", name: "Reference Texts", type: "text_list", required: true },
      { id: "hypotheses", name: "Hypothesis Texts", type: "text_list", required: true },
    ],
    outputs: [
      { id: "scores", name: "ROUGE Scores", type: "dict", required: true },
    ],
    parameters: [
      { id: "rouge_types", name: "ROUGE Types", type: "multiselect", default: ["rouge1", "rouge2", "rougeL"], options: [{ label: "ROUGE-1", value: "rouge1" }, { label: "ROUGE-2", value: "rouge2" }, { label: "ROUGE-L", value: "rougeL" }, { label: "ROUGE-Lsum", value: "rougeLsum" }] },
    ],
    codeTemplate: {
      imports: ["from rouge_score import rouge_scorer"],
      body: `_scorer = rouge_scorer.RougeScorer({{params.rouge_types}}, use_stemmer=True)
_agg = {k: [] for k in {{params.rouge_types}}}
for _ref, _hyp in zip({{inputs.references}}, {{inputs.hypotheses}}):
    _s = _scorer.score(_ref, _hyp)
    for _k in {{params.rouge_types}}:
        _agg[_k].append(_s[_k].fmeasure)
{{outputs.scores}} = {_k: sum(_v) / len(_v) for _k, _v in _agg.items()}`,
      outputBindings: { scores: "rouge_scores" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. METEOR Score
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.meteor-score",
    name: "METEOR Score",
    category: "evaluation",
    description: "Compute METEOR score for machine translation evaluation with synonym and stemming support",
    tags: ["evaluation", "nlp", "meteor", "translation", "nltk"],
    inputs: [
      { id: "references", name: "Reference Texts", type: "text_list", required: true },
      { id: "hypotheses", name: "Hypothesis Texts", type: "text_list", required: true },
    ],
    outputs: [
      { id: "score", name: "METEOR Score", type: "number", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["from nltk.translate.meteor_score import meteor_score", "import nltk"],
      body: `nltk.download("wordnet", quiet=True)
_scores = [meteor_score([_r.split()], _h.split()) for _r, _h in zip({{inputs.references}}, {{inputs.hypotheses}})]
{{outputs.score}} = sum(_scores) / len(_scores)`,
      outputBindings: { score: "meteor" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. BERTScore
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.bertscore",
    name: "BERTScore",
    category: "evaluation",
    description: "Compute BERTScore using contextual embeddings for semantic text similarity evaluation",
    tags: ["evaluation", "nlp", "bertscore", "semantic", "bert_score"],
    inputs: [
      { id: "references", name: "Reference Texts", type: "text_list", required: true },
      { id: "hypotheses", name: "Hypothesis Texts", type: "text_list", required: true },
    ],
    outputs: [
      { id: "precision", name: "Precision", type: "array", required: true },
      { id: "recall", name: "Recall", type: "array", required: true },
      { id: "f1", name: "F1", type: "array", required: true },
    ],
    parameters: [
      { id: "model_type", name: "Model Type", type: "string", default: "microsoft/deberta-xlarge-mnli", placeholder: "HuggingFace model name" },
      { id: "lang", name: "Language", type: "string", default: "en" },
    ],
    codeTemplate: {
      imports: ["from bert_score import score as bert_score_fn"],
      body: `{{outputs.precision}}, {{outputs.recall}}, {{outputs.f1}} = bert_score_fn({{inputs.hypotheses}}, {{inputs.references}}, model_type="{{params.model_type}}", lang="{{params.lang}}")
{{outputs.precision}} = {{outputs.precision}}.tolist()
{{outputs.recall}} = {{outputs.recall}}.tolist()
{{outputs.f1}} = {{outputs.f1}}.tolist()`,
      outputBindings: { precision: "bertscore_precision", recall: "bertscore_recall", f1: "bertscore_f1" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. Perplexity
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.perplexity",
    name: "Perplexity",
    category: "evaluation",
    description: "Compute perplexity of a language model on a given text corpus",
    tags: ["evaluation", "nlp", "perplexity", "language-model", "pytorch"],
    inputs: [
      { id: "model", name: "Language Model", type: "model", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
      { id: "texts", name: "Texts", type: "text_list", required: true },
    ],
    outputs: [
      { id: "score", name: "Perplexity", type: "number", required: true },
    ],
    parameters: [
      { id: "max_length", name: "Max Sequence Length", type: "number", default: 512, min: 32, max: 8192, step: 32 },
    ],
    codeTemplate: {
      imports: ["import torch", "import math"],
      body: `{{inputs.model}}.eval()
_total_loss, _total_tokens = 0.0, 0
with torch.no_grad():
    for _text in {{inputs.texts}}:
        _enc = {{inputs.tokenizer}}(_text, return_tensors="pt", truncation=True, max_length={{params.max_length}})
        _ids = _enc.input_ids.to(next({{inputs.model}}.parameters()).device)
        _out = {{inputs.model}}(_ids, labels=_ids)
        _total_loss += _out.loss.item() * _ids.shape[1]
        _total_tokens += _ids.shape[1]
{{outputs.score}} = math.exp(_total_loss / _total_tokens)`,
      outputBindings: { score: "perplexity" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. Exact Match
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.exact-match",
    name: "Exact Match",
    category: "evaluation",
    description: "Compute the exact match accuracy between predicted and reference strings",
    tags: ["evaluation", "nlp", "exact-match", "qa"],
    inputs: [
      { id: "references", name: "Reference Answers", type: "text_list", required: true },
      { id: "predictions", name: "Predicted Answers", type: "text_list", required: true },
    ],
    outputs: [
      { id: "score", name: "Exact Match Score", type: "number", required: true },
    ],
    parameters: [
      { id: "normalize", name: "Normalize Text", type: "boolean", default: true, description: "Lowercase and strip whitespace before comparison" },
    ],
    codeTemplate: {
      imports: [],
      body: `def _normalize(s):
    return s.strip().lower() if {{params.normalize}} else s
_matches = sum(1 for _r, _p in zip({{inputs.references}}, {{inputs.predictions}}) if _normalize(_r) == _normalize(_p))
{{outputs.score}} = _matches / len({{inputs.references}})`,
      outputBindings: { score: "exact_match" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. Pass@k (Code)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.pass-at-k",
    name: "Pass@k (Code)",
    category: "evaluation",
    description: "Compute pass@k metric for code generation evaluation (probability at least one of k samples passes)",
    tags: ["evaluation", "code", "pass-at-k", "generation"],
    inputs: [
      { id: "num_samples", name: "Num Samples per Problem", type: "array", required: true },
      { id: "num_correct", name: "Num Correct per Problem", type: "array", required: true },
    ],
    outputs: [
      { id: "score", name: "Pass@k Score", type: "number", required: true },
    ],
    parameters: [
      { id: "k", name: "k", type: "number", default: 1, min: 1, max: 100, step: 1 },
    ],
    codeTemplate: {
      imports: ["import numpy as np", "from math import comb"],
      body: `def _pass_at_k(n, c, k):
    if n - c < k:
        return 1.0
    return 1.0 - comb(n - c, k) / comb(n, k)
_scores = [_pass_at_k(int(n), int(c), {{params.k}}) for n, c in zip({{inputs.num_samples}}, {{inputs.num_correct}})]
{{outputs.score}} = np.mean(_scores).item()`,
      outputBindings: { score: "pass_at_k" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. HumanEval
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.humaneval",
    name: "HumanEval",
    category: "evaluation",
    description: "Run the HumanEval benchmark for code generation models with sandboxed execution",
    tags: ["evaluation", "code", "humaneval", "benchmark"],
    inputs: [
      { id: "model", name: "Code Generation Model", type: "model", required: true },
      { id: "tokenizer", name: "Tokenizer", type: "tokenizer", required: true },
    ],
    outputs: [
      { id: "results", name: "HumanEval Results", type: "dict", required: true },
    ],
    parameters: [
      { id: "num_samples", name: "Samples per Problem", type: "number", default: 1, min: 1, max: 200, step: 1 },
      { id: "temperature", name: "Temperature", type: "number", default: 0.8, min: 0.0, max: 2.0, step: 0.1 },
      { id: "max_tokens", name: "Max Tokens", type: "number", default: 512, min: 64, max: 2048, step: 64 },
    ],
    codeTemplate: {
      imports: ["from human_eval.data import read_problems", "from human_eval.evaluation import evaluate_functional_correctness", "import json", "import tempfile"],
      body: `_problems = read_problems()
_samples = []
{{inputs.model}}.eval()
for _task_id, _problem in _problems.items():
    for _ in range({{params.num_samples}}):
        _enc = {{inputs.tokenizer}}(_problem["prompt"], return_tensors="pt")
        _out = {{inputs.model}}.generate(**_enc, max_new_tokens={{params.max_tokens}}, temperature={{params.temperature}}, do_sample=True)
        _completion = {{inputs.tokenizer}}.decode(_out[0][_enc.input_ids.shape[1]:], skip_special_tokens=True)
        _samples.append({"task_id": _task_id, "completion": _completion})
with tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False) as _f:
    for _s in _samples:
        _f.write(json.dumps(_s) + "\\n")
    _sample_file = _f.name
{{outputs.results}} = evaluate_functional_correctness(_sample_file)`,
      outputBindings: { results: "humaneval_results" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 23. mAP (Object Detection)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.map-object-detection",
    name: "mAP (Object Detection)",
    category: "evaluation",
    description: "Compute mean Average Precision for object detection models",
    tags: ["evaluation", "vision", "map", "object-detection", "torchmetrics"],
    inputs: [
      { id: "preds", name: "Predictions", type: "list", required: true, description: "List of dicts with boxes, scores, labels" },
      { id: "targets", name: "Targets", type: "list", required: true, description: "List of dicts with boxes, labels" },
    ],
    outputs: [
      { id: "map_score", name: "mAP Score", type: "number", required: true },
      { id: "map_50", name: "mAP@50", type: "number", required: true },
    ],
    parameters: [
      { id: "iou_thresholds", name: "IoU Thresholds", type: "string", default: "0.5,0.75", description: "Comma-separated IoU thresholds" },
    ],
    codeTemplate: {
      imports: ["from torchmetrics.detection.mean_ap import MeanAveragePrecision"],
      body: `_metric = MeanAveragePrecision()
_metric.update({{inputs.preds}}, {{inputs.targets}})
_result = _metric.compute()
{{outputs.map_score}} = _result["map"].item()
{{outputs.map_50}} = _result["map_50"].item()`,
      outputBindings: { map_score: "map_score", map_50: "map_50" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 24. IoU
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.iou",
    name: "IoU",
    category: "evaluation",
    description: "Compute Intersection over Union for segmentation or detection evaluation",
    tags: ["evaluation", "vision", "iou", "segmentation", "torchmetrics"],
    inputs: [
      { id: "preds", name: "Predictions", type: "tensor", required: true },
      { id: "targets", name: "Targets", type: "tensor", required: true },
    ],
    outputs: [
      { id: "iou_score", name: "IoU Score", type: "number", required: true },
    ],
    parameters: [
      { id: "num_classes", name: "Number of Classes", type: "number", default: 2, min: 2, step: 1 },
      { id: "task", name: "Task", type: "select", default: "binary", options: [{ label: "Binary", value: "binary" }, { label: "Multiclass", value: "multiclass" }] },
    ],
    codeTemplate: {
      imports: ["from torchmetrics.classification import BinaryJaccardIndex, MulticlassJaccardIndex"],
      body: `if "{{params.task}}" == "binary":
    _metric = BinaryJaccardIndex()
else:
    _metric = MulticlassJaccardIndex(num_classes={{params.num_classes}})
{{outputs.iou_score}} = _metric({{inputs.preds}}, {{inputs.targets}}).item()`,
      outputBindings: { iou_score: "iou" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 25. FID (Image Gen)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.fid",
    name: "FID (Image Gen)",
    category: "evaluation",
    description: "Compute Frechet Inception Distance to evaluate quality of generated images",
    tags: ["evaluation", "vision", "fid", "generative", "torchmetrics"],
    inputs: [
      { id: "real_images", name: "Real Images", type: "image_batch", required: true },
      { id: "fake_images", name: "Generated Images", type: "image_batch", required: true },
    ],
    outputs: [
      { id: "fid_score", name: "FID Score", type: "number", required: true },
    ],
    parameters: [
      { id: "feature_dim", name: "Feature Dimension", type: "select", default: 2048, options: [{ label: "64", value: 64 }, { label: "192", value: 192 }, { label: "768", value: 768 }, { label: "2048", value: 2048 }] },
    ],
    codeTemplate: {
      imports: ["from torchmetrics.image.fid import FrechetInceptionDistance"],
      body: `_fid = FrechetInceptionDistance(feature={{params.feature_dim}})
_fid.update({{inputs.real_images}}, real=True)
_fid.update({{inputs.fake_images}}, real=False)
{{outputs.fid_score}} = _fid.compute().item()`,
      outputBindings: { fid_score: "fid" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 26. IS Score
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.is-score",
    name: "IS Score",
    category: "evaluation",
    description: "Compute Inception Score to evaluate diversity and quality of generated images",
    tags: ["evaluation", "vision", "inception-score", "generative", "torchmetrics"],
    inputs: [
      { id: "images", name: "Generated Images", type: "image_batch", required: true },
    ],
    outputs: [
      { id: "is_mean", name: "IS Mean", type: "number", required: true },
      { id: "is_std", name: "IS Std", type: "number", required: true },
    ],
    parameters: [
      { id: "splits", name: "Number of Splits", type: "number", default: 10, min: 1, max: 50, step: 1 },
    ],
    codeTemplate: {
      imports: ["from torchmetrics.image.inception import InceptionScore"],
      body: `_is_metric = InceptionScore(splits={{params.splits}})
_is_metric.update({{inputs.images}})
_mean, _std = _is_metric.compute()
{{outputs.is_mean}} = _mean.item()
{{outputs.is_std}} = _std.item()`,
      outputBindings: { is_mean: "inception_score_mean", is_std: "inception_score_std" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 27. CLIP Score
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.clip-score",
    name: "CLIP Score",
    category: "evaluation",
    description: "Compute CLIP Score measuring alignment between images and text descriptions",
    tags: ["evaluation", "vision", "clip", "multimodal", "torchmetrics"],
    inputs: [
      { id: "images", name: "Images", type: "image_batch", required: true },
      { id: "texts", name: "Text Descriptions", type: "text_list", required: true },
    ],
    outputs: [
      { id: "score", name: "CLIP Score", type: "number", required: true },
    ],
    parameters: [
      { id: "model_name", name: "CLIP Model", type: "string", default: "openai/clip-vit-base-patch32" },
    ],
    codeTemplate: {
      imports: ["from torchmetrics.multimodal.clip_score import CLIPScore"],
      body: `_clip = CLIPScore(model_name_or_path="{{params.model_name}}")
{{outputs.score}} = _clip({{inputs.images}}, {{inputs.texts}}).item()`,
      outputBindings: { score: "clip_score" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 28. WER (Speech)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.wer",
    name: "WER (Speech)",
    category: "evaluation",
    description: "Compute Word Error Rate for speech recognition evaluation",
    tags: ["evaluation", "speech", "wer", "asr", "torchmetrics"],
    inputs: [
      { id: "references", name: "Reference Transcripts", type: "text_list", required: true },
      { id: "predictions", name: "Predicted Transcripts", type: "text_list", required: true },
    ],
    outputs: [
      { id: "score", name: "WER", type: "number", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["from torchmetrics.text import WordErrorRate"],
      body: `_wer = WordErrorRate()
{{outputs.score}} = _wer({{inputs.predictions}}, {{inputs.references}}).item()`,
      outputBindings: { score: "wer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 29. CER (Speech)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.cer",
    name: "CER (Speech)",
    category: "evaluation",
    description: "Compute Character Error Rate for speech recognition and OCR evaluation",
    tags: ["evaluation", "speech", "cer", "asr", "torchmetrics"],
    inputs: [
      { id: "references", name: "Reference Transcripts", type: "text_list", required: true },
      { id: "predictions", name: "Predicted Transcripts", type: "text_list", required: true },
    ],
    outputs: [
      { id: "score", name: "CER", type: "number", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["from torchmetrics.text import CharErrorRate"],
      body: `_cer = CharErrorRate()
{{outputs.score}} = _cer({{inputs.predictions}}, {{inputs.references}}).item()`,
      outputBindings: { score: "cer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 30. Diarization DER
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.diarization-der",
    name: "Diarization DER",
    category: "evaluation",
    description: "Compute Diarization Error Rate for speaker diarization evaluation",
    tags: ["evaluation", "speech", "diarization", "der", "pyannote"],
    inputs: [
      { id: "reference", name: "Reference Annotation", type: "any", required: true },
      { id: "hypothesis", name: "Hypothesis Annotation", type: "any", required: true },
    ],
    outputs: [
      { id: "der", name: "DER", type: "number", required: true },
      { id: "details", name: "DER Details", type: "dict", required: true },
    ],
    parameters: [
      { id: "collar", name: "Collar (seconds)", type: "number", default: 0.25, min: 0.0, max: 5.0, step: 0.05 },
      { id: "skip_overlap", name: "Skip Overlap Regions", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["from pyannote.metrics.diarization import DiarizationErrorRate"],
      body: `_metric = DiarizationErrorRate(collar={{params.collar}}, skip_overlap={{params.skip_overlap}})
{{outputs.der}} = _metric({{inputs.reference}}, {{inputs.hypothesis}})
_detail = _metric[{{inputs.reference}}.uri]
{{outputs.details}} = {"false_alarm": _detail["false alarm"], "missed_detection": _detail["missed detection"], "confusion": _detail["confusion"]}`,
      outputBindings: { der: "diarization_error_rate", details: "der_details" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 31. Calibration Plot
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.calibration-plot",
    name: "Calibration Plot",
    category: "evaluation",
    description: "Generate a reliability diagram (calibration curve) for probabilistic predictions",
    tags: ["evaluation", "calibration", "reliability-diagram", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_prob", name: "Predicted Probabilities", type: "tensor", required: true },
    ],
    outputs: [
      { id: "fraction_of_positives", name: "Fraction of Positives", type: "array", required: true },
      { id: "mean_predicted_value", name: "Mean Predicted Value", type: "array", required: true },
    ],
    parameters: [
      { id: "n_bins", name: "Number of Bins", type: "number", default: 10, min: 2, max: 50, step: 1 },
      { id: "strategy", name: "Binning Strategy", type: "select", default: "uniform", options: [{ label: "Uniform", value: "uniform" }, { label: "Quantile", value: "quantile" }] },
    ],
    codeTemplate: {
      imports: ["from sklearn.calibration import calibration_curve"],
      body: `{{outputs.fraction_of_positives}}, {{outputs.mean_predicted_value}} = calibration_curve({{inputs.y_true}}, {{inputs.y_prob}}, n_bins={{params.n_bins}}, strategy="{{params.strategy}}")`,
      outputBindings: { fraction_of_positives: "cal_fraction_pos", mean_predicted_value: "cal_mean_pred" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 32. Expected Calibration Error (ECE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.ece",
    name: "Expected Calibration Error (ECE)",
    category: "evaluation",
    description: "Compute Expected Calibration Error measuring how well predicted probabilities match actual frequencies",
    tags: ["evaluation", "calibration", "ece", "torchmetrics"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_prob", name: "Predicted Probabilities", type: "tensor", required: true },
    ],
    outputs: [
      { id: "ece", name: "ECE", type: "number", required: true },
    ],
    parameters: [
      { id: "n_bins", name: "Number of Bins", type: "number", default: 15, min: 2, max: 100, step: 1 },
      { id: "norm", name: "Norm", type: "select", default: "l1", options: [{ label: "L1", value: "l1" }, { label: "L2", value: "l2" }, { label: "Max", value: "max" }] },
    ],
    codeTemplate: {
      imports: ["from torchmetrics.classification import BinaryCalibrationError"],
      body: `_metric = BinaryCalibrationError(n_bins={{params.n_bins}}, norm="{{params.norm}}")
{{outputs.ece}} = _metric({{inputs.y_prob}}, {{inputs.y_true}}).item()`,
      outputBindings: { ece: "expected_calibration_error" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 33. Fairness Metrics Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.fairness-metrics",
    name: "Fairness Metrics Block",
    category: "evaluation",
    description: "Compute fairness metrics including demographic parity, equalized odds, and disparate impact",
    tags: ["evaluation", "fairness", "bias", "equity", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Labels", type: "tensor", required: true },
      { id: "sensitive_attr", name: "Sensitive Attribute", type: "array", required: true },
    ],
    outputs: [
      { id: "metrics", name: "Fairness Metrics", type: "dict", required: true },
    ],
    parameters: [
      { id: "privileged_value", name: "Privileged Group Value", type: "string", default: "1" },
    ],
    codeTemplate: {
      imports: ["import numpy as np"],
      body: `_y_true = np.array({{inputs.y_true}})
_y_pred = np.array({{inputs.y_pred}})
_sensitive = np.array({{inputs.sensitive_attr}})
_priv_mask = _sensitive == {{params.privileged_value}}
_unpriv_mask = ~_priv_mask
_priv_rate = _y_pred[_priv_mask].mean()
_unpriv_rate = _y_pred[_unpriv_mask].mean()
_demographic_parity = abs(_priv_rate - _unpriv_rate)
_disparate_impact = _unpriv_rate / _priv_rate if _priv_rate > 0 else 0.0
_priv_tpr = _y_pred[_priv_mask & (_y_true == 1)].mean() if (_priv_mask & (_y_true == 1)).any() else 0.0
_unpriv_tpr = _y_pred[_unpriv_mask & (_y_true == 1)].mean() if (_unpriv_mask & (_y_true == 1)).any() else 0.0
_equal_opportunity_diff = abs(_priv_tpr - _unpriv_tpr)
{{outputs.metrics}} = {"demographic_parity_diff": float(_demographic_parity), "disparate_impact": float(_disparate_impact), "equal_opportunity_diff": float(_equal_opportunity_diff), "privileged_selection_rate": float(_priv_rate), "unprivileged_selection_rate": float(_unpriv_rate)}`,
      outputBindings: { metrics: "fairness_metrics" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 34. Bias Audit Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.bias-audit",
    name: "Bias Audit Block",
    category: "evaluation",
    description: "Perform a comprehensive bias audit across multiple sensitive attributes and generate a report",
    tags: ["evaluation", "bias", "audit", "fairness", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Labels", type: "tensor", required: true },
      { id: "sensitive_features", name: "Sensitive Features DataFrame", type: "dataframe", required: true },
    ],
    outputs: [
      { id: "report", name: "Bias Audit Report", type: "dict", required: true },
    ],
    parameters: [
      { id: "metrics", name: "Metrics to Audit", type: "multiselect", default: ["accuracy", "selection_rate"], options: [{ label: "Accuracy", value: "accuracy" }, { label: "Selection Rate", value: "selection_rate" }, { label: "True Positive Rate", value: "tpr" }, { label: "False Positive Rate", value: "fpr" }] },
    ],
    codeTemplate: {
      imports: ["import numpy as np", "from sklearn.metrics import accuracy_score"],
      body: `_y_true = np.array({{inputs.y_true}})
_y_pred = np.array({{inputs.y_pred}})
_report = {}
for _col in {{inputs.sensitive_features}}.columns:
    _groups = {{inputs.sensitive_features}}[_col].unique()
    _col_report = {}
    for _g in _groups:
        _mask = ({{inputs.sensitive_features}}[_col] == _g).values
        _group_metrics = {}
        if "accuracy" in {{params.metrics}}:
            _group_metrics["accuracy"] = float(accuracy_score(_y_true[_mask], _y_pred[_mask]))
        if "selection_rate" in {{params.metrics}}:
            _group_metrics["selection_rate"] = float(_y_pred[_mask].mean())
        if "tpr" in {{params.metrics}}:
            _pos = _mask & (_y_true == 1)
            _group_metrics["tpr"] = float(_y_pred[_pos].mean()) if _pos.any() else 0.0
        if "fpr" in {{params.metrics}}:
            _neg = _mask & (_y_true == 0)
            _group_metrics["fpr"] = float(_y_pred[_neg].mean()) if _neg.any() else 0.0
        _col_report[str(_g)] = _group_metrics
    _report[_col] = _col_report
{{outputs.report}} = _report`,
      outputBindings: { report: "bias_audit_report" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 35. LLM-as-Judge Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.llm-as-judge",
    name: "LLM-as-Judge Block",
    category: "evaluation",
    description: "Use a large language model to evaluate text quality, helpfulness, or correctness",
    tags: ["evaluation", "llm", "judge", "auto-eval", "openai"],
    inputs: [
      { id: "responses", name: "Responses to Judge", type: "text_list", required: true },
      { id: "prompts", name: "Original Prompts", type: "text_list", required: false },
      { id: "references", name: "Reference Answers", type: "text_list", required: false },
    ],
    outputs: [
      { id: "scores", name: "Judge Scores", type: "array", required: true },
      { id: "explanations", name: "Explanations", type: "text_list", required: true },
    ],
    parameters: [
      { id: "model", name: "Judge Model", type: "string", default: "gpt-4" },
      { id: "criteria", name: "Evaluation Criteria", type: "string", default: "helpfulness, correctness, clarity" },
      { id: "scale_min", name: "Score Min", type: "number", default: 1, min: 0, max: 100, step: 1 },
      { id: "scale_max", name: "Score Max", type: "number", default: 5, min: 1, max: 100, step: 1 },
      { id: "api_key_env", name: "API Key Env Var", type: "string", default: "OPENAI_API_KEY" },
    ],
    codeTemplate: {
      imports: ["import openai", "import os", "import json"],
      body: `_client = openai.OpenAI(api_key=os.environ["{{params.api_key_env}}"])
_scores, _explanations = [], []
for _idx, _resp in enumerate({{inputs.responses}}):
    _prompt_ctx = f"Prompt: {{{inputs.prompts}}[_idx]}\\n" if {{inputs.prompts}} else ""
    _ref_ctx = f"Reference: {{{inputs.references}}[_idx]}\\n" if {{inputs.references}} else ""
    _msg = f"""{_prompt_ctx}{_ref_ctx}Response: {_resp}

Evaluate this response on: {{params.criteria}}.
Return JSON: {{"score": <int {{params.scale_min}}-{{params.scale_max}}>, "explanation": "<brief reason>"}}"""
    _completion = _client.chat.completions.create(model="{{params.model}}", messages=[{"role": "system", "content": "You are an impartial evaluator."}, {"role": "user", "content": _msg}], temperature=0)
    _parsed = json.loads(_completion.choices[0].message.content)
    _scores.append(_parsed["score"])
    _explanations.append(_parsed["explanation"])
{{outputs.scores}} = _scores
{{outputs.explanations}} = _explanations`,
      outputBindings: { scores: "judge_scores", explanations: "judge_explanations" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 36. Human Eval Collect
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.human-eval-collect",
    name: "Human Eval Collect",
    category: "evaluation",
    description: "Collect and aggregate human evaluation scores from annotators with inter-rater agreement",
    tags: ["evaluation", "human", "annotation", "inter-rater", "agreement"],
    inputs: [
      { id: "annotations_path", name: "Annotations File Path", type: "path", required: true },
    ],
    outputs: [
      { id: "aggregated", name: "Aggregated Scores", type: "dict", required: true },
      { id: "agreement", name: "Inter-Rater Agreement", type: "number", required: true },
    ],
    parameters: [
      { id: "agg_method", name: "Aggregation Method", type: "select", default: "mean", options: [{ label: "Mean", value: "mean" }, { label: "Median", value: "median" }, { label: "Majority Vote", value: "majority" }] },
      { id: "format", name: "File Format", type: "select", default: "json", options: [{ label: "JSON", value: "json" }, { label: "CSV", value: "csv" }] },
    ],
    codeTemplate: {
      imports: ["import json", "import csv", "import numpy as np", "from sklearn.metrics import cohen_kappa_score"],
      body: `if "{{params.format}}" == "json":
    with open({{inputs.annotations_path}}) as _f:
        _data = json.load(_f)
else:
    with open({{inputs.annotations_path}}) as _f:
        _data = list(csv.DictReader(_f))
_by_item = {}
for _ann in _data:
    _item_id = _ann["item_id"]
    if _item_id not in _by_item:
        _by_item[_item_id] = []
    _by_item[_item_id].append(float(_ann["score"]))
_agg = {}
for _item_id, _scores in _by_item.items():
    if "{{params.agg_method}}" == "mean":
        _agg[_item_id] = float(np.mean(_scores))
    elif "{{params.agg_method}}" == "median":
        _agg[_item_id] = float(np.median(_scores))
    else:
        _vals, _counts = np.unique(_scores, return_counts=True)
        _agg[_item_id] = float(_vals[np.argmax(_counts)])
_pairs = [(s[0], s[1]) for s in _by_item.values() if len(s) >= 2]
if _pairs:
    _a1, _a2 = zip(*_pairs)
    {{outputs.agreement}} = float(cohen_kappa_score(np.round(_a1), np.round(_a2)))
else:
    {{outputs.agreement}} = 0.0
{{outputs.aggregated}} = _agg`,
      outputBindings: { aggregated: "human_eval_scores", agreement: "inter_rater_agreement" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 37. Classification Report
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "evaluation.classification-report",
    name: "Classification Report",
    category: "evaluation",
    description: "Generate a comprehensive classification report with per-class precision, recall, and F1",
    tags: ["evaluation", "classification", "report", "per-class", "sklearn"],
    inputs: [
      { id: "y_true", name: "True Labels", type: "tensor", required: true },
      { id: "y_pred", name: "Predicted Labels", type: "tensor", required: true },
    ],
    outputs: [
      { id: "report", name: "Report Dict", type: "dict", required: true },
      { id: "report_str", name: "Report String", type: "text", required: true },
    ],
    parameters: [
      { id: "target_names", name: "Class Names (comma-separated)", type: "string", default: "", placeholder: "cat,dog,bird" },
      { id: "digits", name: "Decimal Digits", type: "number", default: 4, min: 1, max: 8, step: 1 },
    ],
    codeTemplate: {
      imports: ["from sklearn.metrics import classification_report"],
      body: `_names = [n.strip() for n in "{{params.target_names}}".split(",") if n.strip()] or None
{{outputs.report_str}} = classification_report({{inputs.y_true}}, {{inputs.y_pred}}, target_names=_names, digits={{params.digits}})
{{outputs.report}} = classification_report({{inputs.y_true}}, {{inputs.y_pred}}, target_names=_names, digits={{params.digits}}, output_dict=True)`,
      outputBindings: { report: "classification_report_dict", report_str: "classification_report_str" },
    },
  },
];
