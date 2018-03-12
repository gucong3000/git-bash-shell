'use strict';
var pathStartsWith = require('../lib/path-starts-with');
var fixSpawnArgs = require('../lib/fix-spawn-args');
var getEnvPath = require('../lib/get-env-path');
var shebang = require('../lib/shebang');
var expect = require('expect.js');
var path = require('path');
var fs = require('fs-extra');
var os = require('os');

describe('API', function () {
	describe('get-env-path', function () {
		it('no result', function () {
			expect(getEnvPath({})).to.have.length(0);
		});

		it('ignore case', function () {
			var PATH = getEnvPath({
				PATH: 'mock',
			});
			expect(PATH).to.have.length(1);
			expect(PATH).to.contain('mock');
		});

		it('Environment variables', function () {
			var PATH = getEnvPath({
				WINDIR: 'C:\\windows',
				PATH: '%windir%\\mock\\%notexist%',
			});
			expect(PATH).to.have.length(1);
			expect(PATH).to.contain('C:\\windows\\mock\\%notexist%');
		});

		it('USERPROFILE', function () {
			var home = getEnvPath({
				HOMEDRIVE: 'c:',
				HOMEPATH: '\\Users\\mock',
			}, 'USERPROFILE');
			expect(home).to.equal('c:\\Users\\mock');
		});
	});
	describe('shebang', function () {
		var tempDir;
		function testShebang (file, contents) {
			file = path.resolve(tempDir, file);
			return fs.outputFile(file, contents).then(function () {
				return shebang(file);
			});
		}
		before(function () {
			return fs.mkdtemp(path.join(os.tmpdir(), 'git-bash-shell-shebang-')).then(function (dir) {
				tempDir = dir;
			});
		});
		after(function () {
			return fs.remove(tempDir);
		});
		it('npm bin with shebang', function () {
			return testShebang(
				'node_modules/.bin/with_shebang',
				'#!cat\n'
			).then(function (shebang) {
				expect(shebang).to.have.length(2);
				expect(shebang[0]).to.equal('cat');
				expect(shebang[1]).to.match(/\\node_modules\\.bin\\with_shebang$/);
			});
		});

		it('shebang without line break', function () {
			return testShebang(
				'without_break',
				'#!grep'
			).then(function (shebang) {
				expect(shebang).to.have.length(2);
				expect(shebang[0]).to.equal('grep');
				expect(shebang[1]).to.match(/\\without_break$/);
			});
		});

		it('file without shebang', function () {
			return testShebang(
				'without_shebang',
				'foo\nbar\n'
			).then(function (shebang) {
				expect(shebang).to.be(null);
			});
		});

		it('should use cache', function () {
			var file = path.resolve(tempDir, 'cache');
			return fs.writeFile(
				file,
				'#!mock'
			).then(function () {
				shebang(file);
				return fs.unlink(file);
			}).then(function () {
				var cmd = shebang(file);
				expect(cmd).to.have.length(2);
				expect(cmd[0]).to.equal('mock');
				expect(cmd[1]).to.match(/\\cache$/);
			});
		});
	});

	describe('fix-spawn-args', function () {
		var homeMockFile = path.join(os.homedir(), 'mock');
		after(function () {
			return fs.unlink(homeMockFile);
		});

		it('~/mock', function () {
			return fs.writeFile(homeMockFile, '').then(function () {
				var options = {
					file: '~/mock',
					args: [],
					envPairs: [],
				};
				fixSpawnArgs(options);
				expect(options.file).to.match(/^(.*)\\mock$/);
				expect(RegExp.$1).to.equal(os.homedir());
			});
		});

		it('Custom HOME path', function () {
			var options = {
				file: '~/shell.cmd',
				args: [],
				envPairs: [
					'HOME=' + path.resolve('bin'),
				],
			};
			fixSpawnArgs(options);
			expect(options.file).to.equal(path.resolve('bin/shell.cmd'));
		});

		it('bin/bash', function () {
			var options = {
				file: 'bin/shell',
				args: [],
				envPairs: [
					'PATHEXT=.CMD',
				],
			};
			fixSpawnArgs(options);
			expect(options.file).to.equal(path.resolve('bin/shell.cmd'));
		});
		it('ENOENT', function () {
			var options = {
				file: 'ENOENT',
				args: [],
				envPairs: [],
			};
			fixSpawnArgs(options);
			expect(options.file).to.equal('ENOENT');
		});
		it('should not modify args', function () {
			var options = {
				file: '/bin/bash',
				args: [
					'bash',
					'/d',
					'/s',
					'/c',
					'file.sh',
				],
				windowsVerbatimArguments: true,
				envPairs: [
				],
			};
			fixSpawnArgs(options);
			expect(options.args).have.length(3);
			expect(options.args[0]).to.equal('bash');
			expect(options.args[1]).to.equal('-c');
			expect(options.args[2]).to.equal('file.sh');
		});
		it('fixShellArgs', function () {
			var options = {
				file: 'bash',
				args: [
					'bash',
					'--posix',
					'file.sh',
				],
				envPairs: [
					'mock',
				],
			};
			fixSpawnArgs(options);
			expect(options.file).to.equal('bash');
			expect(options.args).have.length(3);
			expect(options.args[0]).to.equal('bash');
			expect(options.args[1]).to.equal('--posix');
			expect(options.args[2]).to.equal('file.sh');
		});
		it('pathStartsWith', function () {
			expect(pathStartsWith('/foo/bar', '/foo')).to.equal('/bar');
			expect(pathStartsWith('', '/foo')).to.not.ok();
		});
	});
});
