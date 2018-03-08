'use strict';
var pathStartsWith = require('./path-starts-with');
var isPosixShell = require('./is-posix-shell');
var getEnvPath = require('./get-env-path');
var findFile = require('./find-file');
var shebang = require('./shebang');
var lxssFs = require('./lxss-fs');
var gitDir = require('git-win');
var path = require('path');
var os = require('os');

function fixShellArgs (options) {
	if (!options.windowsVerbatimArguments || options.args.length < 3 || !isPosixShell(options.file) || options.args.slice(1, -1).some(function (arg) {
		return !/^\/\w+(?:\s+\/\w+)*$/.test(arg);
	})) {
		return;
	}

	options.windowsVerbatimArguments = false;
	var args = options.args[options.args.length - 1];

	if (/^".*"$/.test(args)) {
		args = args.slice(1, -1);
	}
	options.args = [options.args[0], '-c', args];
}

// 可执行文件路径查找
function fixFilePath (options, env) {
	var pwd = options.cwd || process.cwd();

	function resolve (file) {
		return path.resolve(pwd, file || options.file);
	}

	function setFile (file) {
		file = findFile(file, getEnvPath(env, 'PATHEXT'));
		if (file) {
			options.file = file;
		}
	}
	if (/(?:^|\\|\/)node(?:\.exe)?/i.test(options.file)) {
		options.args = [
			options.args.shift(),
			'--require',
			require.resolve('../'),

		].concat(options.args);
	} else if (/^~\//.test(options.file)) {
		// 处理linux风格的home路径

		var homeFile = options.file.slice(2);
		setFile([
			getEnvPath(env, 'HOME'),
			getEnvPath(env, 'USERPROFILE'),
			getEnvPath(process.env, 'HOME'),
			getEnvPath(process.env, 'USERPROFILE'),
			os.homedir(),
		].filter(Boolean).map(function (home) {
			return path.join(home, homeFile);
		}));
	} else if (/^\//.test(options.file)) {
		// 处理linux风格的绝对路径
		var file = options.file.slice(1);
		setFile([
			path.join(gitDir, file),
			lxssFs(file),
		]);
	} else {
		var envPath;
		if (path.isAbsolute(options.file)) {
			envPath = [];
		} else {
			envPath = getEnvPath(env).map(function (dir) {
				return resolve(path.join(dir, options.file));
			});
		}

		envPath.unshift(resolve());
		setFile(envPath);
	}
	fixShebang(options, env);
}

// 文件shebang读取
function fixShebang (options, env) {
	if (!/\.(?:exe|cmd|bat|com)$/i.test(options.file)) {
		var shebangArgs = shebang(options.file);
		if (shebangArgs) {
			// 写入shebang解析结果
			options.file = shebangArgs[0];
			options.args = shebangArgs.concat(options.args.slice(1));
			fixFilePath(options, env);
		}
	}
}

function fixSpawnArgs (options) {
	var env = {};
	options.envPairs.forEach(function (value) {
		if (/^(.+?)=(.*)$/.test(value)) {
			env[RegExp.$1] = RegExp.$2;
		}
	});
	fixShellArgs(options, env);
	fixFilePath(options, env);
	options.args = options.args.map(function (file) {
		return pathStartsWith(file, gitDir) || file;
	});
}

module.exports = fixSpawnArgs;
