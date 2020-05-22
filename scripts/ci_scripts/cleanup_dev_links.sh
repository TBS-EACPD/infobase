#!/bin/bash
set -e

echo "Starting dev link bucket cleanup..."

source ~/InfoBase/scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"

active_branches=$(git branch -r | sed -E 's/(.*\/)(.*)/\2/g')

branches_with_dev_link_buckets=$(gsutil ls $GCLOUD_BUCKET_ROOT | \
  sed -E 's/(.*\/)(.*)(\/$)/\2/g' | \
  sed -E '/(^__)|(^archived__).*/d')

inactive_branches_with_dev_link_buckets=$(grep -Fxvf <(echo "$active_branches") <(echo "$branches_with_dev_link_buckets"))

while IFS= read -r branch_name;
  gsutil cp -a public-read "./scripts/ci_scripts/dead_dev_link.html" "$GCLOUD_BUCKET_ROOT/$branch_name/index-eng.html"
  gsutil cp -a public-read "./scripts/ci_scripts/dead_dev_link.html" "$GCLOUD_BUCKET_ROOT/$branch_name/index-fra.html"
done <<< "$inactive_branches_with_dev_link_buckets"

source ~/InfoBase/scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"