#!/bin/bash
set -e # will exit if any command has non-zero exit value 

npx patch-package

# @cypress/snapshot has an annoying post-install script that ignores your configuration and assumes you want snapshots in the default location,
# creates a snapshots.js file containing just "{}" in the project root on install. If that specific file exists after running an install,
# clean it up
cypress_snapshot_default="./snapshots.js"
if [[ -f "$cypress_snapshot_default" ]] && [[ $(< "$cypress_snapshot_default") == "{}" ]]; then
  rm $cypress_snapshot_default
fi