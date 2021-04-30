#!/bin/bash
# must run this deploy_scripts in root of api project
set -e # will exit if any command has non-zero exit value

source deploy_scripts/set_prod_env_vars.sh
source deploy_scripts/set_transient_function_secrets.sh # these trap EXIT to handle their own cleanup

npm run prod_build

gcloud functions deploy prod-api-${CURRENT_SHA} --project ${PROJECT} --region us-central1 --entry-point app --stage-bucket prod-api-staging-bucket --runtime nodejs14 --trigger-http --env-vars-file $scratch/envs.yaml > /dev/null
gcloud alpha functions add-iam-policy-binding prod-api-${CURRENT_SHA} --project ${PROJECT} --region us-central1 --member allUsers --role roles/cloudfunctions.invoker

source deploy_scripts/unset_prod_env_vars.sh

exit