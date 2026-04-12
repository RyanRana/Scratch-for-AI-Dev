"""
aiblocks.classical_ml — Classical ML

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def linear_regression(X_train=None, y_train=None, fit_intercept=True, normalize=False):
    """Ordinary least-squares linear regression model
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): Training feature matrix
        y_train (array) (required): Training target vector
    
    Parameters:
        fit_intercept (boolean, default=True): Whether to calculate the intercept
        normalize (boolean, default=False): Normalize regressors before fitting
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.linear_model import LinearRegression']
    _code = '{{outputs.model}} = LinearRegression(fit_intercept={{params.fit_intercept}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.fit_intercept}}", str(fit_intercept))
    _code = _code.replace("{{params.normalize}}", str(normalize))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def ridge_regression(X_train=None, y_train=None, alpha=1.0, fit_intercept=True, solver='auto'):
    """L2-regularized linear regression (Tikhonov regularization)
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        alpha (number, default=1.0): Regularization strength
        fit_intercept (boolean, default=True): 
        solver (select, default='auto'): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.linear_model import Ridge']
    _code = '{{outputs.model}} = Ridge(alpha={{params.alpha}}, fit_intercept={{params.fit_intercept}}, solver="{{params.solver}}")\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.fit_intercept}}", str(fit_intercept))
    _code = _code.replace("{{params.solver}}", str(solver))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def lasso_regression(X_train=None, y_train=None, alpha=1.0, max_iter=1000, fit_intercept=True):
    """L1-regularized linear regression for sparse solutions
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        alpha (number, default=1.0): Regularization strength
        max_iter (number, default=1000): 
        fit_intercept (boolean, default=True): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.linear_model import Lasso']
    _code = '{{outputs.model}} = Lasso(alpha={{params.alpha}}, max_iter={{params.max_iter}}, fit_intercept={{params.fit_intercept}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.max_iter}}", str(max_iter))
    _code = _code.replace("{{params.fit_intercept}}", str(fit_intercept))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def elastic_net(X_train=None, y_train=None, alpha=1.0, l1_ratio=0.5, max_iter=1000):
    """Combined L1 + L2 regularized linear regression
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        alpha (number, default=1.0): Overall regularization strength
        l1_ratio (number, default=0.5): Mix between L1 (1.0) and L2 (0.0)
        max_iter (number, default=1000): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.linear_model import ElasticNet']
    _code = '{{outputs.model}} = ElasticNet(alpha={{params.alpha}}, l1_ratio={{params.l1_ratio}}, max_iter={{params.max_iter}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.l1_ratio}}", str(l1_ratio))
    _code = _code.replace("{{params.max_iter}}", str(max_iter))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def logistic_regression(X_train=None, y_train=None, C=1.0, penalty='l2', solver='lbfgs', max_iter=100, multi_class='auto'):
    """Logistic regression classifier for binary and multiclass problems
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        C (number, default=1.0): Smaller values mean stronger regularization
        penalty (select, default='l2'): 
        solver (select, default='lbfgs'): 
        max_iter (number, default=100): 
        multi_class (select, default='auto'): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.linear_model import LogisticRegression']
    _code = '{{outputs.model}} = LogisticRegression(C={{params.C}}, penalty="{{params.penalty}}", solver="{{params.solver}}", max_iter={{params.max_iter}}, multi_class="{{params.multi_class}}")\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.C}}", str(C))
    _code = _code.replace("{{params.penalty}}", str(penalty))
    _code = _code.replace("{{params.solver}}", str(solver))
    _code = _code.replace("{{params.max_iter}}", str(max_iter))
    _code = _code.replace("{{params.multi_class}}", str(multi_class))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def naive_bayes(X_train=None, y_train=None, variant='gaussian', var_smoothing=1e-09, alpha=1.0):
    """Gaussian Naive Bayes classifier based on Bayes' theorem
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        variant (select, default='gaussian'): 
        var_smoothing (number, default=1e-09): Portion of largest variance added for stability (Gaussian only)
        alpha (number, default=1.0): Additive smoothing for Multinomial/Bernoulli/Complement
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.naive_bayes import GaussianNB, MultinomialNB, BernoulliNB, ComplementNB']
    _code = '_variant = "{{params.variant}}"\nif _variant == "gaussian":\n    {{outputs.model}} = GaussianNB(var_smoothing={{params.var_smoothing}})\nelif _variant == "multinomial":\n    {{outputs.model}} = MultinomialNB(alpha={{params.alpha}})\nelif _variant == "bernoulli":\n    {{outputs.model}} = BernoulliNB(alpha={{params.alpha}})\n "else":\n    {{outputs.model}} = ComplementNB(alpha={{params.alpha}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.variant}}", str(variant))
    _code = _code.replace("{{params.var_smoothing}}", str(var_smoothing))
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def knn(X_train=None, y_train=None, n_neighbors=5, weights='uniform', metric='minkowski', task='classification'):
    """k-NN classifier/regressor using distance-based voting
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        n_neighbors (number, default=5): 
        weights (select, default='uniform'): 
        metric (select, default='minkowski'): 
        task (select, default='classification'): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor']
    _code = 'if "{{params.task}}" == "classification":\n    {{outputs.model}} = KNeighborsClassifier(n_neighbors={{params.n_neighbors}}, weights="{{params.weights}}", metric="{{params.metric}}")\n "else":\n    {{outputs.model}} = KNeighborsRegressor(n_neighbors={{params.n_neighbors}}, weights="{{params.weights}}", metric="{{params.metric}}")\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.n_neighbors}}", str(n_neighbors))
    _code = _code.replace("{{params.weights}}", str(weights))
    _code = _code.replace("{{params.metric}}", str(metric))
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def decision_tree(X_train=None, y_train=None, task='classification', max_depth=5, min_samples_split=2, min_samples_leaf=1, criterion='gini'):
    """Tree-based model for classification or regression
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        task (select, default='classification'): 
        max_depth (number, default=5): Maximum depth of the tree
        min_samples_split (number, default=2): 
        min_samples_leaf (number, default=1): 
        criterion (select, default='gini'): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor']
    _code = 'if "{{params.task}}" == "classification":\n    {{outputs.model}} = DecisionTreeClassifier(max_depth={{params.max_depth}}, min_samples_split={{params.min_samples_split}}, min_samples_leaf={{params.min_samples_leaf}}, criterion="{{params.criterion}}")\n "else":\n    {{outputs.model}} = DecisionTreeRegressor(max_depth={{params.max_depth}}, min_samples_split={{params.min_samples_split}}, min_samples_leaf={{params.min_samples_leaf}}, criterion="{{params.criterion}}")\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{params.max_depth}}", str(max_depth))
    _code = _code.replace("{{params.min_samples_split}}", str(min_samples_split))
    _code = _code.replace("{{params.min_samples_leaf}}", str(min_samples_leaf))
    _code = _code.replace("{{params.criterion}}", str(criterion))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def random_forest(X_train=None, y_train=None, task='classification', n_estimators=100, max_depth=10, min_samples_split=2, max_features='sqrt', random_state=42):
    """Ensemble of decision trees with bagging and feature randomization
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        task (select, default='classification'): 
        n_estimators (number, default=100): 
        max_depth (number, default=10): 
        min_samples_split (number, default=2): 
        max_features (select, default='sqrt'): 
        random_state (number, default=42): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor']
    _code = '_max_features = None if "{{params.max_features}}" == "None" else "{{params.max_features}}"\nif "{{params.task}}" == "classification":\n    {{outputs.model}} = RandomForestClassifier(n_estimators={{params.n_estimators}}, max_depth={{params.max_depth}}, min_samples_split={{params.min_samples_split}}, max_features=_max_features, random_state={{params.random_state}})\n "else":\n    {{outputs.model}} = RandomForestRegressor(n_estimators={{params.n_estimators}}, max_depth={{params.max_depth}}, min_samples_split={{params.min_samples_split}}, max_features=_max_features, random_state={{params.random_state}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{params.n_estimators}}", str(n_estimators))
    _code = _code.replace("{{params.max_depth}}", str(max_depth))
    _code = _code.replace("{{params.min_samples_split}}", str(min_samples_split))
    _code = _code.replace("{{params.max_features}}", str(max_features))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def gradient_boosting(X_train=None, y_train=None, task='classification', n_estimators=100, learning_rate=0.1, max_depth=3, subsample=1.0, random_state=42):
    """Gradient-boosted decision tree ensemble via scikit-learn
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        task (select, default='classification'): 
        n_estimators (number, default=100): 
        learning_rate (number, default=0.1): 
        max_depth (number, default=3): 
        subsample (number, default=1.0): 
        random_state (number, default=42): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor']
    _code = 'if "{{params.task}}" == "classification":\n    {{outputs.model}} = GradientBoostingClassifier(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, max_depth={{params.max_depth}}, subsample={{params.subsample}}, random_state={{params.random_state}})\n "else":\n    {{outputs.model}} = GradientBoostingRegressor(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, max_depth={{params.max_depth}}, subsample={{params.subsample}}, random_state={{params.random_state}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{params.n_estimators}}", str(n_estimators))
    _code = _code.replace("{{params.learning_rate}}", str(learning_rate))
    _code = _code.replace("{{params.max_depth}}", str(max_depth))
    _code = _code.replace("{{params.subsample}}", str(subsample))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def xgboost(X_train=None, y_train=None, task='classification', n_estimators=100, learning_rate=0.1, max_depth=6, subsample=1.0, colsample_bytree=1.0, reg_alpha=0, reg_lambda=1, random_state=42):
    """Extreme Gradient Boosting — high-performance gradient-boosted trees
    
    Dependencies: pip install xgboost
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        task (select, default='classification'): 
        n_estimators (number, default=100): 
        learning_rate (number, default=0.1): 
        max_depth (number, default=6): 
        subsample (number, default=1.0): 
        colsample_bytree (number, default=1.0): 
        reg_alpha (number, default=0): 
        reg_lambda (number, default=1): 
        random_state (number, default=42): 
    
    Returns:
        model: 
    """
    _imports = ['import xgboost as xgb']
    _code = 'if "{{params.task}}" == "classification":\n    {{outputs.model}} = xgb.XGBClassifier(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, max_depth={{params.max_depth}}, subsample={{params.subsample}}, colsample_bytree={{params.colsample_bytree}}, reg_alpha={{params.reg_alpha}}, reg_lambda={{params.reg_lambda}}, random_state={{params.random_state}}, use_label_encoder=False, eval_metric="logloss")\n "else":\n    {{outputs.model}} = xgb.XGBRegressor(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, max_depth={{params.max_depth}}, subsample={{params.subsample}}, colsample_bytree={{params.colsample_bytree}}, reg_alpha={{params.reg_alpha}}, reg_lambda={{params.reg_lambda}}, random_state={{params.random_state}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{params.n_estimators}}", str(n_estimators))
    _code = _code.replace("{{params.learning_rate}}", str(learning_rate))
    _code = _code.replace("{{params.max_depth}}", str(max_depth))
    _code = _code.replace("{{params.subsample}}", str(subsample))
    _code = _code.replace("{{params.colsample_bytree}}", str(colsample_bytree))
    _code = _code.replace("{{params.reg_alpha}}", str(reg_alpha))
    _code = _code.replace("{{params.reg_lambda}}", str(reg_lambda))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def lightgbm(X_train=None, y_train=None, task='classification', n_estimators=100, learning_rate=0.1, max_depth=-1, num_leaves=31, subsample=1.0, colsample_bytree=1.0, random_state=42):
    """Microsoft's Light Gradient Boosting Machine — fast and memory-efficient
    
    Dependencies: pip install lightgbm
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        task (select, default='classification'): 
        n_estimators (number, default=100): 
        learning_rate (number, default=0.1): 
        max_depth (number, default=-1): -1 means no limit
        num_leaves (number, default=31): 
        subsample (number, default=1.0): 
        colsample_bytree (number, default=1.0): 
        random_state (number, default=42): 
    
    Returns:
        model: 
    """
    _imports = ['import lightgbm as lgb']
    _code = 'if "{{params.task}}" == "classification":\n    {{outputs.model}} = lgb.LGBMClassifier(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, max_depth={{params.max_depth}}, num_leaves={{params.num_leaves}}, subsample={{params.subsample}}, colsample_bytree={{params.colsample_bytree}}, random_state={{params.random_state}}, verbose=-1)\n "else":\n    {{outputs.model}} = lgb.LGBMRegressor(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, max_depth={{params.max_depth}}, num_leaves={{params.num_leaves}}, subsample={{params.subsample}}, colsample_bytree={{params.colsample_bytree}}, random_state={{params.random_state}}, verbose=-1)\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{params.n_estimators}}", str(n_estimators))
    _code = _code.replace("{{params.learning_rate}}", str(learning_rate))
    _code = _code.replace("{{params.max_depth}}", str(max_depth))
    _code = _code.replace("{{params.num_leaves}}", str(num_leaves))
    _code = _code.replace("{{params.subsample}}", str(subsample))
    _code = _code.replace("{{params.colsample_bytree}}", str(colsample_bytree))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def catboost(X_train=None, y_train=None, task='classification', iterations=100, learning_rate=0.1, depth=6, l2_leaf_reg=3.0, random_state=42):
    """Yandex CatBoost — gradient boosting with native categorical feature support
    
    Dependencies: pip install catboost
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        task (select, default='classification'): 
        iterations (number, default=100): 
        learning_rate (number, default=0.1): 
        depth (number, default=6): 
        l2_leaf_reg (number, default=3.0): 
        random_state (number, default=42): 
    
    Returns:
        model: 
    """
    _imports = ['from catboost import CatBoostClassifier, CatBoostRegressor']
    _code = 'if "{{params.task}}" == "classification":\n    {{outputs.model}} = CatBoostClassifier(iterations={{params.iterations}}, learning_rate={{params.learning_rate}}, depth={{params.depth}}, l2_leaf_reg={{params.l2_leaf_reg}}, random_state={{params.random_state}}, verbose=0)\n "else":\n    {{outputs.model}} = CatBoostRegressor(iterations={{params.iterations}}, learning_rate={{params.learning_rate}}, depth={{params.depth}}, l2_leaf_reg={{params.l2_leaf_reg}}, random_state={{params.random_state}}, verbose=0)\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{params.iterations}}", str(iterations))
    _code = _code.replace("{{params.learning_rate}}", str(learning_rate))
    _code = _code.replace("{{params.depth}}", str(depth))
    _code = _code.replace("{{params.l2_leaf_reg}}", str(l2_leaf_reg))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def adaboost(X_train=None, y_train=None, task='classification', n_estimators=50, learning_rate=1.0, random_state=42):
    """Adaptive Boosting — sequentially re-weights misclassified samples
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        task (select, default='classification'): 
        n_estimators (number, default=50): 
        learning_rate (number, default=1.0): 
        random_state (number, default=42): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.ensemble import AdaBoostClassifier, AdaBoostRegressor']
    _code = 'if "{{params.task}}" == "classification":\n    {{outputs.model}} = AdaBoostClassifier(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, random_state={{params.random_state}})\n "else":\n    {{outputs.model}} = AdaBoostRegressor(n_estimators={{params.n_estimators}}, learning_rate={{params.learning_rate}}, random_state={{params.random_state}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{params.n_estimators}}", str(n_estimators))
    _code = _code.replace("{{params.learning_rate}}", str(learning_rate))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def bagging_ensemble(X_train=None, y_train=None, task='classification', n_estimators=10, max_samples=1.0, max_features=1.0, random_state=42):
    """Bootstrap-aggregated ensemble of base estimators
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        task (select, default='classification'): 
        n_estimators (number, default=10): 
        max_samples (number, default=1.0): Fraction of samples to draw per estimator
        max_features (number, default=1.0): Fraction of features to draw per estimator
        random_state (number, default=42): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.ensemble import BaggingClassifier, BaggingRegressor']
    _code = 'if "{{params.task}}" == "classification":\n    {{outputs.model}} = BaggingClassifier(n_estimators={{params.n_estimators}}, max_samples={{params.max_samples}}, max_features={{params.max_features}}, random_state={{params.random_state}})\n "else":\n    {{outputs.model}} = BaggingRegressor(n_estimators={{params.n_estimators}}, max_samples={{params.max_samples}}, max_features={{params.max_features}}, random_state={{params.random_state}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{params.n_estimators}}", str(n_estimators))
    _code = _code.replace("{{params.max_samples}}", str(max_samples))
    _code = _code.replace("{{params.max_features}}", str(max_features))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def stacking_ensemble(X_train=None, y_train=None, base_models=None, task='classification', cv=5, passthrough=False):
    """Stacked generalization — trains a meta-learner on base model predictions
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
        base_models (list) (required): List of (name, estimator) tuples
    
    Parameters:
        task (select, default='classification'): 
        cv (number, default=5): Cross-validation folds for generating meta-features
        passthrough (boolean, default=False): Include original features alongside meta-features
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.ensemble import StackingClassifier, StackingRegressor', 'from sklearn.linear_model import LogisticRegression, Ridge']
    _code = 'if "{{params.task}}" == "classification":\n    {{outputs.model}} = StackingClassifier(estimators={{inputs.base_models}}, final_estimator=LogisticRegression(), cv={{params.cv}}, passthrough={{params.passthrough}})\n "else":\n    {{outputs.model}} = StackingRegressor(estimators={{inputs.base_models}}, final_estimator=Ridge(), cv={{params.cv}}, passthrough={{params.passthrough}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{params.cv}}", str(cv))
    _code = _code.replace("{{params.passthrough}}", str(passthrough))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{inputs.base_models}}", "base_models")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    _ns["base_models"] = base_models
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def voting_ensemble(X_train=None, y_train=None, base_models=None, task='classification', voting='soft'):
    """Combines multiple models via majority vote (classification) or averaging (regression)
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
        base_models (list) (required): List of (name, estimator) tuples
    
    Parameters:
        task (select, default='classification'): 
        voting (select, default='soft'): Only for classification
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.ensemble import VotingClassifier, VotingRegressor']
    _code = 'if "{{params.task}}" == "classification":\n    {{outputs.model}} = VotingClassifier(estimators={{inputs.base_models}}, voting="{{params.voting}}")\n "else":\n    {{outputs.model}} = VotingRegressor(estimators={{inputs.base_models}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{params.voting}}", str(voting))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{inputs.base_models}}", "base_models")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    _ns["base_models"] = base_models
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def svm_classifier(X_train=None, y_train=None, C=1.0, kernel='rbf', gamma='scale', degree=3, probability=True):
    """Support Vector Machine classifier using kernel trick
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        C (number, default=1.0): 
        kernel (select, default='rbf'): 
        gamma (select, default='scale'): Kernel coefficient
        degree (number, default=3): Degree for polynomial kernel
        probability (boolean, default=True): Enable probability predictions (slower training)
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.svm import SVC']
    _code = '{{outputs.model}} = SVC(C={{params.C}}, kernel="{{params.kernel}}", gamma="{{params.gamma}}", degree={{params.degree}}, probability={{params.probability}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.C}}", str(C))
    _code = _code.replace("{{params.kernel}}", str(kernel))
    _code = _code.replace("{{params.gamma}}", str(gamma))
    _code = _code.replace("{{params.degree}}", str(degree))
    _code = _code.replace("{{params.probability}}", str(probability))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def svm_regressor(X_train=None, y_train=None, C=1.0, kernel='rbf', epsilon=0.1, gamma='scale'):
    """Support Vector Machine for regression (epsilon-SVR)
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        C (number, default=1.0): 
        kernel (select, default='rbf'): 
        epsilon (number, default=0.1): Epsilon in the epsilon-SVR model
        gamma (select, default='scale'): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.svm import SVR']
    _code = '{{outputs.model}} = SVR(C={{params.C}}, kernel="{{params.kernel}}", epsilon={{params.epsilon}}, gamma="{{params.gamma}}")\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.C}}", str(C))
    _code = _code.replace("{{params.kernel}}", str(kernel))
    _code = _code.replace("{{params.epsilon}}", str(epsilon))
    _code = _code.replace("{{params.gamma}}", str(gamma))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def svr(X_train=None, y_train=None, C=1.0, epsilon=0.0, loss='epsilon_insensitive', max_iter=1000):
    """Linear Support Vector Regression — fast for large datasets
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        C (number, default=1.0): 
        epsilon (number, default=0.0): Epsilon parameter in epsilon-insensitive loss
        loss (select, default='epsilon_insensitive'): 
        max_iter (number, default=1000): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.svm import LinearSVR']
    _code = '{{outputs.model}} = LinearSVR(C={{params.C}}, epsilon={{params.epsilon}}, loss="{{params.loss}}", max_iter={{params.max_iter}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.C}}", str(C))
    _code = _code.replace("{{params.epsilon}}", str(epsilon))
    _code = _code.replace("{{params.loss}}", str(loss))
    _code = _code.replace("{{params.max_iter}}", str(max_iter))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def kmeans(X=None, n_clusters=8, init='k-means++', n_init=10, max_iter=300, random_state=42):
    """K-Means clustering — partitions data into k clusters by centroid distance
    
    Dependencies: pip install scikit-learn
    
    Args:
        X (array) (required): Feature matrix to cluster
    
    Parameters:
        n_clusters (number, default=8): 
        init (select, default='k-means++'): 
        n_init (number, default=10): Number of times to run with different seeds
        max_iter (number, default=300): 
        random_state (number, default=42): 
    
    Returns:
        dict with keys:
            model (model): 
            labels (array): 
    """
    _imports = ['from sklearn.cluster import KMeans']
    _code = '{{outputs.model}} = KMeans(n_clusters={{params.n_clusters}}, init="{{params.init}}", n_init={{params.n_init}}, max_iter={{params.max_iter}}, random_state={{params.random_state}})\n{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})'
    
    _code = _code.replace("{{params.n_clusters}}", str(n_clusters))
    _code = _code.replace("{{params.init}}", str(init))
    _code = _code.replace("{{params.n_init}}", str(n_init))
    _code = _code.replace("{{params.max_iter}}", str(max_iter))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.X}}", "X")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.labels}}", "_out_labels")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X"] = X
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "labels": _ns.get("_out_labels")}


def dbscan(X=None, eps=0.5, min_samples=5, metric='euclidean'):
    """Density-Based Spatial Clustering — finds arbitrarily-shaped clusters
    
    Dependencies: pip install scikit-learn
    
    Args:
        X (array) (required): 
    
    Parameters:
        eps (number, default=0.5): Maximum distance between two samples in the same neighborhood
        min_samples (number, default=5): Minimum number of samples in a neighborhood for a core point
        metric (select, default='euclidean'): 
    
    Returns:
        dict with keys:
            model (model): 
            labels (array): 
    """
    _imports = ['from sklearn.cluster import DBSCAN']
    _code = '{{outputs.model}} = DBSCAN(eps={{params.eps}}, min_samples={{params.min_samples}}, metric="{{params.metric}}")\n{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})'
    
    _code = _code.replace("{{params.eps}}", str(eps))
    _code = _code.replace("{{params.min_samples}}", str(min_samples))
    _code = _code.replace("{{params.metric}}", str(metric))
    _code = _code.replace("{{inputs.X}}", "X")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.labels}}", "_out_labels")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X"] = X
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "labels": _ns.get("_out_labels")}


def hierarchical_clustering(X=None, n_clusters=2, linkage='ward', metric='euclidean'):
    """Agglomerative hierarchical clustering — builds a tree of clusters
    
    Dependencies: pip install scikit-learn
    
    Args:
        X (array) (required): 
    
    Parameters:
        n_clusters (number, default=2): 
        linkage (select, default='ward'): 
        metric (select, default='euclidean'): Distance metric (ward requires euclidean)
    
    Returns:
        dict with keys:
            model (model): 
            labels (array): 
    """
    _imports = ['from sklearn.cluster import AgglomerativeClustering']
    _code = '{{outputs.model}} = AgglomerativeClustering(n_clusters={{params.n_clusters}}, linkage="{{params.linkage}}", metric="{{params.metric}}")\n{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})'
    
    _code = _code.replace("{{params.n_clusters}}", str(n_clusters))
    _code = _code.replace("{{params.linkage}}", str(linkage))
    _code = _code.replace("{{params.metric}}", str(metric))
    _code = _code.replace("{{inputs.X}}", "X")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.labels}}", "_out_labels")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X"] = X
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "labels": _ns.get("_out_labels")}


def gaussian_mixture(X=None, n_components=3, covariance_type='full', max_iter=100, random_state=42):
    """Probabilistic clustering via mixture of Gaussian distributions
    
    Dependencies: pip install scikit-learn
    
    Args:
        X (array) (required): 
    
    Parameters:
        n_components (number, default=3): 
        covariance_type (select, default='full'): 
        max_iter (number, default=100): 
        random_state (number, default=42): 
    
    Returns:
        dict with keys:
            model (model): 
            labels (array): 
    """
    _imports = ['from sklearn.mixture import GaussianMixture']
    _code = '{{outputs.model}} = GaussianMixture(n_components={{params.n_components}}, covariance_type="{{params.covariance_type}}", max_iter={{params.max_iter}}, random_state={{params.random_state}})\n{{outputs.model}}.fit({{inputs.X}})\n{{outputs.labels}} = {{outputs.model}}.predict({{inputs.X}})'
    
    _code = _code.replace("{{params.n_components}}", str(n_components))
    _code = _code.replace("{{params.covariance_type}}", str(covariance_type))
    _code = _code.replace("{{params.max_iter}}", str(max_iter))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.X}}", "X")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.labels}}", "_out_labels")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X"] = X
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "labels": _ns.get("_out_labels")}


def isolation_forest(X=None, n_estimators=100, contamination=0.1, max_samples='auto', random_state=42):
    """Anomaly detection by isolating observations using random splits
    
    Dependencies: pip install scikit-learn
    
    Args:
        X (array) (required): 
    
    Parameters:
        n_estimators (number, default=100): 
        contamination (number, default=0.1): Expected proportion of outliers
        max_samples (select, default='auto'): 
        random_state (number, default=42): 
    
    Returns:
        dict with keys:
            model (model): 
            labels (array): 1 for inliers, -1 for outliers
    """
    _imports = ['from sklearn.ensemble import IsolationForest']
    _code = '_max_samples = "auto" if "{{params.max_samples}}" == "auto" else int("{{params.max_samples}}")\n{{outputs.model}} = IsolationForest(n_estimators={{params.n_estimators}}, contamination={{params.contamination}}, max_samples=_max_samples, random_state={{params.random_state}})\n{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})'
    
    _code = _code.replace("{{params.n_estimators}}", str(n_estimators))
    _code = _code.replace("{{params.contamination}}", str(contamination))
    _code = _code.replace("{{params.max_samples}}", str(max_samples))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.X}}", "X")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.labels}}", "_out_labels")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X"] = X
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "labels": _ns.get("_out_labels")}


def one_class_svm(X=None, kernel='rbf', nu=0.1, gamma='scale'):
    """Unsupervised anomaly detection via support vector boundary
    
    Dependencies: pip install scikit-learn
    
    Args:
        X (array) (required): 
    
    Parameters:
        kernel (select, default='rbf'): 
        nu (number, default=0.1): Upper bound on the fraction of outliers
        gamma (select, default='scale'): 
    
    Returns:
        dict with keys:
            model (model): 
            labels (array): 1 for inliers, -1 for outliers
    """
    _imports = ['from sklearn.svm import OneClassSVM']
    _code = '{{outputs.model}} = OneClassSVM(kernel="{{params.kernel}}", nu={{params.nu}}, gamma="{{params.gamma}}")\n{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})'
    
    _code = _code.replace("{{params.kernel}}", str(kernel))
    _code = _code.replace("{{params.nu}}", str(nu))
    _code = _code.replace("{{params.gamma}}", str(gamma))
    _code = _code.replace("{{inputs.X}}", "X")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.labels}}", "_out_labels")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X"] = X
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "labels": _ns.get("_out_labels")}


def optics(X=None, min_samples=5, max_eps=None, metric='minkowski', cluster_method='xi'):
    """Ordering Points To Identify Clustering Structure — density-based like DBSCAN but no fixed eps
    
    Dependencies: pip install numpy scikit-learn
    
    Args:
        X (array) (required): 
    
    Parameters:
        min_samples (number, default=5): 
        max_eps (number, default=None): Maximum reachability distance (inf = no limit)
        metric (select, default='minkowski'): 
        cluster_method (select, default='xi'): 
    
    Returns:
        dict with keys:
            model (model): 
            labels (array): 
    """
    _imports = ['from sklearn.cluster import OPTICS', 'import numpy as np']
    _code = '_max_eps = np.inf if {{params.max_eps}} == float("inf") else {{params.max_eps}}\n{{outputs.model}} = OPTICS(min_samples={{params.min_samples}}, max_eps=_max_eps, metric="{{params.metric}}", cluster_method="{{params.cluster_method}}")\n{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})'
    
    _code = _code.replace("{{params.min_samples}}", str(min_samples))
    _code = _code.replace("{{params.max_eps}}", str(max_eps))
    _code = _code.replace("{{params.metric}}", str(metric))
    _code = _code.replace("{{params.cluster_method}}", str(cluster_method))
    _code = _code.replace("{{inputs.X}}", "X")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.labels}}", "_out_labels")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X"] = X
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "labels": _ns.get("_out_labels")}


def mean_shift(X=None, bandwidth=0, bin_seeding=False):
    """Non-parametric clustering by iteratively shifting toward density modes
    
    Dependencies: pip install scikit-learn
    
    Args:
        X (array) (required): 
    
    Parameters:
        bandwidth (number, default=0): Kernel bandwidth (0 = auto-estimate)
        bin_seeding (boolean, default=False): Use binning to speed up computation
    
    Returns:
        dict with keys:
            model (model): 
            labels (array): 
    """
    _imports = ['from sklearn.cluster import MeanShift, estimate_bandwidth']
    _code = '_bandwidth = {{params.bandwidth}} if {{params.bandwidth}} > 0 else estimate_bandwidth({{inputs.X}})\n{{outputs.model}} = MeanShift(bandwidth=_bandwidth, bin_seeding={{params.bin_seeding}})\n{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})'
    
    _code = _code.replace("{{params.bandwidth}}", str(bandwidth))
    _code = _code.replace("{{params.bin_seeding}}", str(bin_seeding))
    _code = _code.replace("{{inputs.X}}", "X")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.labels}}", "_out_labels")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X"] = X
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "labels": _ns.get("_out_labels")}


def spectral_clustering(X=None, n_clusters=8, affinity='rbf', n_neighbors=10, random_state=42):
    """Graph-based clustering using the eigenvalues of the affinity matrix
    
    Dependencies: pip install scikit-learn
    
    Args:
        X (array) (required): 
    
    Parameters:
        n_clusters (number, default=8): 
        affinity (select, default='rbf'): 
        n_neighbors (number, default=10): Used when affinity is nearest_neighbors
        random_state (number, default=42): 
    
    Returns:
        dict with keys:
            model (model): 
            labels (array): 
    """
    _imports = ['from sklearn.cluster import SpectralClustering']
    _code = '{{outputs.model}} = SpectralClustering(n_clusters={{params.n_clusters}}, affinity="{{params.affinity}}", n_neighbors={{params.n_neighbors}}, random_state={{params.random_state}})\n{{outputs.labels}} = {{outputs.model}}.fit_predict({{inputs.X}})'
    
    _code = _code.replace("{{params.n_clusters}}", str(n_clusters))
    _code = _code.replace("{{params.affinity}}", str(affinity))
    _code = _code.replace("{{params.n_neighbors}}", str(n_neighbors))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.X}}", "X")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    _code = _code.replace("{{outputs.labels}}", "_out_labels")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X"] = X
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"model": _ns.get("_out_model"), "labels": _ns.get("_out_labels")}


def gaussian_process(X_train=None, y_train=None, task='regression', kernel='rbf', alpha=1e-10, n_restarts_optimizer=0):
    """Gaussian Process for regression/classification with uncertainty estimates
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        task (select, default='regression'): 
        kernel (select, default='rbf'): 
        alpha (number, default=1e-10): Noise level added to diagonal (regression only)
        n_restarts_optimizer (number, default=0): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.gaussian_process import GaussianProcessRegressor, GaussianProcessClassifier', 'from sklearn.gaussian_process.kernels import RBF, Matern, RationalQuadratic, DotProduct']
    _code = '_kernels = {"rbf": RBF(), "matern": Matern(), "rational_quadratic": RationalQuadratic(), "dot_product": DotProduct()}\n_kernel = _kernels["{{params.kernel}}"]\nif "{{params.task}}" == "regression":\n    {{outputs.model}} = GaussianProcessRegressor(kernel=_kernel, alpha={{params.alpha}}, n_restarts_optimizer={{params.n_restarts_optimizer}})\n "else":\n    {{outputs.model}} = GaussianProcessClassifier(kernel=_kernel, n_restarts_optimizer={{params.n_restarts_optimizer}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{params.kernel}}", str(kernel))
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.n_restarts_optimizer}}", str(n_restarts_optimizer))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def bayesian_ridge(X_train=None, y_train=None, max_iter=300, alpha_1=1e-06, alpha_2=1e-06, lambda_1=1e-06, lambda_2=1e-06):
    """Bayesian ridge regression with automatic relevance determination of regularization
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        max_iter (number, default=300): 
        alpha_1 (number, default=1e-06): Shape parameter for Gamma prior over alpha
        alpha_2 (number, default=1e-06): Rate parameter for Gamma prior over alpha
        lambda_1 (number, default=1e-06): Shape parameter for Gamma prior over lambda
        lambda_2 (number, default=1e-06): Rate parameter for Gamma prior over lambda
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.linear_model import BayesianRidge']
    _code = '{{outputs.model}} = BayesianRidge(max_iter={{params.max_iter}}, alpha_1={{params.alpha_1}}, alpha_2={{params.alpha_2}}, lambda_1={{params.lambda_1}}, lambda_2={{params.lambda_2}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.max_iter}}", str(max_iter))
    _code = _code.replace("{{params.alpha_1}}", str(alpha_1))
    _code = _code.replace("{{params.alpha_2}}", str(alpha_2))
    _code = _code.replace("{{params.lambda_1}}", str(lambda_1))
    _code = _code.replace("{{params.lambda_2}}", str(lambda_2))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def ard_regression(X_train=None, y_train=None, max_iter=300, threshold_lambda=10000, alpha_1=1e-06, alpha_2=1e-06):
    """Automatic Relevance Determination regression — sparse Bayesian learning
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        max_iter (number, default=300): 
        threshold_lambda (number, default=10000): Threshold for pruning irrelevant features
        alpha_1 (number, default=1e-06): 
        alpha_2 (number, default=1e-06): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.linear_model import ARDRegression']
    _code = '{{outputs.model}} = ARDRegression(max_iter={{params.max_iter}}, threshold_lambda={{params.threshold_lambda}}, alpha_1={{params.alpha_1}}, alpha_2={{params.alpha_2}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.max_iter}}", str(max_iter))
    _code = _code.replace("{{params.threshold_lambda}}", str(threshold_lambda))
    _code = _code.replace("{{params.alpha_1}}", str(alpha_1))
    _code = _code.replace("{{params.alpha_2}}", str(alpha_2))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def poisson_regression(X_train=None, y_train=None, alpha=1.0, max_iter=100):
    """Generalized linear model for count data with Poisson distribution
    
    Dependencies: pip install scikit-learn
    
    Args:
        X_train (array) (required): 
        y_train (array) (required): 
    
    Parameters:
        alpha (number, default=1.0): Regularization strength
        max_iter (number, default=100): 
    
    Returns:
        model: 
    """
    _imports = ['from sklearn.linear_model import PoissonRegressor']
    _code = '{{outputs.model}} = PoissonRegressor(alpha={{params.alpha}}, max_iter={{params.max_iter}})\n{{outputs.model}}.fit({{inputs.X_train}}, {{inputs.y_train}})'
    
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.max_iter}}", str(max_iter))
    _code = _code.replace("{{inputs.X_train}}", "X_train")
    _code = _code.replace("{{inputs.y_train}}", "y_train")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["X_train"] = X_train
    _ns["y_train"] = y_train
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def cox_regression(dataframe=None, duration_col='duration', event_col='event', penalizer=0.0, l1_ratio=0.0):
    """Cox proportional hazards model for survival analysis
    
    Dependencies: pip install lifelines
    
    Args:
        dataframe (dataframe) (required): DataFrame with covariates, duration, and event columns
    
    Parameters:
        duration_col (string, default='duration'): Column name for observed durations
        event_col (string, default='event'): Column name for event indicator (1 = event, 0 = censored)
        penalizer (number, default=0.0): L2 regularization strength
        l1_ratio (number, default=0.0): Elastic net mixing (0 = pure L2, 1 = pure L1)
    
    Returns:
        model: 
    """
    _imports = ['from lifelines import CoxPHFitter']
    _code = '{{outputs.model}} = CoxPHFitter(penalizer={{params.penalizer}}, l1_ratio={{params.l1_ratio}})\n{{outputs.model}}.fit({{inputs.dataframe}}, duration_col="{{params.duration_col}}", event_col="{{params.event_col}}")'
    
    _code = _code.replace("{{params.duration_col}}", str(duration_col))
    _code = _code.replace("{{params.event_col}}", str(event_col))
    _code = _code.replace("{{params.penalizer}}", str(penalizer))
    _code = _code.replace("{{params.l1_ratio}}", str(l1_ratio))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_model")


def sklearn_predict(model=None, X=None):
    """Run predict() on a fitted scikit-learn estimator (classifier/regressor)
    
    Args:
        model (model) (required): 
        X (array) (required): 
    
    Returns:
        tensor: 
    """
    _imports = []
    _code = '{{outputs.y_pred}} = {{inputs.model}}.predict({{inputs.X}})'
    
    _code = _code.replace("{{inputs.model}}", "model")
    _code = _code.replace("{{inputs.X}}", "X")
    _code = _code.replace("{{outputs.y_pred}}", "_out_y_pred")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["model"] = model
    _ns["X"] = X
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_y_pred")

