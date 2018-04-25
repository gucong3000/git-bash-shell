"use strict";
const pathStartsWith = require("../lib/path-starts-with");
const fixSpawnArgs = require("../lib/fix-spawn-args");
const getEnvPath = require("../lib/get-env-path");
const shebang = require("../lib/shebang");
const expect = require("expect.js");
const path = require("path");
const fs = require("fs-extra");
const os = require("os");

describe("API", () => {
	describe("get-env-path", () => {
		it("no result", () => {
			expect(getEnvPath({})).to.have.length(0);
		});

		it("ignore case", () => {
			const PATH = getEnvPath({
				PATH: "mock",
			});
			expect(PATH).to.have.length(1);
			expect(PATH).to.contain("mock");
		});

		it("Environment variables", () => {
			const PATH = getEnvPath({
				WINDIR: "C:\\windows",
				PATH: "%windir%\\mock\\%notexist%",
			});
			expect(PATH).to.have.length(1);
			expect(PATH).to.contain("C:\\windows\\mock\\%notexist%");
		});

		it("USERPROFILE", () => {
			const home = getEnvPath({
				HOMEDRIVE: "c:",
				HOMEPATH: "\\Users\\mock",
			}, "USERPROFILE");
			expect(home).to.equal("c:\\Users\\mock");
		});
	});
	describe("shebang", () => {
		let tempDir;
		function testShebang (file, contents) {
			file = path.resolve(tempDir, file);
			return fs.outputFile(file, contents).then(() => {
				return shebang(file);
			});
		}
		before(() => {
			return fs.mkdtemp(path.join(os.tmpdir(), "git-bash-shell-shebang-")).then((dir) => {
				tempDir = dir;
			});
		});
		after(() => {
			return fs.remove(tempDir);
		});
		it("npm bin with shebang", () => {
			return testShebang(
				"node_modules/.bin/with_shebang",
				"#!cat\n"
			).then((shebang) => {
				expect(shebang).to.have.length(2);
				expect(shebang[0]).to.equal("cat");
				expect(shebang[1]).to.match(/\\node_modules\\.bin\\with_shebang$/);
			});
		});

		it("shebang without line break", () => {
			return testShebang(
				"without_break",
				"#!grep"
			).then((shebang) => {
				expect(shebang).to.have.length(2);
				expect(shebang[0]).to.equal("grep");
				expect(shebang[1]).to.match(/\\without_break$/);
			});
		});

		it("file without shebang", () => {
			return testShebang(
				"without_shebang",
				"foo\nbar\n"
			).then((shebang) => {
				expect(shebang).to.be(null);
			});
		});

		it("should use cache", () => {
			const file = path.resolve(tempDir, "cache");
			return fs.writeFile(
				file,
				"#!mock"
			).then(() => {
				shebang(file);
				return fs.unlink(file);
			}).then(() => {
				const cmd = shebang(file);
				expect(cmd).to.have.length(2);
				expect(cmd[0]).to.equal("mock");
				expect(cmd[1]).to.match(/\\cache$/);
			});
		});
	});

	describe("fix-spawn-args", () => {
		const homeMockFile = path.join(os.homedir(), "mock");
		after(() => {
			return fs.unlink(homeMockFile);
		});

		it("~/mock", () => {
			return fs.writeFile(homeMockFile, "").then(() => {
				const options = {
					file: "~/mock",
					args: [],
					envPairs: [],
				};
				fixSpawnArgs(options);
				expect(options.file).to.match(/^(.*)\\mock$/);
				expect(RegExp.$1).to.equal(os.homedir());
			});
		});

		it("Custom HOME path", () => {
			const options = {
				file: "~/shell.cmd",
				args: [],
				envPairs: [
					"HOME=" + path.resolve("bin"),
				],
			};
			fixSpawnArgs(options);
			expect(options.file).to.equal(path.resolve("bin/shell.cmd"));
		});

		it("bin/bash", () => {
			const options = {
				file: "bin/shell",
				args: [],
				envPairs: [
					"PATHEXT=.CMD",
				],
			};
			fixSpawnArgs(options);
			expect(options.file).to.equal(path.resolve("bin/shell.cmd"));
		});
		it("ENOENT", () => {
			const options = {
				file: "ENOENT",
				args: [],
				envPairs: [],
			};
			fixSpawnArgs(options);
			expect(options.file).to.equal("ENOENT");
		});
		it("should not modify args", () => {
			const options = {
				file: "/bin/bash",
				args: [
					"bash",
					"/d",
					"/s",
					"/c",
					"file.sh",
				],
				windowsVerbatimArguments: true,
				envPairs: [
				],
			};
			fixSpawnArgs(options);
			expect(options.args).have.length(3);
			expect(options.args[0]).to.equal("bash");
			expect(options.args[1]).to.equal("-c");
			expect(options.args[2]).to.equal("file.sh");
		});
		it("fixShellArgs", () => {
			const options = {
				file: "bash",
				args: [
					"bash",
					"--posix",
					"file.sh",
				],
				envPairs: [
					"mock",
				],
			};
			fixSpawnArgs(options);
			expect(options.file).to.equal("bash");
			expect(options.args).have.length(3);
			expect(options.args[0]).to.equal("bash");
			expect(options.args[1]).to.equal("--posix");
			expect(options.args[2]).to.equal("file.sh");
		});
		it("pathStartsWith", () => {
			expect(pathStartsWith("/foo/bar", "/foo")).to.equal("/bar");
			expect(pathStartsWith("", "/foo")).to.not.ok();
		});
	});
});
