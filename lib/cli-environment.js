'use strict';
require('./env-path');
require('./env-node-options');
require('./env-shell');
var osLocale = require('os-locale');
if (!process.env.LANG) {
	process.env.LANG = osLocale.sync({spawn: true}) + '.UTF-8';
}

function setEnv (key, value) {
	return 'set "' + key + '=' + process.env[value || key] + '"';
}

process.stdout.write([
	setEnv('Path'),
	setEnv('LANG'),
	setEnv('NODE_OPTIONS'),
	setEnv('npm_config_script_shell', 'ComSpec'),
	setEnv('SHELL', 'ComSpec').replace(/\.\w+(")$/, '$1'),
].join('\r\n'));
