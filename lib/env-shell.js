"use strict";
const path = require("path");
const gitDir = require("./git-dir");
const findFile = require("./find-file");
const getEnvPath = require("./get-env-path");
const isPosixShell = require("./is-posix-shell");
const pathStartsWith = require("./path-starts-with");
require("./env-path");

const env = {
	"SHELL": {
		get: function () {
			const value = this.ComSpec;
			return pathStartsWith(value) || value;
		},
		set: function (shell) {
			const unixShell = pathStartsWith(shell);
			let shellPaths;
			if (unixShell) {
				shellPaths = [
					gitDir(unixShell),
				];
			} else if (/^\//.test(shell)) {
				shellPaths = [
					gitDir(shell),
				];
			} else if (path.isAbsolute(shell)) {
				shellPaths = [
					shell,
				];
			} else {
				shellPaths = getEnvPath(this).map((dir) => {
					return path.join(dir, shell);
				});

				shellPaths.unshift(
					path.resolve(shell),
					gitDir("usr/bin", shell)
				);
			}
			this.ComSpec = findFile(shellPaths, getEnvPath(this, "PATHEXT")) || shell;
		},
		enumerable: true,
	},
	"npm_config_script_shell": {
		get: function () {
			if (isPosixShell(this.ComSpec) || pathStartsWith(this.ComSpec)) {
				return this.ComSpec;
			}
		},
		enumerable: true,
	},
};

env.SHELL.set.call(process.env, process.env.SHELL || "/usr/bin/bash");
delete process.env.SHELL;
try {
	Object.defineProperties(
		Object.getPrototypeOf(process.env),
		env
	);
} catch (ex) {
	//
}
module.exports = process.env.ComSpec;
