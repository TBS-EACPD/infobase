#!/bin/bash
echo $API_GCLOUD_JSON_AUTH > ${HOME}/server-gcloud-service-key.json

source ./silence_risky_logging.sh "mute"

gcloud auth activate-service-account --key-file=${HOME}/server-gcloud-service-key.json
gcloud config set project $DEV_API_PROJECT_ID
gcloud config set compute/zone us-central1

source ./silence_risky_logging.sh "unmute"
