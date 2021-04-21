# Directory Structure

See https://github.com/TBS-EACPD/infobase/issues/777 for initial debate

The general organization of the InfoBase client's source code follows a recursive pattern of "utils", "components", and "thematic" directories.
Util and component directories are for rusable code/components, scoped to the theme of their parent directory (globablly usable if in the top-level).
Thematic directories group by, and narrow down the purpose of, their child utils/components directories, modules, and further thematic directories.

TODO: some sort of clarification on how to determine what's a "theme" worth having a thematic sub-directory... or maybe it's just a "do what feels right" thing?

TODO: I'm using "system(s)" a lot, might want to formalize that idea and make sure I'm consistent about it

Proposed:
* `/client/src/`
  * `./utils/`
    * generally reusable utils (i.e. no strong coupling to other systems, no implicit dependencies/assumptions about app state, etc.)
  * `./components/`
    * generally reusable components (i.e. no strong coupling to other systems, no implicit dependencies/assumptions about app state, etc)
    * sub-directories for families of modules, e.g.
    * `./SomeComponent/`
      * `./SomeComponent.js`
      * `./SomeComponent.scss`
      * .etc
  * `./platform/` (Or foundation/domain/systems?)
    * very important, place to put general InfoBase-wide utils/components/systems that meet any of the following criteria:
      1) modules that colocate utilities and components that are often/necessarily imported together
      2) hold state in a singleton or in the module (e.g. top level `let`)
      3) have dependencies on side effects (e.g. assume that the page has a #header selector, require )
  * `./InfoBase/`
    * application entry point, e.g. the application bootstrapper, the React Router configuration, etc.
    * `./components/`
      * route-agnostic navigation components, ErrorBoundary, etc.
    * `./index_html/`
      * templates and data for the generation of index html files
  * `./routes/`
    * all routes, e.g. `infographic`, `metadata`, etc.
  * `./panels/`
    * all the panels
    * utils like `declare_panels`
    * could potentially be a thematic sub-directory of the infographic route dir, but might warrant an exception because of it's size/depth (plus, technically used by two routes if we count the panel inventory, ha)
  * `./charts/`
    * could potentially be a thematic sub-directory of the top-level `components` dir, but might warrant an exception for... TODO reasons
  * `./models/`
    * TODO: tighten up definition on this, sort out the distinctions from `platform/` (if necessary, these might all properly belong as sub-dirs/modules of that) 
    * `./tables/`
    * `./ensure_loaded.js`
  * `./static/`
    * global css, svg, yaml, png
  * `./constants/` (TODO: or "theme"? Some constants/configs will likely come from other places like `injected_build_constants.js` and models?)
    * colors, breakpoints, etc.