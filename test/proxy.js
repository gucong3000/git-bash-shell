"use strict";
const expect = require("expect.js");
const regKey = "HKCU/Software/Microsoft/Windows/CurrentVersion/Internet Settings";
const proxyScript = require.resolve("../lib/env-proxy");
const reg = require("../lib/reg");

async function reload (settings, env) {
	delete process.env.http_proxy;
	delete process.env.https_proxy;
	if (env) {
		Object.assign(process.env, env);
	}
	await reg.add(regKey, settings);
	delete require.cache[proxyScript];
	await require(proxyScript);
}
// const shebang = require("../lib/shebang");
describe("proxy", () => {
	it("AroxyServer => mock.server.test:1080", async () => {
		await reload({
			ProxyEnable: 1,
			ProxyServer: "mock.server.test:1080",
			AutoConfigURL: null,
		});
		expect(process.env.http_proxy).to.equal("http://mock.server.test:1080");
		expect(process.env.https_proxy).to.equal("http://mock.server.test:1080");
	});

	it("AroxyServer => not assign", async () => {
		await reload({
			ProxyEnable: 1,
			ProxyServer: "mock.server.assign:1080",
			AutoConfigURL: null,
		}, {
			http_proxy: "http://mock.server.loacl:1080",
			https_proxy: "http://mock.server.loacl:1080",
		});
		expect(process.env.http_proxy).to.equal("http://mock.server.loacl:1080");
		expect(process.env.https_proxy).to.equal("http://mock.server.loacl:1080");
	});

	it("AroxyServer => do not part assign", async () => {
		await reload({
			ProxyEnable: 1,
			ProxyServer: "mock.server.assign:1080",
			AutoConfigURL: null,
		}, {
			http_proxy: "http://mock.server.loacl:1080",
		});
		expect(process.env.http_proxy).to.equal("http://mock.server.loacl:1080");
		expect(process.env.https_proxy).to.equal(undefined);
	});

	it("AroxyServer => ftp=mock.server.ftp:123;https=mock.server.https:123", async () => {
		await reload({
			ProxyEnable: 1,
			ProxyServer: "https=mock.server.https:123;ftp=asdasdas:123",
			AutoConfigURL: null,
		});
		expect(process.env.http_proxy).to.equal("http://mock.server.https:123");
		expect(process.env.https_proxy).to.equal("http://mock.server.https:123");
	});

	it("AroxyServer => http=mock.server.http:321;https=mock.server.https:321", async () => {
		await reload({
			ProxyEnable: 1,
			ProxyServer: "http=mock.server.http:321;https=mock.server.https:321",
			AutoConfigURL: null,
		});
		expect(process.env.http_proxy).to.equal("http://mock.server.http:321");
		expect(process.env.https_proxy).to.equal("http://mock.server.https:321");
	});

	it("AutoConfigURL", async () => {
		await reload({
			ProxyEnable: 0,
			ProxyServer: null,
			AutoConfigURL: "http://mock.server.pac/pac",
		});
		expect(process.env.http_proxy).to.equal("http://mock.server.pac");
		expect(process.env.https_proxy).to.equal("http://mock.server.pac");
	});

	it("disable", async () => {
		await reload({
			ProxyEnable: 0,
			ProxyServer: null,
			AutoConfigURL: null,
		});
		expect(process.env.http_proxy).to.not.ok();
		expect(process.env.https_proxy).to.not.ok();
	});
});
