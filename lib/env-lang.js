"use strict";
const spawn = require("./spawn");
const which = require("./which");
const lang = process.env.LANG;

async function getLang () {
	let result = await spawn([
		which("/usr/bin/locale"),
		"--user",
		"--utf",
	], {
		encoding: "utf8",
	});
	result = result.trim();
	process.env.LANG = result;
	return result;
}

module.exports = !lang || lang === "C.UTF-8" || !/\w+.UTF-8$/.test(lang) ? getLang() : lang;
