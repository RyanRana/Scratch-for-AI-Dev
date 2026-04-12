import type { BlockDefinition } from "../types.js";

export const controlFlowBlocks: BlockDefinition[] = [
  // ── Start ───────────────────────────────────────────────────────────
  {
    id: "control-flow.start",
    name: "Start",
    category: "control-flow",
    description: "Entry point of a pipeline or sub-pipeline",
    tags: ["start", "begin", "entry", "main"],
    inputs: [],
    outputs: [
      { id: "trigger", name: "Trigger", type: "any", required: false, description: "Signals that execution has begun" },
    ],
    parameters: [
      { id: "label", name: "Label", type: "string", default: "main", description: "Identifier for this entry point" },
    ],
    codeTemplate: {
      imports: [],
      body: "# --- Start: {{params.label}} ---",
      outputBindings: { trigger: "True" },
    },
  },

  // ── End ─────────────────────────────────────────────────────────────
  {
    id: "control-flow.end",
    name: "End",
    category: "control-flow",
    description: "Marks the termination point of a pipeline",
    tags: ["end", "exit", "terminate", "finish"],
    inputs: [
      { id: "result", name: "Result", type: "any", required: false, description: "Final value produced by the pipeline" },
    ],
    outputs: [],
    parameters: [
      { id: "exit_code", name: "Exit Code", type: "number", default: 0, min: 0, max: 255, description: "Process exit code (0 = success)" },
    ],
    codeTemplate: {
      imports: ["import sys"],
      body: "# --- End ---\nsys.exit({{params.exit_code}})",
      outputBindings: {},
    },
  },

  // ── If / Else ───────────────────────────────────────────────────────
  {
    id: "control-flow.if-else",
    name: "If / Else",
    category: "control-flow",
    description: "Conditional branching based on a boolean expression",
    tags: ["if", "else", "condition", "branch"],
    inputs: [
      { id: "condition", name: "Condition", type: "boolean", required: true },
    ],
    outputs: [],
    parameters: [
      { id: "condition_expr", name: "Condition Expression", type: "code", default: "True", description: "Python expression that evaluates to True/False" },
    ],
    codeTemplate: {
      imports: [],
      body: "if {{params.condition_expr}}:\n    {{branches.if_body}}\nelse:\n    {{branches.else_body}}",
      outputBindings: {},
    },
    scopeType: "branch",
    branches: [
      { id: "if_body", label: "If True", accepts: "any" },
      { id: "else_body", label: "Else", accepts: "any" },
    ],
  },

  // ── Switch / Case ───────────────────────────────────────────────────
  {
    id: "control-flow.switch-case",
    name: "Switch / Case",
    category: "control-flow",
    description: "Multi-way branching based on a value matched against cases",
    tags: ["switch", "case", "match", "select", "branch"],
    inputs: [
      { id: "value", name: "Value", type: "any", required: true, description: "The value to match against cases" },
    ],
    outputs: [],
    parameters: [
      { id: "match_expr", name: "Match Expression", type: "code", default: "value", description: "Python expression to match on" },
      { id: "cases", name: "Cases", type: "json", default: ["case_a", "case_b"], description: "List of case value literals (strings/numbers)" },
    ],
    codeTemplate: {
      imports: [],
      body: "match {{params.match_expr}}:\n    {{#each params.cases}}\n    case {{this}}:\n        {{branches.[this]}}\n    {{/each}}\n    case _:\n        {{branches.default_body}}",
      outputBindings: {},
    },
    scopeType: "branch",
    branches: [
      { id: "case_a", label: "Case A", accepts: "any" },
      { id: "case_b", label: "Case B", accepts: "any" },
      { id: "default_body", label: "Default", accepts: "any" },
    ],
  },

  // ── For Loop ────────────────────────────────────────────────────────
  {
    id: "control-flow.for-loop",
    name: "For Loop",
    category: "control-flow",
    description: "Iterate over an iterable or a numeric range",
    tags: ["for", "loop", "iterate", "range", "each"],
    inputs: [
      { id: "iterable", name: "Iterable", type: "list", required: false, description: "Collection to iterate over" },
    ],
    outputs: [
      { id: "item", name: "Current Item", type: "any", required: false, description: "The current element in each iteration" },
      { id: "index", name: "Index", type: "number", required: false, description: "Zero-based index of the current iteration" },
    ],
    parameters: [
      { id: "variable", name: "Loop Variable", type: "string", default: "item", description: "Name of the loop variable" },
      { id: "iterable_expr", name: "Iterable Expression", type: "code", default: "range(10)", description: "Python expression that produces an iterable" },
    ],
    codeTemplate: {
      imports: [],
      body: "for _idx_, {{params.variable}} in enumerate({{params.iterable_expr}}):\n    {{branches.loop_body}}",
      outputBindings: { item: "{{params.variable}}", index: "_idx_" },
    },
    scopeType: "loop",
    branches: [
      { id: "loop_body", label: "Loop Body", accepts: "any" },
    ],
  },

  // ── While Loop ──────────────────────────────────────────────────────
  {
    id: "control-flow.while-loop",
    name: "While Loop",
    category: "control-flow",
    description: "Repeat a block of code while a condition remains true",
    tags: ["while", "loop", "repeat", "condition"],
    inputs: [
      { id: "condition", name: "Condition", type: "boolean", required: false },
    ],
    outputs: [
      { id: "iterations", name: "Iterations", type: "number", required: false, description: "Total number of iterations executed" },
    ],
    parameters: [
      { id: "condition_expr", name: "Condition Expression", type: "code", default: "True", description: "Python expression re-evaluated each iteration" },
      { id: "max_iterations", name: "Max Iterations", type: "number", default: 1000, min: 1, description: "Safety limit to prevent infinite loops", advanced: true },
    ],
    codeTemplate: {
      imports: [],
      body: "_iter_count_ = 0\nwhile {{params.condition_expr}} and _iter_count_ < {{params.max_iterations}}:\n    {{branches.loop_body}}\n    _iter_count_ += 1",
      outputBindings: { iterations: "_iter_count_" },
    },
    scopeType: "loop",
    branches: [
      { id: "loop_body", label: "Loop Body", accepts: "any" },
    ],
  },

  // ── Break ───────────────────────────────────────────────────────────
  {
    id: "control-flow.break",
    name: "Break",
    category: "control-flow",
    description: "Exit the nearest enclosing loop immediately",
    tags: ["break", "exit", "loop", "stop"],
    inputs: [
      { id: "condition", name: "Condition", type: "boolean", required: false, description: "Optional condition; break only when true" },
    ],
    outputs: [],
    parameters: [
      { id: "condition_expr", name: "Condition Expression", type: "code", default: "True", description: "Break only when this expression is true" },
    ],
    codeTemplate: {
      imports: [],
      body: "if {{params.condition_expr}}:\n    break",
      outputBindings: {},
    },
  },

  // ── Continue ────────────────────────────────────────────────────────
  {
    id: "control-flow.continue",
    name: "Continue",
    category: "control-flow",
    description: "Skip the rest of the current loop iteration and proceed to the next",
    tags: ["continue", "skip", "next", "loop"],
    inputs: [
      { id: "condition", name: "Condition", type: "boolean", required: false, description: "Optional condition; continue only when true" },
    ],
    outputs: [],
    parameters: [
      { id: "condition_expr", name: "Condition Expression", type: "code", default: "True", description: "Continue only when this expression is true" },
    ],
    codeTemplate: {
      imports: [],
      body: "if {{params.condition_expr}}:\n    continue",
      outputBindings: {},
    },
  },

  // ── Try / Catch ─────────────────────────────────────────────────────
  {
    id: "control-flow.try-catch",
    name: "Try / Catch",
    category: "control-flow",
    description: "Execute code with error handling via try/except/finally",
    tags: ["try", "catch", "except", "error", "handle", "finally"],
    inputs: [],
    outputs: [
      { id: "error", name: "Error", type: "text", required: false, description: "The caught exception message, if any" },
    ],
    parameters: [
      { id: "exception_types", name: "Exception Types", type: "string", default: "Exception", description: "Comma-separated exception classes to catch" },
      { id: "include_finally", name: "Include Finally", type: "boolean", default: false, description: "Add a finally block that always executes" },
    ],
    codeTemplate: {
      imports: [],
      body: "try:\n    {{branches.try_body}}\nexcept ({{params.exception_types}}) as _err_:\n    {{branches.except_body}}\n{{#if params.include_finally}}\nfinally:\n    {{branches.finally_body}}\n{{/if}}",
      outputBindings: { error: "str(_err_)" },
    },
    scopeType: "error",
    branches: [
      { id: "try_body", label: "Try", accepts: "any" },
      { id: "except_body", label: "Except", accepts: "any" },
      { id: "finally_body", label: "Finally", accepts: "any" },
    ],
  },

  // ── Raise Error ─────────────────────────────────────────────────────
  {
    id: "control-flow.raise-error",
    name: "Raise Error",
    category: "control-flow",
    description: "Raise a Python exception with a custom message",
    tags: ["raise", "throw", "error", "exception"],
    inputs: [
      { id: "message", name: "Message", type: "text", required: false, description: "Dynamic error message" },
    ],
    outputs: [],
    parameters: [
      { id: "exception_type", name: "Exception Type", type: "select", default: "ValueError", options: [
        { label: "ValueError", value: "ValueError" },
        { label: "TypeError", value: "TypeError" },
        { label: "RuntimeError", value: "RuntimeError" },
        { label: "KeyError", value: "KeyError" },
        { label: "IndexError", value: "IndexError" },
        { label: "FileNotFoundError", value: "FileNotFoundError" },
        { label: "NotImplementedError", value: "NotImplementedError" },
        { label: "Custom", value: "Custom" },
      ], description: "Python exception class to raise" },
      { id: "custom_type", name: "Custom Exception Class", type: "string", default: "", description: "Fully qualified class name when Exception Type is Custom", advanced: true },
      { id: "error_message", name: "Error Message", type: "string", default: "An error occurred", description: "Static error message (overridden by input port if connected)" },
    ],
    codeTemplate: {
      imports: [],
      body: "raise {{params.exception_type}}({{inputs.message}} if {{inputs.message}} is not None else \"{{params.error_message}}\")",
      outputBindings: {},
    },
  },

  // ── Assert ──────────────────────────────────────────────────────────
  {
    id: "control-flow.assert",
    name: "Assert",
    category: "control-flow",
    description: "Assert that a condition is true, raising AssertionError otherwise",
    tags: ["assert", "check", "validate", "guard", "invariant"],
    inputs: [
      { id: "value", name: "Value", type: "any", required: false, description: "Value to use in the assertion expression" },
    ],
    outputs: [],
    parameters: [
      { id: "condition_expr", name: "Condition Expression", type: "code", default: "True", description: "Python expression that must evaluate to True" },
      { id: "message", name: "Error Message", type: "string", default: "Assertion failed", description: "Message shown when the assertion fails" },
    ],
    codeTemplate: {
      imports: [],
      body: "assert {{params.condition_expr}}, \"{{params.message}}\"",
      outputBindings: {},
    },
  },

  // ── Return ──────────────────────────────────────────────────────────
  {
    id: "control-flow.return",
    name: "Return",
    category: "control-flow",
    description: "Return a value from the current function or pipeline scope",
    tags: ["return", "output", "result", "value"],
    inputs: [
      { id: "value", name: "Value", type: "any", required: false, description: "The value to return" },
    ],
    outputs: [],
    parameters: [
      { id: "return_expr", name: "Return Expression", type: "code", default: "None", description: "Python expression to return (overridden by input port if connected)" },
    ],
    codeTemplate: {
      imports: [],
      body: "return {{inputs.value}} if {{inputs.value}} is not None else {{params.return_expr}}",
      outputBindings: {},
    },
  },

  // ── Pass ────────────────────────────────────────────────────────────
  {
    id: "control-flow.pass",
    name: "Pass",
    category: "control-flow",
    description: "No-op placeholder that does nothing; useful as an empty block body",
    tags: ["pass", "noop", "placeholder", "empty", "stub"],
    inputs: [],
    outputs: [],
    parameters: [],
    codeTemplate: {
      imports: [],
      body: "pass",
      outputBindings: {},
    },
  },

  // ── Comment ─────────────────────────────────────────────────────────
  {
    id: "control-flow.comment",
    name: "Comment",
    category: "control-flow",
    description: "Insert a descriptive comment into the generated code",
    tags: ["comment", "note", "annotation", "documentation", "remark"],
    inputs: [],
    outputs: [],
    parameters: [
      { id: "text", name: "Comment Text", type: "string", default: "TODO: describe this step", description: "The comment content" },
      { id: "style", name: "Style", type: "select", default: "inline", options: [
        { label: "Inline (#)", value: "inline" },
        { label: "Block (triple-quoted)", value: "block" },
      ], description: "Comment style in generated code" },
    ],
    codeTemplate: {
      imports: [],
      body: "# {{params.text}}",
      outputBindings: {},
    },
  },

  // ── Log / Print ─────────────────────────────────────────────────────
  {
    id: "control-flow.log-print",
    name: "Log / Print",
    category: "control-flow",
    description: "Print a value to stdout or log it with Python logging",
    tags: ["log", "print", "debug", "output", "console", "trace"],
    inputs: [
      { id: "value", name: "Value", type: "any", required: false, description: "Value to print or log" },
    ],
    outputs: [
      { id: "passthrough", name: "Passthrough", type: "any", required: false, description: "The same value, passed through unchanged" },
    ],
    parameters: [
      { id: "method", name: "Method", type: "select", default: "print", options: [
        { label: "print()", value: "print" },
        { label: "logging.debug", value: "debug" },
        { label: "logging.info", value: "info" },
        { label: "logging.warning", value: "warning" },
        { label: "logging.error", value: "error" },
      ], description: "Output method" },
      { id: "prefix", name: "Prefix", type: "string", default: "", description: "Optional prefix prepended to the output" },
      { id: "expression", name: "Expression", type: "code", default: "", description: "Static expression to print when no input is connected" },
    ],
    codeTemplate: {
      imports: ["import logging"],
      body: "_log_val_ = {{inputs.value}} if {{inputs.value}} is not None else {{params.expression}}\n{{#if (eq params.method 'print')}}print(f\"{{params.prefix}}{_log_val_}\"){{else}}logging.{{params.method}}(f\"{{params.prefix}}{_log_val_}\"){{/if}}",
      outputBindings: { passthrough: "_log_val_" },
    },
  },

  // ── Timer / Delay ───────────────────────────────────────────────────
  {
    id: "control-flow.timer-delay",
    name: "Timer / Delay",
    category: "control-flow",
    description: "Pause execution for a specified duration or measure elapsed time",
    tags: ["timer", "delay", "sleep", "wait", "pause", "benchmark", "time"],
    inputs: [
      { id: "trigger", name: "Trigger", type: "any", required: false, description: "Incoming signal to start the timer" },
    ],
    outputs: [
      { id: "elapsed", name: "Elapsed (s)", type: "number", required: false, description: "Wall-clock seconds elapsed during the delay or measured scope" },
    ],
    parameters: [
      { id: "mode", name: "Mode", type: "select", default: "delay", options: [
        { label: "Delay (sleep)", value: "delay" },
        { label: "Measure Time", value: "measure" },
      ], description: "Delay execution or measure elapsed time of child blocks" },
      { id: "seconds", name: "Seconds", type: "number", default: 1.0, min: 0, step: 0.1, description: "Duration to sleep (only used in Delay mode)" },
    ],
    codeTemplate: {
      imports: ["import time"],
      body: "{{#if (eq params.mode 'delay')}}time.sleep({{params.seconds}})\n_elapsed_ = {{params.seconds}}{{else}}_t_start_ = time.perf_counter()\n{{branches.timed_body}}\n_elapsed_ = time.perf_counter() - _t_start_{{/if}}",
      outputBindings: { elapsed: "_elapsed_" },
    },
    scopeType: "branch",
    branches: [
      { id: "timed_body", label: "Timed Body", accepts: "any" },
    ],
  },
];
