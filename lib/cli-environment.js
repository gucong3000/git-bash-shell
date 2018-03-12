'use strict';
require('./env-lang');
require('./env-path');
require('./env-shell');
require('./env-node-options');

var getEnvPath = require('./get-env-path');
process.env.PATH = getEnvPath().join(';');

function setEnv (key, value) {
	return 'set "' + key + '=' + process.env[value || key] + '"';
}

process.stdout.write([
	setEnv('PATH'),
	setEnv('LANG'),
	setEnv('NODE_OPTIONS'),
	setEnv('npm_config_script_shell', 'ComSpec'),
	setEnv('SHELL', 'ComSpec').replace(/\.\w+(")$/, '$1'),
].join('\r\n'));
