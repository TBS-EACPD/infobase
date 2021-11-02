#!/bin/bash
set -e # will exit if any command has non-zero exit value

source ./scripts/deploy/set_transient_secrets.sh
source ./scripts/deploy/create_prod_env_vars.sh

#push build to staging dir of GCloud bucket
export GCLOUD_BUCKET_URL=$STAGING_BUCKET
./scripts/deploy/push_to_gcloud_bucket.sh
