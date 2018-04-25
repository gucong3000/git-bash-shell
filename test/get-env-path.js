"use strict";
const getEnvPath = require("../lib/get-env-path");
const expect = require("expect.js");
describe("getEnvValue", () => {
	it("get USERPROFILE by HOMEDRIVE && HOMEPATH", () => {
		expect(getEnvPath({
			HOMEDRIVE: "X:",
			HOMEPATH: "\\Users\\mock",
		}, "USERPROFILE")).to.equal("X:\\Users\\mock");
	});
	it("Ignore case", () => {
		const result = getEnvPath({
			Path: "mock",
		}, "PATH");
		expect(result).to.have.length(1);
		expect(result).to.contain("mock");
	});
});
