@echo off
title Chatbot-server (laat dit venster open)
cd /d "%~dp0"
echo ================================================================
echo   Chatbot-server wordt gestart.
echo   LAAT DIT VENSTER OPEN staan zolang je de chatbot/dashboard test.
echo   Sluit je het venster, dan stopt de chatbot.
echo.
echo   Test-site:  http://localhost:3100
echo   Dashboard:  http://localhost:3100/dashboard?token=DE-TOKEN-UIT-.ENV
echo ================================================================
echo.
node server.js
echo.
echo De server is gestopt. Druk op een toets om dit venster te sluiten.
pause >nul
