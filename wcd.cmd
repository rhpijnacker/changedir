@echo off
node "%~dp0\changedir.js" %* > %TEMP%\changedir.tmp.bat
call %TEMP%\changedir.tmp.bat
