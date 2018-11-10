"use strict";
const getEnvValue = require("./get-env-value");
const win32Path = require("./win32-path");
const getPath = require("./env-path");
const gitWin = require("git-win");
const LRU = require("lru-cache");
const path = require("path");
const fs = require("fs");
const fsCache = new LRU({ max: 500, maxAge: 30 * 1000 }); // Cache just for 30sec
const fsStorage = global.Map && new Map();

function readDir (dir) {
	dir = path.resolve(dir).toLowerCase();
	const dirCache = ((/^[A-Z]:\\(?:Program\s+Files(?:\s+\(x\d+\))?|Windows)(?=\\|$)/i.test(dir) || gitWin.fixPosixRoot(dir)) && fsStorage) || fsCache;
	if (dirCache.has(dir)) {
		return dirCache.get(dir);
	}

	let files;
	try {
		files = new Map(
			fs.readdirSync(dir).map(filename => (
				[filename.toLowerCase(), filename]
			))
		);
	} catch (ex) {
		files = null;
	}
	dirCache.set(dir, files);
	return files;
}

function * filePathList (file, options) {
	const cwd = (options && options.cwd && path.resolve(options.cwd)) || process.cwd();
	yield win32Path([cwd, file], options);
	if (/[/\\]/.test(file)) {
		return;
	}
	for (
		const dir of getPath(options)
	) {
		yield win32Path([cwd, dir, file], options);
	}
}

function * fileExtList (file, options) {
	let pathExt;
	function ext () {
		if (!pathExt) {
			pathExt = getEnvValue("PATHEXT", options);
			pathExt = pathExt ? pathExt.toLowerCase().split(/\s*;\s*/g) : [".exe"];
		}
		return pathExt;
	}
	for (
		const filePath of filePathList(file, options)
	) {
		const dirname = path.dirname(filePath);
		const files = readDir(dirname);

		if (!files) {
			continue;
		}

		const basename = path.basename(filePath);
		yield [files, dirname, basename];

		if (/\.(?:exe|cmd|bat|com)$/.test(basename)) {
			continue;
		}

		if (gitWin.fixPosixRoot(filePath)) {
			yield [files, dirname, basename + ".exe"];
		} else {
			for (const extName of ext()) {
				yield [files, dirname, basename + extName];
			}
		}
	}
}

function which (file, options) {
	for (const [files, dirname, basename] of fileExtList(file, options)) {
		const realName = files.get(basename);
		if (realName) {
			return path.join(dirname, realName);
		}
	}
}

module.exports = which;
