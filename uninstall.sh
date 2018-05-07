#!/usr/bin/env bash

del () {
	[ -e "$1" ] && echo rm -rf "$1"
}

call() {
	del "$(which $2 2>/dev/null)"
}

call :DEL bash.cmd
call :DEL dash.cmd
call :DEL sh.cmd
call :DEL env.cmd
call :DEL node.cmd
call :DEL \$SHELL.cmd
