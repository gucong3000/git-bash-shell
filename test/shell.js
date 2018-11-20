"use strict";
const expect = require("expect.js");
const childProcess = require("child_process");
const gitWin = require("git-win");
const path = require("path");

require("../src/patch");
describe("env-value", () => {
	before(() => {
		delete process.env.npm_config_shell;
		delete process.env.npm_config_script_shell;
	});
	[
		"/bin/bash",
		"/bin/dash",
		"/bin/sh",
		"bash",
		"dash",
		"sh",
	].forEach(shell => {
		it("env SHELL=" + shell + " echo $SHELL", async () => {
			process.env.SHELL = shell;
			expect(process.env.SHELL).to.equal(shell);
			expect(process.env.npm_config_shell).to.equal(shell);
			expect(process.env.npm_config_script_shell).to.equal(shell);
			const result = childProcess.spawnSync("echo", ["$SHELL"], {
				shell: true,
				encoding: "utf8",
			});
			const options = result.options;
			if (options) {
				expect(options.args).have.length(3);
				expect(options.args[0]).to.equal(shell);
				expect(options.args[1]).to.equal("-c");
				expect(options.args[2]).to.equal("echo $SHELL");
			}

			expect(result.stderr).to.equal("");
			if (path.posix.isAbsolute(shell)) {
				expect(result.stdout).to.equal(shell + "\n");
				const cmdResult = childProcess.execSync("env echo $SHELL", {
					encoding: "utf8",
					env: {
						Path: process.env.Path,
						SHELL: process.env.ComSpec,
					},
				});
				expect(cmdResult).to.be.equal(shell + "\n");
			}
		});
	});
	describe("options.cwd=/", () => {
		[
			"bash",
			"dash",
			"sh",
		].forEach((shell) => {
			it(shell, () => {
				const result = childProcess.spawnSync(shell, ["-c", "echo $0"], {
					cwd: gitWin.root,
					encoding: "utf8",
				});
				expect(result.error).to.not.ok();
				expect(result.stderr).to.equal("");
				expect(result.stdout).to.equal(shell + "\n");
			});
		});
	});
});
