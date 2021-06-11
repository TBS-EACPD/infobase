#!/bin/bash
set -e # will exit if any command has non-zero exit value

source ./deploy_scripts/set_transient_secrets.sh
source ./deploy_scripts/create_prod_env_vars.sh

#refresh node_modules
npm ci

#build everything
./deploy_scripts/build_all.sh