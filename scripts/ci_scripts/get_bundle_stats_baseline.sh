#!/bin/bash
# get a copy of the current master bundle-stats baseline.json from google cloud bucket

set -e # will exit if any command has non-zero exit value

source ./scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"

mkdir -p ./client/node_modules/.cache/bundle-stats

# ... the baseline stats lives in a weird place, node_modules/.cache. No options in the API for controling this, pain to manage
curl https://storage.googleapis.com/$GCLOUD_BUNDLE_STATS_BUCKET_NAME/baseline.json --output ./client/node_modules/.cache/bundle-stats/baseline.json 

source ./scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"