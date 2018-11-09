"use strict";
const fixSpawnArgs = require("./fix-spawn-args");

function fixFn (object, fnName, argHook) {
	const oldFn = object[fnName];
	object[fnName] = function () {
		const args = arguments;
		try {
			argHook.apply(this, args);
		} catch (ex) {
			//
		}
		return oldFn.apply(this, args);
	};
}

fixFn(require("child_process").ChildProcess.prototype, "spawn", fixSpawnArgs);
// eslint-disable-next-line node/no-deprecated-api
fixFn(process.binding("spawn_sync"), "spawn", fixSpawnArgs);
