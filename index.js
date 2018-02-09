#!/usr/bin/env node.exe %NODE_OPTIONS% --require
'use strict';
function init (force) {
	if (process.platform === 'win32') {
		if (force) {
			require('./lib/env-shell');
		}
		require('./lib/env-node-options');
		require('./lib/env-path');
		require('./lib/patch');
	}
}

init(process.env.SHELL || (module.parent && module.parent.filename));

module.exports = init.bind(null, true);
