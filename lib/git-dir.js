"use strict";
const osArch = require("git-win/lib/os-arch");
const gitWin = require("git-win");
const path = require("path").win32;
const fs = require("fs");
const gitDir = path.join.bind(path, gitWin);
let mingw = "mingw" + osArch;

if (osArch === 64) {
	(function () {
		try {
			if (fs.statSync(gitDir(mingw)).isDirectory()) {
				return;
			}
		} catch (ex) {
			//
		}
		mingw = "mingw" + 32;
	})();
}
module.exports = gitDir;
module.exports.dir = gitWin;
module.exports.mingw = mingw;
