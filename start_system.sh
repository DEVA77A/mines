#!/bin/bash
# Tamil Nadu Rockfall Risk Prediction System
# Unix/Linux/macOS Shell Script for Quick System Startup

echo "==============================================================="
echo "   TAMIL NADU ROCKFALL RISK PREDICTION SYSTEM"
echo "==============================================================="
echo "AI-powered rockfall risk assessment for open-pit mines"
echo "Instagram-inspired dashboard with real-time predictions"
echo "==============================================================="
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ from https://python.org"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js 16+ from https://nodejs.org"
    exit 1
fi

echo "✅ Python and Node.js detected!"
echo

# Make script executable if needed
chmod +x run_system.py

# Run the Python startup script
echo "🚀 Starting system..."
python3 run_system.py