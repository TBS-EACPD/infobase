InfoBase
========

## First time setup
0. Assuming you have npm, node, and git installed
1. Open terminal and go to a folder where you want to store the project e.g. `cd ~/Documents` 
2. `git clone https://github.com/TBS-EACPD/InfoBase.git` then enter your github credentials.
3. `cd /InfoBase`

## compiling the InfoBase
0. `npm ci` (needs to be run least frequently, see following section for when)
1. `npm run IB_base`
2. `npm run IB_q` (compiles quickly, only works in chrome) or `npm run IB_dev` (compiles to ES5 so you can test in IE/safari/mobile)
3. sh serve-loopback (starts the server, localhost only)
4. visit localhost:8080/build/InfoBase/index-eng.html

### when do I need to restart/rerun these commands?
* `npm ci` when package-lock.json is changed. Note: use `npm install` if you are adding a new package/updating a package version
* `IB_base` must be re-run when the data, svgs, or css in src/extended-bootstrap changes. Changing branches is often a good reason to re-run IB_base.
* `IB_q/IB_dev/IB_prod` can be left on watch while developing but must be re-run when you change branches. Sometimes you don't need to, but if the build-process changes it's necessary. 


Some TODO's not worth moving to issues right now
---------------------
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
