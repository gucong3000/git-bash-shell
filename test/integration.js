"use strict";
const fs = require("mz/fs");
const path = require("path");
const execFile = require("mz/child_process").execFile;
const exec = require("mz/child_process").exec;
const expect = require("expect.js");

describe("integration", () => {
	before(() => {
		const root = path.resolve("lib");
		for (const file in require.cache) {
			if (file.startsWith(root)) {
				delete require.cache[file];
			}
		}
		delete require.cache[require.resolve("../")];
		process.env.SHELL = "";
		require("../")();
	});

	it("node.cmd", () => {
		return execFile("node_modules\\.bin\\node.cmd", [
			"-p",
			"process.env.SHELL",
		], {
			shell: "cmd.exe",
		}).then((result) => {
			expect(result[0].trim()).to.be.equal("/usr/bin/bash");
		});
	});

	it("/bin/bash", () => {
		return execFile("/bin/bash", [
			"-c",
			"echo hello",
		]).then((result) => {
			expect(result[0].trim()).to.equal("hello");
		});
	});

	it("/bin/sh", () => {
		return execFile("/bin/bash", [
			"-c",
			"echo hello",
		]).then((result) => {
			expect(result[0].trim()).to.equal("hello");
		});
	});
	it("ls", () => {
		return execFile("ls").then((result) => {
			result = result[0].split(/\r?\n/).filter(Boolean).sort();
			expect(result).to.contain("package.json");
			expect(result).to.contain("README.md");
		});
	});
	it("cat README.md", () => {
		return Promise.all([
			exec("cat README.md"),
			execFile("cat", ["README.md"]),
			fs.readFile("README.md", { encoding: "utf8" }),
		]).then((result) => {
			expect(result[0][0]).to.equal(result[2]);
			expect(result[1][0]).to.equal(result[2]);
		});
	});
	it("zdiff --help", () => {
		return Promise.all([
			exec("zdiff --help"),
			execFile("zdiff", ["--help"]),
		]).then((result) => {
			expect(result[0][0]).to.contain("OPTIONs are the same as for");
			expect(result[0][0]).to.be.equal(result[1][0]);
		});
	});
	it("eslint --help", () => {
		const env = Object.assign({}, process.env, {
			PATH: [
				"node_modules/.bin",
				process.env.PATH,
			].join(";"),
		});
		return Promise.all([
			exec("eslint --help", {
				env: env,
			}),
			execFile("eslint", ["--help"], {
				env: env,
			}),
		]).then((result) => {
			expect(result[0][0]).to.contain("Basic configuration:");
			expect(result[0][0]).to.be.equal(result[1][0]);
		});
	});
});
