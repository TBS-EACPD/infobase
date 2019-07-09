GC InfoBase
========

[![CircleCI](https://circleci.com/gh/TBS-EACPD/InfoBase.svg?style=svg&circle-token=a99b6b8309e5edd904b0386c4a92c10bf5f43e29)](https://circleci.com/gh/TBS-EACPD/InfoBase)

Client-side code and content for the GC InfoBase.

## Table of Contents
- [GC InfoBase](#GC-InfoBase)
  - [Table of Contents](#Table-of-Contents)
  - [Getting Started](#Getting-Started)
    - [First time setup](#First-time-setup)
    - [Building the InfoBase](#Building-the-InfoBase)
    - [Visiting a local build](#Visiting-a-local-build)
  - [Tests](#Tests)
    - [Browser tests](#Browser-tests)
      - [Route load tests](#Route-load-tests)

## Getting Started

### First time setup
0. Have npm, node, and git installed
1. Open a terminal and go to the directory where you want to store the project, e.g. `cd ~/Documents` 
2. `git clone https://github.com/TBS-EACPD/InfoBase.git` then enter your github credentials

### Building the InfoBase
0. Go to the client directory of your InfoBase repo in a terminal, e.g. `cd ~/Documents/infobase/client`
1. `npm ci` to get node modules
2. `npm run IB_base_watch` to gather and bundle static files (csv's, svg's, extended bootstrap css). Can be left running to watch for changes
3. `npm run IB_q` to webpack the source code (`IB_q` builds quickly, requires a browser with ES6 support) or `npm run IB_dev` (transpiles and polyfills for testing in IE11/safari/mobile)\*

\* `IB_q` and `IB_dev` are not the only flavours of build. See package.json for a list of all build comands

### Visiting a local build
0. prerequisites: 1) follow the build steps above, 2) follow the steps up through spinning up a local InfoBase API from the [server README](https://github.com/TBS-EACPD/InfoBase/blob/master/server/README.md)
1. Go to the client directory of your InfoBase repo in a terminal, e.g. `cd ~/Documents/infobase/client`
2. `npm run serve-loopback` to start a server in the InfoBase directory, localhost only
3. open a browser and paste `localhost:8080/build/InfoBase/index-eng.html` in the address bar

Note: if you use `npm run serve` you can connect from other devices on your local network (e.g. test from mobile) by visiting `<your IP>:8080/build/InfoBase/index-eng.html`. Note that your IP will change when you move networks/disconnect a network. IB_q, or equivalent, needs to be restarted to update the IP env var, so if you have issues connecting to a local build from another device that's a good first step to try.

## Tests

### Browser tests

#### Route load tests
Route load tests are a quick and dirty form of fairly basic coverage. They just ensure that all routes are able to load without throwing an error. 
1. Do a full prod build (run both `IB_prod` and `a11y_prod`)
2. Have an active `npm run serve-loopback` process
3. `npm run headless_route_load_tests`

New route load tests can be added in `browser-tests/route-load-tests-config.js`.

