"use strict";
const promisify = require("util").promisify || require("util.promisify");
const getEnvValue = require("./get-env-value");
const getPath = require("./env-path");
const spawn = require("./spawn");
const gitWin = require("git-win");
const path = require("path");
const fs = require("fs");
const binDir = path.resolve(__dirname, "../bin");
const windir = getEnvValue("SystemRoot");

function set (key, value) {
	value = value || process.env[key];
	if (value) {
		console.log(`set "${key}=${value}"`);
	}
}

async function login () {
	const env = await spawn([
		gitWin.toWin32("/usr/bin/env.exe"),
		"--ignore-environment",
		"HOME=" + gitWin.toPosix(getEnvValue("HOME")),
		"/bin/sh",
		// gitWin.toWin32("/bin/sh"),
		"--login",
		"-c",
		"env",
	], {
		env: {
			MSYSTEM: gitWin.mingw.toUpperCase(),
		},
		encoding: "utf8",
	});
	env.split(/[\r\n]+/g).forEach(env => {
		if (!env || /^(?:!.+|_|(?:ORIGINAL|MSYSTEM|MINGW)(?:_.+)?|HOME|PWD|SHELL|TERM|PS1|SHLVL|SYSTEMROOT|WINDIR)=/i.test(env) || /=\/mingw\d+(?=\/|$)/.test(env)) {
			return;
		} else if (/^PATH=/i.test(env)) {
			return initPath(env.slice(5).split(/:/g));
		}
		console.log(`set "${env}"`);
	});
}

async function npmrc () {
	const nodeDir = path.dirname(process.execPath);
	const readFile = promisify(fs.readFile);
	async function read (file) {
		try {
			const ini = require(path.join(nodeDir, "node_modules/npm/node_modules/ini/ini.js"));
			const contents = await readFile(file, "utf8");
			return ini.parse(contents);
		} catch (ex) {
			return {};
		}
	}

	const npmConfig = {
		prefix: process.env.npm_config_prefix || path.join(process.env.APPDATA, "npm"),
		"https-proxy": process.env.npm_config_https_proxy,
		"http-proxy": process.env.npm_config_http_proxy,
		shell: process.env.npm_config_shell,
	};

	await Promise.all(
		[
			path.join(npmConfig.prefix, "etc/npmrc"),
			path.join(getEnvValue("HOME"), ".npmrc"),
			".npmrc",
		].map(read)
	).then(config => {
		Object.assign(npmConfig, ...config);
	});

	if (!process.env.SHELL && npmConfig.shell && !/^(?:.*\\)?cmd(?:\.exe)?$/i.test(npmConfig.shell)) {
		process.env.SHELL = npmConfig.shell;
	}
	if (!process.env.npm_config_prefix) {
		process.env.npm_config_prefix = npmConfig.prefix;
	}
	if (!process.env.https_proxy && npmConfig["https-proxy"]) {
		process.env.https_proxy = npmConfig["https-proxy"];
	}
	if (!process.env.http_proxy && npmConfig["http-proxy"]) {
		process.env.http_proxy = npmConfig["http-proxy"];
	}
}

function initPath (envPath) {
	const win32Path = [
		binDir,
		"node_modules/.bin",
		process.env.npm_config_prefix || path.join(getEnvValue("APPDATA"), "npm"),
		path.dirname(process.execPath),
		path.join(windir, "System32", "OpenSSH"),
		path.join(windir, "System32"),
		windir,
		process.env.Path,
	].join(";");

	envPath.some((dir, i) => {
		if (dir === ".") {
			envPath[i] = win32Path;
			return true;
		}
	});

	process.env.Path = envPath.join(";");

	set("PATH", getPath().join(";"));
}

delete process.env.GIT_BASH_SHELL_INIT;

npmrc().then(async () => {
	if (process.env.ProgramData) {
		set("CMDER_ROOT", path.join(process.env.ProgramData, "Cmder"));
	}
	set("GIT_INSTALL_ROOT", gitWin.root);
	set("SHELL");
}).then(login);
