@echo off
if exist "%SHELL%" (
	goto :NODE_OPTIONS
)

(where [.exe && (
	goto :SET_SHELL
)) >nul 2>nul

rem add the unix commands at the end to not shadow windows commands like more
:: check if git is in registry...
for /F "tokens=1,2,*" %%i in ('reg query HKLM\SOFTWARE\GitForWindows /v InstallPath 2^>nul ^| find "InstallPath"') do (
	set "Path=%Path%;%%k\cmd;%%k\usr\bin;%%k\usr\share\vim\vim74"
	set "SHELL=%%k\usr\bin\bash"
	goto :NODE_OPTIONS
)

:SET_SHELL
for /F "delims=" %%F in ('cygpath -w /usr/bin/') do (
	set "SHELL=%%Fbash"
)

:NODE_OPTIONS
set "npm_config_script_shell=%SHELL%"
for /F "delims=" %%F in ('cygpath -w "%~dp0\..\index.js"') do (
	set "NODE_OPTIONS=%NODE_OPTIONS% --require %%F"
)
for /F "delims=" %%F in ('cygpath -w "%~dp0\wrap"') do (
	set "Path=%%F;%Path%"
)
