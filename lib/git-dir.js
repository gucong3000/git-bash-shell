'use strict';
var osArch = require('git-win/lib/os-arch');
var gitWin = require('git-win');
var path = require('path').win32;
var fs = require('fs');
var gitDir = path.join.bind(path, gitWin);
var mingw = 'mingw' + osArch;

if (osArch === 64) {
	(function () {
		try {
			if (fs.statSync(gitDir(mingw)).isDirectory()) {
				return;
			}
		} catch (ex) {
			//
		}
		mingw = 'mingw' + 32;
	})();
}
module.exports = gitDir;
module.exports.dir = gitWin;
module.exports.mingw = mingw;
