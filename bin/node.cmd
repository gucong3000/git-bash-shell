@SETLOCAL
@call "%~dp0\environment.cmd"
"%npm_node_execpath%" --require "%~dp0\..\lib\patch" %*
