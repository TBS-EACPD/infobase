#!/bin/bash
# must run this scripts/deploy in root of api project
set -e # will exit if any command has non-zero exit value

npm ci

source scripts/deploy/set_prod_env_vars.sh
source scripts/deploy/set_transient_function_secrets.sh # these trap EXIT to handle their own cleanup

scripts/deploy/build.sh

gcloud functions deploy prod-api-${CURRENT_SHA} --project ${PROJECT} --region us-central1 --entry-point app --stage-bucket prod-api-staging-bucket --runtime nodejs16 --trigger-http --env-vars-file $scratch/envs.yaml > /dev/null
gcloud alpha functions add-iam-policy-binding prod-api-${CURRENT_SHA} --project ${PROJECT} --region us-central1 --member allUsers --role roles/cloudfunctions.invoker

source scripts/deploy/unset_prod_env_vars.sh

exit