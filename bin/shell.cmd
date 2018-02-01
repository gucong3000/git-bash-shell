@SETLOCAL
@call "%~dp0\environment.cmd"
set "SHELL=%SHELL:~0,-2%%0"
"%SHELL%" %*
