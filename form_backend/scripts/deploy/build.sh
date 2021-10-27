#!/bin/bash
set -e

rm -rf transpiled_build

npx babel src/ --out-dir transpiled_build --copy-files --ignore node_modules

# For dev, the project package.json declare the type to be "module" (esModules)
# Need to over-rule that inside the transpiled_build dir with a local package.json declaring the module type to be CommonJS
echo $'{\n  "type": "commonjs"\n}' > transpiled_build/package.json 