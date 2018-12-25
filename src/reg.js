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
		case "REG_BINARY": {
			return binToUint8Array(value);
		}
		// case "REG_QWORD": {
		// 	return hexToUint8Array(value);
		// }
	}
	return value;
}

// function hexToUint8Array (hex) {
// 	const prefix = hex.slice(0, 2);
// 	hex = hex.slice(2);
// 	if ((hex.length % 2) !== 0) {
// 		hex = "0" + hex;
// 	}
// 	const view = new Uint8Array(hex.length / 2);
// 	for (let i = 0; i < hex.length; i += 2) {
// 		view[i / 2] = parseInt(prefix + hex.slice(i, i + 2));
// 	}
// 	return view;
// }

function binToUint8Array (bin) {
	const view = new Uint8Array(bin.length / 2);
	for (let i = 0; i < bin.length; i += 2) {
		view[i / 2] = parseInt(bin.slice(i, i + 2), 16);
	}
	return view;
}

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
	const result = {};
	const stdout = await spawn([
		regExe,
		"QUERY",
		key,
		"/s",
		"/reg:" + osArch,
	], {
		argv0: "reg",
		encoding: "utf8",
	});
	let prefix;
	let currKey = result;
	stdout.split(/[\r\n]+/g).forEach(line => {
		if (line.startsWith("HKEY_")) {
			if (prefix == null) {
				prefix = "";
				key = line.slice(0, line.indexOf("\\") + key.replace(/^\w+/, "").length);
			}
			prefix = line.slice(key.length + 1);
			currKey = result;
			prefix.split(/\\/g).filter(Boolean).forEach(key => {
				if (!currKey[key]) {
					currKey[key] = {};
				}
				currKey = currKey[key];
			});
		} else if (/^\s+(.*?)\s+(REG_[A-Z_]+)\s+(.*?)$/.test(line)) {
			const {
				$1: key,
				$2: type,
				$3: value,
			} = RegExp;
			currKey[key] = parseValue(type, value);
		}
	});
	return result;
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
