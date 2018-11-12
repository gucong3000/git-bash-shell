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
		// setEnv("npm_config_onload_script"),
		// setEnv("npm_config_prefix"),
		// setEnv("npm_execpath"),
		setEnv("HOME"),
		setEnv("SHELL"),
		setEnv("http_proxy"),
		setEnv("https_proxy"),
		setEnv("npm_config_shell"),
		setEnv("npm_config_script_shell"),
		// setEnv("npm_package_scripts_env"),
		// `set "GIT_INSTALL_ROOT=${gitDir.dir}"`,
	].filter(Boolean).join("\r\n"));
});
