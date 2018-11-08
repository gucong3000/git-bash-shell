@echo off
for /F "delims=" %%F in ('cygpath --mixed "%~dp0/../"') do node.exe --require "%%F" %*
