#!/bin/bash

# Function to handle cleanup
cleanup() {
    echo "Stopping services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

# Start Backend
echo "Starting Backend..."
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Warning: No venv found in root. Assuming python is available or running in system env."
fi

cd backend
# Run uvicorn in background
python3 -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
echo "Backend running (PID: $BACKEND_PID)"

# Return to root
cd ..

# Start Frontend
echo "Starting Frontend..."
cd frontend
# Run next dev in background (or foreground if we want to see logs, but keeping both interactive is hard in simple script)
# We run it in background so the script waits.
npm run dev &
FRONTEND_PID=$!
echo "Frontend running (PID: $FRONTEND_PID)"

# Wait for all background jobs
wait
