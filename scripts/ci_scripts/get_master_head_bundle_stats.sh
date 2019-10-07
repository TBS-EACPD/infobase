#!/bin/bash
# get a copy of the current master bundle-stats.json from google cloud bucket

set -e # will exit if any command has non-zero exit value

source ./scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"

# make the build dir if it doesn't exist yet
mkdir ./client/$BUILD_DIR/

curl https://storage.googleapis.com/$GCLOUD_BUNDLE_STATS_BUCKET_NAME/master-head.json --output ./client/$BUILD_DIR/bundle-stats.json

source ./scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"