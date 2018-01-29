'use strict';
var assert = require('assert');
var fs = require('mz/fs');
var execFile = require('mz/child_process').execFile;
var exec = require('mz/child_process').exec;

describe('git path', function () {
	before(function () {
		require('../');
	});
	it('ls', function () {
		return execFile('ls').then(function (result) {
			result = result[0].split(/\r?\n/).filter(Boolean).sort();
			assert.ok(result.indexOf('package.json') >= 0);
			assert.ok(result.indexOf('README.md') >= 0);
		});
	});
	it('cat README.md', function () {
		return Promise.all([
			exec('cat README.md'),
			execFile('cat', ['README.md']),
			fs.readFile('README.md', {encoding: 'utf8'}),
		]).then(function (result) {
			assert.equal(result[0][0], result[2]);
			assert.equal(result[1][0], result[2]);
		});
	});
	it('zdiff --help', function () {
		return Promise.all([
			exec('zdiff --help'),
			execFile('zdiff', ['--help']),
		]).then(function (result) {
			assert.ok(result[0][0].indexOf('OPTIONs are the same as for') >= 0);
			assert.deepEqual(result[0], result[1]);
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
			assert.ok(result[0][0].indexOf('Basic configuration:') >= 0);
			assert.deepEqual(result[0], result[1]);
		});
	});
});
