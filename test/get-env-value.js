"use strict";
const getEnvValue = require("../lib/get-env-value");
const gitWin = require("git-win");
const path = require("path");
const util = require("util");
const os = require("os");

const expect = require("expect.js");

describe("getEnvValue()", () => {
	it("get $HOME by `process.env.HOME`", () => {
		process.env.HOME = "X:\\Users\\mock";
		expect(getEnvValue("HOME", {
			env: {
				UserProfile: "X:\\Users\\mock",
			},
		})).to.equal("X:\\Users\\mock");
	});

	it("get $HOME by `os.homedir()`", () => {
		delete process.env.HOME;
		expect(getEnvValue("HOME", {
			env: {
				UserProfile: "X:\\Users\\mock",
			},
		})).to.equal(os.homedir());
	});

	it("get $HOME by `envPairs`", () => {
		delete process.env.HOME;
		expect(getEnvValue("HOME", {
			envPairs: [
				"HOME=X:\\Users\\mock",
			],
		})).to.equal("X:\\Users\\mock");
	});

	it("get SystemRoot & windir by `process.env.*`", () => {
		expect(getEnvValue("SystemRoot", {
			env: {},
		})).to.equal(process.env.SystemRoot);
		expect(getEnvValue("windir", {
			env: {},
		})).to.equal(process.env.windir);
	});

	it("get SystemRoot & windir by `process.env.SystemDrive`", () => {
		delete process.env.SystemRoot;
		delete process.env.windir;
		const windir = "C:\\Windows";
		expect(getEnvValue("SystemRoot", {
			env: {},
		})).to.equal(windir);
		expect(getEnvValue("windir", {
			env: {},
		})).to.equal(windir);
		process.env.SystemRoot = windir;
		process.env.windir = windir;
	});

	it("get SystemRoot & windir by empty env", () => {
		delete process.env.SystemRoot;
		delete process.env.windir;
		delete process.env.SystemDrive;

		const windir = "C:\\Windows";
		expect(getEnvValue("SystemRoot", {
			env: {},
		})).to.equal(windir);
		expect(getEnvValue("windir", {
			env: {},
		})).to.equal(windir);
		process.env.SystemRoot = windir;
		process.env.windir = windir;
		process.env.SystemDrive = "C:";
	});

	it("get APPDATA by empty env", () => {
		const APPDATA = process.env.APPDATA;
		delete process.env.APPDATA;
		expect(getEnvValue("APPDATA", { env: {} })).to.equal(APPDATA);
		process.env.APPDATA = APPDATA;
	});

	it("Ignore case by env", () => {
		expect(getEnvValue("PaTh", { env: { PATH: "mock" } })).to.equal("mock");
	});

	it("Ignore case by envPairs", () => {
		expect(getEnvValue("PaTh", {
			envPairs: [
				"PATH=mock",
			],
		})).to.equal("mock");
	});

	it("not exist", () => {
		expect(getEnvValue("NOT_EXIST", {
			env: {},
		})).to.equal(undefined);
	});
});

describe("PATH", () => {
	let PATH;
	before(() => {
		PATH = process.env.PATH;
	});
	after(() => {
		process.env.PATH = "/bin";
		process.env.PATH = PATH;
	});
	it("set posix PATH with `.`", () => {
		process.env.PATH = [
			"/mock/bin",
			".",
			"/mock/perl",
		].join(":");
		process.env.PATH = "C:\\mock;";
		expect(process.env.PATH).to.equal(gitWin.toWin32("/mock/bin") + ";C:\\mock;" + gitWin.toWin32("/mock/perl") + ";");
	});

	it("set posix PATH", () => {
		process.env.PATH = [
			"/mock/bin",
			"/mock/usr/bin",
		].join(":");
		process.env.PATH = "C:\\mock";
		expect(process.env.PATH).to.equal([
			gitWin.toWin32("/mock/bin"),
			gitWin.toWin32("/mock/usr/bin"),
			"C:\\mock",
		].join(";"));
	});

	it("home path", () => {
		process.env.PATH = "~/bin";
		process.env.PATH = "C:\\mock";
		expect(process.env.PATH).to.equal([
			path.join(os.homedir(), "bin"),
			"C:\\mock",
		].join(";"));
	});

	it("util.inspect", () => {
		util.inspect(process.env);
	});
});
