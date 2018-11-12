@echo off
for /F "delims=" %%F in ('cygpath.exe --absolute --windows "%~dp0/../"') do node.exe --require "%%F" %*
