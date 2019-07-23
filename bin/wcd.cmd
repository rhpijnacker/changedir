@echo off
node c:\pms\src\ip\changedir\changedir.js %* > %TEMP%\changedir.tmp.bat
call %TEMP%\changedir.tmp.bat
