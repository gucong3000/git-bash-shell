'use strict';
var gitDir = require('git-win');
module.exports = function isPosixShell (shell) {
	if (/(.*?)(?:ba|da|z)?sh(?:\.exe)?$/i.test(shell)) {
		var parent = RegExp.$1;
		return !parent || parent.startsWith(gitDir) || parent.endsWith('/');
	}
	return false;
};
