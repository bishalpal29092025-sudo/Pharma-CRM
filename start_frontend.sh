#!/bin/bash
echo "===================================="
echo " Pharma CRM AI Assistant - Frontend"
echo "===================================="
echo ""
echo "🌐 Opening frontend..."
echo "   If it doesn't open automatically, open: frontend/index.html"
echo ""

cd "$(dirname "$0")/frontend"

# Try different methods to open the browser
if command -v python3 &>/dev/null; then
  echo "🚀 Serving on http://localhost:3000"
  python3 -m http.server 3000
elif command -v npx &>/dev/null; then
  npx serve . -p 3000
else
  echo "Just open frontend/index.html directly in your browser"
fi
