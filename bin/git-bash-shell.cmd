;= @echo off
;= %SystemRoot%\System32\doskey.exe /listsize=1000 /macrofile=%0%
;= if defined _ goto:eof
;= if defined npm_lifecycle_script goto:eof
;= set _=env
;= for /F "delims=" %%F in ('node.exe "%~dp0\..\lib\cli-environment.js"') do %%F
;= if not exist "%ProgramData%\Cmder\vendor\clink\clink.bat" goto:eof
;= set "CMDER_ROOT=%ProgramData%\Cmder"
;= setlocal enabledelayedexpansion
;= if "%PROCESSOR_ARCHITECTURE%"=="x86" ( set "architecture=86" ) else ( set "architecture=64" )
;= "%CMDER_ROOT%\vendor\clink\clink_x%architecture%.exe" inject --quiet --profile "%CMDER_ROOT%\config" --scripts "%CMDER_ROOT%\vendor"
;= endlocal
;= goto:eof
env=if defined SHELL ( env.exe $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" env.exe $* )
$SHELL=if defined SHELL ( env.exe "%SHELL%" $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/bash $* )
bash=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\bash" /bin/bash $*
dash=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\dash" /bin/dash $*
sh=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/sh $*
npm=env.exe TERM=cygwin npm $*
npx=env.exe TERM=cygwin npx $*
node=env.exe node $*
