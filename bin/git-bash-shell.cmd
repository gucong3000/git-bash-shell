@echo off
if defined GIT_BASH_SHELL_INIT goto:eof
if defined npm_lifecycle_script goto:eof
if defined TERM ( if defined SHLVL goto:eof )
set GIT_BASH_SHELL_INIT=True
@for /F "delims=" %%F in ('node.exe "%~dp0\..\lib\cli-environment.js"') do %%F
if not defined CMDER_ROOT goto:eof
if not exist "%CMDER_ROOT%\vendor\clink\clink_x64.exe" goto:eof
"%CMDER_ROOT%\vendor\clink\clink_x64.exe" inject --autorun --quiet --profile "%CMDER_ROOT%\config" --scripts "%CMDER_ROOT%\vendor"
