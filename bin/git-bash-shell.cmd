;= @echo off
;= rem Call DOSKEY and use this file as the macrofile
;= %SystemRoot%\System32\doskey.exe /listsize=1000 /macrofile=%0%
;= if "%PWD%"=="%CD%" ( goto:eof )
;= set "PWD=%CD%"
;= if not defined HOME ( set "HOME=%USERPROFILE%" )
;= if not defined npm_execpath ( for /F "delims=" %%F in ('node.exe "%~dp0\..\lib\cli-environment.js"') do (%%F) )
;= if defined TERM ( if defined SHLVL ( goto:eof ) )
;= if defined npm_lifecycle_script ( goto:eof )
;= if defined CMDER_ROOT ( goto:eof )
;= if exist "%ProgramData%\Cmder\vendor\clink\clink.bat" ( set "CMDER_ROOT=%ProgramData%\Cmder" && call "%ProgramData%\Cmder\vendor\clink\clink.bat" inject --autorun --quiet --profile "%ProgramData%\Cmder\config" --scripts "%ProgramData%\Cmder\vendor" )
;= rem In batch mode, jump to the end of the file
;= goto:eof
;= Add aliases below here
cd=cd /d $* && for /F "delims=" %F in ('cd') do @set "PWD=%F"
pwd=if /i "$*"=="" (cd) else (pwd.exe $*)
env=if defined SHELL ( env.exe $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" env.exe $* )
$SHELL=if defined SHELL ( env.exe "%SHELL%" $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/bash $* )
bash=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\bash" /bin/bash $*
dash=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\dash" /bin/dash $*
sh=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/sh $*
npm=env.exe TERM=cygwin node "%npm_execpath%" $*
