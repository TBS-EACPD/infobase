#!/bin/bash
# must run this scripts in root of api project

source scripts/set_prod_env_vars.sh
source scripts/set_transient_data_secrets.sh # these trap EXIT to handle their own cleanup

babel-node src/models/populate_models.js

source scripts/unset_prod_env_vars.sh