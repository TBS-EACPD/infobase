#!/bin/bash
# must run this scripts in root of api project
set -e # will exit if any command has non-zero exit value

source deploy_scripts/set_prod_env_vars.sh
source deploy_scripts/set_transient_data_secrets.sh # these trap EXIT to handle their own cleanup

node_modules/@babel/node/bin/babel-node.js src/models/populate_models.js

source deploy_scripts/unset_prod_env_vars.sh

exit