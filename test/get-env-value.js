"use strict";
const getEnvValue = require("../lib/get-env-value");
const getPath = require("../lib/env-path");
const path = require("path");
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
		expect(getEnvValue("APPDATA", {})).to.equal(APPDATA);
		process.env.APPDATA = APPDATA;
	});

	it("not exist", () => {
		expect(getEnvValue("NOT_EXIST", {
			env: {},
		})).to.equal(undefined);
	});
});

describe("getPath()", () => {
	it("path=mock", () => {
		expect(
			getPath({
				envPairs: [
					"PATH=mock",
				],
			}).join(";")
		).to.equal("mock");
	});

	it("PATH: \"PATHmock\"", () => {
		expect(
			getPath({
				env: {
					PATH: "PATHmock",
				},
			}).join(";")
		).to.equal("PATHmock");
	});

	it("PATH: \"PATHmock ; ; PATHmock\"", () => {
		expect(
			getPath({
				env: {
					PATH: "PATHmock ; ; PATHmock",
				},
			}).join(";")
		).to.equal("PATHmock");
	});

	it("PATH: \"PATHmock;\"", () => {
		expect(
			getPath({
				env: {
					PATH: "PATHmock;",
				},
			}).join(";")
		).to.equal("PATHmock");
	});

	it("PATH: \"~/bin;%HOME%\\bin\"", () => {
		expect(
			getPath({
				env: {
					PATH: "~/bin;%HOME%\\bin",
				},
			}).join(";")
		).to.equal(path.join(os.homedir(), "bin"));
	});

	it("PATH: \"%HOME%\\bin;~/bin\"", () => {
		expect(
			getPath({
				env: {
					PATH: "%HOME%\\bin;~/bin",
				},
			}).join(";")
		).to.equal(path.join(os.homedir(), "bin"));
	});

	it("empty", () => {
		expect(
			getPath({}).join(";")
		).to.equal("");
	});
});
