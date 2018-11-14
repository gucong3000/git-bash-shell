;= @echo off
;= if defined GIT_BASH_SHELL_INIT goto:eof
;= set GIT_BASH_SHELL_INIT=True
;= "%SystemRoot%\System32\doskey.exe" /listsize=1000 /macrofile="%0%"
;= for /F "delims=" %%F in ('node.exe "%~dp0\..\lib\cli-environment.js"') do %%F
;= goto:eof
env=if defined SHELL ( env.exe $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" env.exe $* )
$SHELL=if defined SHELL ( env.exe "%SHELL%" $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/bash $* )
bash=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\bash" /bin/bash $*
dash=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\dash" /bin/dash $*
sh=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/sh $*
node.exe=env.exe node $*
node=env.exe node $*
npm=env.exe npm $*
npx=env.exe npx $*
