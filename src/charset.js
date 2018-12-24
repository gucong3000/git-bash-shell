"use strict";
const fs = require("fs");
const reg = require("./reg");
const promisify = require("util").promisify || require("util.promisify");

const writeFile = promisify(fs.writeFile);

async function identifiers () {
	const database = Object.assign(
		{
			codepage: {},
			encoding: {},
		},
		(() => {
			try {
				return require("./charset.json");
			} catch (ex) {
				//
			}
		})()
	);
	let res;
	try {
		const got = require("got");
		res = await got("https://docs.microsoft.com/en-us/windows/desktop/intl/code-page-identifiers");
	} catch (ex) {
		return database;
	}

	res.body.replace(/<tr>\s+<td>\s*(\d+)\s*<\/td>\s*<td>\s*(?:[xX]-)?(.+?)\s*<\/td>/g, (s, codepage, encoding) => {
		codepage = +codepage;
		encoding = canonicalizeEncoding(encoding);
		database.encoding[String(codepage)] = encoding;
		database.codepage[encoding] = codepage;
	});
	return database;
}

function canonicalizeEncoding (encoding) {
	// Canonicalize encoding name: strip all non-alphanumeric chars
	return encoding.replace(/[\W_]+/g, "").toLowerCase();
}

async function codepage (encoding) {
	const codepage = await reg.query("HKCR/MIME/Database/Codepage");
	Object.keys(codepage).forEach(cp => {
		const name = codepage[cp].WebCharset || codepage[cp].BodyCharset;
		encoding[cp] = canonicalizeEncoding(name);
	});
}

async function charset (codepage) {
	const charset = await reg.query("HKCR/MIME/Database/Charset");
	Object.keys(charset).map(name => {
		const data = charset[name];
		const cp = data.Codepage || data.InternetEncoding;
		if (cp) {
			codepage[canonicalizeEncoding(name)] = cp;
		} else if (data.AliasForCharset) {
			return [name, data.AliasForCharset];
		}
	}).forEach((charset) => {
		if (charset) {
			codepage[canonicalizeEncoding(charset[0])] = codepage[canonicalizeEncoding(charset[1])];
		}
	});
}

const magic = {
	"utf16le": 1200,
	"utf16be": 1201,
	"utf32le": 12000,
	"utf32be": 12001,
	"utf64le": 16969,
	"utf7": 65000,
	"utf8": 65001,
};

function patch (database) {
	for (const encoding in magic) {
		const codepage = magic[encoding];
		database.encoding[String(codepage)] = encoding;
		database.codepage[encoding] = codepage;
	}
}

function sort (database) {
	const encoding = {};
	Object.keys(database.encoding).sort((a, b) => a - b).forEach(key => {
		encoding[key] = database.encoding[key];
	});
	database.encoding = encoding;
	const codepage = {};
	Object.keys(database.codepage).sort().sort((a, b) => (
		database.codepage[a] - database.codepage[b] || a.localeCompare(b)
	)).forEach(key => {
		codepage[key] = database.codepage[key];
	});
	database.codepage = codepage;
}

async function database () {
	const database = await identifiers();
	await Promise.all([
		codepage(database.encoding),
		charset(database.codepage),
	]);
	patch(database);
	sort(database);
	await writeFile(require.resolve("./charset.json"), JSON.stringify(database, null, "\t") + "\n");
}

module.exports = database;
