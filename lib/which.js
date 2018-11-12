"use strict";
const getEnvValue = require("./get-env-value");
const win32Path = require("./win32-path");
const getPath = require("./env-path");
const gitWin = require("git-win");
const LRU = require("lru-cache");
const path = require("path");
const fs = require("fs");
const fsCache = new LRU({ max: 500, maxAge: 30 * 1000 }); // Cache just for 30sec
const fsStorage = new Map();

function stat (strPath) {
	const dirCache = /^[A-Z]:\\(?:Program\s+Files(?:\s+\(x\d+\))?|Windows)(?=\\|$)/i.test(strPath) || gitWin.fixPosixRoot(strPath)
		? fsStorage
		: fsCache;

	if (dirCache.has(strPath)) {
		return dirCache.get(strPath);
	}

	let stats;
	try {
		stats = fs.statSync(strPath);
	} catch (ex) {
		stats = null;
	}

	dirCache.set(strPath, stats);
	return stats;
}

function readDir (dir) {
	const stats = stat(dir);
	if (!stats || !stats.isDirectory()) {
		return;
	}

	if (stats.items) {
		return stats.items;
	}

	let files;
	try {
		files = fs.readdirSync(dir);
	} catch (ex) {
		//
	}

	const items = new Map(
		files && files.map(filename => (
			[filename.toLowerCase(), filename]
		))
	);

	stats.items = items;
	return items;
}

function * filePathList (file, options) {
	const cwd = (options && options.cwd && path.resolve(options.cwd)) || process.cwd();
	yield win32Path([cwd, file], options);
	if (/[/\\]/.test(file)) {
		if (path.posix.isAbsolute(file)) {
			yield path.resolve(cwd, file);
		}
	} else {
		for (
			const dir of getPath(options)
		) {
			yield win32Path([cwd, dir, file], options);
		}
	}
}

function * fileExtList (file, options) {
	let pathExt;
	function ext () {
		if (!pathExt) {
			pathExt = getEnvValue("PATHEXT", options);
			pathExt = pathExt ? pathExt.toLowerCase().split(/\s*;\s*/g) : [];
		}
		return pathExt;
	}
	const has = {};
	for (
		const filePath of filePathList(file, options)
	) {
		const dirname = path.dirname(filePath);
		const strDir = dirname.toLowerCase();
		if (has[strDir]) {
			continue;
		}

		has[strDir] = true;
		const files = readDir(strDir);

		if (!files) {
			continue;
		}

		const basename = path.basename(filePath).toLowerCase();
		yield [files, dirname, basename];

		const exts = ext();
		if (gitWin.fixPosixRoot(filePath) && exts.indexOf(".exe") < 0) {
			yield [files, dirname, basename + ".exe"];
		}

		for (const extName of exts) {
			yield [files, dirname, basename + extName];
		}
	}
}

function which (file, options) {
	for (const [files, dirname, basename] of fileExtList(file, options)) {
		let realName = files.get(basename);
		if (realName) {
			realName = path.join(dirname, realName);
			if (/\.(?:exe|cmd|bat|com)$/i.test(basename)) {
				return realName;
			}
			const stats = stat(realName.toLowerCase());
			if (stats && stats.isFile()) {
				return realName;
			}
		}
	}
}

module.exports = which;
