var describe = require('mocha').describe;
// var before = require('mocha').before;
// var after = require('mocha').after;
var it = require('mocha').it;
var assert = require('assert');

var fs = require('mz/fs');
var execFile = require('mz/child_process').execFile;
var exec = require('mz/child_process').exec;
var Promise = require('any-promise');
require('../');

describe('git path', function() {
	it('ls', function() {
		return execFile('ls').then(function(result) {
			result = result[0].split(/\r?\n/).filter(Boolean).sort();
			assert.ok(result.indexOf('package.json') >= 0);
			assert.ok(result.indexOf('README.md') >= 0);
		});
	});
	it('cat README.md', function() {
		return Promise.all([
			exec('cat README.md'),
			execFile('cat', ['README.md']),
			fs.readFile('README.md', {encoding:'utf8'}),
		]).then(function(result) {
			assert.equal(result[0][0], result[2]);
			assert.equal(result[1][0], result[2]);
		});
	});
	it('zdiff --help', function() {
		return Promise.all([
			exec('zdiff --help'),
			execFile('/usr/bin/zdiff', ['--help']),
		]).then(function(result) {
			assert.ok(result[0][0].indexOf('OPTIONs are the same as for') >= 0);
			assert.deepEqual(result[0], result[1]);
		});
	});
});
