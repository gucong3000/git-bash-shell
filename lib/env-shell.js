'use strict';
var path = require('path');
var gitDir = require('git-win');
var findFile = require('./find-file');
var getEnvPath = require('./get-env-path');
var isPosixShell = require('./is-posix-shell');
var pathStartsWith = require('./path-starts-with');

var env = {
	'SHELL': {
		get: function () {
			var value = this.ComSpec;
			return pathStartsWith(value, gitDir) || value;
		},
		set: function (shell) {
			var unixShell = pathStartsWith(shell, gitDir);
			var shellPaths;
			if (unixShell) {
				shellPaths = [
					path.join(gitDir, unixShell),
				];
			} else if (/^\//.test(shell)) {
				shellPaths = [
					path.join(gitDir, shell),
				];
			} else if (path.isAbsolute(shell)) {
				shellPaths = [
					shell,
				];
			} else {
				shellPaths = getEnvPath(this).map(function (dir) {
					return path.join(dir, shell);
				});

				shellPaths.unshift(
					path.resolve(shell),
					path.join(gitDir, 'usr/bin', shell)
				);
			}
			this.ComSpec = findFile(shellPaths, getEnvPath(this, 'PATHEXT')) || shell;
		},
		enumerable: true,
	},
	'npm_config_script_shell': {
		get: function () {
			if (isPosixShell(this.ComSpec) || pathStartsWith(this.ComSpec, gitDir)) {
				return this.ComSpec;
			}
		},
		enumerable: true,
	},
};

env.SHELL.set.call(process.env, process.env.SHELL || '/usr/bin/bash');
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
