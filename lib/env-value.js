"use strict";
const gitWin = require("git-win");
const path = require("path");
const os = require("os");
const binDir = path.join(__dirname, "../bin");
const env = process.env;

let posixPath;

function getShell (shell) {
	if (shell) {
		shell = gitWin.resolve(shell).replace(/^(\/.*?)(?:\.(?:exe|cmd|bat|com))?$/, "$1");
	}
	return shell;
}

function getHome (env) {
	return env.HOME || (env.HOME = os.homedir());
}

function pathSort (dir) {
	if (!dir) {
		return 0xff;
	} else if (binDir === dir) {
		return -0xff;
	}
	return 0;
}

function setPath (env, value) {
	if (!/;/.test(value) && value.split(/:+/g).every(dir => /^(?:\.$|~?\/)/.test(dir))) {
		posixPath = Array.from(new Set(value.split(/:/g))).filter(Boolean);
	} else {
		env.Path = value;
	}
}

function getPath (env) {
	let Path = env.Path.split(/;+/g);
	if (posixPath) {
		Path = Path.filter(dir => posixPath.indexOf(gitWin.resolve(dir)) < 0);
	} else {
		Path = Array.from(new Set(Path)).sort((a, b) => (
			pathSort(a) - pathSort(b)
		));
	}
	Path = Path.join(";");
	if (posixPath) {
		let ending;
		const newPath = posixPath.map(dir => {
			if (dir === "." && ending == null) {
				return Path.replace(/[\s;]*$/, s => {
					ending = s;
					return "";
				});
			} else {
				return gitWin.toWin32(dir).replace(/^%HOME%/, () => getHome(env));
			}
		}).join(";");
		if (ending == null) {
			Path = newPath + ";" + Path;
		} else {
			Path = newPath + ending;
		}
	}
	return Path;
}

const envHandler = {
	get: (env, prop) => {
		if (typeof prop === "string") {
			if (/^PATH$/i.test(prop)) {
				return getPath(env);
			} else if (/^ComSpec$/i.test(prop)) {
				return getShell(env.SHELL) || env[prop];
			} else if (/^npm_config(?:_\w+)*_shell$/i.test(prop)) {
				return getShell(env[prop] || env.SHELL);
			} else if (/^SHELL$/i.test(prop)) {
				return getShell(env.SHELL);
			} else if (/^HOME$/i.test(prop)) {
				return getHome(env);
			} else if (/^APPDATA$/i.test(prop)) {
				return env[prop] || path.join(os.homedir(), "AppData/Roaming");
			} else if (/^(?:SystemRoot|windir)$/i.test(prop)) {
				return env[prop] || path.join(env.SystemDrive || "C:", "Windows");
			}
		}
		return env[prop];
	},
	set: (env, prop, value) => {
		if (typeof prop === "string" && /^PATH$/i.test(prop)) {
			setPath(env, value);
		} else {
			env[prop] = value;
		}
		return true;
	},
};

process.env = new Proxy(env, envHandler);

module.exports = env;
