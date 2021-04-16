# Directory Structure
Listed are the modules/directories that will be encountered in the client `src` folder and their purposes

## Most important/likely to be referenced

- `charts`: this is where the data visualization components exist
- `common_css`: this is where general css is placed - will probably be importing from here quite often
- `common_text`: this is where general text is placed - won't be directly importing here, but check here for common text that might be useful before creating text key-value pairs
- `components`: this is where `React Components` are placed
- `core`: this is where code that is "core" to the application is stored.
- `extended_bootstrap`: this is where extensions to bootstrap css are placed
- `handlebars`: this is where handlebars, `{{ something }}`, are processed with logic/code. These functions are used within text files `.yaml`.
- `icons`: this is where run time svgs are stored. That is, the svg markup is handled by React.
- `InfoBase`: this is where the entry point files are stored.

## More specific directories

- `about`: this is for the "about" page/route
- `contact`: this is more the "contact us" page/route
- `EstimatesComparison`: this is where the files for the "Estimates Comparison" subapp exist.
- `explorer_common`: this is where a specific component and it's related components, "Explorer" exists. Think of this component like a dropdown with many internal dropdowns
- `FAQ`: this is for the "frequently asked questions" page/route
- `glossary`: this is for the "glossary" page/route
- `graphql_utils`: this is where graphql utility functions are stored. Also houses the component for GraphIQL
- `home`: this is where files for the "home" page/route is stored
- `icons`: this is where svg icons inserted during runtime is stored - that is the svg is handled by `React Components` and thus don't render until the JavaScript is done loading. Also see `svg`
- `igoc`: this is where the files for the "List of Organizations (A to Z)" subapp exists
- `infographic`: this is where the files for the main app exist (Clicking into Finances/Covid/People/Results leads to the main app)
- `InfoLab`: files where "InfoLab" sub app is stored
- `metadata`: TODO
- `models`: files containing "standard classes". Except it also like a phonebook for these classes 
- `panels`: this is where panels for `infographic` are stored
- `partition`: this is where files for the "Partition diagram" subapp exist. (See "The government at a glance" subapp for example)
- `png`: png images stored here
- `PrivacyStatement`: this is for the "privacy" page/route
- `robots`: TODO
- `rpb`: this is where files for the "Report Builder" subapp exist
- `search`: this is for search specifc components. (See the search bar on the home page or the glossary page)
- `Survey`: this is for the survey specific components (See feedback/report a problem button at the bottom of the pages). Also contains the "survey" page/router
- `svg`: this is where raw svg icons are stored - anything that needs to be rendered before JavaScript is loaded is stored here.  Also see `icons`
- `tables`: this is where the meta data for tables in `rpb` is stored
- `TagExplorer`: this is where files for the "Tag Explorer" subapp exist
- `TextDiff`: this is where files for the experimental subapp "Indicator Text Comparison Tool" exists. (Visit InfoLab on website to find this)
- `TreeMap`: this is where files for the subapp "TreeMap" exist