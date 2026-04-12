import type { BlockDefinition } from "../types.js";

export const classicalMlBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Linear Regression
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.linear-regression",
    name: "Linear Regression",
    category: "classical-ml",
    description: "Ordinary least-squares linear regression model",
    tags: ["regression", "linear", "ols", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true, description: "Training feature matrix" },
      { id: "y_train", name: "y Train", type: "array", required: true, description: "Training target vector" },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "fit_intercept", name: "Fit Intercept", type: "boolean", default: true, description: "Whether to calculate the intercept" },
      { id: "normalize", name: "Normalize", type: "boolean", default: false, description: "Normalize regressors before fitting", advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.linear_model import LinearRegression"],
      body: `{{outputs.model}} = LinearRegression(fit_intercept={{params.fit_intercept}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "linear_reg_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Ridge Regression
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.ridge-regression",
    name: "Ridge Regression",
    category: "classical-ml",
    description: "L2-regularized linear regression (Tikhonov regularization)",
    tags: ["regression", "ridge", "l2", "regularization", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "alpha", name: "Alpha (L2 penalty)", type: "number", default: 1.0, min: 0, step: 0.01, description: "Regularization strength" },
      { id: "fit_intercept", name: "Fit Intercept", type: "boolean", default: true },
      { id: "solver", name: "Solver", type: "select", default: "auto", options: [{ label: "Auto", value: "auto" }, { label: "SVD", value: "svd" }, { label: "Cholesky", value: "cholesky" }, { label: "LSQR", value: "lsqr" }, { label: "SAG", value: "sag" }, { label: "SAGA", value: "saga" }] },
    ],
    codeTemplate: {
      imports: ["from sklearn.linear_model import Ridge"],
      body: `{{outputs.model}} = Ridge(alpha={{params.alpha}}, fit_intercept={{params.fit_intercept}}, solver="{{params.solver}}")
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "ridge_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Lasso Regression
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.lasso-regression",
    name: "Lasso Regression",
    category: "classical-ml",
    description: "L1-regularized linear regression for sparse solutions",
    tags: ["regression", "lasso", "l1", "regularization", "sklearn", "supervised", "feature-selection"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "alpha", name: "Alpha (L1 penalty)", type: "number", default: 1.0, min: 0, step: 0.01, description: "Regularization strength" },
      { id: "max_iter", name: "Max Iterations", type: "number", default: 1000, min: 1, step: 100, advanced: true },
      { id: "fit_intercept", name: "Fit Intercept", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.linear_model import Lasso"],
      body: `{{outputs.model}} = Lasso(alpha={{params.alpha}}, max_iter={{params.max_iter}}, fit_intercept={{params.fit_intercept}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "lasso_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Elastic Net
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.elastic-net",
    name: "Elastic Net",
    category: "classical-ml",
    description: "Combined L1 + L2 regularized linear regression",
    tags: ["regression", "elastic-net", "l1", "l2", "regularization", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "alpha", name: "Alpha", type: "number", default: 1.0, min: 0, step: 0.01, description: "Overall regularization strength" },
      { id: "l1_ratio", name: "L1 Ratio", type: "number", default: 0.5, min: 0, max: 1, step: 0.05, description: "Mix between L1 (1.0) and L2 (0.0)" },
      { id: "max_iter", name: "Max Iterations", type: "number", default: 1000, min: 1, step: 100, advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.linear_model import ElasticNet"],
      body: `{{outputs.model}} = ElasticNet(alpha={{params.alpha}}, l1_ratio={{params.l1_ratio}}, max_iter={{params.max_iter}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "elastic_net_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Logistic Regression
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.logistic-regression",
    name: "Logistic Regression",
    category: "classical-ml",
    description: "Logistic regression classifier for binary and multiclass problems",
    tags: ["classification", "logistic", "linear", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "C", name: "C (Inverse Regularization)", type: "number", default: 1.0, min: 0.0001, step: 0.1, description: "Smaller values mean stronger regularization" },
      { id: "penalty", name: "Penalty", type: "select", default: "l2", options: [{ label: "L2", value: "l2" }, { label: "L1", value: "l1" }, { label: "Elastic Net", value: "elasticnet" }, { label: "None", value: "none" }] },
      { id: "solver", name: "Solver", type: "select", default: "lbfgs", options: [{ label: "LBFGS", value: "lbfgs" }, { label: "Liblinear", value: "liblinear" }, { label: "SAG", value: "sag" }, { label: "SAGA", value: "saga" }, { label: "Newton-CG", value: "newton-cg" }] },
      { id: "max_iter", name: "Max Iterations", type: "number", default: 100, min: 1, step: 50, advanced: true },
      { id: "multi_class", name: "Multi-class", type: "select", default: "auto", options: [{ label: "Auto", value: "auto" }, { label: "OvR", value: "ovr" }, { label: "Multinomial", value: "multinomial" }], advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.linear_model import LogisticRegression"],
      body: `{{outputs.model}} = LogisticRegression(C={{params.C}}, penalty="{{params.penalty}}", solver="{{params.solver}}", max_iter={{params.max_iter}}, multi_class="{{params.multi_class}}")
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "logistic_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Naive Bayes
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.naive-bayes",
    name: "Naive Bayes",
    category: "classical-ml",
    description: "Gaussian Naive Bayes classifier based on Bayes' theorem",
    tags: ["classification", "naive-bayes", "gaussian", "probabilistic", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "variant", name: "Variant", type: "select", default: "gaussian", options: [{ label: "Gaussian", value: "gaussian" }, { label: "Multinomial", value: "multinomial" }, { label: "Bernoulli", value: "bernoulli" }, { label: "Complement", value: "complement" }] },
      { id: "var_smoothing", name: "Variance Smoothing", type: "number", default: 1e-9, min: 0, step: 1e-10, description: "Portion of largest variance added for stability (Gaussian only)", advanced: true },
      { id: "alpha", name: "Alpha (smoothing)", type: "number", default: 1.0, min: 0, step: 0.1, description: "Additive smoothing for Multinomial/Bernoulli/Complement", advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.naive_bayes import GaussianNB, MultinomialNB, BernoulliNB, ComplementNB"],
      body: `_variant = "{{params.variant}}"
if _variant == "gaussian":
    {{outputs.model}} = GaussianNB(var_smoothing={{params.var_smoothing}})
elif _variant == "multinomial":
    {{outputs.model}} = MultinomialNB(alpha={{params.alpha}})
elif _variant == "bernoulli":
    {{outputs.model}} = BernoulliNB(alpha={{params.alpha}})
else:
    {{outputs.model}} = ComplementNB(alpha={{params.alpha}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "nb_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. k-Nearest Neighbors
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.knn",
    name: "k-Nearest Neighbors",
    category: "classical-ml",
    description: "k-NN classifier/regressor using distance-based voting",
    tags: ["classification", "regression", "knn", "neighbors", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "n_neighbors", name: "k (Neighbors)", type: "number", default: 5, min: 1, step: 1 },
      { id: "weights", name: "Weights", type: "select", default: "uniform", options: [{ label: "Uniform", value: "uniform" }, { label: "Distance", value: "distance" }] },
      { id: "metric", name: "Distance Metric", type: "select", default: "minkowski", options: [{ label: "Minkowski", value: "minkowski" }, { label: "Euclidean", value: "euclidean" }, { label: "Manhattan", value: "manhattan" }, { label: "Cosine", value: "cosine" }] },
      { id: "task", name: "Task", type: "select", default: "classification", options: [{ label: "Classification", value: "classification" }, { label: "Regression", value: "regression" }] },
    ],
    codeTemplate: {
      imports: ["from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor"],
      body: `if "{{params.task}}" == "classification":
    {{outputs.model}} = KNeighborsClassifier(n_neighbors={{params.n_neighbors}}, weights="{{params.weights}}", metric="{{params.metric}}")
else:
    {{outputs.model}} = KNeighborsRegressor(n_neighbors={{params.n_neighbors}}, weights="{{params.weights}}", metric="{{params.metric}}")
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "knn_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Decision Tree
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.decision-tree",
    name: "Decision Tree",
    category: "classical-ml",
    description: "Tree-based model for classification or regression",
    tags: ["classification", "regression", "tree", "decision-tree", "sklearn", "supervised", "interpretable"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "task", name: "Task", type: "select", default: "classification", options: [{ label: "Classification", value: "classification" }, { label: "Regression", value: "regression" }] },
      { id: "max_depth", name: "Max Depth", type: "number", default: 5, min: 1, step: 1, description: "Maximum depth of the tree" },
      { id: "min_samples_split", name: "Min Samples Split", type: "number", default: 2, min: 2, step: 1, advanced: true },
      { id: "min_samples_leaf", name: "Min Samples Leaf", type: "number", default: 1, min: 1, step: 1, advanced: true },
      { id: "criterion", name: "Criterion", type: "select", default: "gini", options: [{ label: "Gini", value: "gini" }, { label: "Entropy", value: "entropy" }, { label: "MSE", value: "squared_error" }, { label: "MAE", value: "absolute_error" }] },
    ],
    codeTemplate: {
      imports: ["from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor"],
      body: `if "{{params.task}}" == "classification":
    {{outputs.model}} = DecisionTreeClassifier(max_depth={{params.max_depth}}, min_samples_split={{params.min_samples_split}}, min_samples_leaf={{params.min_samples_leaf}}, criterion="{{params.criterion}}")
else:
    {{outputs.model}} = DecisionTreeRegressor(max_depth={{params.max_depth}}, min_samples_split={{params.min_samples_split}}, min_samples_leaf={{params.min_samples_leaf}}, criterion="{{params.criterion}}")
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "dt_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Random Forest
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.random-forest",
    name: "Random Forest",
    category: "classical-ml",
    description: "Ensemble of decision trees with bagging and feature randomization",
    tags: ["classification", "regression", "ensemble", "random-forest", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "task", name: "Task", type: "select", default: "classification", options: [{ label: "Classification", value: "classification" }, { label: "Regression", value: "regression" }] },
      { id: "n_estimators", name: "Number of Trees", type: "number", default: 100, min: 1, step: 10 },
      { id: "max_depth", name: "Max Depth", type: "number", default: 10, min: 1, step: 1 },
      { id: "min_samples_split", name: "Min Samples Split", type: "number", default: 2, min: 2, step: 1, advanced: true },
      { id: "max_features", name: "Max Features", type: "select", default: "sqrt", options: [{ label: "Sqrt", value: "sqrt" }, { label: "Log2", value: "log2" }, { label: "All", value: "None" }], advanced: true },
      { id: "random_state", name: "Random State", type: "number", default: 42, min: 0, step: 1, advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor"],
      body: `_max_features = None if "{{params.max_features}}" == "None" else "{{params.max_features}}"
if "{{params.task}}" == "classification":
    {{outputs.model}} = RandomForestClassifier(n_estimators={{params.n_estimators}}, max_depth={{params.max_depth}}, min_samples_split={{params.min_samples_split}}, max_features=_max_features, random_state={{params.random_state}})
else:
    {{outputs.model}} = RandomForestRegressor(n_estimators={{params.n_estimators}}, max_depth={{params.max_depth}}, min_samples_split={{params.min_samples_split}}, max_features=_max_features, random_state={{params.random_state}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "rf_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Gradient Boosting (GBM)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.gradient-boosting",
    name: "Gradient Boosting (GBM)",
    category: "classical-ml",
    description: "Gradient-boosted decision tree ensemble via scikit-learn",
    tags: ["classification", "regression", "ensemble", "boosting", "gbm", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "task", name: "Task", type: "select", default: "classification", options: [{ label: "Classification", value: "classification" }, { label: "Regression", value: "regression" }] },
      { id: "n_estimators", name: "Number of Estimators", type: "number", default: 100, min: 1, step: 10 },
      { id: "learning_rate", name: "Learning Rate", type: "number", default: 0.1, min: 0.001, max: 1, step: 0.01 },
      { id: "max_depth", name: "Max Depth", type: "number", default: 3, min: 1, step: 1 },
      { id: "subsample", name: "Subsample", type: "number", default: 1.0, min: 0.1, max: 1.0, step: 0.05, advanced: true },
      { id: "random_state", name: "Random State", type: "number", default: 42, min: 0, step: 1, advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor"],
      body: `if "{{params.task}}" == "classification":
    {{outputs.model}} = GradientBoostingClassifier(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, max_depth={{params.max_depth}}, subsample={{params.subsample}}, random_state={{params.random_state}})
else:
    {{outputs.model}} = GradientBoostingRegressor(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, max_depth={{params.max_depth}}, subsample={{params.subsample}}, random_state={{params.random_state}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "gbm_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. XGBoost
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.xgboost",
    name: "XGBoost",
    category: "classical-ml",
    description: "Extreme Gradient Boosting — high-performance gradient-boosted trees",
    tags: ["classification", "regression", "ensemble", "boosting", "xgboost", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "task", name: "Task", type: "select", default: "classification", options: [{ label: "Classification", value: "classification" }, { label: "Regression", value: "regression" }] },
      { id: "n_estimators", name: "Number of Estimators", type: "number", default: 100, min: 1, step: 10 },
      { id: "learning_rate", name: "Learning Rate", type: "number", default: 0.1, min: 0.001, max: 1, step: 0.01 },
      { id: "max_depth", name: "Max Depth", type: "number", default: 6, min: 1, step: 1 },
      { id: "subsample", name: "Subsample", type: "number", default: 1.0, min: 0.1, max: 1.0, step: 0.05, advanced: true },
      { id: "colsample_bytree", name: "Col-sample by Tree", type: "number", default: 1.0, min: 0.1, max: 1.0, step: 0.05, advanced: true },
      { id: "reg_alpha", name: "L1 Reg (alpha)", type: "number", default: 0, min: 0, step: 0.01, advanced: true },
      { id: "reg_lambda", name: "L2 Reg (lambda)", type: "number", default: 1, min: 0, step: 0.01, advanced: true },
      { id: "random_state", name: "Random State", type: "number", default: 42, min: 0, step: 1, advanced: true },
    ],
    codeTemplate: {
      imports: ["import xgboost as xgb"],
      body: `if "{{params.task}}" == "classification":
    {{outputs.model}} = xgb.XGBClassifier(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, max_depth={{params.max_depth}}, subsample={{params.subsample}}, colsample_bytree={{params.colsample_bytree}}, reg_alpha={{params.reg_alpha}}, reg_lambda={{params.reg_lambda}}, random_state={{params.random_state}}, use_label_encoder=False, eval_metric="logloss")
else:
    {{outputs.model}} = xgb.XGBRegressor(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, max_depth={{params.max_depth}}, subsample={{params.subsample}}, colsample_bytree={{params.colsample_bytree}}, reg_alpha={{params.reg_alpha}}, reg_lambda={{params.reg_lambda}}, random_state={{params.random_state}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "xgb_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. LightGBM
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.lightgbm",
    name: "LightGBM",
    category: "classical-ml",
    description: "Microsoft's Light Gradient Boosting Machine — fast and memory-efficient",
    tags: ["classification", "regression", "ensemble", "boosting", "lightgbm", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "task", name: "Task", type: "select", default: "classification", options: [{ label: "Classification", value: "classification" }, { label: "Regression", value: "regression" }] },
      { id: "n_estimators", name: "Number of Estimators", type: "number", default: 100, min: 1, step: 10 },
      { id: "learning_rate", name: "Learning Rate", type: "number", default: 0.1, min: 0.001, max: 1, step: 0.01 },
      { id: "max_depth", name: "Max Depth", type: "number", default: -1, min: -1, step: 1, description: "-1 means no limit" },
      { id: "num_leaves", name: "Num Leaves", type: "number", default: 31, min: 2, step: 1 },
      { id: "subsample", name: "Subsample", type: "number", default: 1.0, min: 0.1, max: 1.0, step: 0.05, advanced: true },
      { id: "colsample_bytree", name: "Col-sample by Tree", type: "number", default: 1.0, min: 0.1, max: 1.0, step: 0.05, advanced: true },
      { id: "random_state", name: "Random State", type: "number", default: 42, min: 0, step: 1, advanced: true },
    ],
    codeTemplate: {
      imports: ["import lightgbm as lgb"],
      body: `if "{{params.task}}" == "classification":
    {{outputs.model}} = lgb.LGBMClassifier(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, max_depth={{params.max_depth}}, num_leaves={{params.num_leaves}}, subsample={{params.subsample}}, colsample_bytree={{params.colsample_bytree}}, random_state={{params.random_state}}, verbose=-1)
else:
    {{outputs.model}} = lgb.LGBMRegressor(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, max_depth={{params.max_depth}}, num_leaves={{params.num_leaves}}, subsample={{params.subsample}}, colsample_bytree={{params.colsample_bytree}}, random_state={{params.random_state}}, verbose=-1)
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "lgb_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. CatBoost
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.catboost",
    name: "CatBoost",
    category: "classical-ml",
    description: "Yandex CatBoost — gradient boosting with native categorical feature support",
    tags: ["classification", "regression", "ensemble", "boosting", "catboost", "supervised", "categorical"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "task", name: "Task", type: "select", default: "classification", options: [{ label: "Classification", value: "classification" }, { label: "Regression", value: "regression" }] },
      { id: "iterations", name: "Iterations", type: "number", default: 100, min: 1, step: 10 },
      { id: "learning_rate", name: "Learning Rate", type: "number", default: 0.1, min: 0.001, max: 1, step: 0.01 },
      { id: "depth", name: "Depth", type: "number", default: 6, min: 1, max: 16, step: 1 },
      { id: "l2_leaf_reg", name: "L2 Leaf Reg", type: "number", default: 3.0, min: 0, step: 0.5, advanced: true },
      { id: "random_state", name: "Random State", type: "number", default: 42, min: 0, step: 1, advanced: true },
    ],
    codeTemplate: {
      imports: ["from catboost import CatBoostClassifier, CatBoostRegressor"],
      body: `if "{{params.task}}" == "classification":
    {{outputs.model}} = CatBoostClassifier(iterations={{params.iterations}}, learning_rate={{params.learning_rate}}, depth={{params.depth}}, l2_leaf_reg={{params.l2_leaf_reg}}, random_state={{params.random_state}}, verbose=0)
else:
    {{outputs.model}} = CatBoostRegressor(iterations={{params.iterations}}, learning_rate={{params.learning_rate}}, depth={{params.depth}}, l2_leaf_reg={{params.l2_leaf_reg}}, random_state={{params.random_state}}, verbose=0)
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "catboost_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. AdaBoost
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.adaboost",
    name: "AdaBoost",
    category: "classical-ml",
    description: "Adaptive Boosting — sequentially re-weights misclassified samples",
    tags: ["classification", "regression", "ensemble", "boosting", "adaboost", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "task", name: "Task", type: "select", default: "classification", options: [{ label: "Classification", value: "classification" }, { label: "Regression", value: "regression" }] },
      { id: "n_estimators", name: "Number of Estimators", type: "number", default: 50, min: 1, step: 10 },
      { id: "learning_rate", name: "Learning Rate", type: "number", default: 1.0, min: 0.001, max: 2, step: 0.01 },
      { id: "random_state", name: "Random State", type: "number", default: 42, min: 0, step: 1, advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.ensemble import AdaBoostClassifier, AdaBoostRegressor"],
      body: `if "{{params.task}}" == "classification":
    {{outputs.model}} = AdaBoostClassifier(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, random_state={{params.random_state}})
else:
    {{outputs.model}} = AdaBoostRegressor(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, random_state={{params.random_state}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "adaboost_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Bagging Ensemble
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.bagging-ensemble",
    name: "Bagging Ensemble",
    category: "classical-ml",
    description: "Bootstrap-aggregated ensemble of base estimators",
    tags: ["classification", "regression", "ensemble", "bagging", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "task", name: "Task", type: "select", default: "classification", options: [{ label: "Classification", value: "classification" }, { label: "Regression", value: "regression" }] },
      { id: "n_estimators", name: "Number of Estimators", type: "number", default: 10, min: 1, step: 1 },
      { id: "max_samples", name: "Max Samples", type: "number", default: 1.0, min: 0.1, max: 1.0, step: 0.1, description: "Fraction of samples to draw per estimator" },
      { id: "max_features", name: "Max Features", type: "number", default: 1.0, min: 0.1, max: 1.0, step: 0.1, description: "Fraction of features to draw per estimator", advanced: true },
      { id: "random_state", name: "Random State", type: "number", default: 42, min: 0, step: 1, advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.ensemble import BaggingClassifier, BaggingRegressor"],
      body: `if "{{params.task}}" == "classification":
    {{outputs.model}} = BaggingClassifier(n_estimators={{params.n_estimators}}, max_samples={{params.max_samples}}, max_features={{params.max_features}}, random_state={{params.random_state}})
else:
    {{outputs.model}} = BaggingRegressor(n_estimators={{params.n_estimators}}, max_samples={{params.max_samples}}, max_features={{params.max_features}}, random_state={{params.random_state}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "bagging_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. Stacking Ensemble
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.stacking-ensemble",
    name: "Stacking Ensemble",
    category: "classical-ml",
    description: "Stacked generalization — trains a meta-learner on base model predictions",
    tags: ["classification", "regression", "ensemble", "stacking", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
      { id: "base_models", name: "Base Models", type: "list", required: true, description: "List of (name, estimator) tuples" },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "task", name: "Task", type: "select", default: "classification", options: [{ label: "Classification", value: "classification" }, { label: "Regression", value: "regression" }] },
      { id: "cv", name: "CV Folds", type: "number", default: 5, min: 2, step: 1, description: "Cross-validation folds for generating meta-features" },
      { id: "passthrough", name: "Passthrough", type: "boolean", default: false, description: "Include original features alongside meta-features", advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.ensemble import StackingClassifier, StackingRegressor", "from sklearn.linear_model import LogisticRegression, Ridge"],
      body: `if "{{params.task}}" == "classification":
    {{outputs.model}} = StackingClassifier(estimators={{inputs.base_models}}, final_estimator=LogisticRegression(), cv={{params.cv}}, passthrough={{params.passthrough}})
else:
    {{outputs.model}} = StackingRegressor(estimators={{inputs.base_models}}, final_estimator=Ridge(), cv={{params.cv}}, passthrough={{params.passthrough}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "stacking_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. Voting Ensemble
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.voting-ensemble",
    name: "Voting Ensemble",
    category: "classical-ml",
    description: "Combines multiple models via majority vote (classification) or averaging (regression)",
    tags: ["classification", "regression", "ensemble", "voting", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
      { id: "base_models", name: "Base Models", type: "list", required: true, description: "List of (name, estimator) tuples" },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "task", name: "Task", type: "select", default: "classification", options: [{ label: "Classification", value: "classification" }, { label: "Regression", value: "regression" }] },
      { id: "voting", name: "Voting Strategy", type: "select", default: "soft", options: [{ label: "Hard (majority)", value: "hard" }, { label: "Soft (probability avg)", value: "soft" }], description: "Only for classification" },
    ],
    codeTemplate: {
      imports: ["from sklearn.ensemble import VotingClassifier, VotingRegressor"],
      body: `if "{{params.task}}" == "classification":
    {{outputs.model}} = VotingClassifier(estimators={{inputs.base_models}}, voting="{{params.voting}}")
else:
    {{outputs.model}} = VotingRegressor(estimators={{inputs.base_models}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "voting_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. SVM (Classifier)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.svm-classifier",
    name: "SVM (Classifier)",
    category: "classical-ml",
    description: "Support Vector Machine classifier using kernel trick",
    tags: ["classification", "svm", "svc", "kernel", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "C", name: "C (Regularization)", type: "number", default: 1.0, min: 0.001, step: 0.1 },
      { id: "kernel", name: "Kernel", type: "select", default: "rbf", options: [{ label: "RBF", value: "rbf" }, { label: "Linear", value: "linear" }, { label: "Polynomial", value: "poly" }, { label: "Sigmoid", value: "sigmoid" }] },
      { id: "gamma", name: "Gamma", type: "select", default: "scale", options: [{ label: "Scale", value: "scale" }, { label: "Auto", value: "auto" }], description: "Kernel coefficient" },
      { id: "degree", name: "Degree", type: "number", default: 3, min: 1, step: 1, description: "Degree for polynomial kernel", advanced: true },
      { id: "probability", name: "Probability Estimates", type: "boolean", default: true, description: "Enable probability predictions (slower training)", advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.svm import SVC"],
      body: `{{outputs.model}} = SVC(C={{params.C}}, kernel="{{params.kernel}}", gamma="{{params.gamma}}", degree={{params.degree}}, probability={{params.probability}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "svc_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. SVM (Regressor)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.svm-regressor",
    name: "SVM (Regressor)",
    category: "classical-ml",
    description: "Support Vector Machine for regression (epsilon-SVR)",
    tags: ["regression", "svm", "svr", "kernel", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "C", name: "C (Regularization)", type: "number", default: 1.0, min: 0.001, step: 0.1 },
      { id: "kernel", name: "Kernel", type: "select", default: "rbf", options: [{ label: "RBF", value: "rbf" }, { label: "Linear", value: "linear" }, { label: "Polynomial", value: "poly" }, { label: "Sigmoid", value: "sigmoid" }] },
      { id: "epsilon", name: "Epsilon", type: "number", default: 0.1, min: 0, step: 0.01, description: "Epsilon in the epsilon-SVR model" },
      { id: "gamma", name: "Gamma", type: "select", default: "scale", options: [{ label: "Scale", value: "scale" }, { label: "Auto", value: "auto" }] },
    ],
    codeTemplate: {
      imports: ["from sklearn.svm import SVR"],
      body: `{{outputs.model}} = SVR(C={{params.C}}, kernel="{{params.kernel}}", epsilon={{params.epsilon}}, gamma="{{params.gamma}}")
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "svr_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. SVR
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.svr",
    name: "SVR",
    category: "classical-ml",
    description: "Linear Support Vector Regression — fast for large datasets",
    tags: ["regression", "svr", "linear", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "C", name: "C (Regularization)", type: "number", default: 1.0, min: 0.001, step: 0.1 },
      { id: "epsilon", name: "Epsilon", type: "number", default: 0.0, min: 0, step: 0.01, description: "Epsilon parameter in epsilon-insensitive loss" },
      { id: "loss", name: "Loss", type: "select", default: "epsilon_insensitive", options: [{ label: "Epsilon Insensitive", value: "epsilon_insensitive" }, { label: "Squared Epsilon Insensitive", value: "squared_epsilon_insensitive" }] },
      { id: "max_iter", name: "Max Iterations", type: "number", default: 1000, min: 1, step: 100, advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.svm import LinearSVR"],
      body: `{{outputs.model}} = LinearSVR(C={{params.C}}, epsilon={{params.epsilon}}, loss="{{params.loss}}", max_iter={{params.max_iter}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "linear_svr_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. K-Means
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.kmeans",
    name: "K-Means",
    category: "classical-ml",
    description: "K-Means clustering — partitions data into k clusters by centroid distance",
    tags: ["clustering", "unsupervised", "kmeans", "sklearn"],
    inputs: [
      { id: "X", name: "Data", type: "array", required: true, description: "Feature matrix to cluster" },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
      { id: "labels", name: "Cluster Labels", type: "array", required: true },
    ],
    parameters: [
      { id: "n_clusters", name: "Number of Clusters (k)", type: "number", default: 8, min: 2, step: 1 },
      { id: "init", name: "Initialization", type: "select", default: "k-means++", options: [{ label: "k-means++", value: "k-means++" }, { label: "Random", value: "random" }] },
      { id: "n_init", name: "Number of Inits", type: "number", default: 10, min: 1, step: 1, description: "Number of times to run with different seeds", advanced: true },
      { id: "max_iter", name: "Max Iterations", type: "number", default: 300, min: 1, step: 50, advanced: true },
      { id: "random_state", name: "Random State", type: "number", default: 42, min: 0, step: 1, advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.cluster import KMeans"],
      body: `{{outputs.model}} = KMeans(n_clusters={{params.n_clusters}}, init="{{params.init}}", n_init={{params.n_init}}, max_iter={{params.max_iter}}, random_state={{params.random_state}})
{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})`,
      outputBindings: { model: "kmeans_model", labels: "kmeans_labels" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. DBSCAN
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.dbscan",
    name: "DBSCAN",
    category: "classical-ml",
    description: "Density-Based Spatial Clustering — finds arbitrarily-shaped clusters",
    tags: ["clustering", "unsupervised", "dbscan", "density", "sklearn"],
    inputs: [
      { id: "X", name: "Data", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
      { id: "labels", name: "Cluster Labels", type: "array", required: true },
    ],
    parameters: [
      { id: "eps", name: "Epsilon (eps)", type: "number", default: 0.5, min: 0.001, step: 0.05, description: "Maximum distance between two samples in the same neighborhood" },
      { id: "min_samples", name: "Min Samples", type: "number", default: 5, min: 1, step: 1, description: "Minimum number of samples in a neighborhood for a core point" },
      { id: "metric", name: "Metric", type: "select", default: "euclidean", options: [{ label: "Euclidean", value: "euclidean" }, { label: "Manhattan", value: "manhattan" }, { label: "Cosine", value: "cosine" }] },
    ],
    codeTemplate: {
      imports: ["from sklearn.cluster import DBSCAN"],
      body: `{{outputs.model}} = DBSCAN(eps={{params.eps}}, min_samples={{params.min_samples}}, metric="{{params.metric}}")
{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})`,
      outputBindings: { model: "dbscan_model", labels: "dbscan_labels" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 23. Hierarchical Clustering
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.hierarchical-clustering",
    name: "Hierarchical Clustering",
    category: "classical-ml",
    description: "Agglomerative hierarchical clustering — builds a tree of clusters",
    tags: ["clustering", "unsupervised", "hierarchical", "agglomerative", "sklearn"],
    inputs: [
      { id: "X", name: "Data", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
      { id: "labels", name: "Cluster Labels", type: "array", required: true },
    ],
    parameters: [
      { id: "n_clusters", name: "Number of Clusters", type: "number", default: 2, min: 2, step: 1 },
      { id: "linkage", name: "Linkage", type: "select", default: "ward", options: [{ label: "Ward", value: "ward" }, { label: "Complete", value: "complete" }, { label: "Average", value: "average" }, { label: "Single", value: "single" }] },
      { id: "metric", name: "Metric", type: "select", default: "euclidean", options: [{ label: "Euclidean", value: "euclidean" }, { label: "Manhattan", value: "manhattan" }, { label: "Cosine", value: "cosine" }], description: "Distance metric (ward requires euclidean)" },
    ],
    codeTemplate: {
      imports: ["from sklearn.cluster import AgglomerativeClustering"],
      body: `{{outputs.model}} = AgglomerativeClustering(n_clusters={{params.n_clusters}}, linkage="{{params.linkage}}", metric="{{params.metric}}")
{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})`,
      outputBindings: { model: "hierarchical_model", labels: "hierarchical_labels" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 24. Gaussian Mixture Model
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.gaussian-mixture",
    name: "Gaussian Mixture Model",
    category: "classical-ml",
    description: "Probabilistic clustering via mixture of Gaussian distributions",
    tags: ["clustering", "unsupervised", "gmm", "gaussian", "probabilistic", "sklearn"],
    inputs: [
      { id: "X", name: "Data", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
      { id: "labels", name: "Cluster Labels", type: "array", required: true },
    ],
    parameters: [
      { id: "n_components", name: "Number of Components", type: "number", default: 3, min: 1, step: 1 },
      { id: "covariance_type", name: "Covariance Type", type: "select", default: "full", options: [{ label: "Full", value: "full" }, { label: "Tied", value: "tied" }, { label: "Diagonal", value: "diag" }, { label: "Spherical", value: "spherical" }] },
      { id: "max_iter", name: "Max Iterations", type: "number", default: 100, min: 1, step: 10, advanced: true },
      { id: "random_state", name: "Random State", type: "number", default: 42, min: 0, step: 1, advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.mixture import GaussianMixture"],
      body: `{{outputs.model}} = GaussianMixture(n_components={{params.n_components}}, covariance_type="{{params.covariance_type}}", max_iter={{params.max_iter}}, random_state={{params.random_state}})
{{outputs.model}}.fit({{inputs.X}})
{{outputs.labels}} = {{outputs.model}}.predict({{inputs.X}})`,
      outputBindings: { model: "gmm_model", labels: "gmm_labels" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 25. Isolation Forest
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.isolation-forest",
    name: "Isolation Forest",
    category: "classical-ml",
    description: "Anomaly detection by isolating observations using random splits",
    tags: ["anomaly-detection", "unsupervised", "isolation-forest", "outlier", "sklearn"],
    inputs: [
      { id: "X", name: "Data", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
      { id: "labels", name: "Anomaly Labels", type: "array", required: true, description: "1 for inliers, -1 for outliers" },
    ],
    parameters: [
      { id: "n_estimators", name: "Number of Estimators", type: "number", default: 100, min: 1, step: 10 },
      { id: "contamination", name: "Contamination", type: "number", default: 0.1, min: 0.0, max: 0.5, step: 0.01, description: "Expected proportion of outliers" },
      { id: "max_samples", name: "Max Samples", type: "select", default: "auto", options: [{ label: "Auto", value: "auto" }, { label: "256", value: "256" }], advanced: true },
      { id: "random_state", name: "Random State", type: "number", default: 42, min: 0, step: 1, advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.ensemble import IsolationForest"],
      body: `_max_samples = "auto" if "{{params.max_samples}}" == "auto" else int("{{params.max_samples}}")
{{outputs.model}} = IsolationForest(n_estimators={{params.n_estimators}}, contamination={{params.contamination}}, max_samples=_max_samples, random_state={{params.random_state}})
{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})`,
      outputBindings: { model: "iforest_model", labels: "iforest_labels" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 26. One-Class SVM
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.one-class-svm",
    name: "One-Class SVM",
    category: "classical-ml",
    description: "Unsupervised anomaly detection via support vector boundary",
    tags: ["anomaly-detection", "unsupervised", "svm", "one-class", "outlier", "sklearn"],
    inputs: [
      { id: "X", name: "Data", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
      { id: "labels", name: "Anomaly Labels", type: "array", required: true, description: "1 for inliers, -1 for outliers" },
    ],
    parameters: [
      { id: "kernel", name: "Kernel", type: "select", default: "rbf", options: [{ label: "RBF", value: "rbf" }, { label: "Linear", value: "linear" }, { label: "Polynomial", value: "poly" }, { label: "Sigmoid", value: "sigmoid" }] },
      { id: "nu", name: "Nu", type: "number", default: 0.1, min: 0.01, max: 1.0, step: 0.01, description: "Upper bound on the fraction of outliers" },
      { id: "gamma", name: "Gamma", type: "select", default: "scale", options: [{ label: "Scale", value: "scale" }, { label: "Auto", value: "auto" }] },
    ],
    codeTemplate: {
      imports: ["from sklearn.svm import OneClassSVM"],
      body: `{{outputs.model}} = OneClassSVM(kernel="{{params.kernel}}", nu={{params.nu}}, gamma="{{params.gamma}}")
{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})`,
      outputBindings: { model: "ocsvm_model", labels: "ocsvm_labels" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 27. OPTICS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.optics",
    name: "OPTICS",
    category: "classical-ml",
    description: "Ordering Points To Identify Clustering Structure — density-based like DBSCAN but no fixed eps",
    tags: ["clustering", "unsupervised", "optics", "density", "sklearn"],
    inputs: [
      { id: "X", name: "Data", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
      { id: "labels", name: "Cluster Labels", type: "array", required: true },
    ],
    parameters: [
      { id: "min_samples", name: "Min Samples", type: "number", default: 5, min: 2, step: 1 },
      { id: "max_eps", name: "Max Eps", type: "number", default: Infinity, min: 0, step: 0.1, description: "Maximum reachability distance (inf = no limit)" },
      { id: "metric", name: "Metric", type: "select", default: "minkowski", options: [{ label: "Minkowski", value: "minkowski" }, { label: "Euclidean", value: "euclidean" }, { label: "Manhattan", value: "manhattan" }, { label: "Cosine", value: "cosine" }] },
      { id: "cluster_method", name: "Cluster Method", type: "select", default: "xi", options: [{ label: "Xi", value: "xi" }, { label: "DBSCAN", value: "dbscan" }], advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.cluster import OPTICS", "import numpy as np"],
      body: `_max_eps = np.inf if {{params.max_eps}} == float("inf") else {{params.max_eps}}
{{outputs.model}} = OPTICS(min_samples={{params.min_samples}}, max_eps=_max_eps, metric="{{params.metric}}", cluster_method="{{params.cluster_method}}")
{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})`,
      outputBindings: { model: "optics_model", labels: "optics_labels" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 28. Mean Shift
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.mean-shift",
    name: "Mean Shift",
    category: "classical-ml",
    description: "Non-parametric clustering by iteratively shifting toward density modes",
    tags: ["clustering", "unsupervised", "mean-shift", "density", "sklearn"],
    inputs: [
      { id: "X", name: "Data", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
      { id: "labels", name: "Cluster Labels", type: "array", required: true },
    ],
    parameters: [
      { id: "bandwidth", name: "Bandwidth", type: "number", default: 0, min: 0, step: 0.1, description: "Kernel bandwidth (0 = auto-estimate)" },
      { id: "bin_seeding", name: "Bin Seeding", type: "boolean", default: false, description: "Use binning to speed up computation", advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.cluster import MeanShift, estimate_bandwidth"],
      body: `_bandwidth = {{params.bandwidth}} if {{params.bandwidth}} > 0 else estimate_bandwidth({{inputs.X}})
{{outputs.model}} = MeanShift(bandwidth=_bandwidth, bin_seeding={{params.bin_seeding}})
{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})`,
      outputBindings: { model: "meanshift_model", labels: "meanshift_labels" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 29. Spectral Clustering
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.spectral-clustering",
    name: "Spectral Clustering",
    category: "classical-ml",
    description: "Graph-based clustering using the eigenvalues of the affinity matrix",
    tags: ["clustering", "unsupervised", "spectral", "graph", "sklearn"],
    inputs: [
      { id: "X", name: "Data", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
      { id: "labels", name: "Cluster Labels", type: "array", required: true },
    ],
    parameters: [
      { id: "n_clusters", name: "Number of Clusters", type: "number", default: 8, min: 2, step: 1 },
      { id: "affinity", name: "Affinity", type: "select", default: "rbf", options: [{ label: "RBF", value: "rbf" }, { label: "Nearest Neighbors", value: "nearest_neighbors" }] },
      { id: "n_neighbors", name: "N Neighbors", type: "number", default: 10, min: 1, step: 1, description: "Used when affinity is nearest_neighbors", advanced: true },
      { id: "random_state", name: "Random State", type: "number", default: 42, min: 0, step: 1, advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.cluster import SpectralClustering"],
      body: `{{outputs.model}} = SpectralClustering(n_clusters={{params.n_clusters}}, affinity="{{params.affinity}}", n_neighbors={{params.n_neighbors}}, random_state={{params.random_state}})
{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})`,
      outputBindings: { model: "spectral_model", labels: "spectral_labels" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 30. Gaussian Process
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.gaussian-process",
    name: "Gaussian Process",
    category: "classical-ml",
    description: "Gaussian Process for regression/classification with uncertainty estimates",
    tags: ["regression", "classification", "gaussian-process", "bayesian", "sklearn", "supervised", "uncertainty"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "task", name: "Task", type: "select", default: "regression", options: [{ label: "Regression", value: "regression" }, { label: "Classification", value: "classification" }] },
      { id: "kernel", name: "Kernel", type: "select", default: "rbf", options: [{ label: "RBF", value: "rbf" }, { label: "Matern", value: "matern" }, { label: "Rational Quadratic", value: "rational_quadratic" }, { label: "Dot Product", value: "dot_product" }] },
      { id: "alpha", name: "Alpha (noise)", type: "number", default: 1e-10, min: 0, step: 1e-11, description: "Noise level added to diagonal (regression only)", advanced: true },
      { id: "n_restarts_optimizer", name: "Optimizer Restarts", type: "number", default: 0, min: 0, step: 1, advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.gaussian_process import GaussianProcessRegressor, GaussianProcessClassifier", "from sklearn.gaussian_process.kernels import RBF, Matern, RationalQuadratic, DotProduct"],
      body: `_kernels = {"rbf": RBF(), "matern": Matern(), "rational_quadratic": RationalQuadratic(), "dot_product": DotProduct()}
_kernel = _kernels["{{params.kernel}}"]
if "{{params.task}}" == "regression":
    {{outputs.model}} = GaussianProcessRegressor(kernel=_kernel, alpha={{params.alpha}}, n_restarts_optimizer={{params.n_restarts_optimizer}})
else:
    {{outputs.model}} = GaussianProcessClassifier(kernel=_kernel, n_restarts_optimizer={{params.n_restarts_optimizer}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "gp_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 31. Bayesian Ridge
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.bayesian-ridge",
    name: "Bayesian Ridge",
    category: "classical-ml",
    description: "Bayesian ridge regression with automatic relevance determination of regularization",
    tags: ["regression", "bayesian", "ridge", "sklearn", "supervised", "uncertainty"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "max_iter", name: "Max Iterations", type: "number", default: 300, min: 1, step: 50 },
      { id: "alpha_1", name: "Alpha 1", type: "number", default: 1e-6, min: 0, step: 1e-7, description: "Shape parameter for Gamma prior over alpha", advanced: true },
      { id: "alpha_2", name: "Alpha 2", type: "number", default: 1e-6, min: 0, step: 1e-7, description: "Rate parameter for Gamma prior over alpha", advanced: true },
      { id: "lambda_1", name: "Lambda 1", type: "number", default: 1e-6, min: 0, step: 1e-7, description: "Shape parameter for Gamma prior over lambda", advanced: true },
      { id: "lambda_2", name: "Lambda 2", type: "number", default: 1e-6, min: 0, step: 1e-7, description: "Rate parameter for Gamma prior over lambda", advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.linear_model import BayesianRidge"],
      body: `{{outputs.model}} = BayesianRidge(max_iter={{params.max_iter}}, alpha_1={{params.alpha_1}}, alpha_2={{params.alpha_2}}, lambda_1={{params.lambda_1}}, lambda_2={{params.lambda_2}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "bayesian_ridge_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 32. ARD Regression
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.ard-regression",
    name: "ARD Regression",
    category: "classical-ml",
    description: "Automatic Relevance Determination regression — sparse Bayesian learning",
    tags: ["regression", "bayesian", "ard", "sparse", "sklearn", "supervised", "feature-selection"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "max_iter", name: "Max Iterations", type: "number", default: 300, min: 1, step: 50 },
      { id: "threshold_lambda", name: "Threshold Lambda", type: "number", default: 10000, min: 1, step: 100, description: "Threshold for pruning irrelevant features", advanced: true },
      { id: "alpha_1", name: "Alpha 1", type: "number", default: 1e-6, min: 0, step: 1e-7, advanced: true },
      { id: "alpha_2", name: "Alpha 2", type: "number", default: 1e-6, min: 0, step: 1e-7, advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.linear_model import ARDRegression"],
      body: `{{outputs.model}} = ARDRegression(max_iter={{params.max_iter}}, threshold_lambda={{params.threshold_lambda}}, alpha_1={{params.alpha_1}}, alpha_2={{params.alpha_2}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "ard_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 33. Poisson Regression
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.poisson-regression",
    name: "Poisson Regression",
    category: "classical-ml",
    description: "Generalized linear model for count data with Poisson distribution",
    tags: ["regression", "glm", "poisson", "count", "sklearn", "supervised"],
    inputs: [
      { id: "X_train", name: "X Train", type: "array", required: true },
      { id: "y_train", name: "y Train", type: "array", required: true },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "alpha", name: "Alpha (Regularization)", type: "number", default: 1.0, min: 0, step: 0.1, description: "Regularization strength" },
      { id: "max_iter", name: "Max Iterations", type: "number", default: 100, min: 1, step: 10, advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.linear_model import PoissonRegressor"],
      body: `{{outputs.model}} = PoissonRegressor(alpha={{params.alpha}}, max_iter={{params.max_iter}})
{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})`,
      outputBindings: { model: "poisson_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 34. Cox Regression
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.cox-regression",
    name: "Cox Regression",
    category: "classical-ml",
    description: "Cox proportional hazards model for survival analysis",
    tags: ["regression", "survival", "cox", "lifelines", "supervised", "time-to-event"],
    inputs: [
      { id: "dataframe", name: "Survival DataFrame", type: "dataframe", required: true, description: "DataFrame with covariates, duration, and event columns" },
    ],
    outputs: [
      { id: "model", name: "Fitted Model", type: "model", required: true },
    ],
    parameters: [
      { id: "duration_col", name: "Duration Column", type: "string", default: "duration", placeholder: "duration", description: "Column name for observed durations" },
      { id: "event_col", name: "Event Column", type: "string", default: "event", placeholder: "event", description: "Column name for event indicator (1 = event, 0 = censored)" },
      { id: "penalizer", name: "Penalizer", type: "number", default: 0.0, min: 0, step: 0.01, description: "L2 regularization strength" },
      { id: "l1_ratio", name: "L1 Ratio", type: "number", default: 0.0, min: 0, max: 1, step: 0.05, description: "Elastic net mixing (0 = pure L2, 1 = pure L1)", advanced: true },
    ],
    codeTemplate: {
      imports: ["from lifelines import CoxPHFitter"],
      body: `{{outputs.model}} = CoxPHFitter(penalizer={{params.penalizer}}, l1_ratio={{params.l1_ratio}})
{{outputs.model}}.fit({{inputs.dataframe}}, duration_col="{{params.duration_col}}", event_col="{{params.event_col}}")`,
      outputBindings: { model: "cox_model" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 35. Sklearn Predict (classical estimators)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "classical-ml.sklearn-predict",
    name: "Sklearn Predict",
    category: "classical-ml",
    description: "Run predict() on a fitted scikit-learn estimator (classifier/regressor)",
    tags: ["sklearn", "predict", "inference", "tabular", "supervised"],
    inputs: [
      { id: "model", name: "Fitted model", type: "model", required: true },
      { id: "X", name: "X", type: "array", required: true },
    ],
    outputs: [{ id: "y_pred", name: "Predictions", type: "tensor", required: true }],
    parameters: [],
    codeTemplate: {
      imports: [],
      body: `{{outputs.y_pred}} = {{inputs.model}}.predict({{inputs.X}})`,
      outputBindings: { y_pred: "y_pred" },
    },
  },
];
