#!/bin/bash
echo $GCLOUD_JSON_AUTH > ${HOME}/gcloud-service-key.json
#try if gcloud doesn't work, try sudo /opt/google-cloud-sdk/bin/gcloud
# gcloud components update
gcloud auth activate-service-account --key-file=${HOME}/gcloud-service-key.json
gcloud config set project ib-api-first
gcloud config set compute/zone northamerica-northeast1-a
gcloud container clusters get-credentials ib-api-cluster
