#!/bin/bash
set -e # will exit if any command has non-zero exit value 

# Clear .eslintcache files, both local to the calling location and in the repo root. Note rm-ing with -f to ignore missing file errors,
# both when the caches aren't present and when this is called from root itself (in which case it tries to double rm, harmlessly).

# Example use case: eslint caches do not invalidate on node_modules changes but _should_ because of rules like no-unresolved. I.e. if you
# run a cached lint before installing all dependencies, then install, you'll have a bunch of no-unresolved errors stuck in the cache. We
# probably want to run this cleanup on all sub-repo postinstall/ci scripts

rm -f .eslintcache

repo_root="$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )/../.."
rm -f $repo_root/.eslintcache