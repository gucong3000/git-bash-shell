'use strict';
function getEnvValue (env, key) {
	if (!(key in env)) {
		key = Object.keys(env).find(function (envKey) {
			return envKey.toUpperCase() === key.toUpperCase();
		});
		if (!key) {
			return;
		}
	}
	return env[key].replace(/%(.+?)%/g, function (s, key) {
		return getEnvValue(env, key) || s;
	});
}

function getEnvPath (env, key) {
	var path = getEnvValue(env || process.env, key || 'Path');
	if (!key || /^PATH(?:EXT)?$/i.test(key)) {
		path = path ? path.split(/\s*;\s*/).filter(Boolean) : [];
	}
	return path;
}
module.exports = getEnvPath;
