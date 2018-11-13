;= @echo off
;= if defined GIT_BASH_SHELL_LOCK ( goto:eof ) else ( set GIT_BASH_SHELL_LOCK=True )
;= %SystemRoot%\System32\doskey.exe /listsize=1000 /macrofile=%0%
;= if defined TERM ( if defined SHLVL goto:eof )
;= if defined npm_lifecycle_script goto:eof
;= for /F "delims=" %%F in ('node.exe "%~dp0\..\lib\cli-environment.js"') do %%F
;= set GIT_BASH_SHELL_LOCK=
;= goto:eof
env=if defined SHELL ( env.exe $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" env.exe $* )
$SHELL=if defined SHELL ( env.exe "%SHELL%" $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/bash $* )
bash=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\bash" /bin/bash $*
dash=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\dash" /bin/dash $*
sh=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/sh $*
npm=env.exe npm $*
npx=env.exe npx $*
node=env.exe node $*
