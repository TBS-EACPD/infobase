#!/bin/bash
set -e # will exit if any command has non-zero exit value

source ./scripts/deploy/set_transient_secrets.sh
source ./scripts/deploy/create_prod_env_vars.sh

#refresh node_modules
npm ci

#build everything
./scripts/deploy/build_all.sh