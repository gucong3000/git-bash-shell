"use strict";
const fixSpawn = require("./fix-spawn");
const cp = require("child_process");
function fixFn (object, fnName) {
	const oldFn = object[fnName];
	object[fnName] = function () {
		return fixSpawn.apply(this, [oldFn, arguments]);
	};
}

fixFn(cp.ChildProcess.prototype, "spawn");
// eslint-disable-next-line node/no-deprecated-api
fixFn(process.binding("spawn_sync"), "spawn");
