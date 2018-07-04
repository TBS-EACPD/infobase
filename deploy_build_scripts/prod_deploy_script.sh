#!/bin/bash
set -e # will exit if any command has non-zero exit value
gcloud auth activate-service-account --key-file=${HOME}/infobase-prod-cdn-service-account.json
gcloud config set project infobase-prod
gcloud config set compute/zone northamerica-northeast1-a

# push to branch-specific folder
# CI is a circle-ci thing that is set to true
suffix="InfoBase"
if $CI; then
  suffix=$CIRCLE_BRANCH;
fi;

export CDN_URL="http://35.227.240.145/$suffix"
export GCLOUD_BUCKET_URL="gs://infobase-prod-bucket/$suffix"

#build everything
./deploy_build_scripts/build_all.sh
./deploy_build_scripts/split_gzip_build.sh
./deploy_build_scripts/push_to_gcloud_bucket.sh

# cleanup
rm -r gzip/
rm -r non-gzip/
unset CDN_URL
unset GCLOUD_BUCKET_URL