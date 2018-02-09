@SETLOCAL
@call "%~dp0\environment.cmd"
set "SHELL=%SHELL:~0,-4%%0"
"%SHELL%" %*
