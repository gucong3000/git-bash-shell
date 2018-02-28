'use strict';
require('./env-path');
require('./env-node-options');
require('./env-shell');

function setEnv (key, value) {
	return 'set "' + key + '=' + process.env[value || key] + '"';
}

process.stdout.write([
	setEnv('Path'),
	setEnv('NODE_OPTIONS'),
	setEnv('npm_config_script_shell', 'ComSpec'),
	setEnv('SHELL', 'ComSpec').replace(/\.\w+(")$/, '$1'),
].join('\r\n'));
