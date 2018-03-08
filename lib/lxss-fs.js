'use strict';
var getEnvPath = require('./get-env-path');
var path = require('path').win32;
var fs = require('fs');
var lxssFs;
var localAppdata = getEnvPath(process.env, 'LOCALAPPDATA');
(function () {
	if (localAppdata) {
		lxssFs = path.join(localAppdata, 'lxss/rootfs');
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
