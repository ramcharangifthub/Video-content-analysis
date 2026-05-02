#!/bin/bash
echo ""
echo "============================================"
echo "  🎬  VidAnalyzer v4 — Starting Services"
echo "============================================"
echo ""

# Check ffmpeg
if ! command -v ffmpeg &> /dev/null; then
  echo "⚠️  ffmpeg not found."
  echo "   Install: sudo apt-get install ffmpeg  (Linux)"
  echo "            brew install ffmpeg          (Mac)"
  echo ""
fi

# Start backend
echo "📦 Starting FastAPI backend on port 8000..."
cd "$(dirname "$0")/backend" && uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
sleep 2
echo "✅ Backend running (PID: $BACKEND_PID)"

# Start frontend
echo "🌐 Starting React frontend on port 3000..."
cd "$(dirname "$0")/frontend" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "  ✅  VidAnalyzer is ready!"
echo ""
echo "  Frontend : http://localhost:3000"
echo "  Backend  : http://localhost:8000"
echo "  API Docs : http://localhost:8000/docs"
echo ""
echo "  Login    : demo@vidanalyzer.ai / demo123"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop all servers"
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Stopped.'" EXIT
wait
