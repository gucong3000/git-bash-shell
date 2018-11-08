"use strict";
require("./env-value");

function getArrValue (envPairs, key) {
	let value;
	envPairs.some(env => {
		if (env.length >= key.length && env[key.length] === "=" && env.slice(0, key.length) === key) {
			value = env.slice(key.length + 1);
			return true;
		}
	});
	return value;
}

function getEnvValue (key, options) {
	const env = options ? options.env : process.env;
	let value;
	if (env) {
		value = env[key];
	} else if (options.envPairs) {
		value = getArrValue(options.envPairs, key);
	}

	if (!value && /^(?:HOME|APPDATA|SystemRoot|windir)$/.test(key)) {
		value = process.env[key];
	}
	return value;
}

module.exports = getEnvValue;
