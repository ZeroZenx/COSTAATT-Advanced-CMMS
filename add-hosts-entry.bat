@echo off
echo ========================================
echo Adding CMMS to HOSTS File
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

REM Backup hosts file
copy C:\Windows\System32\drivers\etc\hosts C:\Windows\System32\drivers\etc\hosts.backup

REM Check if entry already exists
findstr /C:"cmms.costaatt.edu.tt" C:\Windows\System32\drivers\etc\hosts >nul
if %errorlevel% equ 0 (
    echo Entry already exists in HOSTS file
) else (
    REM Add CMMS entry
    echo. >> C:\Windows\System32\drivers\etc\hosts
    echo # CMMS System >> C:\Windows\System32\drivers\etc\hosts
    echo 10.2.1.27  cmms.costaatt.edu.tt >> C:\Windows\System32\drivers\etc\hosts
    echo ✅ Added cmms.costaatt.edu.tt to HOSTS file
)

REM Flush DNS cache
ipconfig /flushdns >nul

echo.
echo ✅ HOSTS file updated successfully!
echo ✅ DNS cache flushed
echo.
echo You can now access CMMS at:
echo http://cmms.costaatt.edu.tt
echo.
echo NOTE: This only works on THIS computer.
echo      Other users still need the DNS record from network admin.
echo.
pause


