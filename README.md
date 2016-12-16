git-bash-shell
===========

[![NPM version](https://img.shields.io/npm/v/git-bash-shell.svg?style=flat-square)](https://www.npmjs.com/package/git-bash-shell)
[![AppVeyor](https://img.shields.io/appveyor/ci/gucong3000/git-bash-shell.svg)](https://ci.appveyor.com/project/gucong3000/git-bash-shell)

Use Linux command under Windows

## Why

- Support [PATHEXT](https://github.com/joyent/node/issues/2318)
- Support [shebangs](http://pt.wikipedia.org/wiki/Shebang)
- Use Git [Bash](https://pt.wikipedia.org/wiki/Bash) as shell of child process.


## Install

```bash
npm install --save git-bash-shell
```

## Usage

```javascript
require('git-bash-shell');
const spawn = require('child_process').spawn;
const ls = spawn('cat', ['README.md']);

ls.stdout.on('data', (data) => {
	console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
	console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
	console.log(`child process exited with code ${code}`);
});
```
