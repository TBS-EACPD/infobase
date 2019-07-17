#!/bin/bash
echo $GCLOUD_JSON_AUTH > ${HOME}/gcloud-service-key.json

source ci_scripts/redact_env_vars_from_logging.sh "redact-start"

gcloud auth activate-service-account --key-file=${HOME}/gcloud-service-key.json
gcloud config set project $DEV_CLIENT_PROJECT_ID
gcloud config set compute/zone northamerica-northeast1-a

source ci_scripts/redact_env_vars_from_logging.sh "redact-end"