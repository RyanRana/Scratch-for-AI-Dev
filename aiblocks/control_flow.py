"""
aiblocks.control_flow — Control Flow

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def start(label='main'):
    """Entry point of a pipeline or sub-pipeline
    
    Parameters:
        label (string, default='main'): Identifier for this entry point
    
    Returns:
        any: Signals that execution has begun
    """
    _imports = []
    _code = '# --- Start: {{params.label}} ---'
    
    _code = _code.replace("{{params.label}}", str(label))
    _code = _code.replace("{{outputs.trigger}}", "_out_trigger")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_trigger")


def end(result=None, exit_code=0):
    """Marks the termination point of a pipeline
    
    Args:
        result (any): Final value produced by the pipeline
    
    Parameters:
        exit_code (number, default=0): Process exit code (0 = success)
    """
    _imports = ['import sys']
    _code = '# --- End ---\nsys.exit({{params.exit_code}})'
    
    _code = _code.replace("{{params.exit_code}}", str(exit_code))
    _code = _code.replace("{{inputs.result}}", "result")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["result"] = result
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def if_else(condition=None, condition_expr='True'):
    """Conditional branching based on a boolean expression
    
    Args:
        condition (boolean) (required): 
    
    Parameters:
        condition_expr (code, default='True'): Python expression that evaluates to True/False
    """
    _imports = []
    _code = 'if {{params.condition_expr}}:\n    {{branches.if_body}}\nelse:\n    {{branches.else_body}}'
    
    _code = _code.replace("{{params.condition_expr}}", str(condition_expr))
    _code = _code.replace("{{inputs.condition}}", "condition")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["condition"] = condition
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def switch_case(value=None, match_expr='value', cases=['case_a', 'case_b']):
    """Multi-way branching based on a value matched against cases
    
    Args:
        value (any) (required): The value to match against cases
    
    Parameters:
        match_expr (code, default='value'): Python expression to match on
        cases (json, default=['case_a', 'case_b']): List of case value literals (strings/numbers)
    """
    _imports = []
    _code = 'match {{params.match_expr}}:\n    {{#each params.cases}}\n    case {{this}}:\n        {{branches.[this]}}\n    {{/each}}\n    case _:\n        {{branches.default_body}}'
    
    _code = _code.replace("{{params.match_expr}}", str(match_expr))
    _code = _code.replace("{{params.cases}}", str(cases))
    _code = _code.replace("{{inputs.value}}", "value")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["value"] = value
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def for_loop(iterable=None, variable='item', iterable_expr='range(10)'):
    """Iterate over an iterable or a numeric range
    
    Args:
        iterable (list): Collection to iterate over
    
    Parameters:
        variable (string, default='item'): Name of the loop variable
        iterable_expr (code, default='range(10)'): Python expression that produces an iterable
    
    Returns:
        dict with keys:
            item (any): The current element in each iteration
            index (number): Zero-based index of the current iteration
    """
    _imports = []
    _code = 'for _idx_, {{params.variable}} in enumerate({{params.iterable_expr}}):\n    {{branches.loop_body}}'
    
    _code = _code.replace("{{params.variable}}", str(variable))
    _code = _code.replace("{{params.iterable_expr}}", str(iterable_expr))
    _code = _code.replace("{{inputs.iterable}}", "iterable")
    _code = _code.replace("{{outputs.item}}", "_out_item")
    _code = _code.replace("{{outputs.index}}", "_out_index")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["iterable"] = iterable
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"item": _ns.get("_out_item"), "index": _ns.get("_out_index")}


def while_loop(condition=None, condition_expr='True', max_iterations=1000):
    """Repeat a block of code while a condition remains true
    
    Args:
        condition (boolean): 
    
    Parameters:
        condition_expr (code, default='True'): Python expression re-evaluated each iteration
        max_iterations (number, default=1000): Safety limit to prevent infinite loops
    
    Returns:
        number: Total number of iterations executed
    """
    _imports = []
    _code = '_iter_count_ = 0\nwhile {{params.condition_expr}} and _iter_count_ < {{params.max_iterations}}:\n    {{branches.loop_body}}\n    _iter_count_ += 1'
    
    _code = _code.replace("{{params.condition_expr}}", str(condition_expr))
    _code = _code.replace("{{params.max_iterations}}", str(max_iterations))
    _code = _code.replace("{{inputs.condition}}", "condition")
    _code = _code.replace("{{outputs.iterations}}", "_out_iterations")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["condition"] = condition
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_iterations")


def break_block(condition=None, condition_expr='True'):
    """Exit the nearest enclosing loop immediately
    
    Args:
        condition (boolean): Optional condition; break only when true
    
    Parameters:
        condition_expr (code, default='True'): Break only when this expression is true
    """
    _imports = []
    _code = 'if {{params.condition_expr}}:\n    break'
    
    _code = _code.replace("{{params.condition_expr}}", str(condition_expr))
    _code = _code.replace("{{inputs.condition}}", "condition")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["condition"] = condition
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def continue_block(condition=None, condition_expr='True'):
    """Skip the rest of the current loop iteration and proceed to the next
    
    Args:
        condition (boolean): Optional condition; continue only when true
    
    Parameters:
        condition_expr (code, default='True'): Continue only when this expression is true
    """
    _imports = []
    _code = 'if {{params.condition_expr}}:\n    continue'
    
    _code = _code.replace("{{params.condition_expr}}", str(condition_expr))
    _code = _code.replace("{{inputs.condition}}", "condition")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["condition"] = condition
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def try_catch(exception_types='Exception', include_finally=False):
    """Execute code with error handling via try/except/finally
    
    Parameters:
        exception_types (string, default='Exception'): Comma-separated exception classes to catch
        include_finally (boolean, default=False): Add a finally block that always executes
    
    Returns:
        text: The caught exception message, if any
    """
    _imports = []
    _code = 'try:\n    {{branches.try_body}}\nexcept ({{params.exception_types}}) as _err_:\n    {{branches.except_body}}\n{{#if params.include_finally}}\nfinally:\n    {{branches.finally_body}}\n{{/if}}'
    
    _code = _code.replace("{{params.exception_types}}", str(exception_types))
    _code = _code.replace("{{params.include_finally}}", str(include_finally))
    _code = _code.replace("{{outputs.error}}", "_out_error")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_error")


def raise_error(message=None, exception_type='ValueError', custom_type='', error_message='An error occurred'):
    """Raise a Python exception with a custom message
    
    Args:
        message (text): Dynamic error message
    
    Parameters:
        exception_type (select, default='ValueError'): Python exception class to raise
        custom_type (string, default=''): Fully qualified class name when Exception Type is Custom
        error_message (string, default='An error occurred'): Static error message (overridden by input port if connected)
    """
    _imports = []
    _code = 'raise {{params.exception_type}}({{inputs.message}} if {{inputs.message}} is not None else "{{params.error_message}}")'
    
    _code = _code.replace("{{params.exception_type}}", str(exception_type))
    _code = _code.replace("{{params.custom_type}}", str(custom_type))
    _code = _code.replace("{{params.error_message}}", str(error_message))
    _code = _code.replace("{{inputs.message}}", "message")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["message"] = message
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def assert_block(value=None, condition_expr='True', message='Assertion failed'):
    """Assert that a condition is true, raising AssertionError otherwise
    
    Args:
        value (any): Value to use in the assertion expression
    
    Parameters:
        condition_expr (code, default='True'): Python expression that must evaluate to True
        message (string, default='Assertion failed'): Message shown when the assertion fails
    """
    _imports = []
    _code = 'assert {{params.condition_expr}}, "{{params.message}}"'
    
    _code = _code.replace("{{params.condition_expr}}", str(condition_expr))
    _code = _code.replace("{{params.message}}", str(message))
    _code = _code.replace("{{inputs.value}}", "value")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["value"] = value
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def return_block(value=None, return_expr='None'):
    """Return a value from the current function or pipeline scope
    
    Args:
        value (any): The value to return
    
    Parameters:
        return_expr (code, default='None'): Python expression to return (overridden by input port if connected)
    """
    _imports = []
    _code = 'return {{inputs.value}} if {{inputs.value}} is not None else {{params.return_expr}}'
    
    _code = _code.replace("{{params.return_expr}}", str(return_expr))
    _code = _code.replace("{{inputs.value}}", "value")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["value"] = value
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def pass_block():
    """No-op placeholder that does nothing; useful as an empty block body
    """
    _imports = []
    _code = 'pass'
    
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def comment(text='TODO: describe this step', style='inline'):
    """Insert a descriptive comment into the generated code
    
    Parameters:
        text (string, default='TODO: describe this step'): The comment content
        style (select, default='inline'): Comment style in generated code
    """
    _imports = []
    _code = '# {{params.text}}'
    
    _code = _code.replace("{{params.text}}", str(text))
    _code = _code.replace("{{params.style}}", str(style))
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return None


def log_print(value=None, method='print', prefix='', expression=''):
    """Print a value to stdout or log it with Python logging
    
    Args:
        value (any): Value to print or log
    
    Parameters:
        method (select, default='print'): Output method
        prefix (string, default=''): Optional prefix prepended to the output
        expression (code, default=''): Static expression to print when no input is connected
    
    Returns:
        any: The same value, passed through unchanged
    """
    _imports = ['import logging']
    _code = '_log_val_ = {{inputs.value}} if {{inputs.value}} is not None else {{params.expression}}\n{{#if (eq params.method \'print\')}}print(f"{{params.prefix}}{_log_val_}"){{else}}logging.{{params.method}}(f"{{params.prefix}}{_log_val_}"){{/if}}'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.prefix}}", str(prefix))
    _code = _code.replace("{{params.expression}}", str(expression))
    _code = _code.replace("{{inputs.value}}", "value")
    _code = _code.replace("{{outputs.passthrough}}", "_out_passthrough")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["value"] = value
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_passthrough")


def timer_delay(trigger=None, mode='delay', seconds=1.0):
    """Pause execution for a specified duration or measure elapsed time
    
    Args:
        trigger (any): Incoming signal to start the timer
    
    Parameters:
        mode (select, default='delay'): Delay execution or measure elapsed time of child blocks
        seconds (number, default=1.0): Duration to sleep (only used in Delay mode)
    
    Returns:
        number: Wall-clock seconds elapsed during the delay or measured scope
    """
    _imports = ['import time']
    _code = "{{#if (eq params.mode 'delay')}}time.sleep({{params.seconds}})\n_elapsed_ = {{params.seconds}}{{else}}_t_start_ = time.perf_counter()\n{{branches.timed_body}}\n_elapsed_ = time.perf_counter() - _t_start_{{/if}}"
    
    _code = _code.replace("{{params.mode}}", str(mode))
    _code = _code.replace("{{params.seconds}}", str(seconds))
    _code = _code.replace("{{inputs.trigger}}", "trigger")
    _code = _code.replace("{{outputs.elapsed}}", "_out_elapsed")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["trigger"] = trigger
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_elapsed")

