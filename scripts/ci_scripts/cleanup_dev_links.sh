#!/bin/bash
set -e

echo "Starting dev link MongoDB cleanup..."

source ~/InfoBase/scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"

active_branches=$(git branch -r | sed -E 's/(.*\/)(.*)/\2/g')

dev_link_buckets=$(gsutil ls $GCLOUD_BUCKET_ROOT | \
  sed -E 's/(.*\/)(.*)(\/$)/\2/g' | \
  sed -e '/(^__)|(^archived__).*/d')

inactive_dev_link_buckets=$(grep -Fxvf <(active_branches) <(dev_link_buckets))

echo $inactive_dev_link_buckets # log to test portability in CI

source ~/InfoBase/scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"