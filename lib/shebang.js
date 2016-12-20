var fs = require('fs');
var lfCode = '\n'.charCodeAt(0);
var LRU = require('lru-cache');
var shebangCache = new LRU({ max: 500, maxAge: 30 * 1000 });  // Cache just for 30sec

function shebang(file) {
	// Check if it is in the cache first
	if (shebangCache.has(file)) {
		return shebangCache.get(file);
	}
	var contents = new Buffer(0xff);

	try {
		var fd = fs.openSync(file, 'r');
		fs.readSync(fd, contents, 0, 0xff, 0);
		fs.closeSync(fd);
	} catch (e) {
		/* empty */
	}

	if(contents && contents.slice(0, 2).toString() === '#!') {
		var cmd = contents.slice(2, contents.indexOf(lfCode)).toString().trim();
		if(cmd) {
			cmd = cmd.split(/\s+/);
			shebangCache.set(file, cmd);
			return cmd;
		}
	}
	shebangCache.set(file, null);
	return null;
}
module.exports = shebang;
