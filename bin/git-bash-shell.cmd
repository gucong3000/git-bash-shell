;= @echo off
;= rem Call DOSKEY and use this file as the macrofile
;= if defined git_bash_shell_init ( goto:eof )
;= set git_bash_shell_init=true
;= %SystemRoot%\System32\doskey.exe /listsize=1000 /macrofile=%0%
;= if not defined npm_execpath ( for /F "delims=" %%F in ('node.exe "%~dp0\..\lib\cli-environment.js"') do (%%F) )
;= set git_bash_shell_init=
;= if defined npm_lifecycle_script ( goto:eof )
;= if defined CMDER_ROOT ( goto:eof )
;= if exist "%ProgramData%\Cmder\vendor\clink\clink.bat" ( set "CMDER_ROOT=%ProgramData%\Cmder" && call "%ProgramData%\Cmder\vendor\clink\clink.bat" inject --autorun --quiet --profile "%ProgramData%\Cmder\config" --scripts "%ProgramData%\Cmder\vendor" )
;= rem In batch mode, jump to the end of the file
;= goto:eof
;= Add aliases below here
env=if defined SHELL ( env.exe $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" env.exe $* )
$SHELL=if defined SHELL ( env.exe "%SHELL%" $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/bash $* )
bash=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\bash" /bin/bash $*
dash=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\dash" /bin/dash $*
sh=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/sh $*
npm=env.exe TERM=cygwin node "%npm_execpath%" $*
