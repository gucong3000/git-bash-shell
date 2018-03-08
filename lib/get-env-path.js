'use strict';
var pathUnique = require('./path-unique');

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
	env = env || process.env;
	var path = getEnvValue(env, key || 'Path');
	if (!key || /^PATH(?:EXT)?$/i.test(key)) {
		path = path ? pathUnique(path.split(/\s*;\s*/g)) : [];
	} else if (!path && key === 'USERPROFILE') {
		var homeDrive = getEnvValue(env, 'HOMEDRIVE');
		var homePath = getEnvValue(env, 'HOMEPATH');
		if (homeDrive && homePath) {
			path = homeDrive + homePath;
		}
	}
	return path;
}
module.exports = getEnvPath;
