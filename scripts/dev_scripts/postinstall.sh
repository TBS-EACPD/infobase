#!/bin/bash
set -e # will exit if any command has non-zero exit value 

# Cleanup eslint cache; doesn't invalidate on node_modules changes but _should_ because of rules like no-unresolved
rm -f .eslintcache