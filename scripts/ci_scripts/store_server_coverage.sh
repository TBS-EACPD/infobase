#!/bin/bash
# used during the server deploy CI step to save the test coverage json and status-badge created durring the test step

set -e # will exit if any command has non-zero exit value

source ./scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"

# save a copy for trend analysis purposes
gsutil cp ./server/coverage/coverage-final.json $GCLOUD_SERVER_COVERAGE_BUCKET_URL/$CIRCLE_BRANCH-$(echo "$CIRCLE_SHA1" | cut -c 1-7).json

if [[ $CIRCLE_BRANCH == "master" ]]; then
  # ... the baseline stats lives in a weird place, node_modules/.cache. No options in the API for controling this, pain to manage
  gsutil cp ./server/coverage/coverage-shield-badge.svg $GCLOUD_SERVER_COVERAGE_BUCKET_URL/server-coverage-badge.svg
  gsutil setmeta -h "Cache-Control:no-cache" $GCLOUD_SERVER_COVERAGE_BUCKET_URL/server-coverage-badge.svg
fi

source ./scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"