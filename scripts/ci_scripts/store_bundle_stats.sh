#!/bin/bash
# used after the client has been built, stores the bundle-stats json output in a google cloud bucket for future use

set -e # will exit if any command has non-zero exit value

# save a copy for trend analysis purposes
gsutil cp ./client/$BUILD_DIR/InfoBase/bundle-stats.json $GCLOUD_BUNDLE_STATS_BUCKET_URL/$CIRCLE_BRANCH-$(echo "$CIRCLE_SHA1" | cut -c 1-7).json

if [[ $CIRCLE_BRANCH == "master" ]]; then
  # ... the baseline stats lives in a weird place, node_modules/.cache. No options in the API for controling this, pain to manage
  gsutil cp ./client/node_modules/.cache/bundle-stats/baseline.json $GCLOUD_BUNDLE_STATS_BUCKET_URL/baseline.json
fi
