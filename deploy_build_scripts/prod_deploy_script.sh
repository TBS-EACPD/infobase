#!/bin/bash
set -e # will exit if any command has non-zero exit value

scratch=$(mktemp -d -t tmp.XXXXXXXXXX)
function cleanup {
  rm -rf "$scratch"
  unset CDN_URL
  unset GCLOUD_BUCKET_URL
  unset CLOUDFLARE_KEY
}
trap cleanup EXIT

export CDN_URL="https://cdn-rdc.ea-ad.ca/InfoBase"
export GCLOUD_BUCKET_URL="gs://cdn-rdc.ea-ad.ca/InfoBase"

export CLOUDFLARE_KEY=$(lpass show CLOUDFLARE_KEY --notes)
echo $(lpass show IB_SERVICE_KEY --notes) | base64 -D > $scratch/key.json

gcloud auth activate-service-account --key-file=$scratch/key.json

gcloud config set project infobase-prod
gcloud config set compute/zone northamerica-northeast1-a

#build everything
./deploy_build_scripts/build_all.sh

#push to CDN_URL
./deploy_build_scripts/push_to_gcloud_bucket.sh

#clear certain cloudflare caches
./deploy_build_scripts/selectively_clear_cloudflare_cache.sh

cleanup