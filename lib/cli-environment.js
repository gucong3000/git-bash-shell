"use strict";
const getEnvValue = require("./get-env-value");
const win32Path = require("./win32-path");
const getPath = require("./env-path");
const spawn = require("./spawn");
const path = require("path");

function setEnv (key, value) {
	value = process.env[value || key];
	if (value) {
		return `set "${key}=${value}"`;
	}
}

function findNpmCli (...dir) {
	dir = path.join.bind(path.posix, ...dir);
	try {
		return require.resolve(dir(require(dir("package.json")).bin.npm));
	} catch (ex) {
		//
	}
}

(async function () {
	if (!process.env.APPDATA) {
		process.env.APPDATA = getEnvValue("APPDATA");
	}
	const prefix = process.env.npm_config_prefix || path.join(process.env.APPDATA, "npm");
	const localNpmCliPath = findNpmCli("npm");
	let npmCliPath = "node_modules/npm";
	npmCliPath = localNpmCliPath || findNpmCli(prefix, npmCliPath) || findNpmCli(path.dirname(process.execPath), npmCliPath);
	const npmConfig = JSON.parse(
		await spawn([
			// gitDir("/usr/bin/env.exe"),
			process.execPath,
			npmCliPath,
			"config",
			"list",
			"--json",
		], {
			encoding: "utf8",
		})
	);

	process.env.npm_execpath = localNpmCliPath || (npmConfig.prefix !== prefix && findNpmCli(npmConfig.prefix, "node_modules/npm")) || npmCliPath;

	Object.keys(npmConfig).forEach(key => {
		const envKey = "npm_config_" + key.replace(/-/g, "_");
		if (npmConfig[key] && process.env[envKey] == null) {
			process.env[envKey] = npmConfig[key];
		}
	});

	await Promise.all([
		require("./env-path"),
		require("./env-lang"),
		require("./env-proxy"),
		require("./env-value"),
	]);

	if (process.env.npm_config_shell) {
		if (/^(?:.*\\)?cmd(?:\.exe)?$/i.test(process.env.npm_config_shell)) {
			delete process.env.npm_config_shell;
		} else if (!process.env.SHELL) {
			process.env.SHELL = process.env.npm_config_shell;
		}
	}

	process.env.Path = getPath().map(dir => (
		win32Path([dir])
	)).join(";");
	process.stdout.write([
		setEnv("Path"),
		setEnv("LANG"),
		setEnv("http_proxy"),
		setEnv("https_proxy"),
		// setEnv("npm_config_onload_script"),
		setEnv("npm_config_prefix"),
		setEnv("npm_execpath"),
		setEnv("SHELL"),
		setEnv("GIT_INSTALL_ROOT"),
		// setEnv("npm_config_shell"),
		// setEnv("npm_config_script_shell"),
		// setEnv("npm_package_scripts_env"),
		// `set "GIT_INSTALL_ROOT=${gitDir.dir}"`,
	].filter(Boolean).join("\r\n"));
})();
