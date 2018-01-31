@echo off

if defined BASH (
	if exist "%BASH%" (
		goto :END_OF_FILE
	) else (
		SET BASH=
	)
)

(where [.exe && (
	goto :END_OF_FILE
)) >nul 2>nul

rem add the unix commands at the end to not shadow windows commands like more
:: check if git is in registry...
for /F "tokens=1,2,*" %%i in ('reg query HKLM\SOFTWARE\GitForWindows /v InstallPath 2^>nul ^| find "InstallPath"') do (
	SET "PATH=%PATH%;%%k\cmd;%%k\usr\bin;%%k\usr\share\vim\vim74"
	SET "BASH=%%k\usr\bin\bash.exe"
	goto :END_OF_FILE
)

:END_OF_FILE
