"use strict";
if (!process.env.NODE_OPTIONS || !/--require\s+.*?\\git-bash-shell\\/i.test(process.env.NODE_OPTIONS)) {
	process.env.NODE_OPTIONS = [
		process.env.NODE_OPTIONS,
		"--require",
		require.resolve("../"),
	].filter(Boolean).join(" ");
}
module.exports = process.env.NODE_OPTIONS;
