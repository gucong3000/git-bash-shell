"use strict";
const childProcess = require("child_process");
const expect = require("expect.js");
const gitWin = require("git-win");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
require("../src/patch");

describe("env-value", () => {
	it("SHELL=/bin/bash", async () => {
		process.env.SHELL = "/bin/bash";
		const result = childProcess.spawnSync("echo", ["$SHELL"], {
			shell: true,
			encoding: "utf8",
		});
		const options = result.options;
		if (options) {
			expect(options.file).to.equal(path.join(gitWin.root, "/usr/bin/bash.exe"));
			expect(options.args).have.length(3);
			expect(options.args[0]).to.equal("/bin/bash");
			expect(options.args[1]).to.equal("-c");
			expect(options.args[2]).to.equal("echo $SHELL");
		}
		expect(result.stdout).to.equal("/bin/bash\n");
	});
	it("SHELL=", async () => {
		delete process.env.SHELL;
		const result = childProcess.spawnSync("echo", ["%mock%"], {
			shell: true,
			encoding: "utf8",
			env: {
				mock: "test",
			},
		});
		const options = result.options;
		const cmd = process.env.ComSpec;
		if (options) {
			expect(options.file).to.equal(cmd);
			expect(options.args).have.length(5);
			expect(options.windowsVerbatimArguments).to.equal(true);
			expect(options.args[0]).to.equal(cmd);
			expect(options.args[1]).to.equal("/d");
			expect(options.args[2]).to.equal("/s");
			expect(options.args[3]).to.equal("/c");
			expect(options.args[4]).to.equal("\"echo %mock%\"");
		}
		expect(result.stdout).to.equal("test\r\n");
	});
});

describe("fix-spawn-args", () => {
	let mockFile;
	afterEach(async () => {
		if (mockFile) {
			await fs.unlink(mockFile);
			mockFile = null;
		}
	});

	it("echo $SHELL", async () => {
		process.env.SHELL = "/usr/bin/bash";
		const result = childProcess.spawnSync("echo", ["$SHELL"], {
			shell: true,
			encoding: "utf8",
		});
		expect(result.stderr).to.equal("");
		expect(result.stdout.trim()).to.equal(process.env.SHELL);
		const options = result.options;
		if (options) {
			expect(options.args).have.length(3);
			expect(options.args[1]).to.equal("-c");
			expect(options.args[2]).to.equal("echo $SHELL");
		}
	});

	it("~/mock", async () => {
		// delete process.env.SHELL;
		delete process.env.HOME;
		mockFile = path.join(os.homedir(), "git-bash-shell-home-mock.cmd");
		await fs.writeFile(mockFile, "@echo %0");
		const result = childProcess.spawnSync("~/git-bash-shell-home-mock", {
			encoding: "utf8",
			// stdio: "inherit",
		});
		expect(result.stderr.trim()).to.equal("");
		expect(result.stdout.trim()).to.equal(path.join(os.homedir(), "git-bash-shell-home-mock"));
	});

	it("Custom HOME path", async () => {
		mockFile = path.join(os.tmpdir(), "git-bash-shell-home-mock.cmd");
		await fs.writeFile(mockFile, "@echo %0");

		const result = childProcess.spawnSync("~/git-bash-shell-home-mock.cmd", {
			env: {
				Path: process.env.Path,
				HOME: os.tmpdir(),
			},
			encoding: "utf8",
			// stdio: "inherit",
		});
		if (result.options) {
			expect(result.options.file).to.equal(mockFile);
		}
		expect(result.stderr.trim()).to.equal("");
		expect(result.stdout.trim()).to.equal(mockFile);
	});

	it("PATHEXT", async () => {
		mockFile = path.resolve("test/bash-shell-bin.cmd");
		await fs.writeFile(mockFile, "@echo %0");

		const result = childProcess.spawnSync("test/bash-shell-bin", {
			env: {
				PATH: process.env.PATH,
				PATHEXT: ".CMD",
			},
			encoding: "utf8",
			// stdio: "inherit",
		});
		if (result.options) {
			expect(result.options.file).to.equal(mockFile);
		}
		expect(result.error).to.not.ok();
		// console.error(result.stderr);
		expect(result.stderr.trim()).to.equal("");
		expect(result.stdout.trim()).to.equal("test\\bash-shell-bin");
	});

	it("ENOENT", () => {
		const result = childProcess.spawnSync("ENOENT.file", {
			env: {},
			encoding: "utf8",
		});
		if (result.options) {
			expect(result.options.file).to.equal("ENOENT.file");
		}
		expect(result.error.code || result.error.errno).to.equal("ENOENT");
	});

	it("should fix shell args", () => {
		const result = childProcess.spawnSync("/bin/sh", [
			"/d",
			"/s",
			"/c",
			"echo $SHELL",
		], {
			windowsVerbatimArguments: true,
			encoding: "utf8",
		});
		expect(result.stdout).to.match(/^(\/usr)?\/bin\/([bd]a)sh(\n|$)/);
		const options = result.options;
		if (options) {
			expect(options.file).to.equal(path.join(gitWin.root, "/usr/bin/sh.exe"));
			expect(options.args).have.length(3);
			expect(options.args[0]).to.equal("/bin/sh");
			expect(options.args[1]).to.equal("-c");
			expect(options.args[2]).to.equal("echo $SHELL");
		}
	});

	it("echo", () => {
		const result = childProcess.spawnSync("echo", [
			"$SHELL",
		], {
			encoding: "utf8",
		});
		expect(result.stdout).to.equal("$SHELL\n");
	});

	[
		"curl",
		"tar",
		"bash",
	].forEach(bin => {
		const file = `C:/Windows/System32/${bin}.exe`;
		if (fs.existsSync(file)) {
			it(file, () => {
				const result = childProcess.spawnSync(file, [
					"--version",
				], {
					encoding: "utf8",
				});
				expect(result.stdout.trim()).to.contain(bin);
			});
		}
	});
	if (fs.existsSync("C:/Windows/System32/OpenSSH/ssh.exe")) {
		it("C:/Windows/System32/OpenSSH/ssh.exe", () => {
			const result = childProcess.spawnSync("C:/Windows/System32/OpenSSH/ssh.exe", [
				"-v",
			], {
				encoding: "utf8",
			});
			expect(result.stderr.trim()).to.contain("usage: ssh ");
		});
	}
});

describe("node", () => {
	function runNode (args) {
		return childProcess.spawnSync(process.execPath, args, {
			encoding: "utf8",
		});
	}
	const argPath = path.join(__dirname, "..");
	it("normalize", () => {
		const result = JSON.parse(runNode([
			"-p",
			"JSON.stringify([process.execArgv, Object.keys(require.cache)])",
		]).stdout);
		expect(result[0]).to.have.length(2);
		expect(result[0]).to.not.contain("--require");
		expect(result[1]).to.contain(require.resolve("../"));
	});
	it("run " + path.resolve(__dirname, "../"), () => {
		const result = JSON.parse(runNode([
			"-r",
			argPath,
			"-p",
			"JSON.stringify(process.execArgv)",
		]).stdout);
		expect(result).to.have.length(4);
		expect(result).to.contain("-r");
		expect(result).to.not.contain("--require");
		expect(result).to.contain(argPath);
	});
});

describe("npm", () => {
	function npmRun (args, shell = path.join(process.env.windir, "System32/cmd.exe")) {
		process.env.npm_lifecycle_script = args;
		return childProcess.spawnSync(shell, [
			"/d /s /c",
			args,
		], {
			windowsVerbatimArguments: true,
			encoding: "utf8",
		});
	}
	let npmLifecycleScript;
	before(() => {
		npmLifecycleScript = process.env.npm_lifecycle_script;
	});

	after(() => {
		process.env.npm_lifecycle_script = npmLifecycleScript;
		delete process.env.SHELL;
	});
	beforeEach(() => {
		process.env.SHELL = "/bin/sh";
	});

	it("echo %PATH%", () => {
		const dirs = npmRun("echo %PATH%").stdout.trim().split(/(?:\s*;\s*)+/g).map(dir => path.resolve(dir));
		[
			"node_modules/.bin",
			"/usr/bin",
			"/bin",
		].forEach(dir => {
			expect(dirs).to.not.contain(dir);
			expect(dirs).to.contain(path.resolve(gitWin.toWin32(dir)));
		});
	});

	it("SET echo $0", () => {
		const result = npmRun("SET echo $0", "/bin/bash");
		expect(result.stdout).to.equal("/bin/bash\n");
	});
	it("env echo $0", () => {
		delete process.env.SHELL;
		const result = npmRun("env echo $0");
		expect(result.stdout).to.equal("/bin/sh\n");
	});
	it("$SHELL -c \"echo $0\"", () => {
		delete process.env.SHELL;
		const result = npmRun("$SHELL -c \"echo $0\"");
		expect(result.stdout).to.equal("/bin/sh\n");
	});
	it("${SHELL} -c \"echo $0\"", () => {
		delete process.env.SHELL;
		const result = npmRun("${SHELL} -c \"echo $0\"");
		expect(result.stdout).to.equal("/bin/sh\n");
	});
	it("$SHELL -c \"echo $0\"", () => {
		delete process.env.SHELL;
		const result = npmRun("$SHELL -c \"echo $0\"");
		expect(result.stdout).to.equal("/bin/sh\n");
	});
	it("${SHELL2-/bin/bash} -c \"echo \\$0\"", () => {
		delete process.env.SHELL;
		const result = npmRun("${SHELL2-/bin/bash} -c \"echo \\$0\"");
		expect(result.stdout).to.equal("/bin/bash\n");
	});
	it("env echo $SHELL", () => {
		delete process.env.SHELL;
		const result = npmRun("env echo $SHELL");
		expect(result.stdout).to.equal("/bin/sh\n");
	});
	it("/usr/bin/env echo $0", () => {
		delete process.env.SHELL;
		const result = npmRun("/usr/bin/env echo $0");
		expect(result.stdout).to.equal("/bin/sh\n");
	});
	it("/usr/bin/env echo $SHELL", () => {
		delete process.env.SHELL;
		const result = npmRun("/usr/bin/env echo $SHELL");
		expect(result.stdout).to.equal("/bin/sh\n");
	});
	it("/bin/sh -c \"echo $0\"", () => {
		delete process.env.SHELL;
		const result = npmRun("/bin/sh -c \"echo $0\"");
		expect(result.stdout).to.equal("/bin/sh\n");
	});
	it("/bin/sh -c \"echo $SHELL\"", () => {
		delete process.env.SHELL;
		const result = npmRun("/bin/sh -c \"echo $SHELL\"");
		expect(result.stdout).to.equal("/bin/sh\n");
	});
	it("sh -c \"echo $0\"", () => {
		delete process.env.SHELL;
		const result = npmRun("sh -c \"echo $0\"");
		expect(result.stdout).to.equal("sh\n");
	});
	it("SHELL=/bin/sh echo $0", () => {
		const result = npmRun("SHELL=/bin/sh echo $0");
		expect(result.stdout).to.equal("/bin/sh\n");
	});
	it("SHELL=/bin/sh echo $SHELL", () => {
		const result = npmRun("SHELL=/bin/sh echo $SHELL");
		expect(result.stdout).to.equal("/bin/sh\n");
	});
	it("SHELL=/bin/bash echo $0", () => {
		const result = npmRun("SHELL=/bin/bash echo $0");
		expect(result.stdout).to.equal("/bin/bash\n");
	});
	it("SHELL=/bin/bash echo $SHELL", () => {
		const result = npmRun("SHELL=/bin/bash echo $SHELL");
		expect(result.stdout).to.equal("/bin/bash\n");
	});
});
