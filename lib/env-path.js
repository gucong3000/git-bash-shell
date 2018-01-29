'use strict';
var gitPath = require('git-win');
var path = require('path');
var newPath = [
	'usr/bin',
	'usr/share/vim/vim74',
].map(function (subDir) {
	return path.join(gitPath, subDir);
});
var delimiter = ';';
process.env.PATH = process.env.PATH.split(delimiter).filter(function (dir) {
	return dir && !dir.startsWith(gitPath);
}).concat(newPath).join(delimiter);
