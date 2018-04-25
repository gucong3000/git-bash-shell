"use strict";
const pathUnique = require("./path-unique");

function getEnvValue (env, key) {
	if (!(key in env)) {
		key = Object.keys(env).find((envKey) => {
			return envKey.toUpperCase() === key.toUpperCase();
		});
		if (!key) {
			return;
		}
	}
	return env[key].replace(/%(.+?)%/g, (s, key) => {
		return getEnvValue(env, key) || s;
	});
}

function getEnvPath (env, key) {
	env = env || process.env;
	let path = getEnvValue(env, key || "PATH");
	if (!key || /^PATH(?:EXT)?$/i.test(key)) {
		path = path ? pathUnique(path.split(/\s*;\s*/g)) : [];
	} else if (!path && key === "USERPROFILE") {
		const homeDrive = getEnvValue(env, "HOMEDRIVE");
		const homePath = getEnvValue(env, "HOMEPATH");
		if (homeDrive && homePath) {
			path = homeDrive + homePath;
			console.log(path);
		}
	}
	return path;
}
module.exports = getEnvPath;
