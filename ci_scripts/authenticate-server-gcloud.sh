#!/bin/bash
echo $API_GCLOUD_JSON_AUTH > ${HOME}/server-gcloud-service-key.json
# if gcloud doesn't work, try sudo /opt/google-cloud-sdk/bin/gcloud
# gcloud components update
gcloud auth activate-service-account --key-file=${HOME}/server-gcloud-service-key.json
gcloud config set project $DEV_API_PROJECT_ID
gcloud config set compute/zone us-central1
