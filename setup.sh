#!/usr/bin/env bash
# Simple setup script for the Audio Visualizer project
# Starts a local HTTP server so the app can be accessed in a browser

PORT=${PORT:-8000}

# Check if python3 is installed
if command -v python3 >/dev/null 2>&1; then
    echo "Starting local server at http://localhost:$PORT"
    echo "Press Ctrl+C to stop the server"
    python3 -m http.server "$PORT" --bind 0.0.0.0
else
    echo "Python3 is required to run the local server." >&2
    exit 1
fi
