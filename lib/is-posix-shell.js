"use strict";
const pathStartsWith = require("./path-starts-with");
function isPosixShell (shell) {
	if (/(.*?)(?:ba|da|z)?sh(?:\.exe)?$/i.test(shell)) {
		const parent = RegExp.$1;
		return !parent || (pathStartsWith(parent) != null) || parent.endsWith("/");
	}
	return false;
}
module.exports = isPosixShell;
