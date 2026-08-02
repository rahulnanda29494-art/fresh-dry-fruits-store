@echo off
REM Double-click to launch the Fresh Dry Fruits local stack (DB + API + web).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-local.ps1"
echo.
echo Two new windows opened (API + web). This window can be closed.
pause
