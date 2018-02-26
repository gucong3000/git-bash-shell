@echo off

if "%1"=="" (
	if defined SHELL (
		goto :NODE_OPTIONS
	)
	set "SHELL=bash"
) else (
	set "SHELL=%1"
)

(where [.exe && (
	goto :SET_SHELL
)) >nul 2>nul

rem add the unix commands at the end to not shadow windows commands like more
:: check if git is in registry...
for /F "tokens=1,2,*" %%i in ('^(reg query HKLM\SOFTWARE\GitForWindows /v InstallPath ^|^| reg query HKLM\SOFTWARE\GitForWindows /v InstallPath /reg:64 ^|^| reg query HKLM\SOFTWARE\GitForWindows /v InstallPath /reg:32^) 2^>nul ^| find "InstallPath"') do (
	set "Path=%Path%;%%k\cmd;%%k\usr\bin;%%k\usr\share\vim\vim74"
	set "SHELL=%%k\usr\bin\%SHELL%"
	goto :NODE_OPTIONS
)

for /F "delims=" %%F in ('node.exe -r "%~dp0\..\lib\env-path.js" -p process.env.Path 2^>nul') do (
	set "Path=%%F"
)

:SET_SHELL
for /F "delims=" %%F in ('cygpath -w /usr/bin/') do (
	set "SHELL=%%F%SHELL%"
)

:NODE_OPTIONS
for /F "delims=" %%F in ('cygpath -d "%~dp0\..\index.js"') do (
	set "NODE_OPTIONS=%NODE_OPTIONS% --require %%F"
)
for /F "delims=" %%F in ('cygpath -w "%SHELL%"') do (
	set "npm_config_script_shell=%%F"
)
for /F "delims=" %%F in ('cygpath -w "%~dp0\wrap"') do (
	set "Path=%%F;%Path%"
)
