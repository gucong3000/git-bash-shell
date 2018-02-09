@SETLOCAL
@call "%~dp0\environment.cmd"
echo %0 %* | "%SHELL%"
