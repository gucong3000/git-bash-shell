'use strict';
var cp = require('child_process');
var path = require('path');
var fs = require('fs');
try {
	var promisify = (require('util').promisify || require('util.promisify'));
} catch (ex) {
	//
}

function configEnvPath () {
	var gitPath = require('git-win');
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

	function getPathFromRegstry (global, platform) {
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
		return (getPathFromRegstry(global) || getPathFromRegstry(global, 64) || getPathFromRegstry(global, 32)).split(/\s*;\s*/).filter(Boolean);
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
}

var isModule = /(\\|\/)node_modules\1/.test(__dirname);

function linkBinFile (binDir, binFile, cmds) {
	binFile = require.resolve(binFile);
	return promisify(fs.readFile)(binFile, 'utf8').then(function (data) {
		binFile = path.relative(binDir, binFile);
		if (/^#!(?:\S*\benv\s+)?(.+?)\s*(?:\r?\n|$)/.test(data)) {
			data = `@${RegExp.$1} "%~dp0\\${binFile}" %*`;
		} else if (/(?:cmd|bat)$/.test(binFile)) {
			var baseDir = path.dirname(binFile);
			data = data.replace(/(%~dp0)\\?(\S+)/g, function (s, arg0, file) {
				return [
					arg0,
					baseDir,
					file,
				].join(path.sep);
			});
		} else {
			data = `@"%~dp0\\${binFile}" %*`;
		}
		return Promise.all(cmds.map(function (name) {
			return promisify(fs.writeFile)(
				path.join(binDir, name + '.cmd'),
				data.replace(/%0\b/g, name)
			);
		}));
	});
}

if (promisify) {
	var binDir = isModule ? __dirname.replace(/((\\|\/)node_modules\2).+$/, '$1.bin') : __dirname.replace(/[^\\/]+$/, path.join('node_modules', '.bin'));
	promisify(fs.mkdir)(binDir).catch(function () {

	}).then(function () {
		linkBinFile(binDir, '../bin/shell.cmd', [
			'bash',
			'dash',
			'sh',
		]);
		linkBinFile(binDir, '../bin/$SHELL.cmd', [
			'$SHELL',
		]);
		linkBinFile(binDir, '../bin/env.cmd', ['env']);
		linkBinFile(binDir, '../', ['node']);
	});
}

if (process.platform === 'win32') {
	configEnvPath();
}
