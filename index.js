#!/usr/bin/env node.exe %NODE_OPTIONS% --require
'use strict';
function init (force) {
	if (process.platform === 'win32') {
		require('./lib/env-node-options');
		require('./lib/env-path');
		require('./lib/patch');
		if (force) {
			require('./lib/env-shell');
		}
	}
}

init(process.env.SHELL || (module.parent && module.parent.filename));

module.exports = init.bind(null, true);
