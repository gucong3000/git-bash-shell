var osHomedir = require('os-homedir');
var path = require('path').win32;
var findFile = require('./find-file');
var shebang = require('./shebang');
var gitPath = require('git-win');

function fixFn(object, fnName) {
	var oldFn = object[fnName];
	object[fnName] = function(options) {
		try {
			fixOpts(options);
		} catch(ex) {
			//
		}
		return oldFn.call(this, options);
	};
}

function fixShellArgs(options) {
	if(options.args[0] === options.file && /\/(?:ba)?sh(?:\.\w+)?$/.test(options.file)) {
		for(var i = 1; i < options.args.length - 1; i++) {
			if(!/^\/\w+$/.test(options.args[i])) {
				return;
			}
		}
		var args = options.args[options.args.length - 1];
		options.args = [options.args[0], '-c', args.slice(1, args.length - 1)];
		options.windowsVerbatimArguments = false;
	}
}

function fixOpts(options) {
	function resolve() {
		return path.resolve(options.cwd || process.cwd(), options.file);
	}

	function setFile(file) {
		if(file) {
			options.file = file;
		}
	}

	fixShellArgs(options);

	if(/^~\//.test(options.file)) {
		// 处理linux风格的home路径
		setFile(findFile([path.join(osHomedir(), options.file.slice(2))]));
	} else if(/^[\\\/]/.test(options.file)) {
		// 处理linux风格的绝对路径
		setFile(findFile([path.join(gitPath, options.file.slice(1))]));
	} else if(/^[^\\\/\.]+$/.test(options.file)) {
		// 处理无路径, 无扩展名的命令名称
		var envPath;
		options.envPairs.some(function(value) {
			// 处理环境变量path
			if(/^PATH=/i.test(value)) {
				envPath = value.slice(5).split(';');
			}
			return envPath;
		});

		envPath = envPath.map(function(dir) {
			return path.join(dir, options.file);
		});
		envPath.unshift(resolve());
		setFile(findFile(envPath));
	} else {
		setFile(findFile([resolve()]));
	}

	if(!/\.(?:exe|cmd|bat|com)$/i.test(options.file)) {
		var shebangArgs = shebang(options.file);
		if(shebangArgs) {
			options.file = shebangArgs[0];
			options.args = shebangArgs.concat(options.args);
			fixOpts(options);
		}
	}
}

fixFn(require('child_process').ChildProcess.prototype, 'spawn');
fixFn(process.binding('spawn_sync'), 'spawn');
process.env.comspec = '/bin/bash';
