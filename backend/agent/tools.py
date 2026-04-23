import json
from datetime import date, timedelta
from typing import Optional
from langchain_core.tools import tool


def resolve_date(date_str: str) -> str:
    today = date.today()
    date_lower = date_str.lower().strip()
    if date_lower in ("today", ""):
        return today.isoformat()
    if date_lower == "yesterday":
        return (today - timedelta(days=1)).isoformat()
    if date_lower == "tomorrow":
        return (today + timedelta(days=1)).isoformat()
    return date_str


@tool
def log_interaction(
    hcp_name: str,
    interaction_date: str,
    specialty: str,
    location: str,
    sentiment: str,
    brochure_shared: bool,
    samples_provided: bool,
    follow_up_required: bool,
    products_discussed: str,
    notes: str
) -> str:
    """
    Log a new HCP (Healthcare Professional) interaction by extracting structured data
    from a natural language description. Use this when the user describes meeting or
    interacting with a doctor/HCP for the first time in conversation.

    Args:
        hcp_name: Full name of the HCP with title (e.g. 'Dr. Smith')
        interaction_date: Date of interaction - use 'today', 'yesterday', or ISO date
        specialty: Medical specialty of the HCP (e.g. Cardiologist, Oncologist)
        location: Location/clinic/hospital where the meeting took place
        sentiment: Overall sentiment of the interaction: 'positive', 'neutral', or 'negative'
        brochure_shared: Whether brochures/literature were shared
        samples_provided: Whether product samples were provided
        follow_up_required: Whether a follow-up visit is needed
        products_discussed: Comma-separated list of products discussed
        notes: Key discussion points and observations
    """
    resolved_date = resolve_date(interaction_date)
    products = [p.strip() for p in products_discussed.split(",") if p.strip()]

    form_data = {
        "hcp_name": hcp_name,
        "date": resolved_date,
        "specialty": specialty,
        "location": location,
        "sentiment": sentiment,
        "brochure_shared": brochure_shared,
        "samples_provided": samples_provided,
        "follow_up_required": follow_up_required,
        "products_discussed": products,
        "notes": notes,
        "status": "logged"
    }

    return json.dumps({
        "action": "log_interaction",
        "form_data": form_data,
        "message": f"Interaction with {hcp_name} successfully logged for {resolved_date}."
    })


@tool
def edit_interaction(
    hcp_name: Optional[str] = None,
    interaction_date: Optional[str] = None,
    specialty: Optional[str] = None,
    location: Optional[str] = None,
    sentiment: Optional[str] = None,
    brochure_shared: Optional[bool] = None,
    samples_provided: Optional[bool] = None,
    follow_up_required: Optional[bool] = None,
    products_discussed: Optional[str] = None,
    notes: Optional[str] = None
) -> str:
    """
    Edit/update specific fields of an existing HCP interaction. Use this when the user
    wants to correct or update only certain fields without changing the rest.
    Only pass the fields that need to be changed; omit unchanged fields.

    Args:
        hcp_name: Updated HCP name (only if changing)
        interaction_date: Updated date (only if changing)
        specialty: Updated specialty (only if changing)
        location: Updated location (only if changing)
        sentiment: Updated sentiment: 'positive', 'neutral', or 'negative' (only if changing)
        brochure_shared: Updated brochure status (only if changing)
        samples_provided: Updated samples status (only if changing)
        follow_up_required: Updated follow-up status (only if changing)
        products_discussed: Updated comma-separated products (only if changing)
        notes: Updated notes (only if changing)
    """
    updates = {}
    if hcp_name is not None:
        updates["hcp_name"] = hcp_name
    if interaction_date is not None:
        updates["date"] = resolve_date(interaction_date)
    if specialty is not None:
        updates["specialty"] = specialty
    if location is not None:
        updates["location"] = location
    if sentiment is not None:
        updates["sentiment"] = sentiment
    if brochure_shared is not None:
        updates["brochure_shared"] = brochure_shared
    if samples_provided is not None:
        updates["samples_provided"] = samples_provided
    if follow_up_required is not None:
        updates["follow_up_required"] = follow_up_required
    if products_discussed is not None:
        updates["products_discussed"] = [p.strip() for p in products_discussed.split(",") if p.strip()]
    if notes is not None:
        updates["notes"] = notes

    changed_fields = list(updates.keys())
    return json.dumps({
        "action": "edit_interaction",
        "updates": updates,
        "message": f"Updated fields: {', '.join(changed_fields)}."
    })


@tool
def validate_interaction() -> str:
    """
    Validate the current interaction form to check for missing or incomplete fields.
    Use this when the user asks to validate, check, or review the form for completeness.
    Returns a list of missing fields and a readiness status.
    """
    return json.dumps({
        "action": "validate_interaction",
        "message": "Validation requested. Checking all required fields."
    })


@tool
def summarize_interaction() -> str:
    """
    Generate a professional, human-readable summary of the current interaction form data.
    Use this when the user asks to summarize, recap, describe, or get an overview of
    the logged interaction.
    """
    return json.dumps({
        "action": "summarize_interaction",
        "message": "Summary requested. Generating from current form data."
    })


@tool
def clear_interaction() -> str:
    """
    Clear/reset the entire interaction form back to its empty default state.
    Use this when the user asks to clear, reset, start over, or delete the form data.
    """
    return json.dumps({
        "action": "clear_interaction",
        "form_data": {
            "hcp_name": "",
            "date": "",
            "specialty": "",
            "location": "",
            "sentiment": "",
            "brochure_shared": False,
            "samples_provided": False,
            "follow_up_required": False,
            "products_discussed": [],
            "notes": "",
            "status": ""
        },
        "message": "Form has been cleared and reset to default state."
    })


ALL_TOOLS = [
    log_interaction,
    edit_interaction,
    validate_interaction,
    summarize_interaction,
    clear_interaction
]
