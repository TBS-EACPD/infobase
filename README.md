InfoBase
========

### basic workflow

* To run an http server, run `sh serve`
* Unit testing
  * note that you may or may not want babel to transpile your unit tests. I don't know. 
  * For output in the terminal, you need two windows
    * one for continuously compiling the test bundle `npm run node_unit`
    * another for running the tests: `mocha --watch tests/test.build.js`
  * For output in a browser tab, `npm run browser_unit` and visit /tests/index.html
    * this is useful if you need the browser debugger or want a pretty list of all unit-tests
    * it can also help 
* Integration tests
  * Coming soon
* scraping
  * Docs coming soon
* More information on the build process can be found by reading the 'scripts' part of the package.json and seeing what kind of arguments they set up for proc_build/wpBuild.js, which gives a brief overview of how it handles command line arguments in comments.
* Note on linting: it's currently turned off because the output is overwhelming. IF you'd like, you can do `eslint "src/**/*.js"` to see this output. Later on when we get our code quality improved, it will become part of webpack's output.

* `require('file.css')` will inject that css into a seperate bundle (i.e. not in app-[lang].min) that gets automatically loaded and used properly as css
* `require('file.yaml')` will pipe the yaml through a process that strips out the wrong language (this is done when compiling, not at run time) and spit out the yaml's object to use in js.
* dynamic requires
  * All require statements should satisfy the following
    * a simple, literal string 
      * don't use js expressions in require's argument. e.g. `require(IB_PLUS ? 'plus.csv' : 'minus.csv' )`
      * don't use variables e.g. `var str = 'plus.csv'; require(str);`
    * they should be at the top of the file, before any other statements
    * require statements should not be not be nested within an expression e.g `load_csv(require('minus.csv'));`
  * We're aware of when we violate this. Don't go fixing these.


Check out the project and start with the \_\_module\_\_.html file in the *docs* folder.

Known areas to improve
---------------------

###Easy
* integrate handlebars 2.0 & lodash 3.4 and check
  for problems
* update the js-yaml library
* move all global variables into a namespace
* fix how the lookups work. Currently inflexible
* convert the lookups in table_common.js into a CSV

###Medium
* ~~add in build tasks for for dev and production~~
* easy_access icon list is repetitive and inflexible
* the queries are probably over-built and just duplicating 
  underscore functionality...refactor and minimize?
  (core/queries.js)
* swap out core/stat.js for something a more standardized, 
  there must be a JS library that calculates basic stats 
  like avg, co-var, etc..
* ditch the tableX naming syntax in favour of something more descriptive
* Rationalized how graphs and mini-views are handled for 
  consistency and easily adding another data visualization
  technique
* all the graphics have to call app.get_text("key", this.written_data)
  it might make more sense to provide a partially applied function
  which doesn't need to be passed this.written_data

###Complex
* add in ability for an amount to be NA (instead of hte current standard of using 0)
* redo the formaters to make more sense. Currently 'big-int'
  refers to numbers which should be presented in the thousands
  while 'big-int-real' refers to numbers where no such adjustment
  happens. "compact" formatter automatically assume the amounts 
  are in "$".  Better to re-map to "big-int" being normal, 
  "big-int-k" being rounded to a nearest thousand and then
  add a formatter for 'compact' and 'compact$' to indicate
  more systemically what will be produced.  Consider doing
  this at the column level with sane defaults.
* ~~add in pivot table functionality~~
* figure out way for svg diagrams to re-draw themselves after
  a resize
* graphics should manage their own panel spans rather than the 
  requesting function, currently ad-hoc adjustments are made 
  which luckily always work but it's not systematic
* ~~migrate code to browserify - this will help with eventual automated
  testing~~
* add in ability for a graph to opt for only the text to appear 
  and have everything reflow nicely (for example in the case where a 
  negative value will throw an error)
* ~~function by function, add the 'use strict' declaration, this will allow
  for stricter jshinting~~


###Recent fix ideas (Jan 2016) 
* clean details routing code to cleanly seperate table views, igoc, and 'all'


* (post-new-loading) Re-organize the core/tables design to make it more clear 

* add inverted igoc view (from current igoc) to /org/details/igoc so viewers can see where an organization stands in the inventory

* on bad URLs, correcting the hash will currently break the user's back button. Instead of setting hash on bad URLs, we should use window.history.replaceState. 

### Bigger projects (Jan 2016)

* split up tables into seperate graph, info and dataset objects, along side maybe a table representation object. These objects can list each other as dependencies and have a standardized way of loading data all in one big promise.

* Analytics
  * In case Infobase minus and plus require different solutions, wrap a façade around both so a single API can be used

  * For analytics, it may be best to simply have a counter/log of each possible URL, or URL scheme. URL describes 90% of application state.

* get a boolean map in csv format loaded on start to declare which table/dept are available

* Find out if there's a cleaner way to use URLs in report builder

* Data scalability (if interested in  bigger data)
  * large tables:Find a way to cache data on the client, look into indexedDB and synchronizing methods so users not only cache data, but won't have to parse it

  * background loading: See if we can leverage async or web-workers to load and *process* data in the background

  * make sure data is caching properly on clients.
  
* periodically keep up with html/svg -> pdf/png tech for possible exports feature

* gather documentation and learn more about cygwin ecosytem to ease developing for non-unix devs




