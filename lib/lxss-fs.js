"use strict";
const getEnvPath = require("./get-env-path");
const path = require("path").win32;
const fs = require("fs");
let lxssFs;
const localAppdata = getEnvPath(process.env, "LOCALAPPDATA");
(function () {
	if (localAppdata) {
		lxssFs = path.join(localAppdata, "lxss/rootfs");
		try {
			if (fs.statSync(lxssFs).isDirectory()) {
				module.exports = path.join.bind(path, lxssFs);
				module.exports.dir = lxssFs;
				return;
			}
		} catch (ex) {
			//
		}
	}
	module.exports = function () {};
})();
