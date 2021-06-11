#!/bin/bash
set -e # will exit if any command has non-zero exit value

source ./deploy_scripts/set_transient_secrets.sh
source ./deploy_scripts/create_prod_env_vars.sh

#push build to staging dir of GCloud bucket
export GCLOUD_BUCKET_URL=$STAGING_BUCKET
./deploy_scripts/push_to_gcloud_bucket.sh
