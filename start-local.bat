@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting local portfolio server...
call npm.cmd run dev
pause
