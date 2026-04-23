import json
import os
from typing import Literal
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, ToolMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from .state import AgentState
from .tools import ALL_TOOLS

SYSTEM_PROMPT = """You are a pharmaceutical CRM AI assistant helping medical sales representatives log and manage HCP (Healthcare Professional) interactions.

You have access to these tools:
1. log_interaction - Extract data from natural language and log a new interaction
2. edit_interaction - Update only specific fields of an existing interaction
3. validate_interaction - Check the form for missing or incomplete fields
4. summarize_interaction - Generate a professional summary of the current interaction
5. clear_interaction - Reset/clear the entire form

IMPORTANT RULES:
- Always use a tool for any action that affects the form
- For log_interaction: extract ALL relevant fields from the user's message including date, specialty, location, products, sentiment etc.
- For edit_interaction: ONLY include fields explicitly mentioned as needing change
- For "today", "yesterday" dates - pass those exact strings, they will be resolved
- If the user's intent is ambiguous, make reasonable inferences
- Always respond with a friendly, professional message after tool use
- Sentiment must be one of: positive, neutral, negative
- If specialty is not mentioned, leave it as empty string
- For validate_interaction and summarize_interaction, just call the tool - the frontend handles the logic
"""


def get_llm():
    api_key = os.environ.get("GROQ_API_KEY", "")
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=api_key,
        temperature=0
    )
    return llm.bind_tools(ALL_TOOLS)


def agent_node(state: AgentState) -> AgentState:
    llm = get_llm()
    messages = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]
    response = llm.invoke(messages)
    return {"messages": [response]}


def tool_node(state: AgentState) -> AgentState:
    last_message = state["messages"][-1]
    tool_messages = []
    tool_used = ""
    tool_output = ""

    tools_map = {t.name: t for t in ALL_TOOLS}

    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_used = tool_name

        result = tools_map[tool_name].invoke(tool_args)
        tool_output = result

        tool_messages.append(
            ToolMessage(
                content=result,
                tool_call_id=tool_call["id"]
            )
        )

    return {
        "messages": tool_messages,
        "tool_used": tool_used,
        "tool_output": tool_output
    }


def should_continue(state: AgentState) -> Literal["tools", "end"]:
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return "end"


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)

    graph.set_entry_point("agent")

    graph.add_conditional_edges(
        "agent",
        should_continue,
        {"tools": "tools", "end": END}
    )
    graph.add_edge("tools", "agent")

    return graph.compile()


GRAPH = None


def get_graph():
    global GRAPH
    if GRAPH is None:
        GRAPH = build_graph()
    return GRAPH