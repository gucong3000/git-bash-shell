"use strict";
const path = require("path");
const fs = require("fs");

const binDir = process.env.npm_config_prefix && __dirname.startsWith(path.join(process.env.npm_config_prefix, "/")) ? process.env.npm_config_prefix : path.resolve(__dirname, "..").replace(/(([\\/])node_modules\1.+)?$/, "/node_modules/.bin");

fs.unlink(path.join(binDir, "git-bash-shell.cmd"), (error) => {
	if (error) {
		console.error(error);
		process.exit(1);
	}
});
