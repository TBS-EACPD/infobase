#!/bin/bash
# used in CI after the client has been built, stores the bundle-stats json output in 

set -e # will exit if any command has non-zero exit value

source ./scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"

gsutil cp ./client/$BUILD_DIR/InfoBase/bundle-stats.json $GCLOUD_BUNDLE_STATS_BUCKET_URL/$CIRCLE_BRANCH-$CIRCLE_SHA1-$(date +%s).json

source ./scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"