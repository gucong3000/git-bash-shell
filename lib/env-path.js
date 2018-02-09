'use strict';
var getEnvPath = require('./get-env-path');
var gitDir = require('git-win');
var path = require('path');
var wrapPath = path.resolve(__dirname, '../bin/wrap');
var sysPath = [];

var originalPath = getEnvPath().filter(function (dir) {
	function startsWith (prefix) {
		var value = process.env[prefix];
		return value && dir.startsWith(value);
	}

	if (startsWith('SystemRoot') || startsWith('windir')) {
		sysPath.push(dir);
		return false;
	}
	return dir !== wrapPath;
});
var gitPath = [
	'cmd',
	'usr/bin',
	'usr/share/vim/vim74',
].map(function (subDir) {
	return path.join(gitDir, subDir);
}).filter(function (dir) {
	return originalPath.indexOf(dir) < 0;
});

originalPath.unshift(wrapPath);
process.env.Path = originalPath.concat(gitPath, sysPath).join(';');
