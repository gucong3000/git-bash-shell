'use strict';
var pathStartsWith = require('./path-starts-with');
var getEnvPath = require('./get-env-path');
var lxssFs = require('./lxss-fs');
var gitDir = require('git-win');
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
	return dir !== wrapPath;
});

var prefixPath = [
	'%HOME%/bin',
	'%HOME%/.local/bin',
].filter(notInclude);

var gitPath = [
	'usr/bin',
	'cmd',
	'usr/share/vim/vim74',
	'usr/bin/vendor_perl',
	'usr/bin/core_perl',
].map(function (subDir) {
	return path.join(gitDir, subDir);
}).filter(notInclude);

var lxssPath = [
	'usr/local/sbin',
	'usr/local/bin',
	'usr/sbin',
	'usr/bin',
	'sbin',
	'bin',
].map(function (subDir) {
	return lxssFs(subDir);
}).filter(notInclude);

function notInclude (dir) {
	return originalPath.indexOf(dir) < 0;
}

originalPath.unshift(wrapPath);
process.env.Path = originalPath.concat(prefixPath, gitPath, lxssPath, sysPath).filter(Boolean).join(';');
