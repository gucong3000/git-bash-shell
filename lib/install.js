'use strict';
var cp = require('child_process');
var gitPath = require('git-win');
var path = require('path');
var globalPath = getPath(true);
var userPath = getPath().filter(function (dir) {
	return !dir.startsWith(gitPath);
});
var newPath = [
	'cmd',
	'usr/bin',
	'usr/share/vim/vim74',
].map(function (subDir) {
	return path.join(gitPath, subDir);
}).filter(function (dir) {
	return globalPath.indexOf(dir) < 0;
});

function getPathDirByRegstry (global, platform) {
	var args = [
		'QUERY',
		global ? 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment' : 'HKCU\\Environment',
		'/v',
		'Path',
	];

	if (platform) {
		args.push('/reg:' + platform);
	}

	var regQuery = cp.spawnSync('REG', args);
	if (!regQuery.status && /^\s*Path\s+REG(?:_[A-Z]+)+\s+(.+?)$/m.test(regQuery.stdout.toString())) {
		return RegExp.$1;
	}
}

function getPath (global) {
	return (getPathDirByRegstry(global) || getPathDirByRegstry(global, 64) || getPathDirByRegstry(global, 32)).split(/\s*;\s*/).filter(Boolean);
}

newPath = userPath.concat(newPath);
newPath.push('');
newPath = newPath.join(';');
if (cp.spawnSync('SETX', [
	'Path',
	newPath,
]).status) {
	cp.spawnSync('SETX', [
		'Path',
		'REG',
		'ADD',
		'HKCU\\Environment',
		'/v',
		'Path',
		'/d',
		newPath,
		'/f',
	]);
}
