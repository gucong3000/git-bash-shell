"use strict";
const gitWin = require("git-win");
const expect = require("expect.js");
const path = require("path");
const shebang = require("../lib/shebang");

function resolve (file) {
	return path.resolve(gitWin.toWin32(file));
}

describe("shebang", () => {
	[
		"/usr/bin/git-flow",
		"node_modules/.bin/eslint",
		"node_modules/.bin/eslint",
		"/usr/bin/findssl.sh",
		"/usr/bin/gettext.sh",
	].forEach(file => {
		file = resolve(file);
		it(file, async () => {
			const args = shebang(file);
			expect(args).to.equal("/bin/sh");
		});
	});
	[
		"/usr/bin/vendor_perl/lwp-download",
		"/usr/bin/vendor_perl/lwp-dump",
		"/usr/bin/vendor_perl/lwp-mirror",
		"/usr/bin/vendor_perl/lwp-request",
	].forEach(file => {
		file = resolve(file);
		it(file, async () => {
			const args = shebang(file);
			expect(args).to.equal("/usr/bin/perl");
		});
	});
	[
		"/usr/bin/vendor_perl/binhex.pl",
		"/usr/bin/vendor_perl/debinhex.pl",
	].forEach(file => {
		file = resolve(file);
		it(file, async () => {
			const args = shebang(file);
			expect(args).to.equal("/usr/bin/perl -w");
		});
	});
	[
		process.env.windir,
		process.env.ComSpec,
		"README.md",
	].forEach(file => {
		file = resolve(file);
		it(file, async () => {
			const args = shebang(file);
			expect(args).to.equal(null);
		});
	});
});
