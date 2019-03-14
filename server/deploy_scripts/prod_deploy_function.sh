#!/bin/bash
# must run this deploy_scripts in root of api project
set -e # will exit if any command has non-zero exit value

npm run build

source deploy_scripts/set_prod_env_vars.sh
source deploy_scripts/set_transient_function_secrets.sh # these trap EXIT to handle their own cleanup

gcloud functions deploy prod-api-${CURRENT_SHA} --entry-point app --stage-bucket prod-api-staging-bucket --runtime nodejs6 --trigger-http --env-vars-file $scratch/envs.yaml > /dev/null

source deploy_scripts/unset_prod_env_vars.sh

exit