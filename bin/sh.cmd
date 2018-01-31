@SETLOCAL
@call "%~dp0\environment.cmd"
if not defined npm_config_script_shell (
	set "npm_config_script_shell=sh.exe"
)
sh.exe %*
