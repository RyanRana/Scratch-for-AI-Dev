"""
aiblocks.prompt_engineering — Prompt Engineering

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def system_prompt(content='You are a helpful assistant.', name='system'):
    """Defines the system-level instruction that sets the LLM's role, tone, and constraints
    
    Parameters:
        content (code, default='You are a helpful assistant.'): System prompt content
        name (string, default='system'): 
    
    Returns:
        prompt: 
    """
    _imports = []
    _code = '{{outputs.prompt}} = {"role": "system", "content": """{{params.content}}"""}'
    
    _code = _code.replace("{{params.content}}", str(content))
    _code = _code.replace("{{params.name}}", str(name))
    _code = _code.replace("{{outputs.prompt}}", "_out_prompt")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_prompt")


def user_prompt(variables=None, content='Hello, {name}!'):
    """Defines a user-role message containing the query or instruction for the LLM
    
    Args:
        variables (dict): Variables to inject into the template
    
    Parameters:
        content (code, default='Hello, {name}!'): User prompt template
    
    Returns:
        prompt: 
    """
    _imports = []
    _code = '_content = """{{params.content}}""".format(**({{inputs.variables}} or {}))\n{{outputs.prompt}} = {"role": "user", "content": _content}'
    
    _code = _code.replace("{{params.content}}", str(content))
    _code = _code.replace("{{inputs.variables}}", "variables")
    _code = _code.replace("{{outputs.prompt}}", "_out_prompt")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["variables"] = variables
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_prompt")


def few_shot_examples(query=None, examples=[{'input': '2+2', 'output': '4'}, {'input': '3+5', 'output': '8'}], prefix='Here are some examples:', suffix='Now answer the following:'):
    """Provides example input-output pairs to guide the LLM's behavior via in-context learning
    
    Args:
        query (text) (required): 
    
    Parameters:
        examples (json, default=[{'input': '2+2', 'output': '4'}, {'input': '3+5', 'output': '8'}]): List of {input, output} pairs
        prefix (string, default='Here are some examples:'): 
        suffix (string, default='Now answer the following:'): 
    
    Returns:
        prompt: 
    """
    _imports = []
    _code = '_examples_str = "\\\\n".join(f"Input: {ex[\'input\']}\\\\nOutput: {ex[\'output\']}" for ex in {{params.examples}})\n{{outputs.prompt}} = {"role": "user", "content": f"{{params.prefix}}\\\\n{_examples_str}\\\\n{{params.suffix}}\\\\nInput: {{inputs.query}}\\\\nOutput:"}'
    
    _code = _code.replace("{{params.examples}}", str(examples))
    _code = _code.replace("{{params.prefix}}", str(prefix))
    _code = _code.replace("{{params.suffix}}", str(suffix))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{outputs.prompt}}", "_out_prompt")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_prompt")


def chain_of_thought(query=None, exemplars=[], instruction="Let's think step by step."):
    """Wraps a query with chain-of-thought exemplars that encourage step-by-step reasoning
    
    Args:
        query (text) (required): 
    
    Parameters:
        exemplars (json, default=[]): List of {question, reasoning, answer}
        instruction (string, default="Let's think step by step."): 
    
    Returns:
        prompt: 
    """
    _imports = []
    _code = '_cot_parts = []\nfor ex in {{params.exemplars}}:\n    _cot_parts.append(f"Q: {ex[\'question\']}\\\\nReasoning: {ex[\'reasoning\']}\\\\nA: {ex[\'answer\']}")\n_cot_str = "\\\\n\\\\n".join(_cot_parts)\n{{outputs.prompt}} = {"role": "user", "content": f"{_cot_str}\\\\n\\\\nQ: {{inputs.query}}\\\\n{{params.instruction}}"}'
    
    _code = _code.replace("{{params.exemplars}}", str(exemplars))
    _code = _code.replace("{{params.instruction}}", str(instruction))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{outputs.prompt}}", "_out_prompt")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_prompt")


def zero_shot_cot(query=None, trigger="Let's think step by step."):
    """Appends a reasoning trigger phrase without any exemplars
    
    Args:
        query (text) (required): 
    
    Parameters:
        trigger (string, default="Let's think step by step."): 
    
    Returns:
        prompt: 
    """
    _imports = []
    _code = '{{outputs.prompt}} = {"role": "user", "content": f"{{inputs.query}}\\\\n\\\\n{{params.trigger}}"}'
    
    _code = _code.replace("{{params.trigger}}", str(trigger))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{outputs.prompt}}", "_out_prompt")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_prompt")


def tree_of_thoughts(problem=None, model='gpt-4o', breadth=3, depth=3, strategy='bfs'):
    """Explores multiple reasoning paths in a tree structure, evaluating and pruning branches
    
    Dependencies: pip install langchain-openai
    
    Args:
        problem (text) (required): 
    
    Parameters:
        model (string, default='gpt-4o'): 
        breadth (number, default=3): 
        depth (number, default=3): 
        strategy (select, default='bfs'): 
    
    Returns:
        dict with keys:
            solution (text): 
            branches (list): 
    """
    _imports = ['from langchain_openai import ChatOpenAI']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature=0.7)\n_thoughts = [{"text": "{{inputs.problem}}", "score": 0}]\nfor _d in range({{params.depth}}):\n    _new = []\n    for _t in _thoughts:\n        _resp = _llm.invoke(f"Generate {{params.breadth}} different next steps for: {_t[\'text\']}")\n        _new.extend([{"text": s.strip(), "score": 0} for s in _resp.content.split("\\\\n") if s.strip()])\n    _thoughts = _new[:{{params.breadth}}]\n{{outputs.solution}} = _thoughts[0]["text"] if _thoughts else ""\n{{outputs.branches}} = _thoughts'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.breadth}}", str(breadth))
    _code = _code.replace("{{params.depth}}", str(depth))
    _code = _code.replace("{{params.strategy}}", str(strategy))
    _code = _code.replace("{{inputs.problem}}", "problem")
    _code = _code.replace("{{outputs.solution}}", "_out_solution")
    _code = _code.replace("{{outputs.branches}}", "_out_branches")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["problem"] = problem
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"solution": _ns.get("_out_solution"), "branches": _ns.get("_out_branches")}


def self_consistency(query=None, model='gpt-4o', n_samples=5, temperature=0.7):
    """Samples multiple reasoning paths and picks the most consistent answer via majority vote
    
    Dependencies: pip install langchain-openai
    
    Args:
        query (text) (required): 
    
    Parameters:
        model (string, default='gpt-4o'): 
        n_samples (number, default=5): 
        temperature (number, default=0.7): 
    
    Returns:
        dict with keys:
            answer (text): 
            samples (list): 
    """
    _imports = ['from langchain_openai import ChatOpenAI', 'from collections import Counter']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature={{params.temperature}})\n{{outputs.samples}} = [_llm.invoke(f"{{inputs.query}}\\\\nLet\'s think step by step.").content for _ in range({{params.n_samples}})]\n_answers = [s.strip().split("\\\\n")[-1] for s in {{outputs.samples}}]\n{{outputs.answer}} = Counter(_answers).most_common(1)[0][0]'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.n_samples}}", str(n_samples))
    _code = _code.replace("{{params.temperature}}", str(temperature))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{outputs.answer}}", "_out_answer")
    _code = _code.replace("{{outputs.samples}}", "_out_samples")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"answer": _ns.get("_out_answer"), "samples": _ns.get("_out_samples")}


def role_assign(role='senior data scientist', context=''):
    """Assigns a specific expert role to the LLM
    
    Parameters:
        role (string, default='senior data scientist'): 
        context (string, default=''): 
    
    Returns:
        prompt: 
    """
    _imports = []
    _code = '_ctx = f" {{params.context}}" if "{{params.context}}" else ""\n{{outputs.prompt}} = {"role": "system", "content": f"You are a {{params.role}}.{_ctx}"}'
    
    _code = _code.replace("{{params.role}}", str(role))
    _code = _code.replace("{{params.context}}", str(context))
    _code = _code.replace("{{outputs.prompt}}", "_out_prompt")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_prompt")


def persona(name='Alex', backstory='A 10-year veteran ML engineer at a FAANG company.', style='concise, technical, uses analogies', expertise='machine learning, MLOps'):
    """Defines a detailed persona with backstory, communication style, and domain expertise
    
    Parameters:
        name (string, default='Alex'): 
        backstory (code, default='A 10-year veteran ML engineer at a FAANG company.'): 
        style (string, default='concise, technical, uses analogies'): 
        expertise (string, default='machine learning, MLOps'): 
    
    Returns:
        prompt: 
    """
    _imports = []
    _code = '{{outputs.prompt}} = {"role": "system", "content": f"You are {{params.name}}. {{params.backstory}} Your communication style is {{params.style}}. Your expertise: {{params.expertise}}."}'
    
    _code = _code.replace("{{params.name}}", str(name))
    _code = _code.replace("{{params.backstory}}", str(backstory))
    _code = _code.replace("{{params.style}}", str(style))
    _code = _code.replace("{{params.expertise}}", str(expertise))
    _code = _code.replace("{{outputs.prompt}}", "_out_prompt")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_prompt")


def prompt_template_jinja(variables=None, template='Hello {{ name }}, you asked about {{ topic }}.', strict=True):
    """Renders a Jinja2 template with provided variables to produce a fully resolved prompt
    
    Dependencies: pip install Jinja2
    
    Args:
        variables (dict) (required): 
    
    Parameters:
        template (code, default='Hello {{ name }}, you asked about {{ topic }}.'): 
        strict (boolean, default=True): 
    
    Returns:
        text: 
    """
    _imports = ['from jinja2 import Template, StrictUndefined, Undefined']
    _code = '_undef = StrictUndefined if {{params.strict}} else Undefined\n_tmpl = Template("""{{params.template}}""", undefined=_undef)\n{{outputs.rendered}} = _tmpl.render(**{{inputs.variables}})'
    
    _code = _code.replace("{{params.template}}", str(template))
    _code = _code.replace("{{params.strict}}", str(strict))
    _code = _code.replace("{{inputs.variables}}", "variables")
    _code = _code.replace("{{outputs.rendered}}", "_out_rendered")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["variables"] = variables
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_rendered")


def variable_inject(template=None, variables=None, format_style='fstring'):
    """Injects runtime variables into a prompt template using Python string formatting
    
    Args:
        template (text) (required): 
        variables (dict) (required): 
    
    Parameters:
        format_style (select, default='fstring'): 
    
    Returns:
        text: 
    """
    _imports = []
    _code = 'if "{{params.format_style}}" == "percent":\n    {{outputs.result}} = {{inputs.template}} % {{inputs.variables}}\n "else":\n    {{outputs.result}} = {{inputs.template}}.format(**{{inputs.variables}})'
    
    _code = _code.replace("{{params.format_style}}", str(format_style))
    _code = _code.replace("{{inputs.template}}", "template")
    _code = _code.replace("{{inputs.variables}}", "variables")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["template"] = template
    _ns["variables"] = variables
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_result")


def output_format_spec(prompt=None, format='json', schema='{"answer": "string", "confidence": "number"}'):
    """Appends output format instructions (JSON, XML, markdown, etc.) to a prompt
    
    Args:
        prompt (text) (required): 
    
    Parameters:
        format (select, default='json'): 
        schema (code, default='{"answer": "string", "confidence": "number"}'): 
    
    Returns:
        text: 
    """
    _imports = []
    _code = '{{outputs.formatted_prompt}} = f"{{inputs.prompt}}\\\\n\\\\nRespond in {{params.format}} format following this schema:\\\\n{{params.schema}}"'
    
    _code = _code.replace("{{params.format}}", str(format))
    _code = _code.replace("{{params.schema}}", str(schema))
    _code = _code.replace("{{inputs.prompt}}", "prompt")
    _code = _code.replace("{{outputs.formatted_prompt}}", "_out_formatted_prompt")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["prompt"] = prompt
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_formatted_prompt")


def constraint(prompt=None, constraints=['Keep response under 200 words', 'Do not mention competitors'], position='append'):
    """Adds explicit constraints or rules the LLM must follow
    
    Args:
        prompt (text) (required): 
    
    Parameters:
        constraints (json, default=['Keep response under 200 words', 'Do not mention competitors']): 
        position (select, default='append'): 
    
    Returns:
        text: 
    """
    _imports = []
    _code = '_constraints_str = "\\\\n".join(f"- {c}" for c in {{params.constraints}})\n_block = f"\\\\nConstraints:\\\\n{_constraints_str}"\nif "{{params.position}}" == "prepend":\n    {{outputs.constrained_prompt}} = _block + "\\\\n\\\\n" + {{inputs.prompt}}\n "else":\n    {{outputs.constrained_prompt}} = {{inputs.prompt}} + _block'
    
    _code = _code.replace("{{params.constraints}}", str(constraints))
    _code = _code.replace("{{params.position}}", str(position))
    _code = _code.replace("{{inputs.prompt}}", "prompt")
    _code = _code.replace("{{outputs.constrained_prompt}}", "_out_constrained_prompt")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["prompt"] = prompt
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_constrained_prompt")


def dspy_module(input_data=None, signature='question -> answer', module_type='Predict', model='gpt-4o'):
    """Defines a DSPy module with typed signatures for declarative prompt programming
    
    Dependencies: pip install dspy-ai
    
    Args:
        input_data (any) (required): 
    
    Parameters:
        signature (string, default='question -> answer'): 
        module_type (select, default='Predict'): 
        model (string, default='gpt-4o'): 
    
    Returns:
        any: 
    """
    _imports = ['import dspy']
    _code = 'dspy.configure(lm=dspy.LM("openai/{{params.model}}"))\n_module = dspy.{{params.module_type}}("{{params.signature}}")\n{{outputs.result}} = _module({{inputs.input_data}})'
    
    _code = _code.replace("{{params.signature}}", str(signature))
    _code = _code.replace("{{params.module_type}}", str(module_type))
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{inputs.input_data}}", "input_data")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["input_data"] = input_data
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_result")


def dspy_optimizer(module=None, trainset=None, metric=None, optimizer='BootstrapFewShot', max_bootstrapped=4):
    """Optimizes a DSPy module's prompts using a training set and a chosen optimization strategy
    
    Dependencies: pip install dspy-ai
    
    Args:
        module (any) (required): 
        trainset (list) (required): 
        metric (any) (required): 
    
    Parameters:
        optimizer (select, default='BootstrapFewShot'): 
        max_bootstrapped (number, default=4): 
    
    Returns:
        any: 
    """
    _imports = ['import dspy']
    _code = '_optimizer = dspy.{{params.optimizer}}(metric={{inputs.metric}}, max_bootstrapped_demos={{params.max_bootstrapped}})\n{{outputs.optimized}} = _optimizer.compile({{inputs.module}}, trainset={{inputs.trainset}})'
    
    _code = _code.replace("{{params.optimizer}}", str(optimizer))
    _code = _code.replace("{{params.max_bootstrapped}}", str(max_bootstrapped))
    _code = _code.replace("{{inputs.module}}", "module")
    _code = _code.replace("{{inputs.trainset}}", "trainset")
    _code = _code.replace("{{inputs.metric}}", "metric")
    _code = _code.replace("{{outputs.optimized}}", "_out_optimized")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["module"] = module
    _ns["trainset"] = trainset
    _ns["metric"] = metric
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_optimized")


def ape(task_description=None, eval_examples=None, model='gpt-4o', n_candidates=5, eval_model='gpt-4o'):
    """Automatically generates and evaluates prompt candidates to find the best-performing prompt
    
    Dependencies: pip install langchain-openai
    
    Args:
        task_description (text) (required): 
        eval_examples (list) (required): 
    
    Parameters:
        model (string, default='gpt-4o'): 
        n_candidates (number, default=5): 
        eval_model (string, default='gpt-4o'): 
    
    Returns:
        dict with keys:
            best_prompt (text): 
            scores (list): 
    """
    _imports = ['from langchain_openai import ChatOpenAI']
    _code = '_gen_llm = ChatOpenAI(model="{{params.model}}", temperature=0.9)\n_eval_llm = ChatOpenAI(model="{{params.eval_model}}", temperature=0)\n_candidates = [_gen_llm.invoke(f"Generate an effective prompt for: {{inputs.task_description}}").content for _ in range({{params.n_candidates}})]\n{{outputs.scores}} = []\nfor _c in _candidates:\n    _score = sum(1 for ex in {{inputs.eval_examples}} if ex["expected_output"].lower() in _eval_llm.invoke(f"{_c}\\\\n{ex[\'input\']}").content.lower())\n    {{outputs.scores}}.append({"prompt": _c, "score": _score})\n{{outputs.best_prompt}} = max({{outputs.scores}}, key=lambda x: x["score"])["prompt"]'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.n_candidates}}", str(n_candidates))
    _code = _code.replace("{{params.eval_model}}", str(eval_model))
    _code = _code.replace("{{inputs.task_description}}", "task_description")
    _code = _code.replace("{{inputs.eval_examples}}", "eval_examples")
    _code = _code.replace("{{outputs.best_prompt}}", "_out_best_prompt")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["task_description"] = task_description
    _ns["eval_examples"] = eval_examples
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"best_prompt": _ns.get("_out_best_prompt"), "scores": _ns.get("_out_scores")}


def prompt_version_control(prompt=None, label='v1', store_path='./prompt_versions.json', author=''):
    """Tracks prompt versions with timestamps and metadata, enabling rollback and comparison
    
    Args:
        prompt (text) (required): 
    
    Parameters:
        label (string, default='v1'): 
        store_path (string, default='./prompt_versions.json'): 
        author (string, default=''): 
    
    Returns:
        dict with keys:
            versioned (dict): 
            version_id (text): 
    """
    _imports = ['import json', 'import hashlib', 'from datetime import datetime', 'from pathlib import Path']
    _code = '_hash = hashlib.sha256({{inputs.prompt}}.encode()).hexdigest()[:12]\n{{outputs.version_id}} = f"{{params.label}}-{_hash}"\n{{outputs.versioned}} = {"id": {{outputs.version_id}}, "label": "{{params.label}}", "content": {{inputs.prompt}}, "author": "{{params.author}}", "timestamp": datetime.utcnow().isoformat()}\n_path = Path("{{params.store_path}}")\n_history = json.loads(_path.read_text()) if _path.exists() else []\n_history.append({{outputs.versioned}})\n_path.write_text(json.dumps(_history, indent=2))'
    
    _code = _code.replace("{{params.label}}", str(label))
    _code = _code.replace("{{params.store_path}}", str(store_path))
    _code = _code.replace("{{params.author}}", str(author))
    _code = _code.replace("{{inputs.prompt}}", "prompt")
    _code = _code.replace("{{outputs.versioned}}", "_out_versioned")
    _code = _code.replace("{{outputs.version_id}}", "_out_version_id")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["prompt"] = prompt
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"versioned": _ns.get("_out_versioned"), "version_id": _ns.get("_out_version_id")}


def prompt_ab_test(query=None, prompt_a=None, prompt_b=None, split_ratio=0.5, model='gpt-4o', log_path='./ab_test_log.jsonl'):
    """Routes traffic between two prompt variants and collects performance metrics for comparison
    
    Dependencies: pip install langchain-openai
    
    Args:
        query (text) (required): 
        prompt_a (text) (required): 
        prompt_b (text) (required): 
    
    Parameters:
        split_ratio (number, default=0.5): 
        model (string, default='gpt-4o'): 
        log_path (string, default='./ab_test_log.jsonl'): 
    
    Returns:
        dict with keys:
            result (text): 
            variant (text): 
    """
    _imports = ['import random', 'import json', 'from langchain_openai import ChatOpenAI']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature=0)\n{{outputs.variant}} = "A" if random.random() < {{params.split_ratio}} else "B"\n_prompt = {{inputs.prompt_a}} if {{outputs.variant}} == "A" else {{inputs.prompt_b}}\n{{outputs.result}} = _llm.invoke(f"{_prompt}\\\\n{{inputs.query}}").content\nwith open("{{params.log_path}}", "a") as f:\n    f.write(json.dumps({"variant": {{outputs.variant}}, "query": {{inputs.query}}}) + "\\\\n")'
    
    _code = _code.replace("{{params.split_ratio}}", str(split_ratio))
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.log_path}}", str(log_path))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{inputs.prompt_a}}", "prompt_a")
    _code = _code.replace("{{inputs.prompt_b}}", "prompt_b")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    _code = _code.replace("{{outputs.variant}}", "_out_variant")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    _ns["prompt_a"] = prompt_a
    _ns["prompt_b"] = prompt_b
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"result": _ns.get("_out_result"), "variant": _ns.get("_out_variant")}

