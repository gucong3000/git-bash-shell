'use strict';
var fs = require('mz/fs');
var path = require('path');
var execFile = require('mz/child_process').execFile;
var exec = require('mz/child_process').exec;
var expect = require('expect.js');

describe('integration', function () {
	before(function () {
		var root = path.resolve('lib');
		for (var file in require.cache) {
			if (file.startsWith(root)) {
				delete require.cache[file];
			}
		}
		delete require.cache[require.resolve('../')];
		process.env.SHELL = '';
		require('../')();
	});

	it('node.cmd', function () {
		return execFile('node_modules\\.bin\\node.cmd', [
			'-p',
			'process.env.SHELL',
		], {
			shell: 'cmd.exe',
		}).then(function (result) {
			expect(result[0].trim()).to.be.equal('/usr/bin/bash');
		});
	});

	it('/bin/bash', function () {
		return execFile('/bin/bash', [
			'-c',
			'echo hello',
		]).then(function (result) {
			expect(result[0].trim()).to.equal('hello');
		});
	});

	it('/bin/sh', function () {
		return execFile('/bin/bash', [
			'-c',
			'echo hello',
		]).then(function (result) {
			expect(result[0].trim()).to.equal('hello');
		});
	});
	it('ls', function () {
		return execFile('ls').then(function (result) {
			result = result[0].split(/\r?\n/).filter(Boolean).sort();
			expect(result).to.contain('package.json');
			expect(result).to.contain('README.md');
		});
	});
	it('cat README.md', function () {
		return Promise.all([
			exec('cat README.md'),
			execFile('cat', ['README.md']),
			fs.readFile('README.md', {encoding: 'utf8'}),
		]).then(function (result) {
			expect(result[0][0]).to.equal(result[2]);
			expect(result[1][0]).to.equal(result[2]);
		});
	});
	it('zdiff --help', function () {
		return Promise.all([
			exec('zdiff --help'),
			execFile('zdiff', ['--help']),
		]).then(function (result) {
			expect(result[0][0]).to.contain('OPTIONs are the same as for');
			expect(result[0][0]).to.be.equal(result[1][0]);
		});
	});
	it('eslint --help', function () {
		var env = Object.assign({}, process.env, {
			PATH: [
				'node_modules/.bin',
				process.env.PATH,
			].join(';'),
		});
		return Promise.all([
			exec('eslint --help', {
				env: env,
			}),
			execFile('eslint', ['--help'], {
				env: env,
			}),
		]).then(function (result) {
			expect(result[0][0]).to.contain('Basic configuration:');
			expect(result[0][0]).to.be.equal(result[1][0]);
		});
	});
});
