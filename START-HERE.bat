@echo off
rem ============================================================
rem  LQK Wall Game - Windows launcher
rem  Double-click this file. It opens the game the way the camera
rem  is allowed to work. No internet needed.
rem ============================================================

cd /d "%~dp0"

set GAME=lqk-wall-game.html
set PORT=8000

if not exist "%GAME%" (
  echo Cannot find %GAME% next to this launcher.
  echo Keep both files in the same folder.
  pause
  exit /b 1
)

set PY=
where py >nul 2>nul
if not errorlevel 1 set PY=py -3
if not defined PY (
  where python >nul 2>nul
  if not errorlevel 1 set PY=python
)

if not defined PY (
  echo This PC does not have Python.
  echo.
  echo Install it once from https://www.python.org/downloads/
  echo During the install, tick "Add Python to PATH".
  echo Then double-click this launcher again.
  pause
  exit /b 1
)

echo Starting the Wall Game...
start "LQK Wall Game server" /min cmd /c "%PY% -m http.server %PORT% --bind 127.0.0.1"

rem Give the little server a moment, then open Chrome.
timeout /t 2 /nobreak >nul

start "" chrome "http://localhost:%PORT%/%GAME%"
if errorlevel 1 start "" "http://localhost:%PORT%/%GAME%"

echo.
echo   http://localhost:%PORT%/%GAME%
echo.
echo   A small minimised window called "LQK Wall Game server" is now running.
echo   LEAVE IT OPEN while you play. Close it when you are finished.
echo.
pause
