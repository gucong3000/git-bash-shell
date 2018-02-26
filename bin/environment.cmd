@echo off

if "%1"=="" (
	if exist "%SHELL%.exe" (
		goto :EOF
	)
	if exist "%SHELL%" (
		set "SHELL=%SHELL:~0,-4%"
		goto :EOF
	)
	set "SHELL=/usr/bin/bash"
) else (
	set "SHELL=/usr/bin/%1"
)

for /F "delims=" %%F in ('node.exe "%~dp0\..\lib\cli-environment.js"') do (
	%%F
)
