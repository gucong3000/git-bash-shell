"use strict";
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
		// setEnv("npm_config_onload_script"),
		// setEnv("npm_package_scripts_env"),
		// setEnv("npm_config_prefix"),
		// setEnv("npm_execpath"),
	].filter(Boolean).join("\r\n"));
});
