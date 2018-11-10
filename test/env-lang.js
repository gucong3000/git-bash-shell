"use strict";
const expect = require("expect.js");
// const gitWin = require("git-win");

describe("env-lang", () => {
	beforeEach(() => {
		delete process.env.LANG;
		delete require.cache[require.resolve("../lib/env-lang")];
	});

	it("LANG=", async () => {
		await require("../lib/env-lang");
		expect(process.env.LANG).to.match(/\w+.UTF-8$/);
		expect(process.env.LANG).to.not.equal("C.UTF-8");
	});

	it("LANG=hans", async () => {
		process.env.LANG = "hans";
		await require("../lib/env-lang");
		expect(process.env.LANG).to.match(/\w+.UTF-8$/);
		expect(process.env.LANG).to.not.equal("C.UTF-8");
	});

	it("LANG=hans", async () => {
		process.env.LANG = "C.UTF-8";
		await require("../lib/env-lang");
		expect(process.env.LANG).to.match(/\w+.UTF-8$/);
		expect(process.env.LANG).to.not.equal("C.UTF-8");
	});

	it("LANG=en_US.UTF-8", async () => {
		process.env.LANG = "en_US.UTF-8";
		await require("../lib/env-lang");
		expect(process.env.LANG).to.equal("en_US.UTF-8");
	});

	it("LANG=zh_CN.UTF-8", async () => {
		process.env.LANG = "zh_CN.UTF-8";
		await require("../lib/env-lang");
		expect(process.env.LANG).to.equal("zh_CN.UTF-8");
	});
});
