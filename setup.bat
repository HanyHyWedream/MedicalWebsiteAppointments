@echo off
title MediCare Database Setup
echo ================================================
echo          MediCare - First Time Setup
echo ================================================
echo.
echo This will import the MediCare database.
echo Please enter your MySQL root password when asked.
echo.

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -u root -p -e "CREATE DATABASE IF NOT EXISTS medicalwebsite;"
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -u root -p medicalwebsite < "%~dp0medicalwebsite.sql"

echo.
echo ================================================
echo   Database imported successfully!
echo   You can now run "Start MediCare.bat"
echo ================================================
pause