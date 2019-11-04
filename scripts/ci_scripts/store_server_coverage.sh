#!/bin/bash
# used during the server deploy CI step to save the test coverage json and update the server coverage status-badge (both created during the test job)

set -e # will exit if any command has non-zero exit value

source ./scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"

# save a copy for trend analysis purposes
gsutil cp ./server/coverage/coverage-final.json $GCLOUD_SERVER_COVERAGE_BUCKET_URL/$CIRCLE_BRANCH-$(echo "$CIRCLE_SHA1" | cut -c 1-7).json

if [[ $CIRCLE_BRANCH == "master" ]]; then
  gsutil cp ./server/coverage/coverage-shield-badge.svg $GCLOUD_SERVER_COVERAGE_BUCKET_URL/server-coverage-badge.svg
  gsutil setmeta -h "Cache-Control:no-cache" $GCLOUD_SERVER_COVERAGE_BUCKET_URL/server-coverage-badge.svg
fi

source ./scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"