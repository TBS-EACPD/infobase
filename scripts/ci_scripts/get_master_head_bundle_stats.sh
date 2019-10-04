#!/bin/bash
# get a copy of the current master bundle-stats.json from google cloud bucket

set -e # will exit if any command has non-zero exit value

source ./scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"

# save a copy for trend analysis purposes
gsutil cp ./client/$BUILD_DIR/InfoBase/bundle-stats.json $GCLOUD_BUNDLE_STATS_BUCKET_URL/$CIRCLE_BRANCH-$(echo "$CIRCLE_SHA1" | cut -c 1-7).json

# save a copy as <branch>-head for easy reference when making comparisons
gsutil cp ./client/$BUILD_DIR/InfoBase/bundle-stats.json $GCLOUD_BUNDLE_STATS_BUCKET_URL/$CIRCLE_BRANCH-head.json

source ./scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"