#!/bin/bash
echo "==================================="
echo " Pharma CRM AI Assistant - Backend"
echo "==================================="
echo ""

cd "$(dirname "$0")/backend"

if [ ! -f ".env" ] || grep -q "your_groq_api_key_here" .env; then
  echo "⚠️  GROQ_API_KEY not set!"
  echo "   Get your free key at: https://console.groq.com"
  echo "   Then update backend/.env with: GROQ_API_KEY=gsk_..."
  echo ""
fi

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt -q

echo ""
echo "🚀 Starting FastAPI backend on http://localhost:8000"
echo "   API docs: http://localhost:8000/docs"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
