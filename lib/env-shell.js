'use strict';
var path = require('path');
var gitDir = require('git-win');
var findFile = require('./find-file');
var getEnvPath = require('./get-env-path');
var isPosixShell = require('./is-posix-shell');

var env = {
	'SHELL': {
		get: function () {
			var value = this.ComSpec;
			if (value.startsWith(gitDir)) {
				value = value.slice(gitDir.length).replace(/\.\w+$/, '').replace(/\\/g, '/');
			}
			return value;
		},
		set: function (shell) {
			var shellPaths;
			if (/^\//.test(shell)) {
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
			if (isPosixShell(this.ComSpec) || this.ComSpec.startsWith(gitDir)) {
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
