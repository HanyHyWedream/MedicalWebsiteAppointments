@echo off
title MediCare App
echo Starting MediCare, please wait...

cd /d "%~dp0Backend\dist"
start "" "MediCare.exe"

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

start "" "http://127.0.0.1:8000"

echo MediCare is running!
timeout /t 3 /nobreak >nul
exit