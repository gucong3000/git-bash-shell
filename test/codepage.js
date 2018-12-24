"use strict";
const iconv = require("iconv-lite");
const expect = require("chai").expect;
const stdcp = require("stdcp");
const stdio = require("../src/stdio");

describe("code page", () => {
	let getCP;
	let fromEncoding;
	let toEncoding;
	const iconvBak = {};

	before(() => {
		getCP = stdcp.getSync;
		Object.assign(iconvBak, iconv);
		iconv.decode = function (buf, encoding) {
			fromEncoding = fromEncoding || encoding;
			return iconvBak.decode.apply(iconv, arguments);
		};
		iconv.encode = function (str, encoding) {
			toEncoding = encoding;
			return iconvBak.encode.apply(iconv, arguments);
		};
	});

	after(() => {
		stdcp.getSync = getCP;
		Object.assign(iconv, iconvBak);
	});

	beforeEach(() => {
		fromEncoding = null;
		toEncoding = null;
	});

	function fixstdio (codepage, from, to, string, lang) {
		stdcp.getSync = () => codepage;
		const ps = {
			stdio: [
				null,
				Buffer.isBuffer(string) ? string : iconvBak.encode.apply(iconv, [string, from]),
			],
		};
		stdio.call(ps, {
			env: {
				LANG: `${lang || "C"}.${to}`,
			},
		});
		return ps;
	}

	function testcase (codepage, from, to, string, lang) {
		it(`${codepage} (${from}) => ${to}`, () => {
			const ps = fixstdio(codepage, from, to, string, lang);
			expect(fromEncoding.replace(/[\W_]/g, "").toLowerCase()).to.equal(from.replace(/[\W_]/g, "").toLowerCase());
			expect(toEncoding).to.equal(to);
			expect(ps.stdout.equals(iconvBak.encode.apply(iconv, [string, to]))).to.equal(true);
		});
	}
	const testStringLatin1 = "Hello123!£Å÷×çþÿ¿®";

	testcase(936, "GB2312", "UTF-8", "简体中文", "zh_CN");
	testcase(54936, "GB18030", "UTF-8", "简体中文", "zh_CN");
	testcase(950, "Big5", "UTF-8", "正體中文", "zh_TW");
	testcase(950, "Big5", "UTF-16LE", "正體中文", "zh_TW");
	testcase(437, "IBM437", "UTF-8", "testcase", "en_US");
	testcase(850, "IBM850", "UTF-8", testStringLatin1);
	testcase(1252, "ISO-8859-1", "UTF-8", testStringLatin1);
	testcase(28605, "ISO-8859-15", "UTF-8", testStringLatin1);
	testcase(1200, "UTF-16LE", "UTF-8", testStringLatin1);
	testcase(1201, "UTF-16BE", "UTF-8", testStringLatin1);
	testcase(65000, "UTF-7", "UTF-16LE", testStringLatin1);
	testcase(65000, "UTF-7", "UTF-16BE", testStringLatin1);
	testcase(65001, "UTF-8", "UTF-16LE", testStringLatin1);
	testcase(65001, "UTF-8", "UTF-16BE", testStringLatin1);

	it("1200 (UTF-16LE) => UTF-16LE", () => {
		const buf = Buffer.from("中文", "UTF-16LE");
		const ps = fixstdio(1200, "UTF-16LE", "UTF-16LE", buf);
		expect(ps.stdio[1]).to.equal(buf);
		expect(ps.stdout).to.not.ok;
		expect(fromEncoding).to.equal(null);
		expect(toEncoding).to.equal(null);
	});

	it("65001 (UTF-8) => UTF-8", () => {
		const buf = Buffer.from("中文", "UTF-8");
		const ps = fixstdio(65001, "UTF-8", "UTF-8", buf);
		expect(ps.stdio[1]).to.equal(buf);
		expect(ps.stdout).to.not.ok;
		expect(fromEncoding).to.equal(null);
		expect(toEncoding).to.equal(null);
	});

	it("fast buffer", () => {
		const ps = fixstdio(65001, "UTF-8", "GB2312", "", "zh_CN");
		expect(Buffer.isBuffer(ps.stdout)).to.equal(true);
		expect(ps.stdout).to.have.property("length", 0);
		expect(ps.stdout).to.equal(ps.stdio[1]);
		expect(fromEncoding).to.equal(null);
		expect(toEncoding).to.equal(null);
	});

	it("output", () => {
		stdcp.getSync = () => 950;
		const ps = {
			output: [
				null,
				iconvBak.encode.apply(iconv, ["正體中文", "Big5"]),
			],
		};
		stdio.call(ps, {
			env: {
				LANG: "zh_TW.UTF-16LE",
			},
		});
		expect(fromEncoding).to.equal("big5");
		expect(toEncoding).to.equal("UTF-16LE");
		expect(ps.stdout.equals(Buffer.from("正體中文", "UTF-16LE"))).to.equal(true);
	});

	it("stderr", () => {
		stdcp.getSync = () => 936;
		const ps = {
			stdio: [
				null,
				null,
				iconv.encode("简体中文", 936),
			],
		};
		stdio.call(ps, {
			env: {
				LANG: "zh_CN.UTF-16LE",
			},
		});
		expect(fromEncoding).to.equal("gb2312");
		expect(toEncoding).to.equal("UTF-16LE");
		expect(ps.stderr.equals(Buffer.from("简体中文", "UTF-16LE"))).to.equal(true);
	});

	it("unknow ps object type", () => {
		stdcp.getSync = () => 65001;
		const ps = {};
		stdio.call(ps, {
			env: {
				LANG: "zh_TW.UTF-16LE",
			},
		});
		expect(Object.keys(ps)).to.have.property("length", 0);
		expect(fromEncoding).to.equal(null);
		expect(toEncoding).to.equal(null);
	});

	it("unknow stdio type", () => {
		stdcp.getSync = () => 936;
		const ps = {
			stdio: [
				null,
				stdcp,
			],
		};
		stdio.call(ps, {
			env: {
				LANG: "zh_CN.UTF-8",
			},
		});
		expect(ps.stdout).to.equal(stdcp);
		expect(fromEncoding).to.equal(null);
		expect(toEncoding).to.equal(null);
	});

	it("unknow encoding UTF-64LE", () => {
		const ps = fixstdio(65001, "UTF-8", "UTF-64LE", "中文");
		expect(Buffer.isBuffer(ps.stdio[1])).to.equal(true);
		expect(ps.stdio[1].toString()).to.equal("中文");
		expect(ps.stdout).to.not.ok;
		expect(fromEncoding).to.equal(null);
		expect(toEncoding).to.equal(null);
	});

	it("unknow codepage", () => {
		const ps = fixstdio(600, "UTF-8", "UTF-16LE", "中文");
		expect(Buffer.isBuffer(ps.stdio[1])).to.equal(true);
		expect(ps.stdio[1].toString()).to.equal("中文");
		expect(ps.stdout).to.not.ok;
		expect(fromEncoding).to.equal(null);
		expect(toEncoding).to.equal(null);
	});
});
