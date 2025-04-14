#!/bin/bash
set -e

echo "Starting dev link bucket cleanup..."

active_branches=$(git branch -r | sed -E 's/(.*\/)(.*)/\2/g')

# favicon.ico is arbitrary, just looking for any file present in the true dev link dir
# that isn't in the dead dev link dir
branches_with_live_dev_links=$(gsutil ls "$GCLOUD_BUCKET_ROOT/*/favicon.ico" | \
  sed -E 's/(.*\/)(.*)(\/favicon.ico$)/\2/g' | \
  sed -E '/(^__)|(^archived__).*/d')

# reminder: grep exits with code 1 if no matches found. Using || echo "" to return an empty string instead
inactive_branches_with_live_dev_links=$(grep -Fxvf <(echo "$active_branches") <(echo "$branches_with_live_dev_links") || echo "")

if [[ ! -z "$inactive_branches_with_live_dev_links" ]]; then
  # the index html replacements used for dead dev links are stored in google cloud and must be updated there. Note that
  # buckets don't support sym links, so if you update those files then you should also clobber over all the existing
  # instances in each old dev link dir
  dead_dev_link_html_location="$GCLOUD_BUCKET_ROOT/____dead_dev_link_html"

  echo "Clobbering dev link files for: $inactive_branches_with_live_dev_links"

  while IFS= read -r branch_name; do
    gcloud storage rsync --continue-on-error --recursive --delete-unmatched-destination-objects --predefined-acl=public-read --region=northamerica-northeast1-a --project=$DEV_CLIENT_PROJECT_ID "$dead_dev_link_html_location" "$GCLOUD_BUCKET_ROOT/$branch_name"
    # saw cases where these html files were miss-typed. Couldn't tell why, but being explicit here to play it safe
    gcloud storage objects update "$GCLOUD_BUCKET_ROOT/$branch_name/*.html" --content-type=text/html
  done <<< "$inactive_branches_with_live_dev_links"
else 
  echo "No stale dev links to clobber"
fi
