# Directory Structure

See https://github.com/TBS-EACPD/infobase/issues/777 for initial debate

Proposal: a recursive directory structure based on four types of directories
  1) `utils`
    * generic dir name
    * fully reusable utils (i.e. no indirect coupling to other modules, no implicit dependencies/assumptions about app state, etc)
    * (?) probably no sub-directories
  2) `components`
    * generic dir name
    * fully reusable components (i.e. no indirect coupling to other modules, no implicit dependencies/assumptions about app state, etc)
    * (?) probably only one layer of sub-directories, to group component modules
  3) `platform`
    * generic dir name
    * sets of utils/components/functionality, generally reusable but allowed to:
      1) have strong assumptions
        * e.g. assume that the page has a `#header` node
      2) have implicit dependencies
        * e.g. depend on some non-explicit one-time initialization step
      2) have module level state (e.g. top level `let`), or use the singleton pattern
    * (?) could have it's own thematic sub-directories, since a "platform" could be built of many modules/sub-platforms
  4) thematic sub-directories
    * unique, self-descriptive name
    * may have its own `utils`/`components`/`platform`/thematic sub-directories
    * intentionally a bit vague, sort of a know-it-when-you-see-it
      * maybe because it represents some specific piece of the actual app
        * e.g. the `routes` dir and the contained per-route thematic dirs under it
      * maybe just because it helps with organization/solidifies core concepts
        * e.g. `src/charts` content's could probably be tossed in the root `components` dir, or `src/models`'s in `platform`, but both are "weighty" enough concepts to stand up on their own

Sketch of proposed structure:
* `/client/src/`
  * `./utils/`
    * globally reusable utils 
    * `./request_utils.js`
  * `./components/`
    * globally reusable components
    * `./SomeComponent/`
      * `./SomeComponent.js`
      * `./SomeComponent.scss`
  * `./platform/`
    * sets of related utils/components/functionality, especially for code meeting any of the following criteria:
      1) have strong assumptions/implicit dependencies
        * e.g. assume that the page has a `#header` node, depend on some non-explicit one-time initialization step, etc
      2) have module level state (e.g. top level `let`), or use the singleton pattern
      3) modules that collocate utilities and components that are often/necessarily imported together
    * `./Search/`
    * `./analytics.js`
  * `./InfoBase/`
    * application entry point, e.g. the application bootstrapper, the React Router configuration, etc.
    * `./components/`
      * pre-router components like `ErrorBoundary`, etc.
        * or would many of those be "platform" code??
    * `./index_html/`
      * templates and data for the generation of index html files
  * `./models/`
    * `./platform/`
      * `./ensure_loaded.js`
    * `./subjects/`
    * `./tables/`
  * `./routes/`
    * `./platform/`
      * `./StandardRouteContainer.js` and other route/nav components?
    * `./Infographic/`
      * `./utils/`
        * `./infographic_link.js`
      * `./Infographic.js`
        * the route module, clearly belongs at the root of this dir
      * `./PanelFilterControl.js`
        * not a generally reusable component, or part of some self-contained system 
        * highly coupled to `./Infographic.js` itself, could be inlined in it but kept separate for organization reasons
        * so it should also live in the root of this dir, rather in a `./components` sub-dir, right? 
  * `./panels/`
    * all the panels
    * utils like `declare_panels`
    * could potentially be a thematic sub-directory of the infographic route dir, but might warrant an exception because of it's size/depth (plus, technically used by two routes if we count the panel inventory, ha)
  * `./charts/`
  * `./static/`
    * global css, svgs, pngs, etc
  * `./constants/` (TODO: or "theme"? Some constants/configs will likely come from other places like `injected_build_constants.js` and models?)
    * colors, breakpoints, etc.