'use strict';
var pathStartsWith = require('./path-starts-with');
var getEnvPath = require('./get-env-path');
var lxssFs = require('./lxss-fs');
var gitDir = require('./git-dir');
var path = require('path');
var wrapPath = path.resolve(__dirname, '../bin/wrap');
var sysPath = [];

var originalPath = getEnvPath().filter(function (dir) {
	function startsWith (prefix) {
		var value = process.env[prefix];
		return value && pathStartsWith(dir, value) != null;
	}

	if (startsWith('SystemRoot') || startsWith('windir')) {
		sysPath.push(dir);
		return false;
	}

	// return pathStartsWith(dir) == null && !/^%USERPROFILE%([\\/])(?:.+\1)?bin$/.test(dir);
	// || pathStartsWith(dir, '%HOME%') || pathStartsWith(dir, getEnvPath(process.env, 'HOME'))
	return (pathStartsWith(dir, wrapPath) || pathStartsWith(dir)) == null;
});

// var homePath = [
// 	'bin',
// 	'.local/bin',
// ].map(function (subDir) {
// 	return path.join('%HOME%', subDir);
// });

var gitPath = [
	gitDir.mingw + '/bin',
	'usr/bin',
	'cmd',
	'usr/share/vim/vim74',
	'usr/bin/vendor_perl',
	'usr/bin/core_perl',
].map(function (subDir) {
	return gitDir(subDir);
});

var lxssPath = [
	'usr/local/sbin',
	'usr/local/bin',
	'usr/sbin',
	'usr/bin',
	'sbin',
	'bin',
].map(function (subDir) {
	return lxssFs(subDir);
});

process.env.Path = [].concat(
	wrapPath,
	originalPath,
	// homePath,
	gitPath,
	lxssPath,
	sysPath
).filter(Boolean).join(';');
module.exports = process.env.Path;
