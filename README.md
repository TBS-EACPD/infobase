GC InfoBase
========
The GC InfoBase is an interactive data-visualization tool, transforming complex federal data into visual stories for Canadians. The live site can be found [here](https://www.tbs-sct.gc.ca/ems-sgd/edb-bdd/index-eng.html), where our [about page](https://www.tbs-sct.gc.ca/ems-sgd/edb-bdd/index-eng.html#about) contains further details on who we are and what we do.

## Table of Contents
- [Getting Started](#getting-started)
  * [First time setup](#first-time-setup)
  * [Compiling the InfoBase](#compiling-the-infobase)
- [Tests](#tests)
  * [Running browser tests](#running-browser-tests)

## Getting Started

### First time setup
0. Have npm, node, and git installed
1. Open a terminal and go to the directory where you want to store the project, e.g. `cd ~/Documents` 
2. `git clone https://github.com/TBS-EACPD/InfoBase.git` then enter your github credentials

### Compiling the InfoBase
0. Go to your InfoBase repo in a terminal, e.g. `cd ~/Documents/infobase`
1. `npm ci` (needs to be run least frequently, see following section for when)
2. `npm run IB_base`
3. `npm run IB_q` (compiles quickly, requires a browser with ES6 support) or `npm run IB_dev` (compiles to ES5 so you can test in IE/safari/mobile)
4. `sh serve-loopback` (starts the server, localhost only)
5. visit localhost:8080/build/InfoBase/index-eng.html

See package.json for a list of all build comands.

#### When do I need to restart/rerun these commands?
* `npm ci` when package-lock.json has changed (e.g. potentially on pull or branch change). Note: use `npm install` if you are adding a new package/updating a package version
* `IB_base` must be re-run when the data, svgs, or the css in src/extended-bootstrap changes. Changing branches is often a good reason to re-run IB_base
* `IB_q/IB_dev/IB_prod` can be left on watch while developing, may need to be restarted if certain errors occur. The most common example of a halting error is when an imported node_module can't be found (may occur on branch change or durring the execution of `npm ci`) 

## Tests

### Running browser tests
1. Do a full prod build (run both `IB_prod` and `a11y_prod`)
2. Have an active `sh serve-loopback` process
3. `npm run headless_test`
Note: these are slow, have fairly basic coverage, and are run by CI after each push to GitHub, so running them locally is generally unnecessary. They don't tell you much more than that all of the main routes at least load without error.
