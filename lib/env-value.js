"use strict";
const gitWin = require("git-win");
const path = require("path");
const os = require("os");
const env = process.env;

function getShell (shell) {
	if (shell) {
		shell = gitWin.resolve(shell).replace(/^(\/.*?)(?:\.(?:exe|cmd|bat|com))?$/, "$1");
	}
	return shell;
}

const envHandler = {
	get: (env, prop) => {
		if (typeof prop === "string") {
			if (/^ComSpec$/i.test(prop)) {
				// return getShell(env.SHELL) || (env[prop] && env[prop].replace(/(?:^[a-z]:|\\w(?=indows\\)|\\s(?=ystem32\\))/g, s => s.toUpperCase()));
				return getShell(env.SHELL) || env[prop];
			} else if (/^npm_config(?:_\w+)*_shell$/i.test(prop)) {
				return getShell(env[prop] || env.SHELL);
			} else if (/^SHELL$/i.test(prop)) {
				return getShell(env.SHELL);
			} else if (/^HOME$/i.test(prop)) {
				return env[prop] || os.homedir();
			} else if (/^APPDATA$/i.test(prop)) {
				return env[prop] || path.join(os.homedir(), "AppData/Roaming");
			} else if (/^(?:SystemRoot|windir)$/i.test(prop)) {
				return env[prop] || path.join(env.SystemDrive || "C:", "Windows");
			}
		}
		return env[prop];
	},
};

process.env = new Proxy(env, envHandler);

module.exports = env;
