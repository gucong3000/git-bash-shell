'use strict';
function sep (path) {
	return path.replace(/\\/g, '/');
}
module.exports = function pathStartsWith (path, serachPath) {
	if (!path) {
		return;
	}
	if (/^\w+:/.test(serachPath)) {
		path = path.replace(/^(?:\/\w+)?\/(\w)(\/)/, '$1:$2');
	}
	serachPath = sep(serachPath.toLocaleUpperCase());
	path = sep(path);
	if (serachPath === path.slice(0, serachPath.length).toLocaleUpperCase()) {
		return path.slice(serachPath.length).replace(/\.(?:exe|com|cmd|bat)$/i, '');
	}
};
