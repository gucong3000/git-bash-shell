@echo off
chcp 65001 >nul 2>nul
if not defined npm_node_execpath (
	for /F "delims=" %%F in ('where node.exe 2^>nul') do (
		SET "npm_node_execpath=%%F"
	)
)

(where [.exe && (
	goto :SET_BASH
)) >nul 2>nul

rem add the unix commands at the end to not shadow windows commands like more
:: check if git is in registry...
for /F "tokens=1,2,*" %%i in ('reg query HKLM\SOFTWARE\GitForWindows /v InstallPath 2^>nul ^| find "InstallPath"') do (
	SET "PATH=%PATH%;%%k\cmd;%%k\usr\bin;%%k\usr\share\vim\vim74"
	SET "BASH=%%k\usr\bin\bash.exe"
	goto :END_OF_FILE
)

:SET_BASH
if not defined BASH (
	for /F "delims=" %%F in ('where git.exe 2^>nul ^| sed -r "s/\\w+\\\\git\\.exe$/usr\\\\bin\\\\bash.exe/i"') do (
		set "BASH=%%F"
	)
)
:END_OF_FILE
