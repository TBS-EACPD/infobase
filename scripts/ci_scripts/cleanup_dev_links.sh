#!/bin/bash
set -e

# TODO: don't really like having dead_dev_link.html on disk, should store it as a string
# here and just write it to a temporary file before push it to gcloud

echo "Starting dev link bucket cleanup..."

#source ~/InfoBase/scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"

active_branches=$(git branch -r | sed -E 's/(.*\/)(.*)/\2/g')

branches_with_dev_link_buckets=$(gsutil ls $GCLOUD_BUCKET_ROOT | \
  sed -E 's/(.*\/)(.*)(\/$)/\2/g' | \
  sed -E '/(^__)|(^archived__).*/d')

inactive_branches_with_dev_link_buckets=$(grep -Fxvf <(echo "$active_branches") <(echo "$branches_with_dev_link_buckets"))

if [[ ! -z "$inactive_branches_with_dev_link_buckets" ]]; then
  tmpfile=$(mktemp /tmp/inactive_dev_link_XXXXXX.html)

  echo "<!DOCTYPE html>
  <html class=\"no-js\" lang=\"en\" dir=\"ltr\">
    <head>
      <meta charset=\"utf-8\">
      <meta http-equiv=\"x-ua-compatible\" content=\"ie=edge\">
    </head>
    <body vocab=\"http://schema.org/\" typeof=\"WebPage\">
      <main property=\"mainContentOfPage\">
        <h1>Expired dev link</h1>
        <h3 style=\"max-width: 600px; font-weight: 400;\">
          There used to be am InfoBase dev link here, but it's gone now. The features and content of the corresponding dev build 
          are likely merged in to the main branch, with a dev link <a href='https://dev.ea-ad.ca/master/index-eng.html'>here</a>, 
          and may or may not have been released to production by now. It's also possible the changes were abandoned. If you are
          unsure, or really didn't expect to see this message, contact an InfoBase developer. Thanks!
        </h3>
      </main>
    </body>
  </html>" > $tmpfile
  
  while IFS= read -r branch_name;
    gsutil cp -a public-read "$tmpfile" "$GCLOUD_BUCKET_ROOT/$branch_name/index-eng.html"
    gsutil cp -a public-read "$tmpfile" "$GCLOUD_BUCKET_ROOT/$branch_name/index-fra.html"
  done <<< "$inactive_branches_with_dev_link_buckets"

  rm "$tmpfile"
fi
#source ~/InfoBase/scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"