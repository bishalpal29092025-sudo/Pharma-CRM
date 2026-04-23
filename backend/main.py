import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv

load_dotenv()

from agent.graph import get_graph
from agent.state import FormData

app = FastAPI(title="Pharma CRM AI Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []
    current_form: Dict[str, Any] = {}


class ChatResponse(BaseModel):
    reply: str
    tool_used: Optional[str] = None
    form_update: Optional[Dict[str, Any]] = None
    action: Optional[str] = None
    validation_result: Optional[Dict[str, Any]] = None
    summary: Optional[str] = None


def validate_form(form_data: Dict[str, Any]) -> Dict[str, Any]:
    required_fields = ["hcp_name", "date", "sentiment"]
    optional_fields = ["specialty", "location", "notes", "products_discussed"]
    missing = []
    warnings = []

    for field in required_fields:
        val = form_data.get(field, "")
        if not val or (isinstance(val, str) and not val.strip()):
            missing.append(field)

    if not form_data.get("brochure_shared") and not form_data.get("samples_provided"):
        warnings.append("No materials shared or samples provided")

    if form_data.get("follow_up_required") and not form_data.get("notes"):
        warnings.append("Follow-up required but no notes provided")

    for field in optional_fields:
        val = form_data.get(field)
        if not val or (isinstance(val, list) and len(val) == 0) or (isinstance(val, str) and not val.strip()):
            warnings.append(f"{field.replace('_', ' ').title()} not specified")

    is_complete = len(missing) == 0
    return {
        "is_complete": is_complete,
        "missing_required": missing,
        "warnings": warnings,
        "status": "complete" if is_complete else "incomplete"
    }


def generate_summary(form_data: Dict[str, Any]) -> str:
    if not form_data.get("hcp_name"):
        return "No interaction data available to summarize. Please log an interaction first."

    parts = []
    hcp = form_data.get("hcp_name", "Unknown HCP")
    date = form_data.get("date", "unknown date")
    parts.append(f"Met with {hcp} on {date}.")

    if form_data.get("specialty"):
        parts.append(f"Specialty: {form_data['specialty']}.")

    if form_data.get("location"):
        parts.append(f"Location: {form_data['location']}.")

    sentiment = form_data.get("sentiment", "")
    if sentiment:
        parts.append(f"The interaction had a {sentiment} sentiment.")

    products = form_data.get("products_discussed", [])
    if products:
        parts.append(f"Products discussed: {', '.join(products)}.")

    materials = []
    if form_data.get("brochure_shared"):
        materials.append("brochures")
    if form_data.get("samples_provided"):
        materials.append("samples")
    if materials:
        parts.append(f"Shared {' and '.join(materials)} during the visit.")

    if form_data.get("follow_up_required"):
        parts.append("A follow-up visit has been scheduled.")

    if form_data.get("notes"):
        parts.append(f"Notes: {form_data['notes']}")

    return " ".join(parts)


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    graph = get_graph()

    lc_history = []
    for msg in request.history[-10:]:
        if msg.role == "user":
            lc_history.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            lc_history.append(AIMessage(content=msg.content))

    lc_history.append(HumanMessage(content=request.message))

    initial_state = {
        "messages": lc_history,
        "form_data": request.current_form or {},
        "tool_used": "",
        "tool_output": ""
    }

    result = graph.invoke(initial_state)

    last_ai_message = None
    for msg in reversed(result["messages"]):
        if isinstance(msg, AIMessage):
            last_ai_message = msg
            break

    reply_text = last_ai_message.content if last_ai_message else "I processed your request."

    tool_used = result.get("tool_used", "")
    tool_output_raw = result.get("tool_output", "")

    form_update = None
    action = None
    validation_result = None
    summary_text = None

    if tool_output_raw:
        try:
            tool_data = json.loads(tool_output_raw)
            action = tool_data.get("action", "")

            if action == "log_interaction":
                form_update = tool_data.get("form_data", {})

            elif action == "edit_interaction":
                updates = tool_data.get("updates", {})
                form_update = updates

            elif action == "clear_interaction":
                form_update = tool_data.get("form_data", {})

            elif action == "validate_interaction":
                validation_result = validate_form(request.current_form)

            elif action == "summarize_interaction":
                summary_text = generate_summary(request.current_form)

        except (json.JSONDecodeError, KeyError):
            pass

    return ChatResponse(
        reply=reply_text,
        tool_used=tool_used,
        form_update=form_update,
        action=action,
        validation_result=validation_result,
        summary=summary_text
    )


@app.get("/health")
def health():
    return {"status": "ok"}