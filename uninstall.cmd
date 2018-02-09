@echo off

call :DEL bash.cmd
call :DEL dash.cmd
call :DEL sh.cmd
call :DEL env.cmd
call :DEL node.cmd
call :DEL \$SHELL.cmd
exit /b

:DEL
for /F "delims=" %%F in ('where %1 2^>nul') do @(
	del /F /Q "%%F"
)
