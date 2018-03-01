'use strict';
var getEnvPath = require('./get-env-path');
var path = require('path');
var fs = require('fs');
var lxssFs;
var localAppdata = getEnvPath(process.env, 'LOCALAPPDATA');
if (localAppdata) {
	lxssFs = path.join(localAppdata, 'lxss/rootfs');
	lxssFs = fs.existsSync(lxssFs) && path.join.bind(path, lxssFs);
}
module.exports = lxssFs || function () {};
