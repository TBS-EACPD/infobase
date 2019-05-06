GC InfoBase
========

[![CircleCI](https://circleci.com/gh/TBS-EACPD/InfoBase.svg?style=svg&circle-token=a99b6b8309e5edd904b0386c4a92c10bf5f43e29)](https://circleci.com/gh/TBS-EACPD/InfoBase)

Client-side code and content for the GC InfoBase.

## Table of Contents
- [GC InfoBase](#gc-infobase)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [First time setup](#first-time-setup)
    - [Building the InfoBase](#building-the-infobase)
      - [When do I need to restart/rerun these commands?](#when-do-i-need-to-restartrerun-these-commands)
    - [Visiting a local build](#visiting-a-local-build)
  - [Tests](#tests)
    - [Browser tests](#browser-tests)
      - [Route load tests](#route-load-tests)

## Getting Started

### First time setup
0. Have npm, node, and git installed
1. Open a terminal and go to the directory where you want to store the project, e.g. `cd ~/Documents` 
2. `git clone https://github.com/TBS-EACPD/InfoBase.git` then enter your github credentials

### Building the InfoBase
0. Go to the client directory of your InfoBase repo in a terminal, e.g. `cd ~/Documents/infobase/client`
1. `npm ci` to get node modules
2. `npm run IB_base` to gather and bundle static files (csv's, svg's, extended bootstrap css)
3. `npm run IB_q` to webpack the source code (`IB_q` builds quickly, requires a browser with ES6 support) or `npm run IB_dev` (transpiles and polyfills for testing in IE11/safari/mobile)\*

\* `IB_q` and `IB_dev` are not the only flavours of build. See package.json for a list of all build comands

#### When do I need to restart/rerun these commands?
* `npm ci` when package-lock.json has changed (e.g. potentially on pull or branch change). Note: use `npm install` if you are adding a new package/updating a package version
* `IB_base` must be re-run when the data, svgs, or the css in src/extended-bootstrap changes. Changing branches is often a good reason to re-run `IB_base`
* `IB_q` and the like\** can be left running while you work, as they will automatically re-build whenever you save changes to any of the source files that they bundle. 

\** there are a number of build commands that produce different bundles, so you may need to stop and switch build scripts depending on your requirments. A running build can be killed with ctrl+c

### Visiting a local build
0. prerequisites: 1) follow the build steps above, 2) follow the steps up through spinning up a local InfoBase API from the [server README](https://github.com/TBS-EACPD/InfoBase/blob/master/server/README.md)
1. Go to the client directory of your InfoBase repo in a terminal, e.g. `cd ~/Documents/infobase/client`
2. `npm run serve-loopback` to start a server in the InfoBase directory, localhost only
3. open a browser and paste `localhost:8080/build/InfoBase/index-eng.html` in the address bar

## Tests

### Browser tests

#### Route load tests
Route load tests are a quick and dirty form of fairly basic coverage. They just ensure that all routes are able to load without throwing an error. 
1. Do a full prod build (run both `IB_prod` and `a11y_prod`)
2. Have an active `npm run serve-loopback` process
3. `npm run headless_route_load_tests`

New route load tests can be added in `browser-tests/route-load-tests-config.js`.

