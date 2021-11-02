#!/bin/bash
set -e # will exit if any command has non-zero exit value

#meant to be called with source, sets prod env vars

export IS_ACTUAL_PROD_RELEASE="true"
export BUILD_DIR="build_prod"
export CDN_URL="https://cdn-rdc.ea-ad.ca/InfoBase"

export PREVIOUS_DEPLOY_SHA=$(curl --fail $CDN_URL/build_sha)

export GCLOUD_BUCKET="gs://cdn-rdc.ea-ad.ca"
export STAGING_BUCKET="$GCLOUD_BUCKET/staging"
export PROD_BUCKET="$GCLOUD_BUCKET/InfoBase"
export ROLLBACK_BUCKET="$GCLOUD_BUCKET/rollback"