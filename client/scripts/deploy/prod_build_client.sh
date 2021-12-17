#!/bin/bash
set -e # will exit if any command has non-zero exit value

npm ci

source ./scripts/deploy/set_transient_secrets.sh
source ./scripts/deploy/create_prod_env_vars.sh

#build everything
./scripts/deploy/build_all.sh