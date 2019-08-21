# InfoBase Scripts

Misc. and cross-project scripts.

Some script files can be called directly ("entry point" scripts), others are purely organizational (to be called, or sourced, within other scripts). Script entry points are all listed as scripts in the root package.json and are documented at the top of their (entry) files.

Note that, since they're meant to be called primarily using `npm run`, all of the entry scripts assume a `pwd` of the repo root and use relative paths accordingly.

Project specific scripts can be found in project sub-directories.