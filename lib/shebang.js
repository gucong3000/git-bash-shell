'use strict';
var stringArgv = require('string-argv');
var LRU = require('lru-cache');
var path = require('path');
var fs = require('fs');
var lfCode = '\n'.charCodeAt(0);
var shebangCache = new LRU({ max: 500, maxAge: 30 * 1000 }); // Cache just for 30sec

function shebang (file) {
	var contents;
	var cmd;
	if (/\\node_modules\\\.bin\\/.test(file)) {
		contents = fs.readFileSync(file, 'utf8');
		if (/(\r?\n)\s*else\s*\1\s*node\s+"\$basedir\/(.+?)"\s+"\$@"\s*\1\s*(\w+)=\$\?\s*\1\s*fi\s*\1\s*exit\s+\$\3\s*(\1|$)/.test(contents)) {
			var js = RegExp.$2;
			cmd = [
				process.execPath,
				'--require',
				require.resolve('../'),
				path.resolve(path.dirname(file), js),
			];
			return cmd;
		}
		contents = contents.match(/^.*/)[0];
	} else {
		contents = Buffer.alloc(0xff);
		var bytesRead;
		try {
			var fd = fs.openSync(file, 'r');
			bytesRead = fs.readSync(fd, contents, 0, 0xff, 0);
			fs.closeSync(fd);
		} catch (e) {
			/* empty */
		}
		var length = contents.indexOf(lfCode);
		if (length < 0) {
			length = bytesRead;
		}
		contents = contents.slice(0, length).toString();
	}

	contents = /^#!/.test(contents) && RegExp.rightContext.trim();

	if (contents) {
		cmd = stringArgv(contents);
		cmd.push(file);
		return cmd;
	}
}
module.exports = function (file) {
	var cmd = null;
	if (shebangCache.has(file)) {
		cmd = shebangCache.get(file);
	} else {
		cmd = shebang(file) || null;
		shebangCache.set(file, cmd);
	}
	return cmd;
};
