'use strict';
var gitPath = require('git-win');
var path = require('path');
var newPath = ['usr/bin', 'usr/share/vim/vim74'].map(function (subDir) {
	return path.join(gitPath, subDir);
});
var delimiter = ';';
var paths = process.env.PATH.split(delimiter);
newPath = newPath.filter(function (dir) {
	return paths.indexOf(dir) < 0;
});
process.env.PATH = paths.concat(newPath).filter(Boolean).join(delimiter);
