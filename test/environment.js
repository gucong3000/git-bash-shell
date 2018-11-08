"use strict";
const expect = require("expect.js");
const gitWin = require("git-win");
require("../lib/env-value");

describe("environment", () => {
	describe("env-path", () => {
		let Path;
		before(() => {
			delete require.cache[require.resolve("../lib/env-path")];
			require("../lib/env-path");
			Path = process.env.Path.split(/\s*;\s*/);
		});

		[
			"node_modules/.bin",
			"~/bin",
			"~/.local/bin",
			"/usr/local/sbin",
			"/usr/local/bin",
			"/usr/sbin",
			"/usr/bin",
			"/sbin",
			"/bin",
			gitWin.toPosix("/mingw00/bin"),
		].forEach(dir => {
			it(dir, () => {
				expect(Path).to.contain(dir);
			});
		});
	});

	describe("env-lang", () => {
		beforeEach(() => {
			delete require.cache[require.resolve("../lib/env-lang")];
			delete process.env.LANG;
		});
		it("LANG", async () => {
			await require("../lib/env-lang");
			expect(process.env.LANG).to.match(/^[a-z]+(?:_[A-Z]+)\.UTF-8$/i);
		});
	});
});
