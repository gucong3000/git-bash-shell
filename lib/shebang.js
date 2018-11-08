"use strict";
const LRU = require("lru-cache");
const fs = require("fs");
const lfCode = "\n".charCodeAt(0);
const shebangCache = new LRU({ max: 500, maxAge: 30 * 1000 }); // Cache just for 30sec
const shebangStorage = global.Map && new Map();

function shebang (file) {
	let contents;
	let bytesRead;
	try {
		const fd = fs.openSync(file, "r");
		contents = Buffer.alloc(0xff);
		bytesRead = fs.readSync(fd, contents, 0, 0xff, 0);
		fs.closeSync(fd);
	} catch (e) {
		return null;
	}
	let length = contents.indexOf(lfCode);
	if (length < 0) {
		length = bytesRead;
	}
	contents = contents.slice(0, length).toString();
	return /^#!\s*(\S.*)/.test(contents) ? RegExp.$1 : null;
}
module.exports = function (file) {
	if (/\.(?:exe|cmd|bat|com)$/i.test(file)) {
		return null;
	}
	let result;
	const shebangResultCache = (/^[A-Z]:\\(?:Program\s+Files(?:\s+\(x\d+\))?|Windows)(?=\\|$)/i.test(file) && shebangStorage) || shebangCache;
	file = file.toLowerCase();
	if (shebangResultCache.has(file)) {
		result = shebangResultCache.get(file);
	} else {
		result = shebang(file);
		shebangResultCache.set(file, result);
	}
	return result;
};
