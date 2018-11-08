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
		require("./lib/env-lang"),
		require("./lib/env-path"),
		require("./lib/env-value"),
		require("./lib/env-proxy"),
	]);
}

init(process.env.SHELL && !/^(?:.*\\)?cmd(?:\.exe)?$/i.test(process.env.SHELL));

module.exports = init.bind(null, true);
