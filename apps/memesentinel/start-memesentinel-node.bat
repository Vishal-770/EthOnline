@echo off
echo =========================================
echo      MemeSentinel Multi-Agent System
echo =========================================
echo.
echo Starting all agents in a single process...
echo.

cd /d "%~dp0"
npm run memesentinel

echo.
echo MemeSentinel system stopped.
pause