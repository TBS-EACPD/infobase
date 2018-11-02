GC InfoBase
========
The GC InfoBase is an interactive data-visualization tool, transforming complex federal data into simple visual stories for Canadians. The live site can be found (here)[https://www.tbs-sct.gc.ca/ems-sgd/edb-bdd/index-eng.html], where our (about page)[https://www.tbs-sct.gc.ca/ems-sgd/edb-bdd/index-eng.html#about] contains further details on who we are and what we do.

## Table of Contents
- [Getting Started](#getting-started)
  * [First time setup](#first-time-setup)
  * [Compiling the InfoBase](#compiling-the-infobase)
- [Tests](#tests)
  * [Running browser tests](#running-browser-tests)
- [TODOs](#todos)

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
* `IB_q/IB_dev/IB_prod` can be left on watch while developing, may need to be restarted if certain errors occur. The most common example of an interupting error is a missing node_module (may occur on branch change or durring the execution of `npm ci`) 

## Tests

### Running browser tests
1. Do a full prod build (run both `IB_prod` and `a11y_prod`)
2. Have an active `sh serve-loopback` process
3. `npm run headless_test`
Note: these are slow, have fairly basic coverage, and are run by CI after each push to GitHub, so running them locally is generally unnecessary. They don't tell you much more than that all of the main routes at least load without error.

## TODOs

Some TODO's not worth moving to issues right now:
* move all global variables into a namespace
* swap out core/stat.js for something a more standardized, 
  there must be a JS library that calculates basic stats 
  like avg, co-var, etc..
* ditch the tableX naming syntax in favour of something more descriptive
* add in ability for an amount to be NA (instead of the current standard of reading blanks/.'s from csv's as 0)
* redo the formaters to make more sense. Currently 'big-int'
  refers to numbers which should be presented in the thousands
  while 'big-int-real' refers to numbers where no such adjustment
  happens. "compact" formatter automatically assume the amounts 
  are in "$".  Better to re-map to "big-int" being normal, 
  "big-int-k" being rounded to a nearest thousand and then
  add a formatter for 'compact' and 'compact$' to indicate
  more systemically what will be produced.  Consider doing
  this at the column level with sane defaults.
* graphics should manage their own panel spans rather than the 
  requesting function, currently ad-hoc adjustments are made 
  which luckily always work but it's not systematic
* get a boolean map in csv format loaded on start to declare which table/dept are available
* periodically keep up with html/svg -> pdf/png tech for possible exports feature
