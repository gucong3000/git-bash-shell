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

function findFile (file) {
	file = /^(.+[/\\])(.+?(\.\w+)?)$/.exec(file);
	const files = readDir(file[1]);
	if (!files || !files.size) {
		return;
	}
	let fileList;
	file[2] = file[2].toLowerCase();
	if (file[3]) {
		fileList = [file[2]];
	} else {
		ext = ext && ext();
		if (ext && ext.length) {
			fileList = ext.map(ext => (
				file[2] + ext
			));
		} else {
			fileList = [file[2] + ".exe"];
		}
		fileList.unshift(file[2]);
	}

	let result;
	if (
		fileList.some(fileName => {
			result = files.get(fileName);
			return result;
		})
	) {
		result = file[1] + result;
		if (!/\.\w+$/.test(result) && readDir(result)) {
			return;
		}
		return result;
	}
}

function readDir (dir) {
	dir = path.resolve(dir).toLowerCase();
	const dirCache = (/^[A-Z]:\\(?:Program\s+Files(?:\s+\(x\d+\))?|Windows)(?=\\|$)/i.test(dir) && fsStorage) || fsCache;
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
		yield filePath;
		if (!/\.\w+$/.test(filePath)) {
			if (gitWin.fixPosixRoot(filePath)) {
				yield filePath + ".exe";
			} else {
				for (const extName of ext()) {
					yield filePath + extName;
				}
			}
		}
	}
}

function which (file, options) {
	for (const filePath of fileExtList(file, options)) {
		const dirname = path.dirname(filePath);
		const files = readDir(dirname);
		if (files) {
			const basename = files.get(path.basename(filePath));
			if (basename) {
				return path.join(dirname, basename);
			}
		}
	}
}

module.exports = which;
