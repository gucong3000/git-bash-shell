"use strict";
const which = require("../lib/which");
const expect = require("expect.js");
const gitWin = require("git-win");
const path = require("path");

describe("which", () => {
	it("BASH", () => {
		expect(which("BASH", {
			env: {
				PATHEXT: "",
				PATH: process.env.PATH,
			},
		})).to.equal(path.join(gitWin.root, "usr/bin/bash.exe"));
	});

	it("/usr/bin/BASH", () => {
		expect(which("/usr/bin/BASH")).to.equal(path.join(gitWin.root, "usr/bin/bash.exe"));
	});

	it("vi", () => {
		expect(which("vi")).to.equal(path.join(gitWin.root, "usr/bin/vi"));
	});

	it("/usr/bin/vendor_perl", () => {
		expect(which("/usr/bin/vendor_perl")).to.equal(undefined);
	});

	it("/usr/bin/not_exist", () => {
		expect(which("/usr/bin/not_exist")).to.equal(undefined);
	});

	it("bin/not_exist", () => {
		expect(which("bin/not_exist")).to.equal(undefined);
	});

	it("not_exist", () => {
		expect(which("not_exist", {
			env: {
				PATH: "C:\\;",
			},
			cwd: "C:\\",
		})).to.equal(undefined);
	});

	it("CMD", () => {
		expect(which("CMD")).to.match(/\\cmd.exe$/);
	});

	it("C:\\Windows\\system32\\cmd.exe", () => {
		expect(which("C:\\Windows\\system32\\cmd.exe")).to.equal("C:\\Windows\\system32\\cmd.exe");
	});

	it("/Windows/system32/cmd.exe", () => {
		expect(which("/Windows/system32/cmd.exe", { cwd: "C:\\" })).to.equal("C:\\Windows\\system32\\cmd.exe");
	});

	it(__filename, () => {
		const file = __filename.replace(/\.\w+$/, "");
		expect(which(file, { envPairs: ["PATHEXT=.JS"] })).to.equal(__filename);
		expect(which(file, { env: { PATHEXT: ".JS" } })).to.equal(__filename);
		expect(which(file, { envPairs: [""] })).to.equal(undefined);
		expect(which(file, { env: {} })).to.equal(undefined);
	});

	it("git-bash-shell.cmd", () => {
		const file = "git-bash-shell.cmd";
		const dirname = path.resolve(__dirname, "../bin");
		expect(which(file, { envPairs: ["PATH=" + dirname] })).to.equal(path.join(dirname, file));
		expect(which(file, { envPairs: [] })).to.equal(undefined);
		expect(which(file, { env: { PATH: dirname } })).to.equal(path.join(dirname, file));
		expect(which(file, { env: { } })).to.equal(undefined);
	});
});
