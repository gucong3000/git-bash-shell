"use strict";
const gitDir = require("./git-dir");

function sep (path) {
	return path.replace(/\\/g, "/");
}

function pathStartsWith (path, serachPath) {
	if (!path) {
		return;
	}
	if (!serachPath) {
		serachPath = gitDir.dir;
	}
	if (/^\w+:/.test(serachPath)) {
		path = path.replace(/^(?:\/\w+)?\/(\w)(\/)/, "$1:$2");
	}
	serachPath = sep(serachPath.toLocaleUpperCase());
	path = sep(path);
	if (serachPath === path.slice(0, serachPath.length).toLocaleUpperCase()) {
		return path.slice(serachPath.length).replace(/\.(?:exe|com|cmd|bat)$/i, "");
	}
}
module.exports = pathStartsWith;
