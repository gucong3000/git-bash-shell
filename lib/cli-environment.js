"use strict";
const path = require("path");

function setEnv (key, value) {
	value = process.env[value || key];
	if (value) {
		return `set "${key}=${value}"`;
	}
}

Promise.all(
	[
		"lang",
		"path",
		"value",
		"proxy",
	].map(pack => require("./env-" + pack))
).then(() => {
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
		setEnv("npm_config_shell"),
		setEnv("npm_config_script_shell"),
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
});
