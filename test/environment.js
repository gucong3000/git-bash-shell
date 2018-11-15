"use strict";
const expect = require("expect.js");
const gitWin = require("git-win");
const path = require("path");
require("../lib/env-value");

describe("environment", () => {
	describe("env-path", () => {
		let Path;
		before(() => {
			delete require.cache[require.resolve("../lib/env-path")];
			require("../lib/env-path");
			Path = process.env.Path.split(/\s*;\s*/).map(dir => path.resolve(dir)); ;
		});

		[
			"~/bin",
			gitWin.toPosix("/mingw00/bin"),
			"/usr/local/bin",
			"/usr/bin",
			"/bin",
			"/usr/local/bin",
			"/usr/local/sbin",
			"/usr/bin",
			"/usr/sbin",
			"/bin",
			"/sbin",
			"node_modules/.bin",
			"/usr/bin/vendor_perl",
			"/usr/bin/core_perl",
		].forEach(dir => {
			it(dir, () => {
				expect(Path).to.contain(path.resolve(gitWin.toWin32(dir).replace(/%.*?%/, (s) => process.env[s.slice(1, -1)])));
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
