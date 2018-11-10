"use strict";
const getEnvValue = require("./get-env-value");
const gitWin = require("git-win");
const path = require("path");
const binDir = path.resolve(__dirname, "../bin");
const windir = getEnvValue("SystemRoot");
process.env.GIT_INSTALL_ROOT = gitWin.root;

function getEnvPath (options = process) {
	let Path;
	if (options.env) {
		Path = options.env.Path || options.env.PATH;
	} else if (options.envPairs) {
		options.envPairs.some(env => {
			if (/^Path=/i.test(env)) {
				Path = env.slice(5);
				return true;
			}
		});
	}
	return Path ? Path.split(/(?:\s*;\s*)+/g) : [];
}

function pathUnique (arr) {
	const hash = {};
	return arr.filter((elem) => {
		if (elem) {
			const key = path.resolve(gitWin.resolve(elem).replace(/^(?:~|%HOME%)(?=[/\\]|$)/i, () => getEnvValue("HOME"))).toLowerCase();
			if (!hash[key]) {
				hash[key] = true;
				return true;
			}
		}
	});
}

process.env.Path = pathUnique(
	[
		"node_modules/.bin",
		"~/bin",
		"~/.local/bin",
		"/usr/local/sbin",
		"/usr/local/bin",
		"/usr/sbin",
		"/usr/bin",
		"/sbin",
		"/bin",
		"/" + gitWin.mingw + "/bin",
		// 'usr/games',
		// 'usr/local/games'
		process.env.npm_config_prefix || path.join(getEnvValue("APPDATA"), "npm"),
		binDir,
		path.dirname(process.execPath),
		path.join(windir, "System32", "OpenSSH"),
		path.join(windir, "System32"),
		windir,
	].concat(
		getEnvPath()
	)
).map(dir => gitWin.toWin32(dir)).join(";");

function getPath (options) {
	return pathUnique(getEnvPath(options));
}

module.exports = getPath;
