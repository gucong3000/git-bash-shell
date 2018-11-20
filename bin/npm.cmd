@echo off
if defined npm_execpath (
	env.exe "%~dp0/node" "%npm_execpath%" %*
) else (
	env.exe npm %*
)
