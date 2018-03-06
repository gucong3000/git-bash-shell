'use strict';
var os = require('os');

if (!process.env.HOME) {
	process.env.HOME = os.homedir();
}

module.exports = process.env.HOME;
