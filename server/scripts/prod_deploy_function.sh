#!/bin/bash
# must run this scripts in root of api project

npm run build

source scripts/set_prod_env_vars.sh
source scripts/set_transient_function_secrets.sh # these trap EXIT to handle their own cleanup

gcloud functions deploy app --stage-bucket api-staging-bucket --runtime nodejs6 --trigger-http --env-vars-file $scratch/envs.yaml

source scripts/unset_prod_env_vars.sh