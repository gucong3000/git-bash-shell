"use strict";
const pathStartsWith = require("./path-starts-with");
const getEnvPath = require("./get-env-path");
const lxssFs = require("./lxss-fs");
const gitDir = require("./git-dir");
const path = require("path");
const wrapPath = path.resolve(__dirname, "../bin/wrap");
const sysPath = [];

const originalPath = getEnvPath().filter((dir) => {
	function startsWith (prefix) {
		let value = pathStartsWith(dir, "%" + prefix + "%");
		if (value == null) {
			value = getEnvPath(process.env, prefix);
			value = value && pathStartsWith(dir, value);
		}

		return value;
	}

	if (startsWith("SystemRoot") != null || startsWith("windir") != null) {
		sysPath.push(dir);
		return false;
	}

	const homePath = startsWith("HOME") || startsWith("USERPROFILE");
	if (homePath && /^([\\/])(?:.+\1)?bin$/.test(homePath)) {
		return false;
	}

	return (pathStartsWith(dir, wrapPath) || pathStartsWith(dir)) == null;
});

const home = getEnvPath(process.env, "HOME") || getEnvPath(process.env, "USERPROFILE");

const homePath = [
	"bin",
	".local/bin",
].map((subDir) => {
	return path.join(home, subDir);
});

const gitPath = [
	gitDir.mingw + "/bin",
	"usr/bin",
	"cmd",
	"usr/share/vim/vim74",
	"usr/bin/vendor_perl",
	"usr/bin/core_perl",
].map((subDir) => {
	return gitDir(subDir);
});

const lxssPath = [
	"usr/local/sbin",
	"usr/local/bin",
	"usr/sbin",
	"usr/bin",
	"sbin",
	"bin",
].map((subDir) => {
	return lxssFs(subDir);
});

process.env.PATH = [].concat(
	wrapPath,
	originalPath,
	homePath,
	gitPath,
	lxssPath,
	sysPath
).filter(Boolean).join(path.delimiter);

module.exports = process.env.PATH;
