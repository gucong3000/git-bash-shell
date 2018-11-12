"use strict";
const gitWin = require("git-win");
const getEnvValue = require("./get-env-value");

function win32Path (paths, options) {
	return gitWin.toWin32(...paths).replace(/%(.+?)%/g, (s, key) => (
		getEnvValue(key, options) || s
	));
}

module.exports = win32Path;
