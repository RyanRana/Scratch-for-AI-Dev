"""
aiblocks.agents — Agents & Orchestration

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def llm_agent(goal=None, tools=None, memory=None, model='gpt-4o', temperature=0.0, max_tokens=4096, framework='langchain'):
    """General-purpose LLM agent that accepts a goal and optional tools, then reasons and acts autonomously
    
    Dependencies: pip install langchain langchain-openai
    
    Args:
        goal (text) (required): Natural-language objective for the agent
        tools (list): List of tool definitions available to the agent
        memory (dict): Optional memory context
    
    Parameters:
        model (string, default='gpt-4o'): LLM model identifier
        temperature (number, default=0.0): 
        max_tokens (number, default=4096): 
        framework (select, default='langchain'): 
    
    Returns:
        dict with keys:
            result (text): Final agent response
            steps (list): Intermediate reasoning steps
    """
    _imports = ['from langchain.agents import initialize_agent, AgentType', 'from langchain_openai import ChatOpenAI']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature={{params.temperature}}, max_tokens={{params.max_tokens}})\n_agent = initialize_agent({{inputs.tools}} or [], _llm, agent=AgentType.OPENAI_FUNCTIONS, verbose=True)\n{{outputs.result}} = _agent.run("{{inputs.goal}}")'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.temperature}}", str(temperature))
    _code = _code.replace("{{params.max_tokens}}", str(max_tokens))
    _code = _code.replace("{{params.framework}}", str(framework))
    _code = _code.replace("{{inputs.goal}}", "goal")
    _code = _code.replace("{{inputs.tools}}", "tools")
    _code = _code.replace("{{inputs.memory}}", "memory")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    _code = _code.replace("{{outputs.steps}}", "_out_steps")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["goal"] = goal
    _ns["tools"] = tools
    _ns["memory"] = memory
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"result": _ns.get("_out_result"), "steps": _ns.get("_out_steps")}


def react_agent(goal=None, tools=None, model='gpt-4o', max_iterations=10, early_stop='force'):
    """Reason-and-Act agent that interleaves chain-of-thought reasoning with tool use
    
    Dependencies: pip install langchain langchain-openai
    
    Args:
        goal (text) (required): 
        tools (list) (required): 
    
    Parameters:
        model (string, default='gpt-4o'): 
        max_iterations (number, default=10): 
        early_stop (select, default='force'): 
    
    Returns:
        dict with keys:
            result (text): 
            trace (list): Thought-action-observation trace
    """
    _imports = ['from langchain.agents import initialize_agent, AgentType', 'from langchain_openai import ChatOpenAI']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature=0)\n_agent = initialize_agent({{inputs.tools}}, _llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, max_iterations={{params.max_iterations}}, early_stopping_method="{{params.early_stop}}", verbose=True)\n{{outputs.result}} = _agent.run("{{inputs.goal}}")'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.max_iterations}}", str(max_iterations))
    _code = _code.replace("{{params.early_stop}}", str(early_stop))
    _code = _code.replace("{{inputs.goal}}", "goal")
    _code = _code.replace("{{inputs.tools}}", "tools")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    _code = _code.replace("{{outputs.trace}}", "_out_trace")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["goal"] = goal
    _ns["tools"] = tools
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"result": _ns.get("_out_result"), "trace": _ns.get("_out_trace")}


def plan_and_execute(goal=None, tools=None, planner_model='gpt-4o', executor_model='gpt-4o'):
    """Agent that first creates a step-by-step plan then executes each step sequentially
    
    Dependencies: pip install langchain-openai langchain_experimental
    
    Args:
        goal (text) (required): 
        tools (list) (required): 
    
    Parameters:
        planner_model (string, default='gpt-4o'): 
        executor_model (string, default='gpt-4o'): 
    
    Returns:
        dict with keys:
            result (text): 
            plan (list): Generated plan steps
    """
    _imports = ['from langchain_experimental.plan_and_execute import PlanAndExecute, load_agent_executor, load_chat_planner', 'from langchain_openai import ChatOpenAI']
    _code = '_planner_llm = ChatOpenAI(model="{{params.planner_model}}", temperature=0)\n_executor_llm = ChatOpenAI(model="{{params.executor_model}}", temperature=0)\n_planner = load_chat_planner(_planner_llm)\n_executor = load_agent_executor(_executor_llm, {{inputs.tools}}, verbose=True)\n_agent = PlanAndExecute(planner=_planner, executor=_executor, verbose=True)\n{{outputs.result}} = _agent.run("{{inputs.goal}}")'
    
    _code = _code.replace("{{params.planner_model}}", str(planner_model))
    _code = _code.replace("{{params.executor_model}}", str(executor_model))
    _code = _code.replace("{{inputs.goal}}", "goal")
    _code = _code.replace("{{inputs.tools}}", "tools")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    _code = _code.replace("{{outputs.plan}}", "_out_plan")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["goal"] = goal
    _ns["tools"] = tools
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"result": _ns.get("_out_result"), "plan": _ns.get("_out_plan")}


def tool_router(query=None, tools=None, model='gpt-4o', strategy='function_call'):
    """Routes an agent request to the most appropriate tool based on the query
    
    Dependencies: pip install langchain langchain-openai
    
    Args:
        query (text) (required): 
        tools (list) (required): 
    
    Parameters:
        model (string, default='gpt-4o'): 
        strategy (select, default='function_call'): 
    
    Returns:
        dict with keys:
            selected_tool (tool): 
            tool_input (dict): 
    """
    _imports = ['from langchain_openai import ChatOpenAI', 'from langchain.tools.render import render_text_description']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature=0)\n_llm_with_tools = _llm.bind_tools({{inputs.tools}})\n_response = _llm_with_tools.invoke("{{inputs.query}}")\n{{outputs.selected_tool}} = _response.tool_calls[0]["name"]\n{{outputs.tool_input}} = _response.tool_calls[0]["args"]'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.strategy}}", str(strategy))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{inputs.tools}}", "tools")
    _code = _code.replace("{{outputs.selected_tool}}", "_out_selected_tool")
    _code = _code.replace("{{outputs.tool_input}}", "_out_tool_input")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    _ns["tools"] = tools
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"selected_tool": _ns.get("_out_selected_tool"), "tool_input": _ns.get("_out_tool_input")}


def tool_definition(name='my_tool', description='A custom tool', code='def my_tool(query: str) -> str:\n    return query', return_direct=False):
    """Defines a tool with name, description, and schema that agents can invoke
    
    Dependencies: pip install langchain
    
    Parameters:
        name (string, default='my_tool'): 
        description (string, default='A custom tool'): 
        code (code, default='def my_tool(query: str) -> str:\n    return query'): 
        return_direct (boolean, default=False): If true, tool output is returned directly to the user
    
    Returns:
        tool: 
    """
    _imports = ['from langchain.tools import tool as _tool_decorator']
    _code = '@_tool_decorator(return_direct={{params.return_direct}})\n{{params.code}}\n{{outputs.tool}} = {{params.name}}'
    
    _code = _code.replace("{{params.name}}", str(name))
    _code = _code.replace("{{params.description}}", str(description))
    _code = _code.replace("{{params.code}}", str(code))
    _code = _code.replace("{{params.return_direct}}", str(return_direct))
    _code = _code.replace("{{outputs.tool}}", "_out_tool")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tool")


def tool_result_parser(raw_result=None, schema={}, format='json'):
    """Parses and validates the output returned by a tool call
    
    Args:
        raw_result (any) (required): Raw tool output
    
    Parameters:
        schema (json, default={}): JSON schema to validate against
        format (select, default='json'): 
    
    Returns:
        dict with keys:
            parsed (dict): 
            is_valid (boolean): 
    """
    _imports = ['import json']
    _code = 'try:\n    if "{{params.format}}" == "json":\n        {{outputs.parsed}} = json.loads({{inputs.raw_result}}) if isinstance({{inputs.raw_result}}, str) else {{inputs.raw_result}}\n "else":\n        {{outputs.parsed}} = {"text": str({{inputs.raw_result}})}\n    {{outputs.is_valid}} = True\nexcept Exception:\n    {{outputs.parsed}} = {"error": str({{inputs.raw_result}})}\n    {{outputs.is_valid}} = False'
    
    _code = _code.replace("{{params.schema}}", str(schema))
    _code = _code.replace("{{params.format}}", str(format))
    _code = _code.replace("{{inputs.raw_result}}", "raw_result")
    _code = _code.replace("{{outputs.parsed}}", "_out_parsed")
    _code = _code.replace("{{outputs.is_valid}}", "_out_is_valid")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["raw_result"] = raw_result
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"parsed": _ns.get("_out_parsed"), "is_valid": _ns.get("_out_is_valid")}


def memory_short_term(message=None, k=10, return_messages=True):
    """Conversation buffer memory that retains recent messages within a session
    
    Dependencies: pip install langchain
    
    Args:
        message (text): New message to add to memory
    
    Parameters:
        k (number, default=10): Number of recent messages to retain
        return_messages (boolean, default=True): 
    
    Returns:
        dict with keys:
            memory (dict): 
            history (text): 
    """
    _imports = ['from langchain.memory import ConversationBufferWindowMemory']
    _code = '{{outputs.memory}} = ConversationBufferWindowMemory(k={{params.k}}, return_messages={{params.return_messages}})\nif {{inputs.message}}:\n    {{outputs.memory}}.save_context({"input": {{inputs.message}}}, {"output": ""})\n{{outputs.history}} = {{outputs.memory}}.load_memory_variables({})'
    
    _code = _code.replace("{{params.k}}", str(k))
    _code = _code.replace("{{params.return_messages}}", str(return_messages))
    _code = _code.replace("{{inputs.message}}", "message")
    _code = _code.replace("{{outputs.memory}}", "_out_memory")
    _code = _code.replace("{{outputs.history}}", "_out_history")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["message"] = message
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"memory": _ns.get("_out_memory"), "history": _ns.get("_out_history")}


def memory_long_term(text=None, query=None, collection='long_term_memory', top_k=5, embedding_model='text-embedding-3-small'):
    """Persistent vector-backed memory that stores and retrieves relevant memories via embedding similarity
    
    Dependencies: pip install langchain-community langchain-openai
    
    Args:
        text (text): Text to store as a memory
        query (text): Query to retrieve relevant memories
    
    Parameters:
        collection (string, default='long_term_memory'): 
        top_k (number, default=5): 
        embedding_model (string, default='text-embedding-3-small'): 
    
    Returns:
        list: 
    """
    _imports = ['from langchain_community.vectorstores import Chroma', 'from langchain_openai import OpenAIEmbeddings']
    _code = '_embeddings = OpenAIEmbeddings(model="{{params.embedding_model}}")\n_store = Chroma(collection_name="{{params.collection}}", embedding_function=_embeddings)\nif {{inputs.text}}:\n    _store.add_texts([{{inputs.text}}])\n{{outputs.memories}} = []\nif {{inputs.query}}:\n    _docs = _store.similarity_search({{inputs.query}}, k={{params.top_k}})\n    {{outputs.memories}} = [d.page_content for d in _docs]'
    
    _code = _code.replace("{{params.collection}}", str(collection))
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{params.embedding_model}}", str(embedding_model))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{outputs.memories}}", "_out_memories")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    _ns["query"] = query
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_memories")


def episodic_memory(episode=None, query=None, max_episodes=100, top_k=3):
    """Stores and retrieves task episodes (sequences of actions and outcomes) for experience-based learning
    
    Dependencies: pip install langchain-community langchain-openai
    
    Args:
        episode (dict): Episode dict with goal, steps, outcome
        query (text): 
    
    Parameters:
        max_episodes (number, default=100): 
        top_k (number, default=3): 
    
    Returns:
        list: 
    """
    _imports = ['from langchain_community.vectorstores import Chroma', 'from langchain_openai import OpenAIEmbeddings', 'import json']
    _code = '_embeddings = OpenAIEmbeddings()\n_store = Chroma(collection_name="episodic_memory", embedding_function=_embeddings)\nif {{inputs.episode}}:\n    _store.add_texts([json.dumps({{inputs.episode}})])\n{{outputs.episodes}} = []\nif {{inputs.query}}:\n    _docs = _store.similarity_search({{inputs.query}}, k={{params.top_k}})\n    {{outputs.episodes}} = [json.loads(d.page_content) for d in _docs]'
    
    _code = _code.replace("{{params.max_episodes}}", str(max_episodes))
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{inputs.episode}}", "episode")
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{outputs.episodes}}", "_out_episodes")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["episode"] = episode
    _ns["query"] = query
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_episodes")


def semantic_memory(fact=None, query=None, collection='semantic_kb', top_k=5):
    """Structured knowledge base storing facts and relationships that agents can query
    
    Dependencies: pip install langchain-community langchain-openai
    
    Args:
        fact (text): Fact to store in the knowledge base
        query (text): 
    
    Parameters:
        collection (string, default='semantic_kb'): 
        top_k (number, default=5): 
    
    Returns:
        list: 
    """
    _imports = ['from langchain_community.vectorstores import Chroma', 'from langchain_openai import OpenAIEmbeddings']
    _code = '_embeddings = OpenAIEmbeddings()\n_store = Chroma(collection_name="{{params.collection}}", embedding_function=_embeddings)\nif {{inputs.fact}}:\n    _store.add_texts([{{inputs.fact}}])\n{{outputs.facts}} = []\nif {{inputs.query}}:\n    _docs = _store.similarity_search({{inputs.query}}, k={{params.top_k}})\n    {{outputs.facts}} = [d.page_content for d in _docs]'
    
    _code = _code.replace("{{params.collection}}", str(collection))
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{inputs.fact}}", "fact")
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{outputs.facts}}", "_out_facts")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["fact"] = fact
    _ns["query"] = query
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_facts")


def agent_step(state=None, tools=None, model='gpt-4o'):
    """A single think-act-observe step within an agent loop
    
    Dependencies: pip install langchain-openai
    
    Args:
        state (dict) (required): Current agent state with scratchpad
        tools (list): 
    
    Parameters:
        model (string, default='gpt-4o'): 
    
    Returns:
        dict with keys:
            action (dict): Action to take (tool name + input)
            observation (text): 
            next_state (dict): 
    """
    _imports = ['from langchain_openai import ChatOpenAI']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature=0)\n_response = _llm.invoke({{inputs.state}}["messages"])\n{{outputs.action}} = {"tool": _response.tool_calls[0]["name"], "input": _response.tool_calls[0]["args"]} if _response.tool_calls else {"tool": "final_answer", "input": _response.content}\n{{outputs.observation}} = str({{outputs.action}})\n{{outputs.next_state}} = {**{{inputs.state}}, "last_action": {{outputs.action}}}'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{inputs.state}}", "state")
    _code = _code.replace("{{inputs.tools}}", "tools")
    _code = _code.replace("{{outputs.action}}", "_out_action")
    _code = _code.replace("{{outputs.observation}}", "_out_observation")
    _code = _code.replace("{{outputs.next_state}}", "_out_next_state")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["state"] = state
    _ns["tools"] = tools
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"action": _ns.get("_out_action"), "observation": _ns.get("_out_observation"), "next_state": _ns.get("_out_next_state")}


def agent_loop(agent=None, goal=None, max_iterations=15, stop_on_answer=True):
    """Iterative loop that repeatedly invokes agent steps until a stopping condition is met
    
    Args:
        agent (agent) (required): 
        goal (text) (required): 
    
    Parameters:
        max_iterations (number, default=15): 
        stop_on_answer (boolean, default=True): 
    
    Returns:
        dict with keys:
            result (text): 
            iterations (number): 
    """
    _imports = []
    _code = '{{outputs.result}} = {{inputs.agent}}.run("{{inputs.goal}}")\n{{outputs.iterations}} = getattr({{inputs.agent}}, "_iterations", -1)'
    
    _code = _code.replace("{{params.max_iterations}}", str(max_iterations))
    _code = _code.replace("{{params.stop_on_answer}}", str(stop_on_answer))
    _code = _code.replace("{{inputs.agent}}", "agent")
    _code = _code.replace("{{inputs.goal}}", "goal")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    _code = _code.replace("{{outputs.iterations}}", "_out_iterations")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["agent"] = agent
    _ns["goal"] = goal
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"result": _ns.get("_out_result"), "iterations": _ns.get("_out_iterations")}


def max_iterations_guard(iteration=None, max_iter=25, warning_at=20):
    """Safety guard that terminates an agent loop if it exceeds the configured iteration count
    
    Args:
        iteration (number) (required): 
    
    Parameters:
        max_iter (number, default=25): 
        warning_at (number, default=20): 
    
    Returns:
        dict with keys:
            should_stop (boolean): 
            message (text): 
    """
    _imports = []
    _code = '{{outputs.should_stop}} = {{inputs.iteration}} >= {{params.max_iter}}\n{{outputs.message}} = f"Iteration {{{inputs.iteration}}}/{{{params.max_iter}}}" + (" — STOPPING" if {{outputs.should_stop}} else "")'
    
    _code = _code.replace("{{params.max_iter}}", str(max_iter))
    _code = _code.replace("{{params.warning_at}}", str(warning_at))
    _code = _code.replace("{{inputs.iteration}}", "iteration")
    _code = _code.replace("{{outputs.should_stop}}", "_out_should_stop")
    _code = _code.replace("{{outputs.message}}", "_out_message")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["iteration"] = iteration
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"should_stop": _ns.get("_out_should_stop"), "message": _ns.get("_out_message")}


def multi_agent_supervisor(task=None, agents=None, model='gpt-4o', strategy='round_robin'):
    """Supervises multiple agents, delegating sub-tasks and aggregating their results
    
    Dependencies: pip install autogen
    
    Args:
        task (text) (required): 
        agents (list) (required): List of agent instances
    
    Parameters:
        model (string, default='gpt-4o'): 
        strategy (select, default='round_robin'): 
    
    Returns:
        dict with keys:
            result (text): 
            agent_outputs (dict): 
    """
    _imports = ['from autogen import GroupChat, GroupChatManager']
    _code = '_group_chat = GroupChat(agents={{inputs.agents}}, messages=[], max_round=10)\n_manager = GroupChatManager(groupchat=_group_chat, llm_config={"model": "{{params.model}}"})\n{{inputs.agents}}[0].initiate_chat(_manager, message="{{inputs.task}}")\n{{outputs.result}} = _group_chat.messages[-1]["content"]\n{{outputs.agent_outputs}} = {msg["name"]: msg["content"] for msg in _group_chat.messages}'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.strategy}}", str(strategy))
    _code = _code.replace("{{inputs.task}}", "task")
    _code = _code.replace("{{inputs.agents}}", "agents")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    _code = _code.replace("{{outputs.agent_outputs}}", "_out_agent_outputs")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["task"] = task
    _ns["agents"] = agents
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"result": _ns.get("_out_result"), "agent_outputs": _ns.get("_out_agent_outputs")}


def agent_handoff(from_agent=None, to_agent=None, context=None, handoff_message='Continuing from previous agent'):
    """Transfers control from one agent to another, passing along context and intermediate results
    
    Args:
        from_agent (agent) (required): 
        to_agent (agent) (required): 
        context (dict) (required): State to pass to the next agent
    
    Parameters:
        handoff_message (string, default='Continuing from previous agent'): Message sent during handoff
    
    Returns:
        text: 
    """
    _imports = ['import json']
    _code = '_context_str = json.dumps({{inputs.context}})\n{{outputs.result}} = {{inputs.to_agent}}.run(f"{{params.handoff_message}}\\\\nContext: {_context_str}")'
    
    _code = _code.replace("{{params.handoff_message}}", str(handoff_message))
    _code = _code.replace("{{inputs.from_agent}}", "from_agent")
    _code = _code.replace("{{inputs.to_agent}}", "to_agent")
    _code = _code.replace("{{inputs.context}}", "context")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["from_agent"] = from_agent
    _ns["to_agent"] = to_agent
    _ns["context"] = context
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_result")


def parallel_fan_out(tasks=None, agents=None, max_concurrency=5, timeout=120):
    """Dispatches the same or partitioned tasks to multiple agents in parallel and collects results
    
    Dependencies: pip install asyncio
    
    Args:
        tasks (list) (required): List of tasks to fan out
        agents (list) (required): 
    
    Parameters:
        max_concurrency (number, default=5): 
        timeout (number, default=120): 
    
    Returns:
        list: 
    """
    _imports = ['import asyncio', 'from concurrent.futures import ThreadPoolExecutor']
    _code = 'async def _fan_out():\n    with ThreadPoolExecutor(max_workers={{params.max_concurrency}}) as pool:\n        loop = asyncio.get_event_loop()\n        futures = [loop.run_in_executor(pool, agent.run, task) for agent, task in zip({{inputs.agents}}, {{inputs.tasks}})]\n        return await asyncio.gather(*futures)\n{{outputs.results}} = asyncio.run(_fan_out())'
    
    _code = _code.replace("{{params.max_concurrency}}", str(max_concurrency))
    _code = _code.replace("{{params.timeout}}", str(timeout))
    _code = _code.replace("{{inputs.tasks}}", "tasks")
    _code = _code.replace("{{inputs.agents}}", "agents")
    _code = _code.replace("{{outputs.results}}", "_out_results")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tasks"] = tasks
    _ns["agents"] = agents
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_results")


def critic_agent(content=None, criteria=None, model='gpt-4o', threshold=7):
    """Reviews and critiques the output of another agent, providing feedback and quality scores
    
    Dependencies: pip install langchain-openai
    
    Args:
        content (text) (required): Content to critique
        criteria (text): Evaluation criteria
    
    Parameters:
        model (string, default='gpt-4o'): 
        threshold (number, default=7): Score >= threshold means approved
    
    Returns:
        dict with keys:
            feedback (text): 
            score (number): 
            approved (boolean): 
    """
    _imports = ['from langchain_openai import ChatOpenAI', 'import json']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature=0)\n_prompt = f"Critique this content on a scale of 1-10.\\\\nCriteria: {{inputs.criteria}}\\\\nContent: {{inputs.content}}\\\\nRespond as JSON: {{\\\\\\"score\\\\\\": N, \\\\\\"feedback\\\\\\": \\\\\\"...\\\\\\"}}"\n_resp = _llm.invoke(_prompt)\n_parsed = json.loads(_resp.content)\n{{outputs.feedback}} = _parsed["feedback"]\n{{outputs.score}} = _parsed["score"]\n{{outputs.approved}} = _parsed["score"] >= {{params.threshold}}'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.threshold}}", str(threshold))
    _code = _code.replace("{{inputs.content}}", "content")
    _code = _code.replace("{{inputs.criteria}}", "criteria")
    _code = _code.replace("{{outputs.feedback}}", "_out_feedback")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    _code = _code.replace("{{outputs.approved}}", "_out_approved")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["content"] = content
    _ns["criteria"] = criteria
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"feedback": _ns.get("_out_feedback"), "score": _ns.get("_out_score"), "approved": _ns.get("_out_approved")}


def reflection_step(actions=None, outcomes=None, model='gpt-4o'):
    """Agent reflects on its previous actions and outcomes to improve future decisions
    
    Dependencies: pip install langchain-openai
    
    Args:
        actions (list) (required): 
        outcomes (list) (required): 
    
    Parameters:
        model (string, default='gpt-4o'): 
    
    Returns:
        dict with keys:
            insights (text): 
            revised_plan (list): 
    """
    _imports = ['from langchain_openai import ChatOpenAI']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature=0.3)\n_prompt = f"Reflect on these actions and outcomes. What worked, what didn\'t, and what should change?\\\\nActions: {{{inputs.actions}}}\\\\nOutcomes: {{{inputs.outcomes}}}"\n_resp = _llm.invoke(_prompt)\n{{outputs.insights}} = _resp.content'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{inputs.actions}}", "actions")
    _code = _code.replace("{{inputs.outcomes}}", "outcomes")
    _code = _code.replace("{{outputs.insights}}", "_out_insights")
    _code = _code.replace("{{outputs.revised_plan}}", "_out_revised_plan")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["actions"] = actions
    _ns["outcomes"] = outcomes
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"insights": _ns.get("_out_insights"), "revised_plan": _ns.get("_out_revised_plan")}


def self_correction_loop(draft=None, validation_fn=None, model='gpt-4o', max_retries=3, criteria='Output must be factual and well-structured'):
    """Iteratively refines agent output by checking against validation criteria and self-correcting
    
    Dependencies: pip install langchain-openai
    
    Args:
        draft (text) (required): 
        validation_fn (any): 
    
    Parameters:
        model (string, default='gpt-4o'): 
        max_retries (number, default=3): 
        criteria (string, default='Output must be factual and well-structured'): 
    
    Returns:
        dict with keys:
            final_output (text): 
            corrections (number): 
    """
    _imports = ['from langchain_openai import ChatOpenAI']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature=0)\n_output = {{inputs.draft}}\n_corrections = 0\nfor _i in range({{params.max_retries}}):\n    _check = _llm.invoke(f"Does this meet the criteria \'{{params.criteria}}\'? Output: {_output}\\\\nRespond YES or NO with fixes.")\n    if "YES" in _check.content.upper():\n        break\n    _output = _llm.invoke(f"Fix this based on feedback: {_check.content}\\\\nOriginal: {_output}").content\n    _corrections += 1\n{{outputs.final_output}} = _output\n{{outputs.corrections}} = _corrections'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.max_retries}}", str(max_retries))
    _code = _code.replace("{{params.criteria}}", str(criteria))
    _code = _code.replace("{{inputs.draft}}", "draft")
    _code = _code.replace("{{inputs.validation_fn}}", "validation_fn")
    _code = _code.replace("{{outputs.final_output}}", "_out_final_output")
    _code = _code.replace("{{outputs.corrections}}", "_out_corrections")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["draft"] = draft
    _ns["validation_fn"] = validation_fn
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"final_output": _ns.get("_out_final_output"), "corrections": _ns.get("_out_corrections")}


def prompt_chain(input_text=None, prompts=['Summarize: {input}', 'Translate to French: {input}'], model='gpt-4o'):
    """Chains multiple prompts sequentially where each output feeds into the next prompt
    
    Dependencies: pip install langchain langchain-openai
    
    Args:
        input_text (text) (required): 
    
    Parameters:
        prompts (json, default=['Summarize: {input}', 'Translate to French: {input}']): Ordered list of prompt templates
        model (string, default='gpt-4o'): 
    
    Returns:
        dict with keys:
            result (text): 
            intermediate (list): 
    """
    _imports = ['from langchain_openai import ChatOpenAI', 'from langchain.prompts import PromptTemplate', 'from langchain.chains import LLMChain, SimpleSequentialChain']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature=0)\n_chains = [LLMChain(llm=_llm, prompt=PromptTemplate.from_template(p)) for p in {{params.prompts}}]\n_seq = SimpleSequentialChain(chains=_chains, verbose=True)\n{{outputs.result}} = _seq.run("{{inputs.input_text}}")'
    
    _code = _code.replace("{{params.prompts}}", str(prompts))
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{inputs.input_text}}", "input_text")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    _code = _code.replace("{{outputs.intermediate}}", "_out_intermediate")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["input_text"] = input_text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"result": _ns.get("_out_result"), "intermediate": _ns.get("_out_intermediate")}


def sequential_chain(inputs=None, chain_config=[], model='gpt-4o'):
    """Named-variable sequential chain where each step produces named outputs consumed by later steps
    
    Dependencies: pip install langchain langchain-openai
    
    Args:
        inputs (dict) (required): 
    
    Parameters:
        chain_config (json, default=[]): Array of {prompt, input_vars, output_key}
        model (string, default='gpt-4o'): 
    
    Returns:
        dict: 
    """
    _imports = ['from langchain_openai import ChatOpenAI', 'from langchain.prompts import PromptTemplate', 'from langchain.chains import LLMChain, SequentialChain']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature=0)\n_chains = []\nfor _cfg in {{params.chain_config}}:\n    _chains.append(LLMChain(llm=_llm, prompt=PromptTemplate.from_template(_cfg["prompt"]), output_key=_cfg["output_key"]))\n_input_vars = list({{inputs.inputs}}.keys())\n_output_vars = [c["output_key"] for c in {{params.chain_config}}]\n_seq = SequentialChain(chains=_chains, input_variables=_input_vars, output_variables=_output_vars, verbose=True)\n{{outputs.result}} = _seq({{inputs.inputs}})'
    
    _code = _code.replace("{{params.chain_config}}", str(chain_config))
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{inputs.inputs}}", "inputs")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["inputs"] = inputs
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_result")


def router_chain(query=None, chains=None, model='gpt-4o', route_descriptions={}):
    """Dynamically routes input to one of several sub-chains based on the content of the query
    
    Dependencies: pip install langchain langchain-openai
    
    Args:
        query (text) (required): 
        chains (list) (required): 
    
    Parameters:
        model (string, default='gpt-4o'): 
        route_descriptions (json, default={}): Map of route name to description
    
    Returns:
        dict with keys:
            result (text): 
            route (text): 
    """
    _imports = ['from langchain_openai import ChatOpenAI', 'from langchain.chains.router import MultiRouteChain, RouterChain']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature=0)\n_descriptions = {{params.route_descriptions}}\n_prompt = f"Given the query, choose the best route from: {list(_descriptions.keys())}. Query: {{inputs.query}}"\n_route_resp = _llm.invoke(_prompt)\n{{outputs.route}} = _route_resp.content.strip()\n{{outputs.result}} = {{inputs.chains}}[0].run("{{inputs.query}}")'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.route_descriptions}}", str(route_descriptions))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{inputs.chains}}", "chains")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    _code = _code.replace("{{outputs.route}}", "_out_route")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    _ns["chains"] = chains
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"result": _ns.get("_out_result"), "route": _ns.get("_out_route")}


def map_reduce_chain(documents=None, map_prompt='Summarize this: {text}', reduce_prompt='Combine these summaries into a final summary: {text}', model='gpt-4o'):
    """Applies a map step to each document/chunk, then reduces all mapped outputs into a single result
    
    Dependencies: pip install langchain langchain-openai
    
    Args:
        documents (list) (required): 
    
    Parameters:
        map_prompt (string, default='Summarize this: {text}'): 
        reduce_prompt (string, default='Combine these summaries into a final summary: {text}'): 
        model (string, default='gpt-4o'): 
    
    Returns:
        dict with keys:
            result (text): 
            mapped (list): 
    """
    _imports = ['from langchain_openai import ChatOpenAI', 'from langchain.chains.summarize import load_summarize_chain']
    _code = '_llm = ChatOpenAI(model="{{params.model}}", temperature=0)\n_chain = load_summarize_chain(_llm, chain_type="map_reduce", verbose=True)\n{{outputs.result}} = _chain.run({{inputs.documents}})'
    
    _code = _code.replace("{{params.map_prompt}}", str(map_prompt))
    _code = _code.replace("{{params.reduce_prompt}}", str(reduce_prompt))
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{inputs.documents}}", "documents")
    _code = _code.replace("{{outputs.result}}", "_out_result")
    _code = _code.replace("{{outputs.mapped}}", "_out_mapped")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["documents"] = documents
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"result": _ns.get("_out_result"), "mapped": _ns.get("_out_mapped")}


def debate_multi_agent(topic=None, agents=None, rounds=3, judge_model='gpt-4o', framework='autogen'):
    """Multiple agents argue for and against a topic across rounds, producing a synthesized conclusion
    
    Dependencies: pip install autogen
    
    Args:
        topic (text) (required): 
        agents (list) (required): List of agent instances to participate
    
    Parameters:
        rounds (number, default=3): 
        judge_model (string, default='gpt-4o'): 
        framework (select, default='autogen'): 
    
    Returns:
        dict with keys:
            conclusion (text): 
            transcript (list): 
    """
    _imports = ['from autogen import GroupChat, GroupChatManager, AssistantAgent']
    _code = '_group_chat = GroupChat(agents={{inputs.agents}}, messages=[], max_round={{params.rounds}} * len({{inputs.agents}}))\n_manager = GroupChatManager(groupchat=_group_chat, llm_config={"model": "{{params.judge_model}}"})\n{{inputs.agents}}[0].initiate_chat(_manager, message="Debate topic: {{inputs.topic}}")\n{{outputs.transcript}} = _group_chat.messages\n_judge = AssistantAgent("judge", llm_config={"model": "{{params.judge_model}}"})\n_summary = _judge.generate_reply(messages=[{"role": "user", "content": f"Summarize and give a conclusion for this debate: {{{outputs.transcript}}}"}])\n{{outputs.conclusion}} = _summary'
    
    _code = _code.replace("{{params.rounds}}", str(rounds))
    _code = _code.replace("{{params.judge_model}}", str(judge_model))
    _code = _code.replace("{{params.framework}}", str(framework))
    _code = _code.replace("{{inputs.topic}}", "topic")
    _code = _code.replace("{{inputs.agents}}", "agents")
    _code = _code.replace("{{outputs.conclusion}}", "_out_conclusion")
    _code = _code.replace("{{outputs.transcript}}", "_out_transcript")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["topic"] = topic
    _ns["agents"] = agents
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"conclusion": _ns.get("_out_conclusion"), "transcript": _ns.get("_out_transcript")}

