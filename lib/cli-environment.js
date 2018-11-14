"use strict";
const promisify = require("util").promisify || require("util.promisify");
const getEnvValue = require("./get-env-value");
const getPath = require("./env-path");
const gitWin = require("git-win");
const path = require("path");
const fs = require("fs");
const binDir = path.resolve(__dirname, "../bin");
const windir = getEnvValue("SystemRoot");

function set (key, value) {
	value = value || process.env[key];
	if (value) {
		console.log(`set "${key}=${value || process.env[key]}"`);
	}
}

async function npmrc () {
	const nodeDir = path.dirname(process.execPath);
	const ini = require(path.join(nodeDir, "node_modules/npm/node_modules/ini/ini.js"));
	const readFile = promisify(fs.readFile);
	async function read (file) {
		try {
			file = await readFile(file, "utf8");
			return ini.parse(file);
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
			path.join(process.env.HOME, ".npmrc"),
			".npmrc",
		].map(read)
	).then(config => {
		Object.assign(npmConfig, ...config);
	});

	if (!process.env.SHELL && npmConfig.shell && !/^(?:.*\\)?cmd(?:\.exe)?$/i.test(npmConfig.shell)) {
		set("SHELL", npmConfig.shell);
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

function initPath () {
	let envPath = [
		binDir,
		"node_modules/.bin",
		"~/bin",
		"~/.local/bin",
		"/usr/local/sbin",
		"/usr/local/bin",
		"/usr/sbin",
		"/usr/bin",
		"/sbin",
		"/bin",
		"/" + gitWin.mingw + "/bin",
		// 'usr/games',
		// 'usr/local/games'
		process.env.npm_config_prefix || path.join(getEnvValue("APPDATA"), "npm"),
		path.dirname(process.execPath),
		path.join(windir, "System32", "OpenSSH"),
		path.join(windir, "System32"),
		windir,
	].concat(
		getPath()
	).map(dir => (
		gitWin.resolve(dir)
	));

	envPath = Array.from(new Set(envPath)).map(dir => (
		path.normalize(
			dir
				.replace(/^(?=\/|$)/, "%GIT_INSTALL_ROOT%")
				.replace(/^~(?=\/|\\|$)/, "%HOME%")
		)
	));

	set("PATH", envPath.join(";"));
}

function callCmder () {
	if (!process.env.ProgramData) {
		return;
	}
	const cmderRoot = path.join(process.env.ProgramData, "Cmder");
	set("CMDER_ROOT", cmderRoot);
	const cmder = dir => `"${path.join(cmderRoot, dir)}"`;
	const osArch = /64$/.test(process.env.PROCESSOR_ARCHITEW6432 || process.arch) ? 64 : 32;
	const clink = cmder(`vendor/clink/clink_x${osArch}.exe`);
	console.log(
		[
			clink,
			"inject",
			// "--autorun",
			"--quiet",
			"--profile",
			cmder("config"),
			"--scripts",
			cmder("vendor"),
		].join(" ")
	);
}

npmrc().catch().then(() => (
	Promise.all([
		require("./env-lang"),
		require("./env-proxy"),
	])
)).then(() => {
	set("GIT_INSTALL_ROOT", gitWin.root);
	set("HOME", getEnvValue("HOME"));
	initPath();
	set("https_proxy");
	set("http_proxy");
	set("LANG");
	callCmder();
});
