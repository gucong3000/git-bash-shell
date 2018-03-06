'use strict';
var path = require('path');
var gitDir = require('./git-dir');
var findFile = require('./find-file');
var getEnvPath = require('./get-env-path');
var isPosixShell = require('./is-posix-shell');
var pathStartsWith = require('./path-starts-with');
require('./env-path');

var env = {
	'SHELL': {
		get: function () {
			var value = this.ComSpec;
			return pathStartsWith(value) || value;
		},
		set: function (shell) {
			var unixShell = pathStartsWith(shell);
			var shellPaths;
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
				shellPaths = getEnvPath(this).map(function (dir) {
					return path.join(dir, shell);
				});

				shellPaths.unshift(
					path.resolve(shell),
					gitDir('usr/bin', shell)
				);
			}
			this.ComSpec = findFile(shellPaths, getEnvPath(this, 'PATHEXT')) || shell;
		},
		enumerable: true,
	},
	'npm_config_script_shell': {
		get: function () {
			if (isPosixShell(this.ComSpec) || pathStartsWith(this.ComSpec)) {
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
		process.env,
		env
	);
} catch (ex) {
	//
}
module.exports = process.env.ComSpec;
