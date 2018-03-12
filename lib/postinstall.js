'use strict';
var pathStartsWith = require('./path-starts-with');
var osArch = require('git-win/lib/os-arch');
var cp = require('child_process');
var path = require('path');
var fs = require('fs');
var os = require('os');

try {
	var promisify = (require('util').promisify || require('util.promisify'));
} catch (ex) {
	//
}
var envTypes = {
	global: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment',
	user: 'HKCU\\Environment',
};
var envPath = {};

function getPathFromRegstry (global) {
	var args = [
		'QUERY',
		global ? envTypes.global : envTypes.user,
		'/v',
		'Path',
	];

	if (osArch === 64) {
		args.push('/reg:' + osArch);
	}

	var regQuery = cp.spawnSync('reg.exe', args);
	if (!regQuery.status && regQuery.stdout && /^\s*Path\s+REG(?:_[A-Z]+)+\s+(.+?)$/im.test(regQuery.stdout.toString())) {
		var path = RegExp.$1;
		envPath[global ? 'global' : 'user'] = path;
		return path;
	}
}

function upEnv (value, global) {
	var args = [
		'ADD',
		global ? envTypes.global : envTypes.user,
		'/v',
		'Path',
		'/d',
		value,
		'/f',
	];

	if (osArch === 64) {
		args.push('/reg:' + osArch);
	}
	cp.spawnSync('reg.exe', args, {
		stdio: 'ignore',
	});
}

function getPath (global) {
	return getPathFromRegstry(global).split(/\s*;\s*/).filter(Boolean);
}

function configEnvPath () {
	var gitDir = require('./git-dir');
	var globalPath = getPath(true);
	var userPath = getPath().filter(function (dir) {
		return pathStartsWith(dir) == null && !/^%USERPROFILE%([\\/])(?:.+\1)?bin$/.test(dir);
	});

	var homePath = [
		'bin',
		'.local/bin',
	].map(function (subDir) {
		return path.win32.join('%USERPROFILE%', subDir);
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

	var newPath = [].concat(
		userPath,
		homePath,
		gitPath
	).filter(function (dir) {
		return globalPath.indexOf(dir) < 0;
	});
	newPath.push('');
	newPath = newPath.join(';');

	if (envPath.user === newPath) {
		return;
	}

	upEnv(newPath);
	cp.spawnSync('setx.exe', [
		'Path',
		newPath,
	], {
		stdio: 'ignore',
	});
}

function linkBinFile (binDir, binFile, cmds) {
	binFile = require.resolve(binFile);
	return promisify(fs.readFile)(binFile, 'utf8').then(function (data) {
		binFile = path.relative(binDir, binFile).replace(/\//g, '\\');
		if (/^#!(?:\S*\benv\s+)?(.+?)\s*(?:\r?\n|$)/.test(data)) {
			data = `@${RegExp.$1} "%~dp0\\${binFile}" %*`;
		} else if (/(?:cmd|bat)$/.test(binFile)) {
			var baseDir = path.win32.dirname(binFile);
			data = data.replace(/(%~dp0)\\?([\w\\.]+)/g, function (s, arg0, file) {
				if (fs.existsSync(path.resolve('bin', file))) {
					s = [
						arg0,
						baseDir,
						file,
					].join('\\');
				}
				return s;
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

var binDir = pathStartsWith(__dirname, process.env.npm_config_prefix) ? process.env.npm_config_prefix : process.cwd().replace(/(([\\/])node_modules\1.+)?$/, '/node_modules/.bin');

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

if (process.platform === 'win32' || os.release().includes('Microsoft')) {
	configEnvPath();
}
