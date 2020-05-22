#!/bin/bash
set -e

echo "Starting dev link bucket cleanup..."

#source ~/InfoBase/scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"
GCLOUD_BUCKET_ROOT="gs://dev.ea-ad.ca"

active_branches=$(git branch -r | sed -E 's/(.*\/)(.*)/\2/g')

dev_link_buckets=$(gsutil ls $GCLOUD_BUCKET_ROOT | \
  sed -E 's/(.*\/)(.*)(\/$)/\2/g' | \
  sed -E '/(^__)|(^archived__).*/d')

inactive_dev_link_buckets=$(grep -Fxvf <(echo "$active_branches") <(echo "$dev_link_buckets"))

echo $inactive_dev_link_buckets

#source ~/InfoBase/scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"