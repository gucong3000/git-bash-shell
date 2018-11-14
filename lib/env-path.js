"use strict";
const win32Path = require("./win32-path");
const gitWin = require("git-win");
const path = require("path");
const binDir = path.resolve(__dirname, "../bin");
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
	return Path ? Path.split(/(?:\s*;\s*)+/g).map(dir => (
		win32Path([dir], options)
	)) : [];
}

function pathUnique (arr) {
	const hash = {};
	return arr.filter((elem) => {
		if (elem) {
			const key = path.resolve(elem).toLowerCase();
			if (!hash[key]) {
				hash[key] = true;
				return true;
			}
		}
	});
}

const envPath = getEnvPath();
envPath.unshift(binDir);
process.env.Path = pathUnique(envPath).map(dir => (
	win32Path([dir])
)).join(";");

function getPath (options) {
	return pathUnique(getEnvPath(options));
}

module.exports = getPath;
