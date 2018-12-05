#!/bin/bash
set -e # will exit if any command has non-zero exit value

scratch=$(mktemp -d -t tmp.XXXXXXXXXX)
function cleanup {
  rm -rf "$scratch"
  unset BUILD_DIR
  unset CDN_URL
  unset GCLOUD_BUCKET
  unset STAGING_BUCKET
  unset PROD_BUCKET
  unset ROLLBACK_BUCKET
  unset CLOUDFLARE_KEY
  unset GCLOUD_BUCKET_URL
}
trap cleanup EXIT

export BUILD_DIR="build_prod"
export CDN_URL="https://cdn-rdc.ea-ad.ca/InfoBase"

export GCLOUD_BUCKET="gs://cdn-rdc.ea-ad.ca"
export STAGING_BUCKET="$GCLOUD_BUCKET/staging"
export PROD_BUCKET="$GCLOUD_BUCKET/InfoBase"
export ROLLBACK_BUCKET="$GCLOUD_BUCKET/rollback"

export CLOUDFLARE_KEY=$(lpass show CLOUDFLARE_KEY --notes)
echo $(lpass show IB_SERVICE_KEY --notes) | base64 -D > $scratch/key.json

gcloud auth activate-service-account --key-file=$scratch/key.json

gcloud config set project infobase-prod
gcloud config set compute/zone northamerica-northeast1-a

#refresh node_modules
npm ci

#build everything
./deploy_build_scripts/build_all.sh

#push build to staging dir of GCloud bucket
export GCLOUD_BUCKET_URL=$STAGING_BUCKET
./deploy_build_scripts/push_to_gcloud_bucket.sh

#within the GCloud bucket, backup the live prod directory (/InfoBase) to the /rollback dir, rsync /staging to /InfoBase
#leaves us a safe version to roll back to in /rollback, and minimizes the mid-deploy downtime for the InfoBase
gsutil -m rsync -r -d $PROD_BUCKET $ROLLBACK_BUCKET
gsutil -m rsync -r -d $STAGING_BUCKET $PROD_BUCKET

#clear certain cloudflare caches
./deploy_build_scripts/selectively_clear_cloudflare_cache.sh

cleanup