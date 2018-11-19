"use strict";
const fs = require("fs-extra");
const expect = require("expect.js");
const spawn = require("../src/spawn");
const childProcess = require("child_process");

describe("integration", () => {
	before(() => {
		require("../")();
	});

	it("env echo $SHELL", async () => {
		process.env.SHELL = "/bin/dash";
		const result = childProcess.execSync("echo $SHELL", {
			encoding: "utf8",
		});
		expect(result.trim()).to.be.equal("/bin/dash");
	});

	it("/bin/bash", async () => {
		const result = await spawn(
			[
				"/bin/bash",
				"-c",
				"echo hello",
			],
			{
				encoding: "utf8",
			}
		);
		expect(result.trim()).to.be.equal("hello");
	});

	it("sh", async () => {
		const result = await spawn(
			[
				"sh",
				"-c",
				"echo hello",
			],
			{
				encoding: "utf8",
			}
		);
		expect(result.trim()).to.be.equal("hello");
	});

	it("ls", async () => {
		let result = await spawn(
			[
				"ls",
			],
			{
				encoding: "utf8",
			}
		);
		result = result.split(/\r?\n/).filter(Boolean).sort();
		expect(result).to.contain("package.json");
		expect(result).to.contain("README.md");
	});
	it("cat README.md", async () => {
		const result = await spawn(
			[
				"cat",
				"README.md",
			],
			{
				encoding: "utf8",
			}
		);
		const contents = await fs.readFile("README.md", { encoding: "utf8" });
		expect(result).to.equal(contents);
	});
	it("zdiff --help", async () => {
		const result = await spawn(
			[
				"/usr/bin/zdiff",
				"--help",
			],
			{
				encoding: "utf8",
			}
		);

		expect(result).to.contain("/usr/bin/zdiff [OPTION]... FILE1 [FILE2]");
		expect(result).to.contain("OPTIONs are the same as for");
	});
	it("eslint --help", async () => {
		const result = await spawn(
			[
				"node_modules/.bin/eslint",
				"--help",
			],
			{
				encoding: "utf8",
			}
		);
		expect(result).to.contain("Basic configuration:");
	});

	it(process.env.windir, async () => {
		let result;
		try {
			result = await spawn(
				[
					process.env.windir,
				],
				{
					encoding: "utf8",
				}
			);
		} catch (ex) {
			//
		}
		expect(result).to.not.ok();
	});
});
