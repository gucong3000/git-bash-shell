;= @echo off
;= if defined GIT_BASH_SHELL_INIT goto:eof
;= set GIT_BASH_SHELL_INIT=True
;= @for /F "delims=" %%F in ('node.exe "%~dp0\..\lib\cli-environment.js"') do %%F
;= if defined SHELL env.exe "%SHELL%" --login
;= doskey /listsize=1000 /macrofile="%0%"
;= if defined CMDER_ROOT "%CMDER_ROOT%\vendor\clink\clink_x64.exe" inject --autorun --quiet --profile "%CMDER_ROOT%\config" --scripts "%CMDER_ROOT%\vendor"
;= goto:eof
env=if defined SHELL ( env.exe $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" env.exe $* )
$SHELL=if defined SHELL ( env.exe "%SHELL%" $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/sh $* )
dash=env.exe "SHELL=%GIT_INSTALL_ROOT%\usr\bin\dash" /usr/bin/dash $*
zsh=env.exe "SHELL=%GIT_INSTALL_ROOT%\usr\bin\zsh" /usr/bin/zsh $*
bash=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\bash" /bin/bash $*
sh=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/sh $*
node.exe=env.exe node $*
node=env.exe node $*
npm=env.exe npm $*
npx=env.exe npx $*
