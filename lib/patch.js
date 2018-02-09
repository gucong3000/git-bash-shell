'use strict';
var fixSpawnArgs = require('./fix-spawn-args');

function fixFn (object, fnName, argHook) {
	var oldFn = object[fnName];
	object[fnName] = function () {
		var args = arguments;
		try {
			argHook.apply(this, args);
		} catch (ex) {
			//
		}
		return oldFn.apply(this, args);
	};
}

fixFn(require('child_process').ChildProcess.prototype, 'spawn', fixSpawnArgs);
fixFn(process.binding('spawn_sync'), 'spawn', fixSpawnArgs);
