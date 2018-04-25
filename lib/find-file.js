"use strict";
const fs = require("fs");
const LRU = require("lru-cache");
const pathUnique = require("./path-unique");

const cache = new LRU({ max: 500, maxAge: 30 * 1000 }); // Cache just for 30sec

function isFileSync (file) {
	// Check if its resolved in the cache
	if (cache.has(file)) {
		return cache.get(file);
	}

	let stats;

	try {
		stats = fs.statSync(file);
	} catch (ex) {
		//
	}

	stats = stats && stats.isFile();
	cache.set(file, stats);

	return stats;
}

// 搜索数组中第一个真实存在的可执行文件的全路径
function findFile (pathList, pathExt) {
	let result;
	if (pathUnique(pathList).some((file) => {
		result = file;
		return isFileSync(result) || pathExt.some((ext) => {
			result = file + ext.toLowerCase();
			return isFileSync(result);
		});
	})) {
		return result;
	}
}

module.exports = findFile;
