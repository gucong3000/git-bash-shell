"use strict";
const pathStartsWith = require("./path-starts-with");
const osArch = require("git-win/lib/os-arch");
const cp = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
let promisify;
try {
	promisify = (require("util").promisify || require("util.promisify"));
} catch (ex) {
	//
}
const envTypes = {
	global: "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
	user: "HKCU\\Environment",
};
const envPath = {};

function getPathFromRegstry (global) {
	const args = [
		"QUERY",
		global ? envTypes.global : envTypes.user,
		"/v",
		"Path",
	];

	if (osArch === 64) {
		args.push("/reg:" + osArch);
	}

	const regQuery = cp.spawnSync("reg.exe", args);
	if (!regQuery.status && regQuery.stdout && /^\s*Path\s+REG(?:_[A-Z]+)+\s+(.+?)$/im.test(regQuery.stdout.toString())) {
		const path = RegExp.$1;
		envPath[global ? "global" : "user"] = path;
		return path;
	}
}

function upEnv (value, global) {
	const args = [
		"ADD",
		global ? envTypes.global : envTypes.user,
		"/v",
		"Path",
		"/d",
		value,
		"/f",
	];

	if (osArch === 64) {
		args.push("/reg:" + osArch);
	}
	cp.spawnSync("reg.exe", args, {
		stdio: "ignore",
	});
}

function getPath (global) {
	return getPathFromRegstry(global).split(/\s*;\s*/).filter(Boolean);
}

function configEnvPath () {
	const gitDir = require("./git-dir");
	const globalPath = getPath(true);
	const userPath = getPath().filter((dir) => {
		return pathStartsWith(dir) == null && !/^%USERPROFILE%([\\/])(?:.+\1)?bin$/.test(dir);
	});

	const homePath = [
		"bin",
		".local/bin",
	].map((subDir) => {
		return path.win32.join("%USERPROFILE%", subDir);
	});

	const gitPath = [
		gitDir.mingw + "/bin",
		"usr/bin",
		"cmd",
		"usr/share/vim/vim74",
		"usr/bin/vendor_perl",
		"usr/bin/core_perl",
	].map((subDir) => {
		return gitDir(subDir);
	});

	let newPath = [].concat(
		userPath,
		homePath,
		gitPath
	).filter((dir) => {
		return globalPath.indexOf(dir) < 0;
	});
	newPath.push("");
	newPath = newPath.join(";");

	if (envPath.user === newPath) {
		return;
	}

	upEnv(newPath);
	cp.spawnSync("setx.exe", [
		"Path",
		newPath,
	], {
		stdio: "ignore",
	});
}

function linkBinFile (binDir, binFile, cmds) {
	binFile = require.resolve(binFile);
	return promisify(fs.readFile)(binFile, "utf8").then((data) => {
		binFile = path.relative(binDir, binFile).replace(/\//g, "\\");
		if (/^#!(?:\S*\benv\s+)?(.+?)\s*(?:\r?\n|$)/.test(data)) {
			data = `@${RegExp.$1} "%~dp0\\${binFile}" %*`;
		} else if (/(?:cmd|bat)$/.test(binFile)) {
			const baseDir = path.win32.dirname(binFile);
			data = data.replace(/(%~dp0)\\?([\w\\.]+)/g, (s, arg0, file) => {
				if (fs.existsSync(path.resolve("bin", file))) {
					s = [
						arg0,
						baseDir,
						file,
					].join("\\");
				}
				return s;
			});
		} else {
			data = `@"%~dp0\\${binFile}" %*`;
		}
		return Promise.all(cmds.map((name) => {
			return promisify(fs.writeFile)(
				path.join(binDir, name + ".cmd"),
				data.replace(/%0\b/g, name)
			);
		}));
	});
}

const binDir = pathStartsWith(__dirname, process.env.npm_config_prefix) ? process.env.npm_config_prefix : process.cwd().replace(/(([\\/])node_modules\1.+)?$/, "/node_modules/.bin");

promisify(fs.mkdir)(binDir).catch(() => {

}).then(() => {
	linkBinFile(binDir, "../bin/shell.cmd", [
		"bash",
		"dash",
		"sh",
	]);
	linkBinFile(binDir, "../bin/$SHELL.cmd", [
		"$SHELL",
	]);
	linkBinFile(binDir, "../bin/env.cmd", ["env"]);
	linkBinFile(binDir, "../", ["node"]);
});

if (process.platform === "win32" || os.release().includes("Microsoft")) {
	configEnvPath();
}
