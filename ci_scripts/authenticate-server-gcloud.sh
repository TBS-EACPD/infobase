#!/bin/bash
set -e
echo $API_GCLOUD_JSON_AUTH > ${HOME}/server-gcloud-service-key.json

source ci_scripts/redact_env_vars_from_logging.sh "redact-start"

gcloud auth activate-service-account --key-file=${HOME}/server-gcloud-service-key.json
gcloud config set project $DEV_API_PROJECT_ID || true # || true used to ignore errors from this line, it's a warning but still kills the whole process
gcloud config set compute/zone us-central1

source ci_scripts/redact_env_vars_from_logging.sh "redact-end"
