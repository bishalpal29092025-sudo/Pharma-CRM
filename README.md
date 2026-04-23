# 🏥 Pharma CRM — AI-Powered Interaction Logger

A split-screen pharmaceutical CRM tool where an AI assistant (powered by **LangGraph + Groq**) controls a structured interaction form through natural language — no manual form entry.

---

## 🏗️ Architecture

```
User (Chat Input)
     ↓
React Frontend (split-screen UI)
     ↓ POST /api/chat
FastAPI Backend
     ↓
LangGraph Agent (StateGraph)
     ↓
LLM (Groq - gemma2-9b-it) decides which tool to call
     ↓
5 Tools (log, edit, validate, summarize, clear)
     ↓
Tool output → form_update returned to frontend
     ↓
Frontend re-renders form (never updated manually)
```

---

## 🛠️ 5 LangGraph Tools

| # | Tool | Purpose |
|---|------|---------|
| 1 | `log_interaction` | Extracts all structured fields from natural language |
| 2 | `edit_interaction` | Updates only specific changed fields |
| 3 | `validate_interaction` | Checks for missing/incomplete fields |
| 4 | `summarize_interaction` | Generates a professional interaction summary |
| 5 | `clear_interaction` | Resets entire form to empty state |

---

## 🚀 Setup

### Step 1: Get Groq API Key (Free)
- Go to [console.groq.com](https://console.groq.com)
- Create a free account → API Keys → Create new key
- Copy your key (starts with `gsk_...`)

### Step 2: Configure API Key
```bash
# Edit backend/.env
GROQ_API_KEY=gsk_your_actual_key_here
```

### Step 3: Start Backend
```bash
chmod +x start_backend.sh
./start_backend.sh
```
Backend runs at: `http://localhost:8000`

### Step 4: Open Frontend
```bash
chmod +x start_frontend.sh
./start_frontend.sh
```
Or simply open `frontend/index.html` in your browser.

---

## 💬 Example Interactions

### Log Interaction
```
Today I met Dr. Sarah Mehta, a cardiologist at City General Hospital. 
We discussed CardioMax and PharmaX efficiency. The sentiment was very 
positive. I shared brochures and provided samples. Follow-up needed.
```

### Edit Interaction
```
Actually, the sentiment was neutral and her name is Dr. Sarah Khan.
```

### Validate
```
Can you validate the form for completeness?
```

### Summarize
```
Give me a summary of this interaction.
```

### Clear
```
Clear everything and start over.
```

---

## 📁 Project Structure

```
pharma-crm/
├── backend/
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── state.py       # AgentState TypedDict
│   │   ├── tools.py       # All 5 LangGraph tools
│   │   └── graph.py       # StateGraph definition
│   ├── main.py            # FastAPI app + endpoints
│   ├── requirements.txt
│   └── .env               # GROQ_API_KEY goes here
├── frontend/
│   └── index.html         # Complete single-file React-free UI
├── start_backend.sh
├── start_frontend.sh
└── README.md
```

---

## ⚙️ Tech Stack

- **Frontend**: Vanilla JS + HTML/CSS (no build required)
- **Backend**: Python + FastAPI
- **AI Framework**: LangGraph (StateGraph)
- **LLM Provider**: Groq (gemma2-9b-it)
- **LLM Orchestration**: LangChain

---

## 🎯 Key Design Decisions

1. **Form NEVER updated manually** — all updates come exclusively from LangGraph tool outputs
2. **LLM decides tool selection** — no hardcoded if/else routing
3. **Partial updates** — `edit_interaction` only modifies explicitly changed fields
4. **Visual feedback** — changed fields highlight in cyan when updated
5. **Date resolution** — "today", "yesterday" automatically resolved to ISO dates
