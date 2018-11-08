"use strict";
const fixSpawnArgs = require("./fix-spawn-args");
const cp = require("child_process");
function fixFn (object, fnName, argHook) {
	const oldFn = object[fnName];
	object[fnName] = function () {
		const args = arguments;
		argHook.apply(this, args);
		return oldFn.apply(this, args);
	};
}

fixFn(cp.ChildProcess.prototype, "spawn", fixSpawnArgs);
// eslint-disable-next-line node/no-deprecated-api
fixFn(process.binding("spawn_sync"), "spawn", fixSpawnArgs);
