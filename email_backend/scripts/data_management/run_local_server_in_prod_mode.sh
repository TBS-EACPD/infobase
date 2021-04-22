#!/bin/bash
# must run this scripts in the email_backend dir
set -e # will exit if any command has non-zero exit value

npm run build

source scripts/util/set_prod_env_vars.sh
export IS_FAKE_PROD_SERVER=true

source scripts/util/set_transient_secrets.sh # these trap EXIT to handle their own cleanup

npm run start

source scripts/util/unset_prod_env_vars.sh
unset IS_FAKE_PROD_SERVER=true

exit