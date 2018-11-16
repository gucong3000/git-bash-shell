#!/usr/bin/env node.exe
"use strict";
function init (force) {
	if (process.platform !== "win32") {
		return;
	}
	if (force && !process.env.SHELL) {
		process.env.SHELL = "/bin/bash";
	}
	return Promise.all([
		require("./lib/patch"),
		require("./lib/env-value"),
	]);
}

init(process.env.SHELL && !/^(?:.*\\)?cmd(?:\.exe)?$/i.test(process.env.SHELL));

module.exports = init.bind(null, true);
if (!process.mainModule && process.execArgv[0] === "--require" && process.execArgv[1] === __dirname) {
	process.execArgv = process.execArgv.slice(2);
}
