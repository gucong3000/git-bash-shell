'use strict';
var cp = require('child_process');
var gitDir = require('./git-dir');
if (!process.env.LANG || process.env.LANG === 'C.UTF-8' || !/\w+.UTF-8$/.test(process.env.LANG)) {
	process.env.LANG = cp.spawnSync(gitDir('usr/bin/locale.exe'), ['-uU']).stdout.toString().trim();
}
module.exports = process.env.LANG;
