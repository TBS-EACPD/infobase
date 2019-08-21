#!/bin/sh

# Symlinks all git hooks in the hooks directory to .git/hooks.
# This includes hooks that, on merge and rebase, re-run this script to capture any new hooks

chmod 555 $PWD/scripts/dev_scripts/hooks/*
ln -sf $PWD/scripts/dev_scripts/hooks/* .git/hooks