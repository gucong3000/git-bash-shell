"use strict";
require("./env-value");

function getArrValue (envPairs, key) {
	key = key.toUpperCase();
	let value;
	envPairs.some(env => {
		if (env.length >= key.length && env[key.length] === "=" && env.slice(0, key.length).toUpperCase() === key) {
			value = env.slice(key.length + 1);
			return true;
		}
	});
	return value;
}

function getObjValue (env, key) {
	if (!env.hasOwnProperty(key)) {
		key = key.toUpperCase();
		key = Object.keys(env).find(s => s.toUpperCase() === key) || key;
	}
	return env[key];
}

function getEnvValue (key, options) {
	const env = options ? options.env : process.env;
	let value;
	if (env) {
		value = getObjValue(env, key);
	} else if (options.envPairs) {
		value = getArrValue(options.envPairs, key);
	}

	if (!value && /^(?:HOME|APPDATA|SystemRoot|windir)$/.test(key)) {
		value = process.env[key];
	}
	return value;
}

module.exports = getEnvValue;
