"use strict";
const getEnvValue = require("./get-env-value");
const win32Path = require("./win32-path");
const shebang = require("./shebang");
const which = require("./which");
const path = require("path");
const gitWin = require("git-win");
const envExec = which("/usr/bin/env");
const nodeArg = require.resolve("../");
const windir = getEnvValue("SystemRoot");

function isLifecycleScript (args, options) {
	const script = getEnvValue("npm_lifecycle_script", options);
	return script && script === args;
}

function isWinExec (file) {
	if (/\.(?:cmd|bat)$/.test(file)) {
		return true;
	}
	if (/[A-Z]:\\Windows(?=\\|$)/i.test(file) || (file.startsWith(windir + "\\"))) {
		if (/(?:^|\\)OpenSSH(?=\\|$)/i.test(file) || /(?:^|\\)(?:(?:[bd]a|z)?sh|curl|tar|whoami|HOSTNAME)(?:\.exe)?$/i.test(file)) {
			return false;
		}
		return true;
	}
	return false;
}

function fixShellArgs (options, file) {
	if (options.windowsVerbatimArguments && options.args.length >= 3 && options.args.slice(1, -1).every(arg => /^\/\w(?:\s+\/\w)*$/.test(arg))) {
		let args = options.args[options.args.length - 1];
		if (/^".*"$/.test(args)) {
			args = args.slice(1, -1);
		}
		let argv0;

		if (gitWin.fixPosixRoot(file)) {
			argv0 = options.args[0];
			if (/^SET(?=\s|$)/.test(args) && isLifecycleScript(args, options)) {
				args = "env" + args.slice(3);
			}
		} else if (
			[
				/^\$/,
				/^\w+\S*=/,
				/^(?:env|(?:[bd]a|z)?sh)(?=\s|$)/,
				/^\/(?:bin|dev|etc|mingw\d+|proc|tmp|usr)(?=\/|$)/,
			].some(regexp => regexp.test(args)) && isLifecycleScript(args, options)
		) {
			const shell = getEnvValue("SHELL", options);
			if (/^(?:(?:(?:\/usr)?\/bin\/)?env(?:\s+-\S*)*\s+)?(?:\w+\S+=\S*\s+)*?SHELL=(\S+)(?=\s|$)/.test(args) || /^((?:(?:\/usr)?\/bin\/)?\w+)(?:\s+-\S+)*?\s+-c(?=\s|$)/.test(args)) {
				argv0 = RegExp.$1;
				if (shell && argv0 !== shell) {
					options.envPairs.some((env, i) => {
						if (env.startsWith("SHELL=")) {
							options.envPairs[i] = "SHELL=" + argv0;
							return true;
						}
					});
				}
			} else {
				argv0 = shell || "/bin/sh";
			}
			file = which(argv0, options) || argv0;
			if (!shell) {
				options.envPairs.push("SHELL=" + argv0);
			}
		} else {
			if (options.args[1] === "/d /s /c") {
				options.args[1] = "/s /c";
			}
			options.envPairs.some((env, i) => {
				if (/^Path=/i.test(env)) {
					options.envPairs[i] = env.slice(0, 5) + env.slice(5).split(/(?:\s*;\s*)+/g).map(dir => (
						win32Path([dir], options)
					)).join(";");
					return true;
				}
			});
			return;
		}
		options.args = [argv0, "-c", args];
		options.file = file;

		delete options.windowsVerbatimArguments;
		return options;
	}
}

function fixSpawnArgs (options) {
	const file = which(options.file, options);

	if (!file || file === envExec) {
		return;
	}

	if (file === process.execPath) {
		if (options.args.indexOf(nodeArg) < 0) {
			options.args.unshift(
				options.args.shift(),
				"--require",
				nodeArg
			);
		}
		return;
	}

	if (fixShellArgs(options, file)) {
		return;
	}

	if (isWinExec(file)) {
		const argv0 = path.normalize(options.args[0]);
		options.args[0] = argv0.replace(/^~(?=[/\\]|$)/, () => (
			file.slice(0, file.indexOf(argv0.slice(1)))
		));
	} else if (!/\.\w+$/.test(file) || shebang(file)) {
		options.file = envExec;
		options.args.unshift("/usr/bin/env");
		return;
	}
	options.file = file;
}

module.exports = fixSpawnArgs;
