git-bash-shell
===========

[![NPM version](https://img.shields.io/npm/v/git-bash-shell.svg?style=flat-square)](https://www.npmjs.com/package/git-bash-shell)
[![AppVeyor](https://img.shields.io/appveyor/ci/gucong3000/git-bash-shell.svg)](https://ci.appveyor.com/project/gucong3000/git-bash-shell)
[![Codecov](https://img.shields.io/codecov/c/github/gucong3000/git-bash-shell.svg)](https://codecov.io/gh/gucong3000/git-bash-shell)
[![David](https://img.shields.io/david/gucong3000/git-bash-shell.svg)](https://david-dm.org/gucong3000/git-bash-shell)

Use Git Bash as cross-platform shell for Windows

## Why

- Inject Bash or [Cmder](http://cmder.net/) to Windows shell `cmd.exe`.
- Add [POSIX](https://en.wikipedia.org/wiki/POSIX) style features for Node child process:
  - Add [Shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)) support for executable file.
  - Add POSIX style path support for executable file and `options.shell`.
  - Support for environment variable [PATHEXT](https://github.com/joyent/node/issues/2318).
- Add [POSIX](https://en.wikipedia.org/wiki/POSIX) style path support for Node file system.
  - POSIX style root path will be convert to Git install directory.
  - Support for [the Cygwin mount table](https://cygwin.com/cygwin-ug-net/using.html#mount-table).
  - Support for [The cygdrive path prefix](https://cygwin.com/cygwin-ug-net/using.html#cygdrive).
- Add POSIX style path support for these npm config items:
  - [shell](https://docs.npmjs.com/misc/config#shell)
  - [script-shell](https://docs.npmjs.com/misc/config#script-shell)

## Install

```bash
npm install git-bash-shell --global
exit 0
```
> Please restart your terminal after install.
> If Node version < 8, please install [util.promisify](https://www.npmjs.com/package/util.promisify)

## Usage

### `env` command

Add `env` as a prefix for command in terminal or [npm package scripts](https://docs.npmjs.com/cli/run-script.html)
```json
// package.json
"scripts": {
  "show-shell": "env echo $SHELL",
}
```

### Node API

```javascript
require('git-bash-shell');
const spawnSync = require('cross-spawn').sync;
spawnSync('echo $(git --version)', {
  shell: '/bin/sh',
  stdio: 'inherit',
});
```
### npm config

You can update config by command:
```bash
npm config set shell /bin/bash
npm config set script-shell /bin/sh
```
Or edit [.npmrc](https://docs.npmjs.com/files/npmrc) file in directory of `package.json`:
```bash
echo shell=/bin/bash>>.npmrc
echo script-shell=/bin/sh>>.npmrc
```

## Default Shell

- When `options.shell` set to `true` for child process, `process.env.SHELL` will be used, `process.env.ComSpec` is used as a fallback if `process.env.SHELL` is unavailable.
- When a npm config value set to [shell](https://docs.npmjs.com/misc/config#shell), it will inject to `cmd.exe`
