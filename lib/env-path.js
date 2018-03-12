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
		var value = pathStartsWith(dir, '%' + prefix + '%');
		if (value == null) {
			value = getEnvPath(process.env, prefix);
			value = value && pathStartsWith(dir, value);
		}

		return value;
	}

	if (startsWith('SystemRoot') != null || startsWith('windir') != null) {
		sysPath.push(dir);
		return false;
	}

	var homePath = startsWith('HOME') || startsWith('USERPROFILE');
	if (homePath && /^([\\/])(?:.+\1)?bin$/.test(homePath)) {
		return false;
	}

	return (pathStartsWith(dir, wrapPath) || pathStartsWith(dir)) == null;
});

var home = getEnvPath(process.env, 'HOME') || getEnvPath(process.env, 'USERPROFILE');

var homePath = [
	'bin',
	'.local/bin',
].map(function (subDir) {
	return path.join(home, subDir);
});

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

process.env.PATH = [].concat(
	wrapPath,
	originalPath,
	homePath,
	gitPath,
	lxssPath,
	sysPath
).filter(Boolean).join(path.delimiter);

module.exports = process.env.PATH;
