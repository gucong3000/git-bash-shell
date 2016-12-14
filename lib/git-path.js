var child_process = require('child_process');
var osHomedir = require('os-homedir');
var assert = require('assert');
var path = require('path');
var fs = require('fs');

var gitPaths = {
	'ProgramFiles': 'Git',
	'ProgramFiles(x86)': 'Git',
	'CMDER_ROOT': 'vendor/git-for-windows',
};

function guessGitPath() {
	var paths = Object.keys(gitPaths).map(function(key) {
		if(process.env[key]) {
			return path.join(process.env[key], gitPaths[key]);
		}
	}).concat([
		'AppData/Local/Programs/Git',
		'AppData/Local/Atlassian/SourceTree/git_local',
	].map(function(subdir) {
		return path.join(osHomedir(), subdir);
	})).filter(Boolean);

	var gitInstallPath;

	paths.some(function(path) {
		var stats;
		try {
			stats = fs.statSync(path);
		} catch(ex) {
			//
		}
		if(stats && stats.isDirectory()) {
			gitInstallPath = path;
		}
		return gitInstallPath;
	});
	return gitInstallPath;
}

// 在注册表中查询git安装位置
function readRegGitInstallPath() {
	var output;
	try {
		output = child_process.execFileSync('REG', ['QUERY', 'HKLM\\SOFTWARE\\GitForWindows', '/v', 'InstallPath']);
	} catch(ex) {
		//
	}

	if(output && /\bInstallPath\s+\w+\s+(.+?)\r?\n/.test(output.toString())) {
		return RegExp.$1;
	}
}

function whereIsGit() {
	var output;
	try {
		output = child_process.execFileSync('where', ['git']);
	} catch(ex) {
		//
	}

	if(output && /^(.+?)\\cmd\\git.exe$/i.test(output.toString().trim())) {
		return RegExp.$1;
	}
}

var gitInstallPath = whereIsGit() || readRegGitInstallPath() || guessGitPath();

assert.ok(gitInstallPath, 'Git not found, please install Git and try again.\nhttps://git-scm.com/download/win\nhttps://npm.taobao.org/mirrors/git-for-windows/');

module.exports = gitInstallPath;
