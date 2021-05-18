#!/bin/bash
# used during CI to store coverage reports and update badges to GCloud. Run from the root of a project with a coverage dir containing the appropriate coverage outputs

set -e # will exit if any command has non-zero exit value

project=$1
sha=$(echo "$CIRCLE_SHA1" | cut -c 1-7)

# json and txt reports for long term storage
gsutil cp ./coverage/coverage-final.json $GCLOUD_ALL_COVERAGE_BUCKET_URL/$CIRCLE_BRANCH-$sha-$project.json
gsutil cp ./coverage/coverage-final.txt $GCLOUD_ALL_COVERAGE_BUCKET_URL/$CIRCLE_BRANCH-$sha-$project.txt

# branch-head coverage badge and txt for linking in README's, etc
gsutil cp ./coverage/coverage-shield-badge.svg $GCLOUD_ALL_COVERAGE_BUCKET_URL/$CIRCLE_BRANCH-$project-coverage-badge.svg
gsutil setmeta -h "Cache-Control:no-cache" $GCLOUD_ALL_COVERAGE_BUCKET_URL/$CIRCLE_BRANCH-$project-coverage-badge.svg
gsutil cp ./coverage/coverage-final.txt $GCLOUD_ALL_COVERAGE_BUCKET_URL/$CIRCLE_BRANCH-$project-coverage.txt
gsutil setmeta -h "Cache-Control:no-cache" $GCLOUD_ALL_COVERAGE_BUCKET_URL/$CIRCLE_BRANCH-$project-coverage.txt
