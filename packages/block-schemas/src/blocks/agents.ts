import type { BlockDefinition } from "../types.js";

export const agentsBlocks: BlockDefinition[] = [
  // ── 1. LLM Agent ──────────────────────────────────────────────────────
  {
    id: "agents.llm-agent",
    name: "LLM Agent",
    category: "agents",
    description: "General-purpose LLM agent that accepts a goal and optional tools, then reasons and acts autonomously",
    tags: ["agent", "llm", "langchain", "autogen", "crewai", "autonomous"],
    inputs: [
      { id: "goal", name: "Goal", type: "text", required: true, description: "Natural-language objective for the agent" },
      { id: "tools", name: "Tools", type: "list", required: false, multiple: true, description: "List of tool definitions available to the agent" },
      { id: "memory", name: "Memory", type: "dict", required: false, description: "Optional memory context" },
    ],
    outputs: [
      { id: "result", name: "Result", type: "text", required: true, description: "Final agent response" },
      { id: "steps", name: "Steps", type: "list", required: false, description: "Intermediate reasoning steps" },
    ],
    parameters: [
      { id: "model", name: "Model", type: "string", default: "gpt-4o", description: "LLM model identifier" },
      { id: "temperature", name: "Temperature", type: "number", default: 0.0, min: 0, max: 2, step: 0.1 },
      { id: "max_tokens", name: "Max Tokens", type: "number", default: 4096, min: 1, max: 128000, advanced: true },
      { id: "framework", name: "Framework", type: "select", default: "langchain", options: [{ label: "LangChain", value: "langchain" }, { label: "AutoGen", value: "autogen" }, { label: "CrewAI", value: "crewai" }] },
    ],
    codeTemplate: {
      imports: ["from langchain.agents import initialize_agent, AgentType", "from langchain_openai import ChatOpenAI"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature={{params.temperature}}, max_tokens={{params.max_tokens}})
_agent = initialize_agent({{inputs.tools}} or [], _llm, agent=AgentType.OPENAI_FUNCTIONS, verbose=True)
{{outputs.result}} = _agent.run("{{inputs.goal}}")`,
      outputBindings: { result: "agent_result", steps: "agent_steps" },
    },
  },

  // ── 2. ReAct Agent ────────────────────────────────────────────────────
  {
    id: "agents.react-agent",
    name: "ReAct Agent",
    category: "agents",
    description: "Reason-and-Act agent that interleaves chain-of-thought reasoning with tool use",
    tags: ["react", "agent", "reasoning", "langchain", "tool-use"],
    inputs: [
      { id: "goal", name: "Goal", type: "text", required: true },
      { id: "tools", name: "Tools", type: "list", required: true, multiple: true },
    ],
    outputs: [
      { id: "result", name: "Result", type: "text", required: true },
      { id: "trace", name: "Trace", type: "list", required: false, description: "Thought-action-observation trace" },
    ],
    parameters: [
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
      { id: "max_iterations", name: "Max Iterations", type: "number", default: 10, min: 1, max: 100 },
      { id: "early_stop", name: "Early Stop Method", type: "select", default: "force", options: [{ label: "Force", value: "force" }, { label: "Generate", value: "generate" }] },
    ],
    codeTemplate: {
      imports: ["from langchain.agents import initialize_agent, AgentType", "from langchain_openai import ChatOpenAI"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature=0)
_agent = initialize_agent({{inputs.tools}}, _llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, max_iterations={{params.max_iterations}}, early_stopping_method="{{params.early_stop}}", verbose=True)
{{outputs.result}} = _agent.run("{{inputs.goal}}")`,
      outputBindings: { result: "react_result", trace: "react_trace" },
    },
  },

  // ── 3. Plan-and-Execute Agent ─────────────────────────────────────────
  {
    id: "agents.plan-and-execute",
    name: "Plan-and-Execute Agent",
    category: "agents",
    description: "Agent that first creates a step-by-step plan then executes each step sequentially",
    tags: ["plan", "execute", "agent", "langchain", "planner"],
    inputs: [
      { id: "goal", name: "Goal", type: "text", required: true },
      { id: "tools", name: "Tools", type: "list", required: true, multiple: true },
    ],
    outputs: [
      { id: "result", name: "Result", type: "text", required: true },
      { id: "plan", name: "Plan", type: "list", required: false, description: "Generated plan steps" },
    ],
    parameters: [
      { id: "planner_model", name: "Planner Model", type: "string", default: "gpt-4o" },
      { id: "executor_model", name: "Executor Model", type: "string", default: "gpt-4o" },
    ],
    codeTemplate: {
      imports: ["from langchain_experimental.plan_and_execute import PlanAndExecute, load_agent_executor, load_chat_planner", "from langchain_openai import ChatOpenAI"],
      body: `_planner_llm = ChatOpenAI(model="{{params.planner_model}}", temperature=0)
_executor_llm = ChatOpenAI(model="{{params.executor_model}}", temperature=0)
_planner = load_chat_planner(_planner_llm)
_executor = load_agent_executor(_executor_llm, {{inputs.tools}}, verbose=True)
_agent = PlanAndExecute(planner=_planner, executor=_executor, verbose=True)
{{outputs.result}} = _agent.run("{{inputs.goal}}")`,
      outputBindings: { result: "plan_exec_result", plan: "plan_steps" },
    },
  },

  // ── 4. Tool Router ────────────────────────────────────────────────────
  {
    id: "agents.tool-router",
    name: "Tool Router",
    category: "agents",
    description: "Routes an agent request to the most appropriate tool based on the query",
    tags: ["tool", "router", "dispatch", "langchain", "function-calling"],
    inputs: [
      { id: "query", name: "Query", type: "text", required: true },
      { id: "tools", name: "Tools", type: "list", required: true, multiple: true },
    ],
    outputs: [
      { id: "selected_tool", name: "Selected Tool", type: "tool", required: true },
      { id: "tool_input", name: "Tool Input", type: "dict", required: true },
    ],
    parameters: [
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
      { id: "strategy", name: "Strategy", type: "select", default: "function_call", options: [{ label: "Function Call", value: "function_call" }, { label: "Embedding Similarity", value: "embedding" }] },
    ],
    codeTemplate: {
      imports: ["from langchain_openai import ChatOpenAI", "from langchain.tools.render import render_text_description"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature=0)
_llm_with_tools = _llm.bind_tools({{inputs.tools}})
_response = _llm_with_tools.invoke("{{inputs.query}}")
{{outputs.selected_tool}} = _response.tool_calls[0]["name"]
{{outputs.tool_input}} = _response.tool_calls[0]["args"]`,
      outputBindings: { selected_tool: "selected_tool", tool_input: "tool_input" },
    },
  },

  // ── 5. Tool Definition ────────────────────────────────────────────────
  {
    id: "agents.tool-definition",
    name: "Tool Definition",
    category: "agents",
    description: "Defines a tool with name, description, and schema that agents can invoke",
    tags: ["tool", "define", "function", "langchain", "crewai"],
    inputs: [],
    outputs: [
      { id: "tool", name: "Tool", type: "tool", required: true },
    ],
    parameters: [
      { id: "name", name: "Tool Name", type: "string", default: "my_tool" },
      { id: "description", name: "Description", type: "string", default: "A custom tool" },
      { id: "code", name: "Function Body", type: "code", default: "def my_tool(query: str) -> str:\n    return query" },
      { id: "return_direct", name: "Return Direct", type: "boolean", default: false, description: "If true, tool output is returned directly to the user" },
    ],
    codeTemplate: {
      imports: ["from langchain.tools import tool as _tool_decorator"],
      body: `@_tool_decorator(return_direct={{params.return_direct}})
{{params.code}}
{{outputs.tool}} = {{params.name}}`,
      outputBindings: { tool: "defined_tool" },
    },
  },

  // ── 6. Tool Result Parser ─────────────────────────────────────────────
  {
    id: "agents.tool-result-parser",
    name: "Tool Result Parser",
    category: "agents",
    description: "Parses and validates the output returned by a tool call",
    tags: ["tool", "parser", "result", "output", "validate"],
    inputs: [
      { id: "raw_result", name: "Raw Result", type: "any", required: true, description: "Raw tool output" },
    ],
    outputs: [
      { id: "parsed", name: "Parsed Result", type: "dict", required: true },
      { id: "is_valid", name: "Is Valid", type: "boolean", required: true },
    ],
    parameters: [
      { id: "schema", name: "Expected Schema", type: "json", default: {}, description: "JSON schema to validate against" },
      { id: "format", name: "Parse Format", type: "select", default: "json", options: [{ label: "JSON", value: "json" }, { label: "Text", value: "text" }, { label: "XML", value: "xml" }] },
    ],
    codeTemplate: {
      imports: ["import json"],
      body: `try:
    if "{{params.format}}" == "json":
        {{outputs.parsed}} = json.loads({{inputs.raw_result}}) if isinstance({{inputs.raw_result}}, str) else {{inputs.raw_result}}
    else:
        {{outputs.parsed}} = {"text": str({{inputs.raw_result}})}
    {{outputs.is_valid}} = True
except Exception:
    {{outputs.parsed}} = {"error": str({{inputs.raw_result}})}
    {{outputs.is_valid}} = False`,
      outputBindings: { parsed: "parsed_result", is_valid: "result_valid" },
    },
  },

  // ── 7. Memory Store (Short-Term) ──────────────────────────────────────
  {
    id: "agents.memory-short-term",
    name: "Memory Store (Short-Term)",
    category: "agents",
    description: "Conversation buffer memory that retains recent messages within a session",
    tags: ["memory", "short-term", "buffer", "conversation", "langchain"],
    inputs: [
      { id: "message", name: "Message", type: "text", required: false, description: "New message to add to memory" },
    ],
    outputs: [
      { id: "memory", name: "Memory", type: "dict", required: true },
      { id: "history", name: "History", type: "text", required: true },
    ],
    parameters: [
      { id: "k", name: "Window Size", type: "number", default: 10, min: 1, max: 1000, description: "Number of recent messages to retain" },
      { id: "return_messages", name: "Return Messages", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from langchain.memory import ConversationBufferWindowMemory"],
      body: `{{outputs.memory}} = ConversationBufferWindowMemory(k={{params.k}}, return_messages={{params.return_messages}})
if {{inputs.message}}:
    {{outputs.memory}}.save_context({"input": {{inputs.message}}}, {"output": ""})
{{outputs.history}} = {{outputs.memory}}.load_memory_variables({})`,
      outputBindings: { memory: "short_term_memory", history: "memory_history" },
    },
  },

  // ── 8. Memory Store (Long-Term) ───────────────────────────────────────
  {
    id: "agents.memory-long-term",
    name: "Memory Store (Long-Term)",
    category: "agents",
    description: "Persistent vector-backed memory that stores and retrieves relevant memories via embedding similarity",
    tags: ["memory", "long-term", "vector", "persistent", "langchain"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: false, description: "Text to store as a memory" },
      { id: "query", name: "Query", type: "text", required: false, description: "Query to retrieve relevant memories" },
    ],
    outputs: [
      { id: "memories", name: "Memories", type: "list", required: true },
    ],
    parameters: [
      { id: "collection", name: "Collection Name", type: "string", default: "long_term_memory" },
      { id: "top_k", name: "Top K", type: "number", default: 5, min: 1, max: 100 },
      { id: "embedding_model", name: "Embedding Model", type: "string", default: "text-embedding-3-small", advanced: true },
    ],
    codeTemplate: {
      imports: ["from langchain_community.vectorstores import Chroma", "from langchain_openai import OpenAIEmbeddings"],
      body: `_embeddings = OpenAIEmbeddings(model="{{params.embedding_model}}")
_store = Chroma(collection_name="{{params.collection}}", embedding_function=_embeddings)
if {{inputs.text}}:
    _store.add_texts([{{inputs.text}}])
{{outputs.memories}} = []
if {{inputs.query}}:
    _docs = _store.similarity_search({{inputs.query}}, k={{params.top_k}})
    {{outputs.memories}} = [d.page_content for d in _docs]`,
      outputBindings: { memories: "retrieved_memories" },
    },
  },

  // ── 9. Episodic Memory ────────────────────────────────────────────────
  {
    id: "agents.episodic-memory",
    name: "Episodic Memory",
    category: "agents",
    description: "Stores and retrieves task episodes (sequences of actions and outcomes) for experience-based learning",
    tags: ["memory", "episodic", "experience", "replay", "langchain"],
    inputs: [
      { id: "episode", name: "Episode", type: "dict", required: false, description: "Episode dict with goal, steps, outcome" },
      { id: "query", name: "Query", type: "text", required: false },
    ],
    outputs: [
      { id: "episodes", name: "Similar Episodes", type: "list", required: true },
    ],
    parameters: [
      { id: "max_episodes", name: "Max Episodes", type: "number", default: 100, min: 1, max: 10000 },
      { id: "top_k", name: "Top K", type: "number", default: 3, min: 1, max: 50 },
    ],
    codeTemplate: {
      imports: ["from langchain_community.vectorstores import Chroma", "from langchain_openai import OpenAIEmbeddings", "import json"],
      body: `_embeddings = OpenAIEmbeddings()
_store = Chroma(collection_name="episodic_memory", embedding_function=_embeddings)
if {{inputs.episode}}:
    _store.add_texts([json.dumps({{inputs.episode}})])
{{outputs.episodes}} = []
if {{inputs.query}}:
    _docs = _store.similarity_search({{inputs.query}}, k={{params.top_k}})
    {{outputs.episodes}} = [json.loads(d.page_content) for d in _docs]`,
      outputBindings: { episodes: "similar_episodes" },
    },
  },

  // ── 10. Semantic Memory ───────────────────────────────────────────────
  {
    id: "agents.semantic-memory",
    name: "Semantic Memory",
    category: "agents",
    description: "Structured knowledge base storing facts and relationships that agents can query",
    tags: ["memory", "semantic", "knowledge", "facts", "graph"],
    inputs: [
      { id: "fact", name: "Fact", type: "text", required: false, description: "Fact to store in the knowledge base" },
      { id: "query", name: "Query", type: "text", required: false },
    ],
    outputs: [
      { id: "facts", name: "Related Facts", type: "list", required: true },
    ],
    parameters: [
      { id: "collection", name: "Collection", type: "string", default: "semantic_kb" },
      { id: "top_k", name: "Top K", type: "number", default: 5, min: 1, max: 50 },
    ],
    codeTemplate: {
      imports: ["from langchain_community.vectorstores import Chroma", "from langchain_openai import OpenAIEmbeddings"],
      body: `_embeddings = OpenAIEmbeddings()
_store = Chroma(collection_name="{{params.collection}}", embedding_function=_embeddings)
if {{inputs.fact}}:
    _store.add_texts([{{inputs.fact}}])
{{outputs.facts}} = []
if {{inputs.query}}:
    _docs = _store.similarity_search({{inputs.query}}, k={{params.top_k}})
    {{outputs.facts}} = [d.page_content for d in _docs]`,
      outputBindings: { facts: "related_facts" },
    },
  },

  // ── 11. Agent Step ────────────────────────────────────────────────────
  {
    id: "agents.agent-step",
    name: "Agent Step",
    category: "agents",
    description: "A single think-act-observe step within an agent loop",
    tags: ["agent", "step", "action", "observation", "langchain"],
    inputs: [
      { id: "state", name: "Agent State", type: "dict", required: true, description: "Current agent state with scratchpad" },
      { id: "tools", name: "Tools", type: "list", required: false, multiple: true },
    ],
    outputs: [
      { id: "action", name: "Action", type: "dict", required: true, description: "Action to take (tool name + input)" },
      { id: "observation", name: "Observation", type: "text", required: true },
      { id: "next_state", name: "Next State", type: "dict", required: true },
    ],
    parameters: [
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
    ],
    codeTemplate: {
      imports: ["from langchain_openai import ChatOpenAI"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature=0)
_response = _llm.invoke({{inputs.state}}["messages"])
{{outputs.action}} = {"tool": _response.tool_calls[0]["name"], "input": _response.tool_calls[0]["args"]} if _response.tool_calls else {"tool": "final_answer", "input": _response.content}
{{outputs.observation}} = str({{outputs.action}})
{{outputs.next_state}} = {**{{inputs.state}}, "last_action": {{outputs.action}}}`,
      outputBindings: { action: "step_action", observation: "step_observation", next_state: "next_state" },
    },
  },

  // ── 12. Agent Loop ────────────────────────────────────────────────────
  {
    id: "agents.agent-loop",
    name: "Agent Loop",
    category: "agents",
    description: "Iterative loop that repeatedly invokes agent steps until a stopping condition is met",
    tags: ["agent", "loop", "iterate", "run", "langchain"],
    inputs: [
      { id: "agent", name: "Agent", type: "agent", required: true },
      { id: "goal", name: "Goal", type: "text", required: true },
    ],
    outputs: [
      { id: "result", name: "Result", type: "text", required: true },
      { id: "iterations", name: "Iterations", type: "number", required: true },
    ],
    parameters: [
      { id: "max_iterations", name: "Max Iterations", type: "number", default: 15, min: 1, max: 200 },
      { id: "stop_on_answer", name: "Stop on Final Answer", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: [],
      body: `{{outputs.result}} = {{inputs.agent}}.run("{{inputs.goal}}")
{{outputs.iterations}} = getattr({{inputs.agent}}, "_iterations", -1)`,
      outputBindings: { result: "loop_result", iterations: "loop_iterations" },
    },
    scopeType: "loop",
    branches: [
      { id: "loop_body", label: "Loop Body", accepts: "any" },
    ],
  },

  // ── 13. Max Iterations Guard ──────────────────────────────────────────
  {
    id: "agents.max-iterations-guard",
    name: "Max Iterations Guard",
    category: "agents",
    description: "Safety guard that terminates an agent loop if it exceeds the configured iteration count",
    tags: ["guard", "safety", "iterations", "limit", "timeout"],
    inputs: [
      { id: "iteration", name: "Current Iteration", type: "number", required: true },
    ],
    outputs: [
      { id: "should_stop", name: "Should Stop", type: "boolean", required: true },
      { id: "message", name: "Message", type: "text", required: false },
    ],
    parameters: [
      { id: "max_iter", name: "Max Iterations", type: "number", default: 25, min: 1, max: 1000 },
      { id: "warning_at", name: "Warning At", type: "number", default: 20, min: 1, max: 999, advanced: true },
    ],
    codeTemplate: {
      imports: [],
      body: `{{outputs.should_stop}} = {{inputs.iteration}} >= {{params.max_iter}}
{{outputs.message}} = f"Iteration {{{inputs.iteration}}}/{{{params.max_iter}}}" + (" — STOPPING" if {{outputs.should_stop}} else "")`,
      outputBindings: { should_stop: "should_stop", message: "guard_message" },
    },
  },

  // ── 14. Multi-Agent Supervisor ────────────────────────────────────────
  {
    id: "agents.multi-agent-supervisor",
    name: "Multi-Agent Supervisor",
    category: "agents",
    description: "Supervises multiple agents, delegating sub-tasks and aggregating their results",
    tags: ["multi-agent", "supervisor", "orchestrator", "autogen", "crewai", "langchain"],
    inputs: [
      { id: "task", name: "Task", type: "text", required: true },
      { id: "agents", name: "Agents", type: "list", required: true, multiple: true, description: "List of agent instances" },
    ],
    outputs: [
      { id: "result", name: "Result", type: "text", required: true },
      { id: "agent_outputs", name: "Agent Outputs", type: "dict", required: false },
    ],
    parameters: [
      { id: "model", name: "Supervisor Model", type: "string", default: "gpt-4o" },
      { id: "strategy", name: "Strategy", type: "select", default: "round_robin", options: [{ label: "Round Robin", value: "round_robin" }, { label: "LLM Decides", value: "llm_decides" }, { label: "All Parallel", value: "parallel" }] },
    ],
    codeTemplate: {
      imports: ["from autogen import GroupChat, GroupChatManager"],
      body: `_group_chat = GroupChat(agents={{inputs.agents}}, messages=[], max_round=10)
_manager = GroupChatManager(groupchat=_group_chat, llm_config={"model": "{{params.model}}"})
{{inputs.agents}}[0].initiate_chat(_manager, message="{{inputs.task}}")
{{outputs.result}} = _group_chat.messages[-1]["content"]
{{outputs.agent_outputs}} = {msg["name"]: msg["content"] for msg in _group_chat.messages}`,
      outputBindings: { result: "supervisor_result", agent_outputs: "agent_outputs" },
    },
  },

  // ── 15. Agent Handoff ─────────────────────────────────────────────────
  {
    id: "agents.agent-handoff",
    name: "Agent Handoff",
    category: "agents",
    description: "Transfers control from one agent to another, passing along context and intermediate results",
    tags: ["handoff", "transfer", "agent", "delegation", "autogen"],
    inputs: [
      { id: "from_agent", name: "From Agent", type: "agent", required: true },
      { id: "to_agent", name: "To Agent", type: "agent", required: true },
      { id: "context", name: "Context", type: "dict", required: true, description: "State to pass to the next agent" },
    ],
    outputs: [
      { id: "result", name: "Result", type: "text", required: true },
    ],
    parameters: [
      { id: "handoff_message", name: "Handoff Message", type: "string", default: "Continuing from previous agent", description: "Message sent during handoff" },
    ],
    codeTemplate: {
      imports: ["import json"],
      body: `_context_str = json.dumps({{inputs.context}})
{{outputs.result}} = {{inputs.to_agent}}.run(f"{{params.handoff_message}}\\nContext: {_context_str}")`,
      outputBindings: { result: "handoff_result" },
    },
  },

  // ── 16. Parallel Agent Fan-Out ────────────────────────────────────────
  {
    id: "agents.parallel-fan-out",
    name: "Parallel Agent Fan-Out",
    category: "agents",
    description: "Dispatches the same or partitioned tasks to multiple agents in parallel and collects results",
    tags: ["parallel", "fan-out", "concurrent", "multi-agent", "crewai"],
    inputs: [
      { id: "tasks", name: "Tasks", type: "list", required: true, description: "List of tasks to fan out" },
      { id: "agents", name: "Agents", type: "list", required: true, multiple: true },
    ],
    outputs: [
      { id: "results", name: "Results", type: "list", required: true },
    ],
    parameters: [
      { id: "max_concurrency", name: "Max Concurrency", type: "number", default: 5, min: 1, max: 50 },
      { id: "timeout", name: "Timeout (s)", type: "number", default: 120, min: 1, max: 3600 },
    ],
    codeTemplate: {
      imports: ["import asyncio", "from concurrent.futures import ThreadPoolExecutor"],
      body: `async def _fan_out():
    with ThreadPoolExecutor(max_workers={{params.max_concurrency}}) as pool:
        loop = asyncio.get_event_loop()
        futures = [loop.run_in_executor(pool, agent.run, task) for agent, task in zip({{inputs.agents}}, {{inputs.tasks}})]
        return await asyncio.gather(*futures)
{{outputs.results}} = asyncio.run(_fan_out())`,
      outputBindings: { results: "fan_out_results" },
    },
  },

  // ── 17. Critic Agent ──────────────────────────────────────────────────
  {
    id: "agents.critic-agent",
    name: "Critic Agent",
    category: "agents",
    description: "Reviews and critiques the output of another agent, providing feedback and quality scores",
    tags: ["critic", "review", "feedback", "quality", "autogen"],
    inputs: [
      { id: "content", name: "Content", type: "text", required: true, description: "Content to critique" },
      { id: "criteria", name: "Criteria", type: "text", required: false, description: "Evaluation criteria" },
    ],
    outputs: [
      { id: "feedback", name: "Feedback", type: "text", required: true },
      { id: "score", name: "Score", type: "number", required: false },
      { id: "approved", name: "Approved", type: "boolean", required: true },
    ],
    parameters: [
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
      { id: "threshold", name: "Approval Threshold", type: "number", default: 7, min: 1, max: 10, description: "Score >= threshold means approved" },
    ],
    codeTemplate: {
      imports: ["from langchain_openai import ChatOpenAI", "import json"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature=0)
_prompt = f"Critique this content on a scale of 1-10.\\nCriteria: {{inputs.criteria}}\\nContent: {{inputs.content}}\\nRespond as JSON: {{\\\"score\\\": N, \\\"feedback\\\": \\\"...\\\"}}"
_resp = _llm.invoke(_prompt)
_parsed = json.loads(_resp.content)
{{outputs.feedback}} = _parsed["feedback"]
{{outputs.score}} = _parsed["score"]
{{outputs.approved}} = _parsed["score"] >= {{params.threshold}}`,
      outputBindings: { feedback: "critic_feedback", score: "critic_score", approved: "critic_approved" },
    },
  },

  // ── 18. Reflection Step ───────────────────────────────────────────────
  {
    id: "agents.reflection-step",
    name: "Reflection Step",
    category: "agents",
    description: "Agent reflects on its previous actions and outcomes to improve future decisions",
    tags: ["reflection", "self-reflect", "meta-cognition", "langchain"],
    inputs: [
      { id: "actions", name: "Previous Actions", type: "list", required: true },
      { id: "outcomes", name: "Outcomes", type: "list", required: true },
    ],
    outputs: [
      { id: "insights", name: "Insights", type: "text", required: true },
      { id: "revised_plan", name: "Revised Plan", type: "list", required: false },
    ],
    parameters: [
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
    ],
    codeTemplate: {
      imports: ["from langchain_openai import ChatOpenAI"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature=0.3)
_prompt = f"Reflect on these actions and outcomes. What worked, what didn't, and what should change?\\nActions: {{{inputs.actions}}}\\nOutcomes: {{{inputs.outcomes}}}"
_resp = _llm.invoke(_prompt)
{{outputs.insights}} = _resp.content`,
      outputBindings: { insights: "reflection_insights", revised_plan: "revised_plan" },
    },
  },

  // ── 19. Self-Correction Loop ──────────────────────────────────────────
  {
    id: "agents.self-correction-loop",
    name: "Self-Correction Loop",
    category: "agents",
    description: "Iteratively refines agent output by checking against validation criteria and self-correcting",
    tags: ["self-correct", "refine", "iterate", "loop", "langchain"],
    inputs: [
      { id: "draft", name: "Draft Output", type: "text", required: true },
      { id: "validation_fn", name: "Validation Function", type: "any", required: false },
    ],
    outputs: [
      { id: "final_output", name: "Final Output", type: "text", required: true },
      { id: "corrections", name: "Corrections Made", type: "number", required: true },
    ],
    parameters: [
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
      { id: "max_retries", name: "Max Retries", type: "number", default: 3, min: 1, max: 10 },
      { id: "criteria", name: "Validation Criteria", type: "string", default: "Output must be factual and well-structured" },
    ],
    codeTemplate: {
      imports: ["from langchain_openai import ChatOpenAI"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature=0)
_output = {{inputs.draft}}
_corrections = 0
for _i in range({{params.max_retries}}):
    _check = _llm.invoke(f"Does this meet the criteria '{{params.criteria}}'? Output: {_output}\\nRespond YES or NO with fixes.")
    if "YES" in _check.content.upper():
        break
    _output = _llm.invoke(f"Fix this based on feedback: {_check.content}\\nOriginal: {_output}").content
    _corrections += 1
{{outputs.final_output}} = _output
{{outputs.corrections}} = _corrections`,
      outputBindings: { final_output: "corrected_output", corrections: "num_corrections" },
    },
    scopeType: "loop",
    branches: [
      { id: "correction_body", label: "Correction Body", accepts: "any" },
    ],
  },

  // ── 20. Prompt Chain ──────────────────────────────────────────────────
  {
    id: "agents.prompt-chain",
    name: "Prompt Chain",
    category: "agents",
    description: "Chains multiple prompts sequentially where each output feeds into the next prompt",
    tags: ["chain", "sequential", "prompt", "langchain", "pipeline"],
    inputs: [
      { id: "input_text", name: "Input", type: "text", required: true },
    ],
    outputs: [
      { id: "result", name: "Result", type: "text", required: true },
      { id: "intermediate", name: "Intermediate Results", type: "list", required: false },
    ],
    parameters: [
      { id: "prompts", name: "Prompt Templates", type: "json", default: ["Summarize: {input}", "Translate to French: {input}"], description: "Ordered list of prompt templates" },
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
    ],
    codeTemplate: {
      imports: ["from langchain_openai import ChatOpenAI", "from langchain.prompts import PromptTemplate", "from langchain.chains import LLMChain, SimpleSequentialChain"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature=0)
_chains = [LLMChain(llm=_llm, prompt=PromptTemplate.from_template(p)) for p in {{params.prompts}}]
_seq = SimpleSequentialChain(chains=_chains, verbose=True)
{{outputs.result}} = _seq.run("{{inputs.input_text}}")`,
      outputBindings: { result: "chain_result", intermediate: "intermediate_results" },
    },
  },

  // ── 21. Sequential Chain ──────────────────────────────────────────────
  {
    id: "agents.sequential-chain",
    name: "Sequential Chain",
    category: "agents",
    description: "Named-variable sequential chain where each step produces named outputs consumed by later steps",
    tags: ["chain", "sequential", "named", "langchain", "pipeline"],
    inputs: [
      { id: "inputs", name: "Inputs", type: "dict", required: true },
    ],
    outputs: [
      { id: "result", name: "Result", type: "dict", required: true },
    ],
    parameters: [
      { id: "chain_config", name: "Chain Config", type: "json", default: [], description: "Array of {prompt, input_vars, output_key}" },
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
    ],
    codeTemplate: {
      imports: ["from langchain_openai import ChatOpenAI", "from langchain.prompts import PromptTemplate", "from langchain.chains import LLMChain, SequentialChain"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature=0)
_chains = []
for _cfg in {{params.chain_config}}:
    _chains.append(LLMChain(llm=_llm, prompt=PromptTemplate.from_template(_cfg["prompt"]), output_key=_cfg["output_key"]))
_input_vars = list({{inputs.inputs}}.keys())
_output_vars = [c["output_key"] for c in {{params.chain_config}}]
_seq = SequentialChain(chains=_chains, input_variables=_input_vars, output_variables=_output_vars, verbose=True)
{{outputs.result}} = _seq({{inputs.inputs}})`,
      outputBindings: { result: "sequential_result" },
    },
  },

  // ── 22. Router Chain ──────────────────────────────────────────────────
  {
    id: "agents.router-chain",
    name: "Router Chain",
    category: "agents",
    description: "Dynamically routes input to one of several sub-chains based on the content of the query",
    tags: ["chain", "router", "dispatch", "langchain", "conditional"],
    inputs: [
      { id: "query", name: "Query", type: "text", required: true },
      { id: "chains", name: "Sub-Chains", type: "list", required: true, multiple: true },
    ],
    outputs: [
      { id: "result", name: "Result", type: "text", required: true },
      { id: "route", name: "Selected Route", type: "text", required: false },
    ],
    parameters: [
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
      { id: "route_descriptions", name: "Route Descriptions", type: "json", default: {}, description: "Map of route name to description" },
    ],
    codeTemplate: {
      imports: ["from langchain_openai import ChatOpenAI", "from langchain.chains.router import MultiRouteChain, RouterChain"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature=0)
_descriptions = {{params.route_descriptions}}
_prompt = f"Given the query, choose the best route from: {list(_descriptions.keys())}. Query: {{inputs.query}}"
_route_resp = _llm.invoke(_prompt)
{{outputs.route}} = _route_resp.content.strip()
{{outputs.result}} = {{inputs.chains}}[0].run("{{inputs.query}}")`,
      outputBindings: { result: "router_result", route: "selected_route" },
    },
  },

  // ── 23. Map-Reduce Chain ──────────────────────────────────────────────
  {
    id: "agents.map-reduce-chain",
    name: "Map-Reduce Chain",
    category: "agents",
    description: "Applies a map step to each document/chunk, then reduces all mapped outputs into a single result",
    tags: ["chain", "map-reduce", "summarize", "langchain", "aggregate"],
    inputs: [
      { id: "documents", name: "Documents", type: "list", required: true },
    ],
    outputs: [
      { id: "result", name: "Result", type: "text", required: true },
      { id: "mapped", name: "Mapped Outputs", type: "list", required: false },
    ],
    parameters: [
      { id: "map_prompt", name: "Map Prompt", type: "string", default: "Summarize this: {text}" },
      { id: "reduce_prompt", name: "Reduce Prompt", type: "string", default: "Combine these summaries into a final summary: {text}" },
      { id: "model", name: "Model", type: "string", default: "gpt-4o" },
    ],
    codeTemplate: {
      imports: ["from langchain_openai import ChatOpenAI", "from langchain.chains.summarize import load_summarize_chain"],
      body: `_llm = ChatOpenAI(model="{{params.model}}", temperature=0)
_chain = load_summarize_chain(_llm, chain_type="map_reduce", verbose=True)
{{outputs.result}} = _chain.run({{inputs.documents}})`,
      outputBindings: { result: "map_reduce_result", mapped: "mapped_outputs" },
    },
  },

  // ── 24. Debate (Multi-Agent) ──────────────────────────────────────────
  {
    id: "agents.debate-multi-agent",
    name: "Debate (Multi-Agent)",
    category: "agents",
    description: "Multiple agents argue for and against a topic across rounds, producing a synthesized conclusion",
    tags: ["debate", "multi-agent", "adversarial", "autogen", "crewai", "discussion"],
    inputs: [
      { id: "topic", name: "Topic", type: "text", required: true },
      { id: "agents", name: "Debaters", type: "list", required: true, multiple: true, description: "List of agent instances to participate" },
    ],
    outputs: [
      { id: "conclusion", name: "Conclusion", type: "text", required: true },
      { id: "transcript", name: "Transcript", type: "list", required: true },
    ],
    parameters: [
      { id: "rounds", name: "Debate Rounds", type: "number", default: 3, min: 1, max: 20 },
      { id: "judge_model", name: "Judge Model", type: "string", default: "gpt-4o" },
      { id: "framework", name: "Framework", type: "select", default: "autogen", options: [{ label: "AutoGen", value: "autogen" }, { label: "CrewAI", value: "crewai" }] },
    ],
    codeTemplate: {
      imports: ["from autogen import GroupChat, GroupChatManager, AssistantAgent"],
      body: `_group_chat = GroupChat(agents={{inputs.agents}}, messages=[], max_round={{params.rounds}} * len({{inputs.agents}}))
_manager = GroupChatManager(groupchat=_group_chat, llm_config={"model": "{{params.judge_model}}"})
{{inputs.agents}}[0].initiate_chat(_manager, message="Debate topic: {{inputs.topic}}")
{{outputs.transcript}} = _group_chat.messages
_judge = AssistantAgent("judge", llm_config={"model": "{{params.judge_model}}"})
_summary = _judge.generate_reply(messages=[{"role": "user", "content": f"Summarize and give a conclusion for this debate: {{{outputs.transcript}}}"}])
{{outputs.conclusion}} = _summary`,
      outputBindings: { conclusion: "debate_conclusion", transcript: "debate_transcript" },
    },
  },
];
