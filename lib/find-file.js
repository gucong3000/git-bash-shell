'use strict';
var fs = require('fs');
var LRU = require('lru-cache');
var pathUnique = require('./path-unique');

var cache = new LRU({ max: 500, maxAge: 30 * 1000 }); // Cache just for 30sec

function isFileSync (file) {
	// Check if its resolved in the cache
	if (cache.has(file)) {
		return cache.get(file);
	}

	var stats;

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
	var result;
	if (pathUnique(pathList).some(function (file) {
		result = file;
		return isFileSync(result) || pathExt.some(function (ext) {
			result = file + ext.toLowerCase();
			return isFileSync(result);
		});
	})) {
		return result;
	}
}

module.exports = findFile;
