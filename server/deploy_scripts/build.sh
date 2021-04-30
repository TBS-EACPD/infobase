#!/bin/bash
set -e

rm -rf transpiled_build

babel src/ --out-dir transpiled_build --copy-files --ignore node_modules