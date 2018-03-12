'use strict';
var gitWin = require('git-win');
var path = require('path');
var expect = require('expect.js');

describe('environment', function () {
	before(function () {
		delete process.env.LANG;
		delete process.env.HOME;
		delete process.env.NODE_OPTIONS;
		delete process.env.SHELL;
		delete process.env.ComSpec;
		delete process.env.npm_config_script_shell;
	});
	describe('env-path', function () {
		describe('PATH', function () {
			var PATH;
			before(function () {
				delete require.cache[require.resolve('../lib/env-path')];
				require('../lib/env-path');
				PATH = process.env.PATH.split(/\s*;\s*/);
			});
			it('Git/cmd', function () {
				expect(PATH).to.contain(path.join(gitWin, 'cmd'));
			});
			it('Git/usr/bin', function () {
				expect(PATH).to.contain(path.join(gitWin, 'usr/bin'));
			});
			it('Git/usr/share/vim/vim74', function () {
				expect(PATH).to.contain(path.join(gitWin, 'usr/share/vim/vim74'));
			});
			it('git-bash-shell/bin/wrap', function () {
				var wrap = path.resolve(__dirname, '../bin/wrap');
				expect(PATH[0]).to.equal(wrap);
			});
		});
		describe('Windows install dir', function () {
			var env = Object.assign({}, process.env);
			after(function () {
				Object.assign(process.env, env);
			});
			beforeEach(function () {
				delete require.cache[require.resolve('../lib/env-path')];
				delete process.env.windir;
				delete process.env.SystemRoot;
				delete process.env.PATH;
			});
			it('windir', function () {
				process.env.PATH = 'C:\\win;C:\\cygwin64';
				process.env.windir = 'C:\\win';
				require('../lib/env-path');
				expect(process.env.PATH).match(/^.+?\\git-bash-shell\\bin\\wrap;C:\\cygwin64;.*?;C:\\win$/);
			});
			it('SystemRoot', function () {
				process.env.PATH = 'C:\\win;C:\\cygwin64';
				process.env.SystemRoot = 'C:\\win';
				require('../lib/env-path');
				expect(process.env.PATH).match(/^.+?\\git-bash-shell\\bin\\wrap;C:\\cygwin64;.*?;C:\\win$/);
			});
		});
	});
	describe('NODE_OPTIONS', function () {
		beforeEach(function () {
			delete require.cache[require.resolve('../lib/env-node-options')];
			delete process.env.NODE_OPTIONS;
		});

		it('inheritance NODE_OPTIONS', function () {
			process.env.NODE_OPTIONS = 'test mock';
			require('../lib/env-node-options');
			expect(process.env.NODE_OPTIONS).to.match(/^test mock --require (.+)$/);
			expect(RegExp.$1).to.equal(require.resolve('../'));
		});

		it('not change NODE_OPTIONS', function () {
			process.env.NODE_OPTIONS = '--require c:\\git-bash-shell\\index.js';
			require('../lib/env-node-options');
			expect(process.env.NODE_OPTIONS).to.equal('--require c:\\git-bash-shell\\index.js');
		});

		it('init NODE_OPTIONS', function () {
			require('../lib/env-node-options');
			expect(process.env.NODE_OPTIONS).to.contain('--require ');
			expect(process.env.NODE_OPTIONS).to.contain(require.resolve('../'));
		});
	});
	describe('shell', function () {
		before(function () {
			delete require.cache[require.resolve('../lib/env-shell')];
			delete process.env.SHELL;
			delete process.env.ComSpec;
			delete process.env.npm_config_script_shell;
			require('../lib/env-shell');
		});

		it('SHELL', function () {
			expect(process.env.SHELL).to.equal('/usr/bin/bash');
		});

		it('ComSpec', function () {
			expect(process.env.ComSpec).to.match(/^(.*)\\usr\\bin\\bash.exe$/);
			expect(RegExp.$1).to.equal(gitWin);
		});

		it('npm_config_script_shell', function () {
			expect(process.env.npm_config_script_shell).to.equal(process.env.ComSpec);
		});
	});

	describe('env-lang', function () {
		beforeEach(function () {
			delete require.cache[require.resolve('../lib/env-lang')];
			delete process.env.LANG;
		});
		it('LANG', function () {
			require('../lib/env-lang');
			expect(process.env.LANG).to.match(/^[a-z]+(?:_[A-Z]+)\.UTF-8$/i);
		});
	});

	describe('env-shell', function () {
		beforeEach(function () {
			delete require.cache[require.resolve('../lib/env-shell')];
			delete process.env.SHELL;
			delete process.env.ComSpec;
			delete process.env.npm_config_script_shell;
		});
		it('SHELL=cmd.exe', function () {
			process.env.SHELL = 'cmd';
			require('../lib/env-shell');
			expect(process.env.SHELL).to.match(/^(.*)\\system32\\cmd.exe$/i);
			expect(RegExp.$1.toUpperCase()).to.equal(process.env.SystemRoot.toUpperCase());
			expect(process.env.ComSpec).to.equal(process.env.SHELL);
			expect(process.env.npm_config_script_shell).to.be(undefined);
		});
		it('SHELL=notexist.exe', function () {
			var notexist = 'notexist.exe';
			process.env.SHELL = notexist;
			require('../lib/env-shell');
			expect(process.env.SHELL).to.eql(notexist);
			expect(process.env.ComSpec).to.equal(notexist);
			expect(process.env.npm_config_script_shell).to.be(undefined);
		});
		it('SHELL=C:\\Windows\\System32\\cmd.exe', function () {
			var cmd = 'C:\\Windows\\System32\\cmd.exe';
			process.env.SHELL = cmd;
			require('../lib/env-shell');
			expect(process.env.SHELL).to.eql(cmd);
			expect(process.env.ComSpec).to.equal(cmd);
			expect(process.env.npm_config_script_shell).to.be(undefined);
		});
		it('SHELL=/usr/bin/dash.exe', function () {
			process.env.SHELL = '/usr/bin/dash.exe';
			require('../lib/env-shell');
			expect(process.env.ComSpec).to.match(/^(.*)\\usr\\bin\\dash.exe$/);
			expect(RegExp.$1).to.equal(gitWin);
			expect(process.env.npm_config_script_shell).to.be(process.env.ComSpec);
			expect(process.env.SHELL).to.equal('/usr/bin/dash');
		});
		it('SHELL=bash', function () {
			process.env.SHELL = 'bash';
			require('../lib/env-shell');
			expect(process.env.ComSpec).to.match(/^(.*)\\usr\\bin\\bash.exe$/);
			expect(RegExp.$1).to.equal(gitWin);
			expect(process.env.npm_config_script_shell).to.be(process.env.ComSpec);
			expect(process.env.SHELL).to.equal('/usr/bin/bash');
		});
		it('SHELL=/c/Program Files/Git/bin/bash.exe', function () {
			process.env.SHELL = path.join(gitWin, 'bin/bash.exe').replace(/^(\w):\\/g, '/$1/').replace(/\\/g, '/');
			require('../lib/env-shell');
			expect(process.env.ComSpec).to.match(/^(.*)\\bin\\bash.exe$/);
			expect(RegExp.$1).to.equal(gitWin);
			expect(process.env.npm_config_script_shell).to.be(process.env.ComSpec);
			expect(process.env.SHELL).to.equal('/bin/bash');
		});
	});
});
