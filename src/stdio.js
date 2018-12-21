"use strict";
const iconv = require("iconv-lite");
const getEnvValue = require("./get-env-value");
let stdcp;
// HKEY_CLASSES_ROOT\MIME\Database\Charset
const magic = {
	// Japanese
	"932": "Shift_JIS",
	"20932": "EUC-JP",
	"51932": "EUC-JP",

	// Simplified Chinese
	"936": "GB2312",
	"20936": "GB2312-80",
	"51936": "EUC-CN",
	"52936": "HZ-GB2312",
	"54936": "GB18030",

	// Korean:
	"949": "KS_C_5601",
	"51949": "EUC-KR",

	// Traditional Chinese
	"950": "Big5",
	"51950": "EUC-TW",

	// macintosh
	"10000": "mac-roman",
	"10001": "mac-japanese",
	"10002": "mac-chinesetrad",
	"10003": "mac-korean",
	"10004": "mac-arabic",
	"10005": "mac-hebrew",
	"10006": "mac-greek",
	"10007": "mac-cyrillic",
	"10008": "mac-chinesesimp",
	"10010": "mac-romanian",
	"10017": "mac-ukrainian",
	"10021": "mac-thai",
	"10029": "mac-ce",
	"10079": "mac-icelandic",
	"10081": "mac-turkish",
	"10082": "mac-croatian",

	// KOI8 codepages
	"20866": "KOI8-R",
	"21866": "KOI8-U",

	// Miscellaneous
	"708": "ISO-8859-6",
	"16969": "UTF-64LE",
	"20127": "ASCII",
};

function getCodeName (codepage) {
	// https://docs.microsoft.com/en-us/windows/desktop/intl/code-page-identifiers
	// https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings

	if (codepage <= 500 || (codepage >= 737 && codepage <= 870) || (codepage > 1024 && codepage < 1200)) {
		// IBM codepages
		return `IBM${codepage}`;
	}
	if ((codepage > 1250 && codepage < 1300) || codepage === 874) {
		// Windows codepages: 874, 1250-1258
		return `Windows-${codepage}`;
	}
	if ((codepage > 20270 && codepage < 20500) || (codepage > 20870 && codepage < 20930)) {
		// IBM codepages
		return `IBM${codepage - 20000}`;
	}
	if (codepage > 28590 && codepage < 29000) {
		// ISO codepages: ISO-8859-1 - ISO-8859-16
		return `ISO-8859-${codepage - 28590}`;
	}
	if (codepage >= 65000) {
		// 65000	utf-7	Unicode (UTF-7)
		// 65001	utf-8	Unicode (UTF-8)
		return `UTF-${codepage - 64993}`;
	}

	codepage = String(codepage);

	if (/^120+\d$/.test(codepage)) {
		// 1200	UTF-16LE	Unicode UTF-16, little endian byte order (BMP of ISO 10646); available only to managed applications
		// 1201	UTF-16BE	Unicode UTF-16, big endian byte order; available only to managed applications
		// 12000	UTF-32LE	Unicode UTF-32, little endian byte order; available only to managed applications
		// 12001	UTF-32BE	Unicode UTF-32, big endian byte order; available only to managed applications
		return `UTF-${Math.pow(2, codepage.length)}${codepage.endsWith("0") ? "L" : "B"}E`;
	}

	return magic[codepage];
}

function getEncoding () {
	if (!stdcp) {
		stdcp = require("stdcp");
	}
	const codepage = stdcp.getSync();
	return [
		getCodeName(codepage),
		String(codepage),
		codepage > 1000 && String(codepage % 1000),
	].find(isEncoding);
}

function fixEncoding (stdio, fromEncoding, toEncoding) {
	if (Buffer.isBuffer(stdio)) {
		if (stdio.length) {
			stdio = iconv.encode(iconv.decode(stdio, fromEncoding), toEncoding);
		}
	} else if (stdio.pipe) {
		stdio = stdio.pipe(
			iconv.decodeStream(fromEncoding)
		);
		stdio = stdio.pipe(
			iconv.encodeStream(toEncoding)
		);
	}
	return stdio;
}

function fixOutput (ps, output, fromEncoding, toEncoding) {
	const stdio = ps[output].map((stdio, i) => (
		i && stdio ? fixEncoding(stdio, fromEncoding, toEncoding) : stdio
	));
	ps[output] = stdio;
	if (stdio[1]) {
		ps.stdout = stdio[1];
	}
	if (stdio[2]) {
		ps.stderr = stdio[2];
	}
}

function stdio (options) {
	let toEncoding = getEnvValue("LANG", options);
	toEncoding = toEncoding && /\.[^.]+$/.exec(toEncoding);
	toEncoding = toEncoding && toEncoding[0].slice(1);
	if (!isEncoding(toEncoding)) {
		return;
	}

	const fromEncoding = getEncoding();
	if (!fromEncoding || canonicalizeEncoding(fromEncoding) === canonicalizeEncoding(toEncoding)) {
		return;
	}

	if (this.stdio) {
		fixOutput(this, "stdio", fromEncoding, toEncoding);
	} else if (this.output) {
		fixOutput(this, "output", fromEncoding, toEncoding);
	}
}

function isEncoding (encoding) {
	return encoding && (Buffer.isEncoding(encoding) || iconv.encodingExists(encoding));
}
function canonicalizeEncoding (encoding) {
	// Canonicalize encoding name: strip all non-alphanumeric chars
	return encoding.replace(/\W+/g, "").toUpperCase();
}

module.exports = stdio;
