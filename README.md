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
> Please restart your terminal after successful installation.

## Usage

- npm config

  These npm config items will be compatible under Windows:
  - [shell](https://docs.npmjs.com/misc/config#shell)
  - [script-shell](https://docs.npmjs.com/misc/config#script-shell)

  You can edit [.npmrc](https://docs.npmjs.com/files/npmrc) to use a unified terminal:
  ```ini
    shell=/bin/bash
    script-shell=/bin/sh
  ```

- `env` command

  In your `package.json` file, you can add script prefix `env` to compatible with Widnows:
  ```json
  "scripts": {
    "posix": "env echo $SHELL",
  }
  ```
  Just run `npm run posix`, it will run for Windows and POSIX


- Node API:

  ```javascript
  await require('git-bash-shell')();
  const spawnSync = require('cross-spawn').sync;
  spawnSync('echo $(git --version)', {
    shell: '/bin/sh',
    stdio: 'inherit',
  });
  ```

## Environment Variables

### SHELL

- Default: `/bin/sh`
- Type: path

POSIX specific implementations of shell path.
