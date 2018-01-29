'use strict';
var osHomedir = require('os-homedir');
var path = require('path').win32;
var findFile = require('./find-file');
var shebang = require('./shebang');
var gitPath = require('git-win');

function fixFn (object, fnName) {
	var oldFn = object[fnName];
	object[fnName] = function (options) {
		try {
			fixOpts(options);
		} catch (ex) {
			//
		}
		return oldFn.call(this, options);
	};
}

function getPath (options) {
	var env = {};
	var path;
	options.envPairs.forEach(function (value) {
		if (/^(.+?)=(.+$)/.test(value)) {
			env[RegExp.$1] = RegExp.$2;
			if (/^PATH=/i.test(value)) {
				path = value.slice(5);
			}
		}
	});
	function getEnv (value) {
		return value.replace(/%(.+?)%/g, function (s, envKey) {
			return env[envKey] ? getEnv(env[envKey]) : s;
		});
	}
	return path && path.split(';').filter(Boolean).map(getEnv);
}

function fixShellArgs (options) {
	if (/(^|[/\\])(?:ba|da|z)?sh(?:\.exe)?$/.test(options.args[0])) {
		// 判断参数是否为“/d /s /c”
		for (var i = 1; i < options.args.length - 1; i++) {
			if (!/^\/\w+$/.test(options.args[i])) {
				return;
			}
		}
		var args = options.args[options.args.length - 1];

		args = args.slice(1, args.length - 1);
		options.args = [options.args[0], '-c', args];
		options.windowsVerbatimArguments = false;
	}
}

// 可执行文件路径查找
function fixFilePath (options) {
	var pwd = options.cwd || process.cwd();
	function resolve (file) {
		return path.resolve(pwd, file || options.file);
	}

	function setFile (file) {
		if (file) {
			options.file = file;
		}
	}
	if (/^~\//.test(options.file)) {
		// 处理linux风格的home路径
		setFile(findFile([path.join(osHomedir(), options.file.slice(2))]));
	} else if (/^\//.test(options.file)) {
		// 处理linux风格的绝对路径
		setFile(findFile([path.join(gitPath, options.file.slice(1))]));
	} else if (/^[^\\/.]+$/.test(options.file)) {
		// 处理无路径, 无扩展名的命令名称
		var envPath = getPath(options).map(function (dir) {
			return resolve(path.join(dir, options.file));
		});
		envPath.unshift(resolve());
		setFile(findFile(envPath));
	} else {
		setFile(findFile([resolve()]));
	}
	fixShebang(options);
}

// 文件shebang读取
function fixShebang (options) {
	if (!/\.(?:exe|cmd|bat|com)$/i.test(options.file)) {
		var shebangArgs = shebang(options.file);
		if (shebangArgs) {
			// 写入shebang解析结果
			options.file = shebangArgs[0];
			options.args = shebangArgs.concat(options.args.slice(1));
			fixFilePath(options);
		}
	}
}

function fixOpts (options) {
	fixShellArgs(options);
	fixFilePath(options);
	options.args = options.args.map(function (file) {
		if (file.startsWith(gitPath)) {
			// 如果是git目录下的可执行文件，将其路径处理为linux风格
			file = file.slice(gitPath.length).replace(/\\/g, '/');
		}
		return file;
	});
}

process.env.comspec = process.env.SHELL || '/usr/bin/bash';
fixFn(require('child_process').ChildProcess.prototype, 'spawn');
fixFn(process.binding('spawn_sync'), 'spawn');
