"use strict";
const spawn = require("./spawn");
const reg = require("./reg");
const gitWin = require("git-win");
const path = require("path");
const url = require("url");
const fs = require("fs");
const promisify = require("util").promisify || require("util.promisify");
const curl = gitWin.toWin32("/mingw00/bin/curl.exe");

async function autoRun () {
	const cmdPath = path.join(/[\\/]node_modules[\\/]/i.test(__dirname) ? "node_modules/.bin" : "bin", "git-bash-shell.cmd");
	// return reg.add(`HK${isAdmin ? "LM" : "CU"}/Software/Microsoft/Command Processor`, {
	return reg.add("HKCU/Software/Microsoft/Command Processor", {
		AutoRun: `
			if exist ${cmdPath} (
				call ${cmdPath}
			) else (
				if exist "%APPDATA%\\npm\\git-bash-shell.cmd" (
					call "%APPDATA%\\npm\\git-bash-shell.cmd"
				) else (
					DOSKEY cd=cd /d $* ^&^& if exist ${cmdPath} call ${cmdPath}
				)
			)
		`.replace(/\s+/g, " ").trim(),
	});
}

function urlResolve (from, to) {
	// eslint-disable-next-line node/no-deprecated-api
	return url.resolve(from, to);
}

async function getLocation (from) {
	const head = await spawn([
		curl,
		"--head",
		from,
	], {
		argv0: "curl",
		encoding: "utf8",
		// echo: true,
	});
	const location = /(?:^|\r?\n)Location:\s*(.*?)(?:\r?\n|$)/i.exec(head);
	return urlResolve(from, location[1]);
}

async function checkCmder (cmderDir, cmderVer) {
	let files;
	try {
		files = await promisify(fs.readdir)(cmderDir);
	} catch (ex) {
		await promisify(fs.mkdir)(cmderDir);
		return false;
	}
	return files.some(file => /^Version\s+(.+)$/i.test(file) && RegExp.$1.startsWith(cmderVer));
}

async function downCmder (releaseUrl, zipFile) {
	const html = await spawn([
		curl,
		"--location",
		releaseUrl,
	], {
		argv0: "curl",
		encoding: "utf8",
		// echo: true,
	});

	const zipUrl = urlResolve(releaseUrl, /\s+href=('|")(.+?\/cmder_mini.zip)\1/i.exec(html)[2]);

	await spawn([
		curl,
		"--fail",
		"--insecure",
		"--location",
		"--remote-time",
		"--continue-at",
		"-",
		"--output",
		gitWin.toWin32(zipFile),
		zipUrl,
	], {
		argv0: "curl",
		stdio: "inherit",
		echo: true,
		env: Object.assign({
			https_proxy: process.env.npm_config_https_proxy,
		}, process.env),
	});
}

async function getCmder () {
	if (process.env.CI) {
		return;
	}
	const releaseUrl = await getLocation("https://github.com/cmderdev/cmder/releases/latest");
	const cmderVer = /\/v*([^/\\]+?)$/.exec(releaseUrl)[1];
	const cmderDir = path.join(process.env.ProgramData, "Cmder");

	if (!await checkCmder(cmderDir, cmderVer)) {
		const unzip = gitWin.toWin32("/usr/bin/unzip.exe");
		const zipFile = `/tmp/cmder_mini_v${cmderVer}.zip`;

		try {
			await spawn([
				unzip,
				"-t",
				zipFile,
			], {
				argv0: "unzip",
				stdio: "ignore",
				// echo: true,
			});
		} catch (ex) {
			await downCmder(releaseUrl, zipFile);
		}

		await spawn([
			unzip,
			"-o",
			"-d",
			cmderDir,
			zipFile,
		], {
			argv0: "unzip",
			stdio: [
				"inherit",
				"pipe",
				"inherit",
			],
			echo: true,
		});
	}

	const clinkFile = path.join(cmderDir, "vendor/clink.lua");
	let clinkConfig = await promisify(fs.readFile)(clinkFile, "utf8");
	clinkConfig = clinkConfig.replace(/λ/g, "$");
	if (RegExp.lastMatch === "λ") {
		await promisify(fs.writeFile)(clinkFile, clinkConfig);
	}
}

async function cmd () {
	const cmdFile = require.resolve("../bin/git-bash-shell.cmd");
	let cmd = await promisify(fs.readFile)(cmdFile, "utf8");
	const osArch = /64$/.test(process.env.PROCESSOR_ARCHITEW6432 || process.arch) ? 64 : 86;
	cmd = cmd.replace(/(\bclink_x)\d*/, "$1" + osArch);
	await promisify(fs.writeFile)(cmdFile, cmd);
}

module.exports = Promise.all([
	autoRun(),
	getCmder(),
	cmd(),
]).then(() => {
	console.log("`git-bash-shell` installation was successful, please restart your terminal!");
}, (error) => {
	console.error(error.stack || error);
	process.exitCode = 1;
});