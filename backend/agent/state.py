from typing import TypedDict, Annotated, List
from langchain_core.messages import BaseMessage
import operator


class FormData(TypedDict, total=False):
    hcp_name: str
    date: str
    specialty: str
    location: str
    sentiment: str
    brochure_shared: bool
    samples_provided: bool
    follow_up_required: bool
    products_discussed: List[str]
    notes: str
    status: str


class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    form_data: FormData
    tool_used: str
    tool_output: str
