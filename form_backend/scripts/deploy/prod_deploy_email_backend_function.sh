#!/bin/bash
# must run this scripts in the email_backend dir
set -e # will exit if any command has non-zero exit value

source scripts/util/set_prod_env_vars.sh
source scripts/util/set_transient_secrets.sh # these trap EXIT to handle their own cleanup

scripts/deploy/build.sh

gcloud beta functions deploy prod-email-backend --max-instances 1 --project ${PROJECT} --region us-central1 --entry-point email_backend --stage-bucket email-backend-staging-bucket --runtime nodejs14 --trigger-http --env-vars-file $scratch/envs.yaml > /dev/null
gcloud alpha functions add-iam-policy-binding prod-email-backend --project ${PROJECT} --region us-central1 --member allUsers --role roles/cloudfunctions.invoker

source scripts/util/unset_prod_env_vars.sh

exit