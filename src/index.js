"use strict";
const path = require("path");

function init (force) {
	if (process.platform !== "win32") {
		return;
	}
	if (force && !process.env.SHELL) {
		process.env.SHELL = "/bin/bash";
	}
	require("./patch");
	require("./env-value");
	require("fs-posix");
}

init(process.env.SHELL && !/^(?:.*\\)?cmd(?:\.exe)?$/i.test(process.env.SHELL));

module.exports = init.bind(null, true);
if (!process.mainModule && process.execArgv[0] === "--require" && process.execArgv[1] === path.join(__dirname, "..")) {
	process.execArgv = process.execArgv.slice(2);
}
