#!/bin/bash
set -e # will exit if any command has non-zero exit value
gcloud auth activate-service-account --key-file=${HOME}/infobase-prod-cdn-service-account.json
gcloud config set project infobase-prod
gcloud config set compute/zone northamerica-northeast1-a

export CDN_URL="https://cdn-rdc.ea-ad.ca/InfoBase"
export GCLOUD_BUCKET_URL="gs://cdn-rdc.ea-ad.ca/InfoBase"

#build everything
./deploy_build_scripts/build_all.sh
./deploy_build_scripts/push_to_gcloud_bucket.sh

# cleanup
unset CDN_URL
unset GCLOUD_BUCKET_URL