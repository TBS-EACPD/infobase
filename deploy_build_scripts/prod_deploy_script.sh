#!/bin/bash
set -e # will exit if any command has non-zero exit value

sudo chmod g+r ${HOME}/infobase-prod-cdn-service-account.json
gcloud auth activate-service-account --key-file=${HOME}/infobase-prod-cdn-service-account.json
sudo chmod g-r ${HOME}/infobase-prod-cdn-service-account.json

gcloud config set project infobase-prod
gcloud config set compute/zone northamerica-northeast1-a

export CDN_URL="https://cdn-rdc.ea-ad.ca/InfoBase"
export GCLOUD_BUCKET_URL="gs://cdn-rdc.ea-ad.ca/InfoBase"

#build everything
./deploy_build_scripts/build_all.sh

#push to CDN_URL
./deploy_build_scripts/push_to_gcloud_bucket.sh

#clear certain cloudflare caches
./selectively_clear_cloudflare_cache.sh

# cleanup
unset CDN_URL
unset GCLOUD_BUCKET_URL