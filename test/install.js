"use strict";
const install = require.resolve("../src/postinstall");
const fs = require("fs-extra");
const spawn = require("../src/spawn");
const reg = require("../src/reg");
const expect = require("expect.js");
const path = require("path");

require("../src/")();

describe("install", () => {
	beforeEach(() => {
		delete require.cache[install];
	});

	it("Add reg", async () => {
		await reg.delete("HKCU/Software/Microsoft/Command Processor", "AutoRun");
		await require(install);
		expect((await reg.query("HKCU/Software/Microsoft/Command Processor")).AutoRun).to.contain("%APPDATA%\\npm\\");
	});

	it("download and install Cmder", async () => {
		await spawn([
			"rm",
			"-rf",
			`"${path.join(process.env.ProgramData, "Cmder")}"`,
			"/tmp/cmder_mini_*.zip",
		], {
			shell: true,
		});
		await require(install);
		expect(await fs.exists(path.join(process.env.ProgramData, "Cmder/vendor/clink/clink.bat"))).to.equal(true);
	});

	it("install Cmder without download", async () => {
		await spawn([
			"rm",
			"-rf",
			path.join(process.env.ProgramData, "Cmder"),
		]);
		await require(install);
		expect(await fs.exists(path.join(process.env.ProgramData, "Cmder/vendor/clink/clink.bat"))).to.equal(true);
	});

	it("reinstalll", async () => {
		await require(install);
		expect(await fs.exists(path.join(process.env.ProgramData, "Cmder/vendor/clink/clink.bat"))).to.equal(true);
	});
});
