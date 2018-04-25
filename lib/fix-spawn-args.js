"use strict";
const pathStartsWith = require("./path-starts-with");
const isPosixShell = require("./is-posix-shell");
const getEnvPath = require("./get-env-path");
const findFile = require("./find-file");
const shebang = require("./shebang");
const lxssFs = require("./lxss-fs");
const gitDir = require("./git-dir");
const path = require("path");
const os = require("os");

function fixShellArgs (options) {
	if (!options.windowsVerbatimArguments || options.args.length < 3 || !isPosixShell(options.file) || options.args.slice(1, -1).some((arg) => {
		return !/^\/\w+(?:\s+\/\w+)*$/.test(arg);
	})) {
		return;
	}

	options.windowsVerbatimArguments = false;
	let args = options.args[options.args.length - 1];

	if (/^".*"$/.test(args)) {
		args = args.slice(1, -1);
	}
	options.args = [options.args[0], "-c", args];
}

// 可执行文件路径查找
function fixFilePath (options, env) {
	const pwd = options.cwd || process.cwd();

	function resolve (file) {
		return path.resolve(pwd, file || options.file);
	}

	function setFile (file) {
		file = findFile(file, getEnvPath(env, "PATHEXT"));
		if (file) {
			options.file = file;
		}
	}
	if (/(?:^|\\|\/)node(?:\.exe)?$/i.test(options.file)) {
		options.args = [
			options.args.shift(),
			"--require",
			require.resolve("../"),
		].concat(options.args);
	} else if (/^~\//.test(options.file)) {
		// 处理linux风格的home路径

		const homeFile = options.file.slice(2);
		setFile([
			getEnvPath(env, "HOME"),
			getEnvPath(env, "USERPROFILE"),
			getEnvPath(process.env, "HOME"),
			getEnvPath(process.env, "USERPROFILE"),
			os.homedir(),
		].filter(Boolean).map((home) => {
			return path.join(home, homeFile);
		}));
	} else if (/^\//.test(options.file)) {
		// 处理linux风格的绝对路径
		const file = options.file.slice(1);
		setFile([
			gitDir(file),
			lxssFs(file),
		]);
	} else {
		let envPath;
		if (path.isAbsolute(options.file)) {
			envPath = [];
		} else {
			envPath = getEnvPath(env).map((dir) => {
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
		const shebangArgs = shebang(options.file);
		if (shebangArgs) {
			// 写入shebang解析结果
			options.file = shebangArgs[0];
			options.args = shebangArgs.concat(options.args.slice(1));
			fixFilePath(options, env);
		}
	}
}

function fixSpawnArgs (options) {
	const env = {};
	options.envPairs.forEach((value) => {
		if (/^(.+?)=(.*)$/.test(value)) {
			env[RegExp.$1] = RegExp.$2;
		}
	});
	fixShellArgs(options, env);
	fixFilePath(options, env);
	if (pathStartsWith(options.file) == null) {
		return;
	}
	options.args = options.args.map((file) => {
		return pathStartsWith(file) || file;
	});
}

module.exports = fixSpawnArgs;
