"use strict";
const reg = require("./reg");
const env = process.env;

async function getInternetSettings () {
	const settings = await reg.query("HKCU/Software/Microsoft/Windows/CurrentVersion/Internet Settings");
	const result = {};
	if (settings.ProxyEnable && settings.ProxyServer) {
		settings.ProxyServer.split(";").forEach(server => {
			server = /^(?:(\w+)=)?(.+)/.exec(server);
			if (server && (!server[1] || /^https?$/.test(server[1]))) {
				const key = (server[1] || "https") + "_proxy";
				result[key] = "http://" + server[2];
			}
		});
		if (!result.http_proxy && result.https_proxy) {
			result.http_proxy = result.https_proxy;
		}
	} else if (settings.AutoConfigURL) {
		result.https_proxy = settings.AutoConfigURL.replace(/^(\w+:\/\/[^/]+).*/, "$1");
		result.http_proxy = result.https_proxy;
	}
	return result;
}

module.exports = (async () => {
	if (env.https_proxy && env.http_proxy) {
		return;
	}
	const settings = await getInternetSettings();
	Object.keys(settings).forEach(key => {
		if (!(key in process.env)) {
			process.env[key] = settings[key];
		}
	});
})();
