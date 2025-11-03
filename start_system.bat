@echo off
REM Tamil Nadu Rockfall Risk Prediction System
REM Windows Batch Script for Quick System Startup

echo ===============================================================
echo   TAMIL NADU ROCKFALL RISK PREDICTION SYSTEM
echo ===============================================================
echo AI-powered rockfall risk assessment for open-pit mines
echo Instagram-inspired dashboard with real-time predictions
echo ===============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
)

echo Python and Node.js detected!
echo.

REM Run the Python startup script
echo Starting system...
python run_system.py

pause