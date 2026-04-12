import type { BlockDefinition } from "../types.js";

export const promptEngineeringBlocks: BlockDefinition[] = [
  // ── 1. System Prompt Block ────────────────────────────────────────────
  {
    id: "prompt-engineering.system-prompt",
    name: "System Prompt Block",
    category: "prompt-engineering",
    description: "Defines the system-level instruction that sets the LLM's role, tone, and constraints",
    tags: ["system", "prompt", "instruction", "role", "setup"],
    inputs: [],
    outputs: [
      { id: "prompt", name: "System Prompt", type: "prompt", required: true },
    ],
    parameters: [
      { id: "content", name: "System Message", type: "code", default: "You are a helpful assistant.", description: "System prompt content" },
      { id: "name", name: "Name", type: "string", default: "system", advanced: true },
    ],
    codeTemplate: {
      imports: [],
      body: `{{outputs.prompt}} = {"role": "system", "content": """{{params.content}}"""}`,
      outputBindings: { prompt: "system_prompt" },
    },
  },

  // ── 2. User Prompt Block ──────────────────────────────────────────────
  {
    id: "prompt-engineering.user-prompt",
    name: "User Prompt Block",
    category: "prompt-engineering",
    description: "Defines a user-role message containing the query or instruction for the LLM",
    tags: ["user", "prompt", "message", "query", "input"],
    inputs: [
      { id: "variables", name: "Variables", type: "dict", required: false, description: "Variables to inject into the template" },
    ],
    outputs: [
      { id: "prompt", name: "User Prompt", type: "prompt", required: true },
    ],
    parameters: [
      { id: "content", name: "User Message", type: "code", default: "Hello, {name}!", description: "User prompt template" },
    ],
    codeTemplate: {
      imports: [],
      body: `_content = """{{params.content}}""".format(**({{inputs.variables}} or {}))
{{outputs.prompt}} = {"role": "user", "content": _content}`,
      outputBindings: { prompt: "user_prompt" },
    },
  },

  // ── 3. Few-Shot Examples ──────────────────────────────────────────────
  {
    id: "prompt-engineering.few-shot-examples",
    name: "Few-Shot Examples",
    category: "prompt-engineering",
    description: "Provides example input-output pairs to guide the LLM's behavior via in-context learning",
    tags: ["few-shot", "examples", "in-context", "learning", "demonstrations"],
    inputs: [
      { id: "query", name: "Query", type: "text", required: true },
    ],
    outputs: [
      { id: "prompt", name: "Prompt with Examples", type: "prompt", required: true },
    ],
    parameters: [
      { id: "examples", name: "Examples", type: "json", default: [{ input: "2+2", output: "4" }, { input: "3+5", output: "8" }], description: "List of {input, output} pairs" },
      { id: "prefix", name: "Prefix", type: "string", default: "Here are some examples:" },
      { id: "suffix", name: "Suffix", type: "string", default: "Now answer the following:" },
    ],
    codeTemplate: {
      imports: [],
      body: `_examples_str = "\\n".join(f"Input: {ex['input']}\\nOutput: {ex['output']}" for ex in {{params.examples}})
{{outputs.prompt}} = {"role": "user", "content": f"{{params.prefix}}\\n{_examples_str}\\n{{params.suffix}}\\nInput: {{inputs.query}}\\nOutput:"}`,
      outputBindings: { prompt: "few_shot_prompt" },
    },
  },

  // ── 4. Chain-of-Thought Prompt ────────────────────────────────────────
  {
    id: "prompt-engineering.chain-of-thought",
    name: "Chain-of-Thought Prompt",
    category: "prompt-engineering",
    description: "Wraps a query with chain-of-thought exemplars that encourage step-by-step reasoning",
    tags: ["cot", "chain-of-thought", "reasoning", "step-by-step"],
    inputs: [
      { id: "query", name: "Query", type: "text", required: true },
    ],
    outputs: [
      { id: "prompt", name: "CoT Prompt", type: "prompt", required: true },
    ],
    parameters: [
      { id: "exemplars", name: "CoT Exemplars", type: "json", default: [], description: "List of {question, reasoning, answer}" },
      { id: "instruction", name: "Instruction", type: "string", default: "Let's think step by step." },
    ],
    codeTemplate: {
      imports: [],
      body: `_cot_parts = []
for ex in {{params.exemplars}}:
    _cot_parts.append(f"Q: {ex['question']}\\nReasoning: {ex['reasoning']}\\nA: {ex['answer']}")
_cot_str = "\\n\\n".join(_cot_parts)
{{outputs.prompt}} = {"role": "user", "content": f"{_cot_str}\\n\\nQ: {{inputs.query}}\\n{{params.instruction}}"}`,
      outputBindings: { prompt: "cot_prompt" },
    },
  },

  // ── 5. Zero-Shot CoT Prompt ───────────────────────────────────────────
  {
    id: "prompt-engineering.zero-shot-cot",
    name: "Zero-Shot CoT Prompt",
    category: "prompt-engineering",
    description: "Appends a reasoning trigger phrase without any exemplars",
    tags: ["zero-shot", "cot", "reasoning", "think", "step-by-step"],
    inputs: [
      { id: "query", name: "Query", type: "text", required: true },
    ],
    outputs: [
      { id: "prompt", name: "Zero-Shot CoT Prompt", type: "prompt", required: true },
    ],
    parameters: [
      { id: "trigger", name: "Trigger Phrase", type: "string", default: "Let's think step by step." },
    ],
    codeTemplate: {
      imports: [],
      body: `{{outputs.prompt}} = {"role": "user", "content": f"{{inputs.query}}\\n\\n{{params.trigger}}"}`,
      outputBindings: { prompt: "zero_shot_cot_prompt" },
    },
  },

  // ── 6. Tree of Thoughts ───────────────────────────────────────────────
  {
    id: "prompt-engineering.tree-of-thoughts",
    name: "Tree of Thoughts",
    category: "prompt-engineering",
    description: "Explores multiple reasoning paths in a tree structure, evaluating and pruning branches",
    tags: ["tree-of-thoughts", "tot", "reasoning", "branching", "search"],
    inputs: [
      { id: "problem", name: "Problem", type: "text", required: true },
    ],
    outputs: [
      { id: "solution", name: "Best Solution", type: "text", required: true },
      { id: "branches", name: "Explored Branches", type: "list", required: false },
    ],
    parameters: [
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
      { id: "breadth", name: "Branching Factor", type: "number", default: 3, min: 2, max: 10 },
      { id: "depth", name: "Max Depth", type: "number", default: 3, min: 1, max: 10 },
      { id: "strategy", name: "Search Strategy", type: "select", default: "bfs", options: [{ label: "BFS", value: "bfs" }, { label: "DFS", value: "dfs" }] },
    ],
    codeTemplate: {
      imports: ["from langchain_openai import ChatOpenAI"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature=0.7)
_thoughts = [{"text": "{{inputs.problem}}", "score": 0}]
for _d in range({{params.depth}}):
    _new = []
    for _t in _thoughts:
        _resp = _llm.invoke(f"Generate {{params.breadth}} different next steps for: {_t['text']}")
        _new.extend([{"text": s.strip(), "score": 0} for s in _resp.content.split("\\n") if s.strip()])
    _thoughts = _new[:{{params.breadth}}]
{{outputs.solution}} = _thoughts[0]["text"] if _thoughts else ""
{{outputs.branches}} = _thoughts`,
      outputBindings: { solution: "tot_solution", branches: "tot_branches" },
    },
  },

  // ── 7. Self-Consistency Sample ────────────────────────────────────────
  {
    id: "prompt-engineering.self-consistency",
    name: "Self-Consistency Sample",
    category: "prompt-engineering",
    description: "Samples multiple reasoning paths and picks the most consistent answer via majority vote",
    tags: ["self-consistency", "sampling", "majority-vote", "ensemble"],
    inputs: [
      { id: "query", name: "Query", type: "text", required: true },
    ],
    outputs: [
      { id: "answer", name: "Consensus Answer", type: "text", required: true },
      { id: "samples", name: "All Samples", type: "list", required: false },
    ],
    parameters: [
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
      { id: "n_samples", name: "Number of Samples", type: "number", default: 5, min: 2, max: 40 },
      { id: "temperature", name: "Temperature", type: "number", default: 0.7, min: 0, max: 2, step: 0.1 },
    ],
    codeTemplate: {
      imports: ["from langchain_openai import ChatOpenAI", "from collections import Counter"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature={{params.temperature}})
{{outputs.samples}} = [_llm.invoke(f"{{inputs.query}}\\nLet's think step by step.").content for _ in range({{params.n_samples}})]
_answers = [s.strip().split("\\n")[-1] for s in {{outputs.samples}}]
{{outputs.answer}} = Counter(_answers).most_common(1)[0][0]`,
      outputBindings: { answer: "consensus_answer", samples: "sc_samples" },
    },
  },

  // ── 8. Role Assign Block ──────────────────────────────────────────────
  {
    id: "prompt-engineering.role-assign",
    name: "Role Assign Block",
    category: "prompt-engineering",
    description: "Assigns a specific expert role to the LLM",
    tags: ["role", "assign", "expert", "persona", "system"],
    inputs: [],
    outputs: [
      { id: "prompt", name: "Role Prompt", type: "prompt", required: true },
    ],
    parameters: [
      { id: "role", name: "Role", type: "string", default: "senior data scientist" },
      { id: "context", name: "Additional Context", type: "string", default: "" },
    ],
    codeTemplate: {
      imports: [],
      body: `_ctx = f" {{params.context}}" if "{{params.context}}" else ""
{{outputs.prompt}} = {"role": "system", "content": f"You are a {{params.role}}.{_ctx}"}`,
      outputBindings: { prompt: "role_prompt" },
    },
  },

  // ── 9. Persona Block ──────────────────────────────────────────────────
  {
    id: "prompt-engineering.persona",
    name: "Persona Block",
    category: "prompt-engineering",
    description: "Defines a detailed persona with backstory, communication style, and domain expertise",
    tags: ["persona", "character", "style", "voice", "identity"],
    inputs: [],
    outputs: [
      { id: "prompt", name: "Persona Prompt", type: "prompt", required: true },
    ],
    parameters: [
      { id: "name", name: "Persona Name", type: "string", default: "Alex" },
      { id: "backstory", name: "Backstory", type: "code", default: "A 10-year veteran ML engineer at a FAANG company." },
      { id: "style", name: "Communication Style", type: "string", default: "concise, technical, uses analogies" },
      { id: "expertise", name: "Domain Expertise", type: "string", default: "machine learning, MLOps" },
    ],
    codeTemplate: {
      imports: [],
      body: `{{outputs.prompt}} = {"role": "system", "content": f"You are {{params.name}}. {{params.backstory}} Your communication style is {{params.style}}. Your expertise: {{params.expertise}}."}`,
      outputBindings: { prompt: "persona_prompt" },
    },
  },

  // ── 10. Prompt Template (Jinja) ───────────────────────────────────────
  {
    id: "prompt-engineering.prompt-template-jinja",
    name: "Prompt Template (Jinja)",
    category: "prompt-engineering",
    description: "Renders a Jinja2 template with provided variables to produce a fully resolved prompt",
    tags: ["template", "jinja", "jinja2", "render", "variables"],
    inputs: [
      { id: "variables", name: "Variables", type: "dict", required: true },
    ],
    outputs: [
      { id: "rendered", name: "Rendered Prompt", type: "text", required: true },
    ],
    parameters: [
      { id: "template", name: "Jinja2 Template", type: "code", default: "Hello {{ name }}, you asked about {{ topic }}." },
      { id: "strict", name: "Strict Mode", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from jinja2 import Template, StrictUndefined, Undefined"],
      body: `_undef = StrictUndefined if {{params.strict}} else Undefined
_tmpl = Template("""{{params.template}}""", undefined=_undef)
{{outputs.rendered}} = _tmpl.render(**{{inputs.variables}})`,
      outputBindings: { rendered: "rendered_prompt" },
    },
  },

  // ── 11. Variable Inject ───────────────────────────────────────────────
  {
    id: "prompt-engineering.variable-inject",
    name: "Variable Inject",
    category: "prompt-engineering",
    description: "Injects runtime variables into a prompt template using Python string formatting",
    tags: ["variable", "inject", "format", "substitute", "interpolate"],
    inputs: [
      { id: "template", name: "Template", type: "text", required: true },
      { id: "variables", name: "Variables", type: "dict", required: true },
    ],
    outputs: [
      { id: "result", name: "Formatted Prompt", type: "text", required: true },
    ],
    parameters: [
      { id: "format_style", name: "Format Style", type: "select", default: "fstring", options: [{ label: "f-string {var}", value: "fstring" }, { label: "% style %(var)s", value: "percent" }, { label: ".format()", value: "dotformat" }] },
    ],
    codeTemplate: {
      imports: [],
      body: `if "{{params.format_style}}" == "percent":
    {{outputs.result}} = {{inputs.template}} % {{inputs.variables}}
else:
    {{outputs.result}} = {{inputs.template}}.format(**{{inputs.variables}})`,
      outputBindings: { result: "injected_prompt" },
    },
  },

  // ── 12. Output Format Spec ────────────────────────────────────────────
  {
    id: "prompt-engineering.output-format-spec",
    name: "Output Format Spec",
    category: "prompt-engineering",
    description: "Appends output format instructions (JSON, XML, markdown, etc.) to a prompt",
    tags: ["output", "format", "json", "schema", "structured"],
    inputs: [
      { id: "prompt", name: "Prompt", type: "text", required: true },
    ],
    outputs: [
      { id: "formatted_prompt", name: "Formatted Prompt", type: "text", required: true },
    ],
    parameters: [
      { id: "format", name: "Output Format", type: "select", default: "json", options: [{ label: "JSON", value: "json" }, { label: "XML", value: "xml" }, { label: "Markdown", value: "markdown" }, { label: "CSV", value: "csv" }, { label: "YAML", value: "yaml" }] },
      { id: "schema", name: "Schema/Example", type: "code", default: '{"answer": "string", "confidence": "number"}' },
    ],
    codeTemplate: {
      imports: [],
      body: `{{outputs.formatted_prompt}} = f"{{inputs.prompt}}\\n\\nRespond in {{params.format}} format following this schema:\\n{{params.schema}}"`,
      outputBindings: { formatted_prompt: "format_spec_prompt" },
    },
  },

  // ── 13. Constraint Block ──────────────────────────────────────────────
  {
    id: "prompt-engineering.constraint",
    name: "Constraint Block",
    category: "prompt-engineering",
    description: "Adds explicit constraints or rules the LLM must follow",
    tags: ["constraint", "rule", "limit", "restriction", "guardrail"],
    inputs: [
      { id: "prompt", name: "Prompt", type: "text", required: true },
    ],
    outputs: [
      { id: "constrained_prompt", name: "Constrained Prompt", type: "text", required: true },
    ],
    parameters: [
      { id: "constraints", name: "Constraints", type: "json", default: ["Keep response under 200 words", "Do not mention competitors"] },
      { id: "position", name: "Position", type: "select", default: "append", options: [{ label: "Append", value: "append" }, { label: "Prepend", value: "prepend" }] },
    ],
    codeTemplate: {
      imports: [],
      body: `_constraints_str = "\\n".join(f"- {c}" for c in {{params.constraints}})
_block = f"\\nConstraints:\\n{_constraints_str}"
if "{{params.position}}" == "prepend":
    {{outputs.constrained_prompt}} = _block + "\\n\\n" + {{inputs.prompt}}
else:
    {{outputs.constrained_prompt}} = {{inputs.prompt}} + _block`,
      outputBindings: { constrained_prompt: "constrained_prompt" },
    },
  },

  // ── 14. DSPy Module ───────────────────────────────────────────────────
  {
    id: "prompt-engineering.dspy-module",
    name: "DSPy Module",
    category: "prompt-engineering",
    description: "Defines a DSPy module with typed signatures for declarative prompt programming",
    tags: ["dspy", "module", "signature", "declarative", "programming"],
    inputs: [
      { id: "input_data", name: "Input", type: "any", required: true },
    ],
    outputs: [
      { id: "result", name: "Result", type: "any", required: true },
    ],
    parameters: [
      { id: "signature", name: "Signature", type: "string", default: "question -> answer" },
      { id: "module_type", name: "Module Type", type: "select", default: "Predict", options: [{ label: "Predict", value: "Predict" }, { label: "ChainOfThought", value: "ChainOfThought" }, { label: "ReAct", value: "ReAct" }] },
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
    ],
    codeTemplate: {
      imports: ["import dspy"],
      body: `dspy.configure(lm=dspy.LM("openai/{{params.model}}"))
_module = dspy.{{params.module_type}}("{{params.signature}}")
{{outputs.result}} = _module({{inputs.input_data}})`,
      outputBindings: { result: "dspy_result" },
    },
  },

  // ── 15. DSPy Optimizer ────────────────────────────────────────────────
  {
    id: "prompt-engineering.dspy-optimizer",
    name: "DSPy Optimizer",
    category: "prompt-engineering",
    description: "Optimizes a DSPy module's prompts using a training set and a chosen optimization strategy",
    tags: ["dspy", "optimizer", "compile", "bootstrap", "mipro"],
    inputs: [
      { id: "module", name: "DSPy Module", type: "any", required: true },
      { id: "trainset", name: "Training Set", type: "list", required: true },
      { id: "metric", name: "Metric Function", type: "any", required: true },
    ],
    outputs: [
      { id: "optimized", name: "Optimized Module", type: "any", required: true },
    ],
    parameters: [
      { id: "optimizer", name: "Optimizer", type: "select", default: "BootstrapFewShot", options: [{ label: "BootstrapFewShot", value: "BootstrapFewShot" }, { label: "BootstrapFewShotWithRandomSearch", value: "BootstrapFewShotWithRandomSearch" }, { label: "MIPRO", value: "MIPRO" }] },
      { id: "max_bootstrapped", name: "Max Bootstrapped Demos", type: "number", default: 4, min: 0, max: 25 },
    ],
    codeTemplate: {
      imports: ["import dspy"],
      body: `_optimizer = dspy.{{params.optimizer}}(metric={{inputs.metric}}, max_bootstrapped_demos={{params.max_bootstrapped}})
{{outputs.optimized}} = _optimizer.compile({{inputs.module}}, trainset={{inputs.trainset}})`,
      outputBindings: { optimized: "optimized_module" },
    },
  },

  // ── 16. APE Block (Auto Prompt Engineering) ───────────────────────────
  {
    id: "prompt-engineering.ape",
    name: "APE Block (Auto Prompt Engineering)",
    category: "prompt-engineering",
    description: "Automatically generates and evaluates prompt candidates to find the best-performing prompt",
    tags: ["ape", "auto", "prompt-engineering", "generate", "evaluate", "optimization"],
    inputs: [
      { id: "task_description", name: "Task Description", type: "text", required: true },
      { id: "eval_examples", name: "Evaluation Examples", type: "list", required: true },
    ],
    outputs: [
      { id: "best_prompt", name: "Best Prompt", type: "text", required: true },
      { id: "scores", name: "Candidate Scores", type: "list", required: false },
    ],
    parameters: [
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
      { id: "n_candidates", name: "Candidates", type: "number", default: 5, min: 2, max: 20 },
      { id: "eval_model", name: "Eval Model", type: "string", default: "gpt-4o", advanced: true },
    ],
    codeTemplate: {
      imports: ["from langchain_openai import ChatOpenAI"],
      body: `_gen_llm = ChatOpenAI(model="{{params.model}}", temperature=0.9)
_eval_llm = ChatOpenAI(model="{{params.eval_model}}", temperature=0)
_candidates = [_gen_llm.invoke(f"Generate an effective prompt for: {{inputs.task_description}}").content for _ in range({{params.n_candidates}})]
{{outputs.scores}} = []
for _c in _candidates:
    _score = sum(1 for ex in {{inputs.eval_examples}} if ex["expected_output"].lower() in _eval_llm.invoke(f"{_c}\\n{ex['input']}").content.lower())
    {{outputs.scores}}.append({"prompt": _c, "score": _score})
{{outputs.best_prompt}} = max({{outputs.scores}}, key=lambda x: x["score"])["prompt"]`,
      outputBindings: { best_prompt: "best_prompt", scores: "candidate_scores" },
    },
  },

  // ── 17. Prompt Version Control ────────────────────────────────────────
  {
    id: "prompt-engineering.prompt-version-control",
    name: "Prompt Version Control",
    category: "prompt-engineering",
    description: "Tracks prompt versions with timestamps and metadata, enabling rollback and comparison",
    tags: ["version", "control", "history", "track", "rollback"],
    inputs: [
      { id: "prompt", name: "Prompt", type: "text", required: true },
    ],
    outputs: [
      { id: "versioned", name: "Versioned Prompt", type: "dict", required: true },
      { id: "version_id", name: "Version ID", type: "text", required: true },
    ],
    parameters: [
      { id: "label", name: "Version Label", type: "string", default: "v1" },
      { id: "store_path", name: "Store Path", type: "string", default: "./prompt_versions.json" },
      { id: "author", name: "Author", type: "string", default: "" },
    ],
    codeTemplate: {
      imports: ["import json", "import hashlib", "from datetime import datetime", "from pathlib import Path"],
      body: `_hash = hashlib.sha256({{inputs.prompt}}.encode()).hexdigest()[:12]
{{outputs.version_id}} = f"{{params.label}}-{_hash}"
{{outputs.versioned}} = {"id": {{outputs.version_id}}, "label": "{{params.label}}", "content": {{inputs.prompt}}, "author": "{{params.author}}", "timestamp": datetime.utcnow().isoformat()}
_path = Path("{{params.store_path}}")
_history = json.loads(_path.read_text()) if _path.exists() else []
_history.append({{outputs.versioned}})
_path.write_text(json.dumps(_history, indent=2))`,
      outputBindings: { versioned: "versioned_prompt", version_id: "prompt_version_id" },
    },
  },

  // ── 18. Prompt A/B Test ───────────────────────────────────────────────
  {
    id: "prompt-engineering.prompt-ab-test",
    name: "Prompt A/B Test",
    category: "prompt-engineering",
    description: "Routes traffic between two prompt variants and collects performance metrics for comparison",
    tags: ["ab-test", "experiment", "compare", "split", "evaluate"],
    inputs: [
      { id: "query", name: "Query", type: "text", required: true },
      { id: "prompt_a", name: "Prompt A", type: "text", required: true },
      { id: "prompt_b", name: "Prompt B", type: "text", required: true },
    ],
    outputs: [
      { id: "result", name: "Result", type: "text", required: true },
      { id: "variant", name: "Selected Variant", type: "text", required: true },
    ],
    parameters: [
      { id: "split_ratio", name: "A/B Split Ratio", type: "number", default: 0.5, min: 0, max: 1, step: 0.05 },
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
      { id: "log_path", name: "Log Path", type: "string", default: "./ab_test_log.jsonl", advanced: true },
    ],
    codeTemplate: {
      imports: ["import random", "import json", "from langchain_openai import ChatOpenAI"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature=0)
{{outputs.variant}} = "A" if random.random() < {{params.split_ratio}} else "B"
_prompt = {{inputs.prompt_a}} if {{outputs.variant}} == "A" else {{inputs.prompt_b}}
{{outputs.result}} = _llm.invoke(f"{_prompt}\\n{{inputs.query}}").content
with open("{{params.log_path}}", "a") as f:
    f.write(json.dumps({"variant": {{outputs.variant}}, "query": {{inputs.query}}}) + "\\n")`,
      outputBindings: { result: "ab_result", variant: "ab_variant" },
    },
  },
];
