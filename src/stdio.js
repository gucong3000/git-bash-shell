"use strict";
const iconv = require("iconv-lite");
const getEnvValue = require("./get-env-value");
let stdcp;
let charset;

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
	toEncoding = toEncoding && toEncoding.replace(/^.*\./, "");
	if (!isEncoding(toEncoding)) {
		return;
	}

	if (!stdcp) {
		stdcp = require("stdcp");
	}
	if (!charset) {
		charset = require("./charset.json");
	}

	const codepage = stdcp.getSync();
	if (codepage === charset.codepage[canonicalizeEncoding(toEncoding)]) {
		return;
	}
	const fromEncoding = charset.encoding[String(codepage)];
	if (!isEncoding(fromEncoding)) {
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
	return encoding.replace(/[\W_]+/g, "").toLowerCase();
}

module.exports = stdio;
