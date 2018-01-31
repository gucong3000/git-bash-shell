@SETLOCAL
@call "%~dp0\environment.cmd"
if not defined BASH (
	for /F "delims=" %%F in ('where git.exe 2^>nul ^| sed -r "s/\\w+\\\\git\\.exe$/usr\\\\bin\\\\bash.exe/i"') do (
		set "BASH=%%F"
	)
)
if not defined npm_config_script_shell (
	set "npm_config_script_shell=%BASH%"
)
"%BASH%" %*
