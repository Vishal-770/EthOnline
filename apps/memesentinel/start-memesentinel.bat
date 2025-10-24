@echo off
title MemeSentinel Multi-Agent System Launcher
color 0A

echo.
echo 🚀 MemeSentinel Multi-Agent System Launcher
echo ============================================
echo.

:: Change to the correct directory
cd /d "C:\Users\hemav\OneDrive\Desktop\eo\EthOnline\apps\memesentinel"

:: Check if we're in the right place
if not exist "package.json" (
    echo ❌ Error: package.json not found!
    echo 📍 Current directory: %CD%
    echo 🔍 Please ensure you're in the memesentinel project directory
    pause
    exit /b 1
)

echo 📂 Working directory: %CD%
echo.

:: Start each agent in a new command window
echo 🎯 Launching agents...
echo.

echo 🔄 Starting Scout Agent (port 4001)...
start "Scout Agent - Port 4001" cmd /k "npm run scout"
timeout /t 3 /nobreak >nul

echo 🔄 Starting Yield Agent (port 4002)...
start "Yield Agent - Port 4002" cmd /k "npm run yield"
timeout /t 2 /nobreak >nul

echo 🔄 Starting Risk Agent (port 4003)...
start "Risk Agent - Port 4003" cmd /k "npm run risk"
timeout /t 2 /nobreak >nul

echo 🔄 Starting Alert Agent (port 4004)...
start "Alert Agent - Port 4004" cmd /k "npm run alert"
timeout /t 2 /nobreak >nul

echo 🔄 Starting Settlement Agent (port 4005)...
start "Settlement Agent - Port 4005" cmd /k "npm run settlement"
timeout /t 2 /nobreak >nul

echo 🔄 Starting Assistant Agent (port 4006)...
start "Assistant Agent - Port 4006 + Dashboard 4106" cmd /k "npm run assistant"
timeout /t 2 /nobreak >nul

echo.
echo ✅ All agents launched in separate windows!
echo.
echo 📊 Access Points:
echo   • Dashboard: http://localhost:4106/dashboard
echo   • Agent Cards: http://localhost:400X/.well-known/agent-card.json
echo.
echo 🔍 Waiting 10 seconds for agents to initialize...
timeout /t 10 /nobreak >nul

echo.
echo 🎯 System Status:
echo   • Scout scans for tokens every 5 minutes
echo   • Agents communicate via A2A protocol  
echo   • Check individual windows for detailed logs
echo.
echo 🛠️  Management:
echo   • To stop all: Close all agent windows or use Task Manager
echo   • To check ports: netstat -ano ^| findstr ":400"
echo.
echo ✨ MemeSentinel is now running!
echo.
pause