"""
aiblocks.data_processing — Data Processing

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def filter_rows(dataframe=None, expression='', drop_index=True):
    """Filter DataFrame rows using a boolean expression or query string
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        expression (string, default=''): Pandas query expression for filtering rows
        drop_index (boolean, default=True): Reset the index after filtering
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '{{outputs.filtered}} = {{inputs.dataframe}}.query("{{params.expression}}")\nif {{params.drop_index}}:\n    {{outputs.filtered}} = {{outputs.filtered}}.reset_index(drop=True)'
    
    _code = _code.replace("{{params.expression}}", str(expression))
    _code = _code.replace("{{params.drop_index}}", str(drop_index))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.filtered}}", "_out_filtered")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_filtered")


def select_columns(dataframe=None, columns=''):
    """Select a subset of columns from a DataFrame
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        columns (string, default=''): Comma-separated column names to keep
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()]\n{{outputs.selected}} = {{inputs.dataframe}}[_cols]'
    
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.selected}}", "_out_selected")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_selected")


def rename_column(dataframe=None, mapping={}):
    """Rename one or more DataFrame columns using a mapping
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        mapping (json, default={}): JSON object mapping old column names to new names
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd', 'import json']
    _code = "_mapping = json.loads('''{{params.mapping}}''')\n{{outputs.renamed}} = {{inputs.dataframe}}.rename(columns=_mapping)"
    
    _code = _code.replace("{{params.mapping}}", str(mapping))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.renamed}}", "_out_renamed")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_renamed")


def drop_nulls(dataframe=None, axis='rows', how='any', subset=''):
    """Remove rows or columns that contain null / NaN values
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        axis (select, default='rows'): Drop rows or columns with nulls
        how (select, default='any'): 
        subset (string, default=''): Only consider these columns (comma-separated, empty = all)
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '_axis = 0 if "{{params.axis}}" == "rows" else 1\n_subset = [c.strip() for c in "{{params.subset}}".split(",") if c.strip()] or None\n{{outputs.cleaned}} = {{inputs.dataframe}}.dropna(axis=_axis, how="{{params.how}}", subset=_subset).reset_index(drop=True)'
    
    _code = _code.replace("{{params.axis}}", str(axis))
    _code = _code.replace("{{params.how}}", str(how))
    _code = _code.replace("{{params.subset}}", str(subset))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.cleaned}}", "_out_cleaned")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_cleaned")


def fill_nulls(dataframe=None, strategy='mean', fill_value='0', columns=''):
    """Replace null / NaN values using a chosen strategy (constant, mean, median, ffill, bfill)
    
    Dependencies: pip install numpy pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        strategy (select, default='mean'): 
        fill_value (string, default='0'): Value used when strategy is 'constant'
        columns (string, default=''): Columns to fill (empty = all)
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd', 'import numpy as np']
    _code = '_strategy = "{{params.strategy}}"\n_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.columns.tolist()\n{{outputs.filled}} = {{inputs.dataframe}}.copy()\nfor _col in _cols:\n    if _strategy == "constant":\n        {{outputs.filled}}[_col] = {{outputs.filled}}[_col].fillna({{params.fill_value}})\n    elif _strategy == "mean":\n        {{outputs.filled}}[_col] = {{outputs.filled}}[_col].fillna({{outputs.filled}}[_col].mean())\n    elif _strategy == "median":\n        {{outputs.filled}}[_col] = {{outputs.filled}}[_col].fillna({{outputs.filled}}[_col].median())\n    elif _strategy == "mode":\n        {{outputs.filled}}[_col] = {{outputs.filled}}[_col].fillna({{outputs.filled}}[_col].mode().iloc[0])\n    elif _strategy == "ffill":\n        {{outputs.filled}}[_col] = {{outputs.filled}}[_col].ffill()\n    elif _strategy == "bfill":\n        {{outputs.filled}}[_col] = {{outputs.filled}}[_col].bfill()'
    
    _code = _code.replace("{{params.strategy}}", str(strategy))
    _code = _code.replace("{{params.fill_value}}", str(fill_value))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.filled}}", "_out_filled")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_filled")


def deduplicate(dataframe=None, subset='', keep='first'):
    """Remove duplicate rows from a DataFrame
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        subset (string, default=''): Columns to consider for identifying duplicates (empty = all)
        keep (select, default='first'): 
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '_subset = [c.strip() for c in "{{params.subset}}".split(",") if c.strip()] or None\n_keep = False if "{{params.keep}}" == "False" else "{{params.keep}}"\n{{outputs.deduped}} = {{inputs.dataframe}}.drop_duplicates(subset=_subset, keep=_keep).reset_index(drop=True)'
    
    _code = _code.replace("{{params.subset}}", str(subset))
    _code = _code.replace("{{params.keep}}", str(keep))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.deduped}}", "_out_deduped")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_deduped")


def sort(dataframe=None, by='', ascending=True, na_position='last'):
    """Sort a DataFrame by one or more columns
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        by (string, default=''): Comma-separated column names to sort by
        ascending (boolean, default=True): 
        na_position (select, default='last'): 
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '_by = [c.strip() for c in "{{params.by}}".split(",") if c.strip()]\n{{outputs.sorted}} = {{inputs.dataframe}}.sort_values(by=_by, ascending={{params.ascending}}, na_position="{{params.na_position}}").reset_index(drop=True)'
    
    _code = _code.replace("{{params.by}}", str(by))
    _code = _code.replace("{{params.ascending}}", str(ascending))
    _code = _code.replace("{{params.na_position}}", str(na_position))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.sorted}}", "_out_sorted")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_sorted")


def group_by(dataframe=None, by='', agg_func='mean', as_index=False):
    """Group a DataFrame by one or more columns and apply an aggregation function
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        by (string, default=''): 
        agg_func (select, default='mean'): 
        as_index (boolean, default=False): 
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '_by = [c.strip() for c in "{{params.by}}".split(",") if c.strip()]\n{{outputs.grouped}} = {{inputs.dataframe}}.groupby(_by, as_index={{params.as_index}}).agg("{{params.agg_func}}").reset_index()'
    
    _code = _code.replace("{{params.by}}", str(by))
    _code = _code.replace("{{params.agg_func}}", str(agg_func))
    _code = _code.replace("{{params.as_index}}", str(as_index))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.grouped}}", "_out_grouped")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_grouped")


def aggregate(dataframe=None, agg_spec={}):
    """Apply multiple aggregation functions to different columns using a JSON spec
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        agg_spec (json, default={}): JSON mapping of column names to aggregation function(s)
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd', 'import json']
    _code = "_spec = json.loads('''{{params.agg_spec}}''')\n{{outputs.aggregated}} = {{inputs.dataframe}}.agg(_spec)\nif isinstance({{outputs.aggregated}}, pd.Series):\n    {{outputs.aggregated}} = {{outputs.aggregated}}.to_frame().T\n{{outputs.aggregated}} = {{outputs.aggregated}}.reset_index()"
    
    _code = _code.replace("{{params.agg_spec}}", str(agg_spec))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.aggregated}}", "_out_aggregated")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_aggregated")


def join_merge(left=None, right=None, on='', how='inner', suffixes_left='_x', suffixes_right='_y'):
    """Join two DataFrames on one or more key columns (SQL-style merge)
    
    Dependencies: pip install pandas
    
    Args:
        left (dataframe) (required): 
        right (dataframe) (required): 
    
    Parameters:
        on (string, default=''): Comma-separated column names to join on
        how (select, default='inner'): 
        suffixes_left (string, default='_x'): 
        suffixes_right (string, default='_y'): 
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '_on = [c.strip() for c in "{{params.on}}".split(",") if c.strip()] or None\n{{outputs.merged}} = pd.merge({{inputs.left}}, {{inputs.right}}, on=_on, how="{{params.how}}", suffixes=("{{params.suffixes_left}}", "{{params.suffixes_right}}"))'
    
    _code = _code.replace("{{params.on}}", str(on))
    _code = _code.replace("{{params.how}}", str(how))
    _code = _code.replace("{{params.suffixes_left}}", str(suffixes_left))
    _code = _code.replace("{{params.suffixes_right}}", str(suffixes_right))
    _code = _code.replace("{{inputs.left}}", "left")
    _code = _code.replace("{{inputs.right}}", "right")
    _code = _code.replace("{{outputs.merged}}", "_out_merged")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["left"] = left
    _ns["right"] = right
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_merged")


def pivot(dataframe=None, index='', columns='', values='', agg_func='mean'):
    """Reshape a DataFrame from long to wide format using pivot or pivot_table
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        index (string, default=''): 
        columns (string, default=''): Column whose unique values become new columns
        values (string, default=''): 
        agg_func (select, default='mean'): Aggregation when duplicates exist
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '{{outputs.pivoted}} = {{inputs.dataframe}}.pivot_table(\n    index="{{params.index}}",\n    columns="{{params.columns}}",\n    values="{{params.values}}",\n    aggfunc="{{params.agg_func}}"\n).reset_index()\n{{outputs.pivoted}}.columns = [str(c) for c in {{outputs.pivoted}}.columns]'
    
    _code = _code.replace("{{params.index}}", str(index))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.values}}", str(values))
    _code = _code.replace("{{params.agg_func}}", str(agg_func))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.pivoted}}", "_out_pivoted")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_pivoted")


def melt_unpivot(dataframe=None, id_vars='', value_vars='', var_name='variable', value_name='value'):
    """Reshape a DataFrame from wide to long format (unpivot)
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        id_vars (string, default=''): Columns to keep as identifiers
        value_vars (string, default=''): Columns to unpivot (empty = all non-id columns)
        var_name (string, default='variable'): 
        value_name (string, default='value'): 
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '_id_vars = [c.strip() for c in "{{params.id_vars}}".split(",") if c.strip()] or None\n_value_vars = [c.strip() for c in "{{params.value_vars}}".split(",") if c.strip()] or None\n{{outputs.melted}} = {{inputs.dataframe}}.melt(id_vars=_id_vars, value_vars=_value_vars, var_name="{{params.var_name}}", value_name="{{params.value_name}}")'
    
    _code = _code.replace("{{params.id_vars}}", str(id_vars))
    _code = _code.replace("{{params.value_vars}}", str(value_vars))
    _code = _code.replace("{{params.var_name}}", str(var_name))
    _code = _code.replace("{{params.value_name}}", str(value_name))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.melted}}", "_out_melted")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_melted")


def sample(dataframe=None, mode='n', n=100, frac=0.1, random_state=42, replace=False):
    """Randomly sample rows from a DataFrame by count or fraction
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        mode (select, default='n'): 
        n (number, default=100): 
        frac (number, default=0.1): 
        random_state (number, default=42): 
        replace (boolean, default=False): 
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = 'if "{{params.mode}}" == "n":\n    {{outputs.sampled}} = {{inputs.dataframe}}.sample(n={{params.n}}, random_state={{params.random_state}}, replace={{params.replace}}).reset_index(drop=True)\n "else":\n    {{outputs.sampled}} = {{inputs.dataframe}}.sample(frac={{params.frac}}, random_state={{params.random_state}}, replace={{params.replace}}).reset_index(drop=True)'
    
    _code = _code.replace("{{params.mode}}", str(mode))
    _code = _code.replace("{{params.n}}", str(n))
    _code = _code.replace("{{params.frac}}", str(frac))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{params.replace}}", str(replace))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.sampled}}", "_out_sampled")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_sampled")


def train_val_test_split(dataframe=None, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15, random_state=42, shuffle=True):
    """Split a DataFrame into train, validation, and test sets
    
    Dependencies: pip install pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        train_ratio (number, default=0.7): 
        val_ratio (number, default=0.15): 
        test_ratio (number, default=0.15): 
        random_state (number, default=42): 
        shuffle (boolean, default=True): 
    
    Returns:
        dict with keys:
            train (dataframe): 
            val (dataframe): 
            test (dataframe): 
    """
    _imports = ['import pandas as pd', 'from sklearn.model_selection import train_test_split']
    _code = '_train_ratio = {{params.train_ratio}}\n_val_ratio = {{params.val_ratio}}\n_test_ratio = {{params.test_ratio}}\n{{outputs.train}}, _temp = train_test_split({{inputs.dataframe}}, test_size=1 - _train_ratio, random_state={{params.random_state}}, shuffle={{params.shuffle}})\n_relative_val = _val_ratio / (_val_ratio + _test_ratio)\n{{outputs.val}}, {{outputs.test}} = train_test_split(_temp, test_size=1 - _relative_val, random_state={{params.random_state}}, shuffle={{params.shuffle}})\n{{outputs.train}} = {{outputs.train}}.reset_index(drop=True)\n{{outputs.val}} = {{outputs.val}}.reset_index(drop=True)\n{{outputs.test}} = {{outputs.test}}.reset_index(drop=True)'
    
    _code = _code.replace("{{params.train_ratio}}", str(train_ratio))
    _code = _code.replace("{{params.val_ratio}}", str(val_ratio))
    _code = _code.replace("{{params.test_ratio}}", str(test_ratio))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{params.shuffle}}", str(shuffle))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.train}}", "_out_train")
    _code = _code.replace("{{outputs.val}}", "_out_val")
    _code = _code.replace("{{outputs.test}}", "_out_test")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"train": _ns.get("_out_train"), "val": _ns.get("_out_val"), "test": _ns.get("_out_test")}


def k_fold_split(dataframe=None, n_splits=5, shuffle=True, random_state=42):
    """Generate K-Fold cross-validation train/test index splits
    
    Dependencies: pip install scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        n_splits (number, default=5): 
        shuffle (boolean, default=True): 
        random_state (number, default=42): 
    
    Returns:
        list: List of (train_idx, test_idx) tuples
    """
    _imports = ['from sklearn.model_selection import KFold']
    _code = '_kf = KFold(n_splits={{params.n_splits}}, shuffle={{params.shuffle}}, random_state={{params.random_state}} if {{params.shuffle}} else None)\n{{outputs.folds}} = list(_kf.split({{inputs.dataframe}}))'
    
    _code = _code.replace("{{params.n_splits}}", str(n_splits))
    _code = _code.replace("{{params.shuffle}}", str(shuffle))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.folds}}", "_out_folds")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_folds")


def stratified_split(dataframe=None, target_column='', test_size=0.2, random_state=42):
    """Split data while preserving the class distribution of a target column
    
    Dependencies: pip install pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        target_column (string, default=''): 
        test_size (number, default=0.2): 
        random_state (number, default=42): 
    
    Returns:
        dict with keys:
            train (dataframe): 
            test (dataframe): 
    """
    _imports = ['import pandas as pd', 'from sklearn.model_selection import train_test_split']
    _code = '{{outputs.train}}, {{outputs.test}} = train_test_split(\n    {{inputs.dataframe}},\n    test_size={{params.test_size}},\n    stratify={{inputs.dataframe}}["{{params.target_column}}"],\n    random_state={{params.random_state}}\n)\n{{outputs.train}} = {{outputs.train}}.reset_index(drop=True)\n{{outputs.test}} = {{outputs.test}}.reset_index(drop=True)'
    
    _code = _code.replace("{{params.target_column}}", str(target_column))
    _code = _code.replace("{{params.test_size}}", str(test_size))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.train}}", "_out_train")
    _code = _code.replace("{{outputs.test}}", "_out_test")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"train": _ns.get("_out_train"), "test": _ns.get("_out_test")}


def shuffle(dataframe=None, random_state=42):
    """Randomly shuffle the rows of a DataFrame
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        random_state (number, default=42): 
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '{{outputs.shuffled}} = {{inputs.dataframe}}.sample(frac=1.0, random_state={{params.random_state}}).reset_index(drop=True)'
    
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.shuffled}}", "_out_shuffled")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_shuffled")


def batch(dataframe=None, batch_size=32, drop_last=False):
    """Split a DataFrame into fixed-size batches (chunks)
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        batch_size (number, default=32): 
        drop_last (boolean, default=False): Drop the last batch if it is smaller than batch_size
    
    Returns:
        list: List of DataFrame chunks
    """
    _imports = ['import pandas as pd', 'import math']
    _code = '_n = len({{inputs.dataframe}})\n_bs = {{params.batch_size}}\n{{outputs.batches}} = [{{inputs.dataframe}}.iloc[i:i+_bs].reset_index(drop=True) for i in range(0, _n, _bs)]\nif {{params.drop_last}} and len({{outputs.batches}}) > 0 and len({{outputs.batches}}[-1]) < _bs:\n    {{outputs.batches}} = {{outputs.batches}}[:-1]'
    
    _code = _code.replace("{{params.batch_size}}", str(batch_size))
    _code = _code.replace("{{params.drop_last}}", str(drop_last))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.batches}}", "_out_batches")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_batches")


def window_slide(dataframe=None, window_size=10, stride=1):
    """Create sliding window views over a DataFrame or array for time-series / sequence tasks
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        window_size (number, default=10): 
        stride (number, default=1): 
    
    Returns:
        list: List of windowed DataFrames
    """
    _imports = ['import pandas as pd']
    _code = '_ws = {{params.window_size}}\n_stride = {{params.stride}}\n_n = len({{inputs.dataframe}})\n{{outputs.windows}} = [{{inputs.dataframe}}.iloc[i:i+_ws].reset_index(drop=True) for i in range(0, _n - _ws + 1, _stride)]'
    
    _code = _code.replace("{{params.window_size}}", str(window_size))
    _code = _code.replace("{{params.stride}}", str(stride))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.windows}}", "_out_windows")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_windows")


def normalize(dataframe=None, norm='l2', columns=''):
    """Normalize rows to unit norm (L1 or L2) using sklearn Normalizer
    
    Dependencies: pip install pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        norm (select, default='l2'): 
        columns (string, default=''): Numeric columns to normalize (empty = all numeric)
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd', 'from sklearn.preprocessing import Normalizer']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()\n_normalizer = Normalizer(norm="{{params.norm}}")\n{{outputs.normalized}} = {{inputs.dataframe}}.copy()\n{{outputs.normalized}}[_cols] = _normalizer.fit_transform({{outputs.normalized}}[_cols])'
    
    _code = _code.replace("{{params.norm}}", str(norm))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.normalized}}", "_out_normalized")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_normalized")


def standardize(dataframe=None, columns='', with_mean=True, with_std=True):
    """Standardize features by removing the mean and scaling to unit variance (z-score)
    
    Dependencies: pip install pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        columns (string, default=''): Numeric columns to standardize (empty = all numeric)
        with_mean (boolean, default=True): 
        with_std (boolean, default=True): 
    
    Returns:
        dict with keys:
            standardized (dataframe): 
            scaler (any): 
    """
    _imports = ['import pandas as pd', 'from sklearn.preprocessing import StandardScaler']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()\n{{outputs.scaler}} = StandardScaler(with_mean={{params.with_mean}}, with_std={{params.with_std}})\n{{outputs.standardized}} = {{inputs.dataframe}}.copy()\n{{outputs.standardized}}[_cols] = {{outputs.scaler}}.fit_transform({{outputs.standardized}}[_cols])'
    
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.with_mean}}", str(with_mean))
    _code = _code.replace("{{params.with_std}}", str(with_std))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.standardized}}", "_out_standardized")
    _code = _code.replace("{{outputs.scaler}}", "_out_scaler")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"standardized": _ns.get("_out_standardized"), "scaler": _ns.get("_out_scaler")}


def min_max_scale(dataframe=None, columns='', feature_min=0, feature_max=1):
    """Scale features to a given range (default 0-1) using MinMaxScaler
    
    Dependencies: pip install pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        columns (string, default=''): Numeric columns to scale (empty = all numeric)
        feature_min (number, default=0): 
        feature_max (number, default=1): 
    
    Returns:
        dict with keys:
            scaled (dataframe): 
            scaler (any): 
    """
    _imports = ['import pandas as pd', 'from sklearn.preprocessing import MinMaxScaler']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()\n{{outputs.scaler}} = MinMaxScaler(feature_range=({{params.feature_min}}, {{params.feature_max}}))\n{{outputs.scaled}} = {{inputs.dataframe}}.copy()\n{{outputs.scaled}}[_cols] = {{outputs.scaler}}.fit_transform({{outputs.scaled}}[_cols])'
    
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.feature_min}}", str(feature_min))
    _code = _code.replace("{{params.feature_max}}", str(feature_max))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.scaled}}", "_out_scaled")
    _code = _code.replace("{{outputs.scaler}}", "_out_scaler")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"scaled": _ns.get("_out_scaled"), "scaler": _ns.get("_out_scaler")}


def clip_values(dataframe=None, lower=0, upper=1, columns=''):
    """Clip (limit) values in a DataFrame to a specified min and max range
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        lower (number, default=0): 
        upper (number, default=1): 
        columns (string, default=''): Columns to clip (empty = all numeric)
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()\n{{outputs.clipped}} = {{inputs.dataframe}}.copy()\n{{outputs.clipped}}[_cols] = {{outputs.clipped}}[_cols].clip(lower={{params.lower}}, upper={{params.upper}})'
    
    _code = _code.replace("{{params.lower}}", str(lower))
    _code = _code.replace("{{params.upper}}", str(upper))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.clipped}}", "_out_clipped")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_clipped")


def cast_type(dataframe=None, columns='', dtype='float64'):
    """Cast one or more DataFrame columns to a specified data type
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        columns (string, default=''): Comma-separated columns to cast
        dtype (select, default='float64'): 
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()]\n{{outputs.casted}} = {{inputs.dataframe}}.copy()\nfor _col in _cols:\n    {{outputs.casted}}[_col] = {{outputs.casted}}[_col].astype("{{params.dtype}}")'
    
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.dtype}}", str(dtype))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.casted}}", "_out_casted")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_casted")


def one_hot_encode(dataframe=None, columns='', drop_first=False, sparse_output=False):
    """One-hot encode categorical columns into binary indicator columns
    
    Dependencies: pip install pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        columns (string, default=''): Categorical columns to encode (empty = all object/category)
        drop_first (boolean, default=False): Drop the first category to avoid multicollinearity
        sparse_output (boolean, default=False): 
    
    Returns:
        dict with keys:
            encoded (dataframe): 
            encoder (any): 
    """
    _imports = ['import pandas as pd', 'from sklearn.preprocessing import OneHotEncoder']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include=["object", "category"]).columns.tolist()\n{{outputs.encoder}} = OneHotEncoder(drop="first" if {{params.drop_first}} else None, sparse_output={{params.sparse_output}}, handle_unknown="ignore")\n_encoded_arr = {{outputs.encoder}}.fit_transform({{inputs.dataframe}}[_cols])\nif {{params.sparse_output}}:\n    _encoded_arr = _encoded_arr.toarray()\n_encoded_cols = {{outputs.encoder}}.get_feature_names_out(_cols)\n_df_enc = pd.DataFrame(_encoded_arr, columns=_encoded_cols, index={{inputs.dataframe}}.index)\n{{outputs.encoded}} = pd.concat([{{inputs.dataframe}}.drop(columns=_cols), _df_enc], axis=1)'
    
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.drop_first}}", str(drop_first))
    _code = _code.replace("{{params.sparse_output}}", str(sparse_output))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.encoded}}", "_out_encoded")
    _code = _code.replace("{{outputs.encoder}}", "_out_encoder")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"encoded": _ns.get("_out_encoded"), "encoder": _ns.get("_out_encoder")}


def label_encode(dataframe=None, columns=''):
    """Encode categorical labels as integer indices using LabelEncoder
    
    Dependencies: pip install pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        columns (string, default=''): Columns to label encode (empty = all object/category)
    
    Returns:
        dict with keys:
            encoded (dataframe): 
            encoders (dict): Dict mapping column name to fitted LabelEncoder
    """
    _imports = ['import pandas as pd', 'from sklearn.preprocessing import LabelEncoder']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include=["object", "category"]).columns.tolist()\n{{outputs.encoded}} = {{inputs.dataframe}}.copy()\n{{outputs.encoders}} = {}\nfor _col in _cols:\n    _le = LabelEncoder()\n    {{outputs.encoded}}[_col] = _le.fit_transform({{outputs.encoded}}[_col].astype(str))\n    {{outputs.encoders}}[_col] = _le'
    
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.encoded}}", "_out_encoded")
    _code = _code.replace("{{outputs.encoders}}", "_out_encoders")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"encoded": _ns.get("_out_encoded"), "encoders": _ns.get("_out_encoders")}


def ordinal_encode(dataframe=None, columns='', handle_unknown='use_encoded_value', unknown_value=-1):
    """Encode categorical features as ordinal integers with a specified order
    
    Dependencies: pip install pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        columns (string, default=''): Columns to ordinal encode (empty = all object/category)
        handle_unknown (select, default='use_encoded_value'): 
        unknown_value (number, default=-1): Value to assign to unknown categories
    
    Returns:
        dict with keys:
            encoded (dataframe): 
            encoder (any): 
    """
    _imports = ['import pandas as pd', 'from sklearn.preprocessing import OrdinalEncoder']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include=["object", "category"]).columns.tolist()\n{{outputs.encoder}} = OrdinalEncoder(handle_unknown="{{params.handle_unknown}}", unknown_value={{params.unknown_value}})\n{{outputs.encoded}} = {{inputs.dataframe}}.copy()\n{{outputs.encoded}}[_cols] = {{outputs.encoder}}.fit_transform({{outputs.encoded}}[_cols])'
    
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.handle_unknown}}", str(handle_unknown))
    _code = _code.replace("{{params.unknown_value}}", str(unknown_value))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.encoded}}", "_out_encoded")
    _code = _code.replace("{{outputs.encoder}}", "_out_encoder")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"encoded": _ns.get("_out_encoded"), "encoder": _ns.get("_out_encoder")}


def target_encode(dataframe=None, target=None, columns='', smooth='auto'):
    """Encode categorical features using the mean of the target variable (target encoding)
    
    Dependencies: pip install pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
        target (series) (required): 
    
    Parameters:
        columns (string, default=''): Columns to target encode (empty = all object/category)
        smooth (select, default='auto'): Smoothing strategy to reduce overfitting
    
    Returns:
        dict with keys:
            encoded (dataframe): 
            encoder (any): 
    """
    _imports = ['import pandas as pd', 'from sklearn.preprocessing import TargetEncoder']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include=["object", "category"]).columns.tolist()\n_smooth = "auto" if "{{params.smooth}}" == "auto" else None\n{{outputs.encoder}} = TargetEncoder(smooth=_smooth)\n{{outputs.encoded}} = {{inputs.dataframe}}.copy()\n{{outputs.encoded}}[_cols] = {{outputs.encoder}}.fit_transform({{outputs.encoded}}[_cols], {{inputs.target}})'
    
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.smooth}}", str(smooth))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{inputs.target}}", "target")
    _code = _code.replace("{{outputs.encoded}}", "_out_encoded")
    _code = _code.replace("{{outputs.encoder}}", "_out_encoder")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    _ns["target"] = target
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"encoded": _ns.get("_out_encoded"), "encoder": _ns.get("_out_encoder")}


def bin_discretize(dataframe=None, column='', strategy='uniform', n_bins=5, custom_edges='', labels='', output_column=''):
    """Bin continuous values into discrete intervals (equal-width, quantile, or custom edges)
    
    Dependencies: pip install numpy pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        column (string, default=''): 
        strategy (select, default='uniform'): 
        n_bins (number, default=5): 
        custom_edges (string, default=''): Comma-separated bin edges (only for custom strategy)
        labels (string, default=''): Comma-separated labels (empty = default intervals)
        output_column (string, default=''): Name for the binned column (default: column + '_bin')
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd', 'import numpy as np']
    _code = '_col = "{{params.column}}"\n_out_col = "{{params.output_column}}" or f"{_col}_bin"\n_labels = [l.strip() for l in "{{params.labels}}".split(",") if l.strip()] or False\n{{outputs.binned}} = {{inputs.dataframe}}.copy()\nif "{{params.strategy}}" == "uniform":\n    {{outputs.binned}}[_out_col] = pd.cut({{outputs.binned}}[_col], bins={{params.n_bins}}, labels=_labels if _labels else None)\nelif "{{params.strategy}}" == "quantile":\n    {{outputs.binned}}[_out_col] = pd.qcut({{outputs.binned}}[_col], q={{params.n_bins}}, labels=_labels if _labels else None, duplicates="drop")\n "else":\n    _edges = [float(e.strip()) for e in "{{params.custom_edges}}".split(",") if e.strip()]\n    {{outputs.binned}}[_out_col] = pd.cut({{outputs.binned}}[_col], bins=_edges, labels=_labels if _labels else None)'
    
    _code = _code.replace("{{params.column}}", str(column))
    _code = _code.replace("{{params.strategy}}", str(strategy))
    _code = _code.replace("{{params.n_bins}}", str(n_bins))
    _code = _code.replace("{{params.custom_edges}}", str(custom_edges))
    _code = _code.replace("{{params.labels}}", str(labels))
    _code = _code.replace("{{params.output_column}}", str(output_column))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.binned}}", "_out_binned")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_binned")


def pca(dataframe=None, n_components=2, columns='', whiten=False, random_state=42):
    """Reduce dimensionality using Principal Component Analysis
    
    Dependencies: pip install numpy pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        n_components (number, default=2): 
        columns (string, default=''): Numeric columns (empty = all numeric)
        whiten (boolean, default=False): 
        random_state (number, default=42): 
    
    Returns:
        dict with keys:
            transformed (dataframe): 
            model (any): 
    """
    _imports = ['import pandas as pd', 'import numpy as np', 'from sklearn.decomposition import PCA']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()\n{{outputs.model}} = PCA(n_components={{params.n_components}}, whiten={{params.whiten}}, random_state={{params.random_state}})\n_components = {{outputs.model}}.fit_transform({{inputs.dataframe}}[_cols])\n_comp_names = [f"PC{i+1}" for i in range({{params.n_components}})]\n{{outputs.transformed}} = pd.DataFrame(_components, columns=_comp_names, index={{inputs.dataframe}}.index)'
    
    _code = _code.replace("{{params.n_components}}", str(n_components))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.whiten}}", str(whiten))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.transformed}}", "_out_transformed")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"transformed": _ns.get("_out_transformed"), "model": _ns.get("_out_model")}


def umap(dataframe=None, n_components=2, n_neighbors=15, min_dist=0.1, metric='euclidean', columns='', random_state=42):
    """Reduce dimensionality using Uniform Manifold Approximation and Projection
    
    Dependencies: pip install numpy pandas umap
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        n_components (number, default=2): 
        n_neighbors (number, default=15): 
        min_dist (number, default=0.1): 
        metric (select, default='euclidean'): 
        columns (string, default=''): Numeric columns (empty = all numeric)
        random_state (number, default=42): 
    
    Returns:
        dict with keys:
            transformed (dataframe): 
            model (any): 
    """
    _imports = ['import pandas as pd', 'import numpy as np', 'import umap']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()\n{{outputs.model}} = umap.UMAP(\n    n_components={{params.n_components}},\n    n_neighbors={{params.n_neighbors}},\n    min_dist={{params.min_dist}},\n    metric="{{params.metric}}",\n    random_state={{params.random_state}}\n)\n_embedding = {{outputs.model}}.fit_transform({{inputs.dataframe}}[_cols].values)\n_comp_names = [f"UMAP{i+1}" for i in range({{params.n_components}})]\n{{outputs.transformed}} = pd.DataFrame(_embedding, columns=_comp_names, index={{inputs.dataframe}}.index)'
    
    _code = _code.replace("{{params.n_components}}", str(n_components))
    _code = _code.replace("{{params.n_neighbors}}", str(n_neighbors))
    _code = _code.replace("{{params.min_dist}}", str(min_dist))
    _code = _code.replace("{{params.metric}}", str(metric))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.transformed}}", "_out_transformed")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"transformed": _ns.get("_out_transformed"), "model": _ns.get("_out_model")}


def t_sne(dataframe=None, n_components=2, perplexity=30, learning_rate=200, n_iter=1000, columns='', random_state=42):
    """Reduce dimensionality using t-Distributed Stochastic Neighbor Embedding for visualization
    
    Dependencies: pip install numpy pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        n_components (number, default=2): 
        perplexity (number, default=30): 
        learning_rate (number, default=200): 
        n_iter (number, default=1000): 
        columns (string, default=''): Numeric columns (empty = all numeric)
        random_state (number, default=42): 
    
    Returns:
        dataframe: 
    """
    _imports = ['import pandas as pd', 'import numpy as np', 'from sklearn.manifold import TSNE']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()\n_tsne = TSNE(\n    n_components={{params.n_components}},\n    perplexity={{params.perplexity}},\n    learning_rate={{params.learning_rate}},\n    n_iter={{params.n_iter}},\n    random_state={{params.random_state}}\n)\n_embedding = _tsne.fit_transform({{inputs.dataframe}}[_cols].values)\n_comp_names = [f"tSNE{i+1}" for i in range({{params.n_components}})]\n{{outputs.transformed}} = pd.DataFrame(_embedding, columns=_comp_names, index={{inputs.dataframe}}.index)'
    
    _code = _code.replace("{{params.n_components}}", str(n_components))
    _code = _code.replace("{{params.perplexity}}", str(perplexity))
    _code = _code.replace("{{params.learning_rate}}", str(learning_rate))
    _code = _code.replace("{{params.n_iter}}", str(n_iter))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.transformed}}", "_out_transformed")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_transformed")


def ica(dataframe=None, n_components=2, columns='', max_iter=200, random_state=42):
    """Independent Component Analysis for signal separation and dimensionality reduction
    
    Dependencies: pip install numpy pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        n_components (number, default=2): 
        columns (string, default=''): Numeric columns (empty = all numeric)
        max_iter (number, default=200): 
        random_state (number, default=42): 
    
    Returns:
        dict with keys:
            transformed (dataframe): 
            model (any): 
    """
    _imports = ['import pandas as pd', 'import numpy as np', 'from sklearn.decomposition import FastICA']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()\n{{outputs.model}} = FastICA(n_components={{params.n_components}}, max_iter={{params.max_iter}}, random_state={{params.random_state}})\n_components = {{outputs.model}}.fit_transform({{inputs.dataframe}}[_cols].values)\n_comp_names = [f"IC{i+1}" for i in range({{params.n_components}})]\n{{outputs.transformed}} = pd.DataFrame(_components, columns=_comp_names, index={{inputs.dataframe}}.index)'
    
    _code = _code.replace("{{params.n_components}}", str(n_components))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.max_iter}}", str(max_iter))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.transformed}}", "_out_transformed")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"transformed": _ns.get("_out_transformed"), "model": _ns.get("_out_model")}


def svd(dataframe=None, n_components=2, columns='', random_state=42):
    """Truncated Singular Value Decomposition for dimensionality reduction (works with sparse data)
    
    Dependencies: pip install numpy pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        n_components (number, default=2): 
        columns (string, default=''): Numeric columns (empty = all numeric)
        random_state (number, default=42): 
    
    Returns:
        dict with keys:
            transformed (dataframe): 
            model (any): 
    """
    _imports = ['import pandas as pd', 'import numpy as np', 'from sklearn.decomposition import TruncatedSVD']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()\n{{outputs.model}} = TruncatedSVD(n_components={{params.n_components}}, random_state={{params.random_state}})\n_components = {{outputs.model}}.fit_transform({{inputs.dataframe}}[_cols].values)\n_comp_names = [f"SVD{i+1}" for i in range({{params.n_components}})]\n{{outputs.transformed}} = pd.DataFrame(_components, columns=_comp_names, index={{inputs.dataframe}}.index)'
    
    _code = _code.replace("{{params.n_components}}", str(n_components))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.transformed}}", "_out_transformed")
    _code = _code.replace("{{outputs.model}}", "_out_model")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"transformed": _ns.get("_out_transformed"), "model": _ns.get("_out_model")}


def feature_selection(dataframe=None, target=None, k=10, score_func='f_classif', columns=''):
    """Select the top-K features using a scoring function (chi2, f_classif, f_regression)
    
    Dependencies: pip install numpy pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
        target (series) (required): 
    
    Parameters:
        k (number, default=10): 
        score_func (select, default='f_classif'): 
        columns (string, default=''): Numeric feature columns (empty = all numeric)
    
    Returns:
        dict with keys:
            selected (dataframe): 
            selector (any): 
            scores (series): 
    """
    _imports = ['import pandas as pd', 'import numpy as np', 'from sklearn.feature_selection import SelectKBest, f_classif, f_regression, chi2, mutual_info_classif, mutual_info_regression']
    _code = '_score_funcs = {"f_classif": f_classif, "f_regression": f_regression, "chi2": chi2, "mutual_info_classif": mutual_info_classif, "mutual_info_regression": mutual_info_regression}\n_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()\n{{outputs.selector}} = SelectKBest(score_func=_score_funcs["{{params.score_func}}"], k={{params.k}})\n_X_selected = {{outputs.selector}}.fit_transform({{inputs.dataframe}}[_cols], {{inputs.target}})\n_mask = {{outputs.selector}}.get_support()\n_selected_cols = [c for c, m in zip(_cols, _mask) if m]\n{{outputs.selected}} = pd.DataFrame(_X_selected, columns=_selected_cols, index={{inputs.dataframe}}.index)\n{{outputs.scores}} = pd.Series({{outputs.selector}}.scores_, index=_cols, name="score").sort_values(ascending=False)'
    
    _code = _code.replace("{{params.k}}", str(k))
    _code = _code.replace("{{params.score_func}}", str(score_func))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{inputs.target}}", "target")
    _code = _code.replace("{{outputs.selected}}", "_out_selected")
    _code = _code.replace("{{outputs.selector}}", "_out_selector")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    _ns["target"] = target
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"selected": _ns.get("_out_selected"), "selector": _ns.get("_out_selector"), "scores": _ns.get("_out_scores")}


def correlation_filter(dataframe=None, threshold=0.95, method='pearson', columns=''):
    """Remove features that are highly correlated with each other above a threshold
    
    Dependencies: pip install numpy pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        threshold (number, default=0.95): 
        method (select, default='pearson'): 
        columns (string, default=''): Numeric columns to check (empty = all numeric)
    
    Returns:
        dict with keys:
            filtered (dataframe): 
            dropped_cols (list): 
    """
    _imports = ['import pandas as pd', 'import numpy as np']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()\n_corr = {{inputs.dataframe}}[_cols].corr(method="{{params.method}}").abs()\n_upper = _corr.where(np.triu(np.ones(_corr.shape), k=1).astype(bool))\n{{outputs.dropped_cols}} = [col for col in _upper.columns if any(_upper[col] > {{params.threshold}})]\n{{outputs.filtered}} = {{inputs.dataframe}}.drop(columns={{outputs.dropped_cols}})'
    
    _code = _code.replace("{{params.threshold}}", str(threshold))
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.filtered}}", "_out_filtered")
    _code = _code.replace("{{outputs.dropped_cols}}", "_out_dropped_cols")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"filtered": _ns.get("_out_filtered"), "dropped_cols": _ns.get("_out_dropped_cols")}


def variance_threshold(dataframe=None, threshold=0.0, columns=''):
    """Remove features with variance below a specified threshold
    
    Dependencies: pip install pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        threshold (number, default=0.0): Features with variance <= this value are removed
        columns (string, default=''): Numeric columns to check (empty = all numeric)
    
    Returns:
        dict with keys:
            filtered (dataframe): 
            selector (any): 
    """
    _imports = ['import pandas as pd', 'from sklearn.feature_selection import VarianceThreshold']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()\n{{outputs.selector}} = VarianceThreshold(threshold={{params.threshold}})\n_X_filtered = {{outputs.selector}}.fit_transform({{inputs.dataframe}}[_cols])\n_mask = {{outputs.selector}}.get_support()\n_kept_cols = [c for c, m in zip(_cols, _mask) if m]\n_non_numeric = [c for c in {{inputs.dataframe}}.columns if c not in _cols]\n{{outputs.filtered}} = pd.concat([\n    {{inputs.dataframe}}[_non_numeric].reset_index(drop=True),\n    pd.DataFrame(_X_filtered, columns=_kept_cols)\n], axis=1)'
    
    _code = _code.replace("{{params.threshold}}", str(threshold))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.filtered}}", "_out_filtered")
    _code = _code.replace("{{outputs.selector}}", "_out_selector")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"filtered": _ns.get("_out_filtered"), "selector": _ns.get("_out_selector")}


def mutual_info_filter(dataframe=None, target=None, task='classification', k=10, columns='', random_state=42):
    """Select features based on mutual information scores with the target variable
    
    Dependencies: pip install numpy pandas scikit-learn
    
    Args:
        dataframe (dataframe) (required): 
        target (series) (required): 
    
    Parameters:
        task (select, default='classification'): 
        k (number, default=10): 
        columns (string, default=''): Numeric columns (empty = all numeric)
        random_state (number, default=42): 
    
    Returns:
        dict with keys:
            filtered (dataframe): 
            scores (series): 
    """
    _imports = ['import pandas as pd', 'import numpy as np', 'from sklearn.feature_selection import mutual_info_classif, mutual_info_regression']
    _code = '_cols = [c.strip() for c in "{{params.columns}}".split(",") if c.strip()] or {{inputs.dataframe}}.select_dtypes(include="number").columns.tolist()\n_mi_func = mutual_info_classif if "{{params.task}}" == "classification" else mutual_info_regression\n_mi_scores = _mi_func({{inputs.dataframe}}[_cols], {{inputs.target}}, random_state={{params.random_state}})\n{{outputs.scores}} = pd.Series(_mi_scores, index=_cols, name="mutual_info").sort_values(ascending=False)\n_top_k = {{outputs.scores}}.head({{params.k}}).index.tolist()\n{{outputs.filtered}} = {{inputs.dataframe}}[_top_k]'
    
    _code = _code.replace("{{params.task}}", str(task))
    _code = _code.replace("{{params.k}}", str(k))
    _code = _code.replace("{{params.columns}}", str(columns))
    _code = _code.replace("{{params.random_state}}", str(random_state))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{inputs.target}}", "target")
    _code = _code.replace("{{outputs.filtered}}", "_out_filtered")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    _ns["target"] = target
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"filtered": _ns.get("_out_filtered"), "scores": _ns.get("_out_scores")}


def dataframe_to_xy(dataframe=None, feature_columns='', target_column='target'):
    """Split a DataFrame into a feature matrix X and target vector y using column names (for classical ML blocks)
    
    Dependencies: pip install pandas
    
    Args:
        dataframe (dataframe) (required): 
    
    Parameters:
        feature_columns (string, default=''): Comma-separated feature column names (numeric/categorical encoded)
        target_column (string, default='target'): Name of the target / label column
    
    Returns:
        dict with keys:
            X (array): 
            y (array): 
    """
    _imports = ['import pandas as pd']
    _code = '_fc = [c.strip() for c in "{{params.feature_columns}}".split(",") if c.strip()]\n_tc = "{{params.target_column}}".strip()\nif not _fc or not _tc:\n    raise ValueError("Set feature_columns (comma-separated) and target_column on the DataFrame → X & y block")\n{{outputs.X}} = {{inputs.dataframe}}[_fc].values\n{{outputs.y}} = {{inputs.dataframe}}[_tc].values'
    
    _code = _code.replace("{{params.feature_columns}}", str(feature_columns))
    _code = _code.replace("{{params.target_column}}", str(target_column))
    _code = _code.replace("{{inputs.dataframe}}", "dataframe")
    _code = _code.replace("{{outputs.X}}", "_out_X")
    _code = _code.replace("{{outputs.y}}", "_out_y")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dataframe"] = dataframe
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"X": _ns.get("_out_X"), "y": _ns.get("_out_y")}

