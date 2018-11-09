git-bash-shell
===========

[![NPM version](https://img.shields.io/npm/v/git-bash-shell.svg?style=flat-square)](https://www.npmjs.com/package/git-bash-shell)
[![AppVeyor](https://img.shields.io/appveyor/ci/gucong3000/git-bash-shell.svg)](https://ci.appveyor.com/project/gucong3000/git-bash-shell)
[![Codecov](https://img.shields.io/codecov/c/github/gucong3000/git-bash-shell.svg)](https://codecov.io/gh/gucong3000/git-bash-shell)
[![David](https://img.shields.io/david/gucong3000/git-bash-shell.svg)](https://david-dm.org/gucong3000/git-bash-shell)

Use Git Bash as cross-platform shell for Windows

## Why

- Use Git [Bash](https://en.wikipedia.org/wiki/Bash_(Unix_shell)) as cross-platform shell for child process or [npm run scripts](https://docs.npmjs.com/cli/run-script).
- Support [POSIX](https://en.wikipedia.org/wiki/POSIX) file path.
- Support [Shebang](https://en.wikipedia.org/wiki/Shebang_(Unix))
- Support [PATHEXT](https://github.com/joyent/node/issues/2318)
- Support [Shell script](https://en.wikipedia.org/wiki/Shell_script)

## Install

```bash
npm install --save git-bash-shell
```

## Usage

In your `package.json` file, you can add script prefix to compatible with Widnows: `env`, `bash`, `sh`, `dash` or `$SHELL`.

```json
"scripts": {
  "git:ls-files": "git ls-files > /tmp/git-files",
  "lint:eslint": "eslint `grep \\.js$ /tmp/git-files`",
  "lint:eclint": "eclint check `cat /tmp/git-files`",
  "lint-flow": "env npm-run-all --parallel git:ls-files lint",
}
```
just run `npm run lint-flow`, and all npm scripts will work under Windows

Node API:

```javascript
require('git-bash-shell')();
const spawnSync = require('cross-spawn').sync;
spawnSync('echo `git --version`', {
  shell: true,
  stdio: 'inherit',
});
```

## Environment Variables

### SHELL

- Default: `/usr/bin/bash`
- Type: path

POSIX specific implementations of shell path.

### ComSpec

- Default: `%ProgramFiles%\Git\usr\bin\bash.exe`
- Type: path

The shell to use for scripts run with the npm run command.
If you want to turn off SHELL feature, assign assign environment variable to `cmd.exe`


### PATHEXT

- Default: `%PATHEXT%`
- Type: path list

';'-separated list of suffix to executable file search.
If you want to turn off PATHEXT feature, just empty this environment variable

### HOME

- Default: `%USERPROFILE%`
- Type: path

Directory path of `~/`
