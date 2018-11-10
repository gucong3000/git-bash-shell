"use strict";
const gitWin = require("git-win");
const getEnvValue = require("./get-env-value");

function win32Path (paths, options) {
	function envReplace (f) {
		return f.replace(/%(.+?)%/g, (s, key) => (
			getEnvValue(key, options) || s
		));
	}
	return envReplace(gitWin.toWin32(...paths.map(envReplace)));
}

module.exports = win32Path;
