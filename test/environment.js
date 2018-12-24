"use strict";
const expect = require("chai").expect;
const gitWin = require("git-win");
const path = require("path");
require("../src/env-value");

describe("environment", () => {
	describe("env-path", () => {
		let Path;
		before(() => {
			Path = process.env.Path.split(/\s*;\s*/).map(dir => path.resolve(dir)); ;
		});

		[
			"~/bin",
			gitWin.toPosix("/mingw00/bin"),
			"/usr/local/bin",
			"/usr/bin",
			"/bin",
			"/usr/local/bin",
			"/usr/bin",
			"/bin",
			"node_modules/.bin",
			"/usr/bin/vendor_perl",
			"/usr/bin/core_perl",
		].forEach(dir => {
			it(dir, () => {
				expect(Path).to.contain(path.resolve(gitWin.toWin32(dir).replace(/%.*?%/, (s) => process.env[s.slice(1, -1)])));
			});
		});
	});
});
