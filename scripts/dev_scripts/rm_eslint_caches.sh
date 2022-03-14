#!/bin/bash
set -e # will exit if any command has non-zero exit value 

# certain circumstances where we need to nuke all of the eslint cahces, this makes that easier to do
# e.g. eslint doesn't bust its own cache on changes to node_modules, so a missing dependency error can get replayed
# from cache after it stops actually applying (and up until you find and kill that cahce). As such, we likely want
# this script to run post-install/ci (in any sub-repo)

repo_root="$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )/../.."

shopt -s globstar 

rm $repo_root/**/.eslintcache