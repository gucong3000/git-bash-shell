'use strict';
if (!process.env.LANG) {
	process.env.LANG = require('os-locale').sync({spawn: true}) + '.UTF-8';
}
