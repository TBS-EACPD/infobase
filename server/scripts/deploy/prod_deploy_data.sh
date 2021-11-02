#!/bin/bash
# must run this scripts in root of api project
set -e # will exit if any command has non-zero exit value

source scripts/deploy/set_prod_env_vars.sh
source scripts/deploy/set_transient_data_secrets.sh # these trap EXIT to handle their own cleanup

node src/populate_db.js

source scripts/deploy/unset_prod_env_vars.sh

exit