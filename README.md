GC InfoBase
========

[![CircleCI](https://circleci.com/gh/TBS-EACPD/InfoBase.svg?style=svg&circle-token=a99b6b8309e5edd904b0386c4a92c10bf5f43e29)](https://circleci.com/gh/TBS-EACPD/InfoBase)

The GC InfoBase is an interactive data-visualization tool, transforming complex federal data into visual stories for Canadians. The live site can be found [here](https://www.tbs-sct.gc.ca/ems-sgd/edb-bdd/index-eng.html), where our [about page](https://www.tbs-sct.gc.ca/ems-sgd/edb-bdd/index-eng.html#about) contains further details on who we are and what we do.

## Table of Contents
- [Getting Started](#getting-started)
  * [First time setup](#first-time-setup)
  * [Building the InfoBase](#building-the-infobase)
  * [Visiting a local build](#visiting-a-local-build)
- [Tests](#tests)
  * [Browser tests](#browser-tests)
    + [Route load tests](#route-load-tests)

## Getting Started

### First time setup
0. Have npm, node, and git installed
1. Open a terminal and go to the directory where you want to store the project, e.g. `cd ~/Documents` 
2. `git clone https://github.com/TBS-EACPD/InfoBase.git` then enter your github credentials

### Building the InfoBase
0. Go to your InfoBase repo in a terminal, e.g. `cd ~/Documents/infobase`
1. `npm ci` to get node modules (needs to be run least frequently, see following section for when)
2. `npm run IB_base` to gather and bundle static files (csv's, svg's, extended bootstrap css)
3. `npm run IB_q` to webpack the source code (`IB_q` builds quickly, requires a browser with ES6 support) or `npm run IB_dev` (transpiles to ES5 so you can test in IE/safari/mobile)

See package.json for a list of all build comands.

#### When do I need to restart/rerun these commands?
* `npm ci` when package-lock.json has changed (e.g. potentially on pull or branch change). Note: use `npm install` if you are adding a new package/updating a package version
* `IB_base` must be re-run when the data, svgs, or the css in src/extended-bootstrap changes. Changing branches is often a good reason to re-run IB_base
* `IB_q/IB_dev/IB_prod` can be left on watch while developing, may need to be restarted if certain errors occur. Again, there are a number of build commands that produce different bundles, so you may need to stop and switch build scripts depending on your requirments. 

### Visiting a local build
0. Go to your InfoBase repo in a terminal, e.g. `cd ~/Documents/infobase`
1. `sh serve-loopback` to start a server in the InfoBase directory, localhost only
2. visit localhost:8080/build/InfoBase/index-eng.html

## Tests

### Browser tests

#### Route load tests
Route load tests are a quick and dirty form of fairly basic coverage. They just ensure that all routes are able to load without throwing an error. 
1. Do a full prod build (run both `IB_prod` and `a11y_prod`)
2. Have an active `sh serve-loopback` process
3. `npm run headless_route_load_tests`
New route load tests can be added in `browser-tests/route-load-tests-config.js`.

