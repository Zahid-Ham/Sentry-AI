@echo off
REM Quick start script for SentryAI Local Backend

echo.
echo ========================================
echo SentryAI - LOCAL BACKEND STARTUP
echo ========================================
echo.

REM Navigate to backend folder
cd /d "%~dp0backend"

REM Check if venv exists
if not exist "env" (
    echo Creating virtual environment...
    python -m venv env
)

REM Activate venv
echo Activating virtual environment...
call env\Scripts\activate.bat

REM Install requirements
echo Installing dependencies...
pip install -r requirements.txt -q

REM Start server
echo.
echo ========================================
echo Starting SentryAI Backend Server...
echo ========================================
echo.
echo Access at: http://localhost:8000
echo WebSocket at: ws://localhost:8000/ws/user-session-1
echo.
echo Keep this window OPEN while using the extension!
echo.

python main.py

pause
