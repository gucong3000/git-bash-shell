'use strict';
module.exports = function pathStartsWith (path, serachPath) {
	return path && serachPath.toLocaleUpperCase() === path.slice(0, serachPath.length).toLocaleUpperCase();
};
