;= @echo off
;= if defined GIT_BASH_SHELL_INIT goto:eof
;= if defined npm_lifecycle_script goto:eof
;= if defined TERM ( if defined SHLVL goto:eof )
;= set GIT_BASH_SHELL_INIT=True
;= @for /F "delims=" %%F in ('node.exe "%~dp0\..\lib\cli-environment.js"') do %%F
;= "%windir%\System32\doskey.exe" /listsize=1000 /macrofile="%0%"
;= if not defined CMDER_ROOT goto:eof
;= if not exist "%CMDER_ROOT%\vendor\clink\clink_x64.exe" goto:eof
;= "%CMDER_ROOT%\vendor\clink\clink_x64.exe" inject --autorun --quiet --profile "%CMDER_ROOT%\config" --scripts "%CMDER_ROOT%\vendor"
;= goto:eof
$SHELL=if defined SHELL ( env.exe "%SHELL%" $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/sh $* )
env=if defined SHELL ( env.exe $* ) else ( env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" env.exe $* )
dash=env.exe "SHELL=%GIT_INSTALL_ROOT%\usr\bin\dash" /usr/bin/dash $*
zsh=env.exe "SHELL=%GIT_INSTALL_ROOT%\usr\bin\zsh" /usr/bin/zsh $*
bash=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\bash" /bin/bash $*
sh=env.exe "SHELL=%GIT_INSTALL_ROOT%\bin\sh" /bin/sh $*
node=env.exe node $*
npm=env.exe npm $*
npx=env.exe npx $*
