#!/bin/bash
set -e # will exit if any command has non-zero exit value 

# Cleanup own and ancestor eslint caches; these don't invalidate on node_modules changes but _should_ because of rules like no-missing-dependencies 
rm -f ../.eslintcache
rm -f .eslintcache