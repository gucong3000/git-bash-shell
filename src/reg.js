"use strict";
const osArch = require("git-win/lib/os-arch");
const path = require("path");
const spawn = require("./spawn");
const getEnvValue = require("./get-env-value");
const regExe = path.join(getEnvValue("SystemRoot"), "System32/reg.exe");

// const fs = require('fs-extra');
// const Path = require('Path');

function parseValue (type, value) {
	switch (type) {
		case "REG_DWORD": {
			return parseInt(value);
		}
		// case 'REG_QWORD': {
		// 	value = hexToUint8Array(value);
		// 	break;
		// }
	}
	return value;
}

// function hexToUint8Array (hex) {
// 	const prefix = hex.slice(0, 2);
// 	hex = hex.slice(2);
// 	if ((hex.length % 2) !== 0) {
// 		hex = '0' + hex;
// 	}
// 	var view = new Uint8Array(hex.length / 2);
// 	for (var i = 0; i < hex.length; i += 2) {
// 		view[i / 2] = parseInt(prefix + hex.slice(i, i + 2));
// 	}
// 	return view;
// }

// function strToHex (value) {
// 	if (!value) {
// 		return '-';
// 	}
// 	if (value.includes(';')) {
// 		return 'hex(2):' + Array.from(value).map(char => (
// 			Number(char.charCodeAt(0)).toString(16)
// 		)).join(',');
// 	} else {
// 		return JSON.stringify(value);
// 	}
// }

async function add (key, values) {
	key = path.win32.normalize(key);
	const oldValues = await query(key);
	await Promise.all(
		Object.keys(values).map(valueName => {
			if (values[valueName] === oldValues[valueName]) {
				return;
			}
			if (values[valueName] == null) {
				return regDelete(key, valueName);
			}
			return spawn(
				[
					regExe,
					"ADD",
					key,
					"/v",
					valueName,
					"/t",
					Number.isFinite(values[valueName]) ? "REG_DWORD" : "REG_EXPAND_SZ",
					"/d",
					values[valueName],
					"/f",
					"/reg:" + osArch,
				],
				{
					argv0: "reg",
					stdio: "inherit",
					echo: true,
				}
			);
		})
	);
	delete reqCache[key];
}

const reqCache = {};

async function queryAsync (key) {
	const stdout = await spawn([
		regExe,
		"QUERY",
		key,
		"/reg:" + osArch,
	], {
		argv0: "reg",
		encoding: "utf8",
	});
	return new Proxy({}, {
		get: (target, name) => {
			if (typeof name === "string" && !target[name]) {
				const key = new RegExp(`^\\s+${name}\\s+(REG(?:_[A-Z]+)+)\\s+(.+)$`, "im").exec(stdout);
				if (key) {
					target[name] = key[2];
					return parseValue(key[1], key[2]);
				}
			}
			return target[name];
		},
	});
}

function query (key) {
	key = path.win32.normalize(key);
	if (reqCache[key]) {
		return reqCache[key];
	}
	reqCache[key] = queryAsync(key);
	return reqCache[key];
}

async function regDelete (key, valueName) {
	key = path.win32.normalize(key);
	const oldValues = await query(key);
	if (!oldValues[valueName]) {
		return;
	}
	delete reqCache[key];
	return spawn(
		[
			regExe,
			"DELETE",
			key,
			"/v",
			valueName,
			"/f",
			"/reg:" + osArch,
		],
		{
			argv0: "reg",
			stdio: "inherit",
			echo: true,
		}
	);
}

module.exports = {
	add,
	query,
	delete: regDelete,
};
