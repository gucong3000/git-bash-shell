"use strict";
const promisify = require("util").promisify || require("util.promisify");
const path = require("path");
const fs = require("fs");

function setEnv (key, value) {
	value = process.env[value || key];
	if (value) {
		return `set "${key}=${value}"`;
	}
}

async function npm () {
	require("./env-value");
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
	// function findNpmCli (pckName) {
	// 	try {
	// 		return require.resolve(path.join(pckName, require(pckName + "/package.json").bin.npm));
	// 	} catch (ex) {
	// 		//
	// 	}
	// }

	const npmConfig = {
		prefix: process.env.npm_config_prefix || path.join(process.env.APPDATA, "npm"),
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
		process.env.SHELL = npmConfig.shell;
	}
	if (!process.env.npm_config_prefix) {
		process.env.npm_config_prefix = npmConfig.prefix;
	}
	// if (!process.env.npm_execpath) {
	// 	const npmPath = prefix => path.join(prefix, "node_modules/npm");
	// 	process.env.npm_execpath = findNpmCli("npm") || findNpmCli(npmPath(npmConfig.prefix)) || findNpmCli(npmPath(nodeDir));
	// }
}

function stdout () {
	let cmder;
	const ProgramData = process.env.ProgramData;
	let cmderRoot = process.env.CMDER_ROOT;
	if (!cmderRoot && ProgramData) {
		cmderRoot = path.join(ProgramData, "Cmder");
		process.env.CMDER_ROOT = cmderRoot;
		cmder = subPath => `"${path.join(cmderRoot, subPath)}"`;
	}
	process.stdout.write([
		setEnv("PATH"),
		setEnv("LANG"),
		setEnv("HOME"),
		setEnv("SHELL"),
		setEnv("http_proxy"),
		setEnv("https_proxy"),
		setEnv("GIT_INSTALL_ROOT"),
		setEnv("CMDER_ROOT"),
		cmder && [
			cmder(`vendor/clink/clink_x${/64$/.test(process.env.PROCESSOR_ARCHITEW6432 || process.arch) ? "64" : "32"}.exe`),
			"inject",
			"--quiet",
			"--profile",
			cmder("config"),
			"--scripts",
			cmder("vendor"),
		].join(" "),
	].filter(Boolean).join("\r\n"));
}

npm().catch(() => {}).then(() => (
	Promise.all(
		[
			"lang",
			"path",
			"value",
			"proxy",
		].map(pack => require("./env-" + pack))
	)
)).then(stdout);
