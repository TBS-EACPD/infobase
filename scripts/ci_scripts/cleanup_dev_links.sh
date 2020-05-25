#!/bin/bash
set -e

echo "Starting dev link bucket cleanup..."

source ~/InfoBase/scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"


active_branches=$(git branch -r | sed -E 's/(.*\/)(.*)/\2/g')

branches_with_dev_link_buckets=$(gsutil ls $GCLOUD_BUCKET_ROOT | \
  sed -E 's/(.*\/)(.*)(\/$)/\2/g' | \
  sed -E '/(^__)|(^archived__).*/d')

inactive_branches_with_dev_link_buckets=$(grep -Fxvf <(echo "$active_branches") <(echo "$branches_with_dev_link_buckets"))

if [[ ! -z "$inactive_branches_with_dev_link_buckets" ]]; then
  index_names="index-eng.html index-fra.html index-basic-eng.html index-basic-fra.html"
  new_index_html="<!DOCTYPE html>
  <html class='no-js' lang='en' dir='ltr'>
    <head>
      <meta charset='utf-8'>
      <meta http-equiv='x-ua-compatible' content='ie=edge'>
    </head>
    <body vocab='http://schema.org/' typeof='WebPage'>
      <main property='mainContentOfPage'>
        <h1>Expired dev link</h1>
        <h3 style='max-width: 600px; font-weight: 400;'>
          There used to be am InfoBase dev link here, but it's gone now. The features and content of the corresponding dev build 
          are likely merged in to the main branch, with a dev link <a href='https://dev.ea-ad.ca/master/index-eng.html'>here</a>, 
          and may or may not have been released to production by now. It's also possible the changes were abandoned. If you are
          unsure, or really didn't expect to see this message, contact an InfoBase developer. Thanks!
        </h3>
      </main>
    </body>
  </html>"
  
  tmpfile=$(mktemp -d)

  for index_name in $index_names; do
    echo "$new_index_html" > "$tmpfile/$index_name"
  done

  echo ""
  echo "Storing dead dev link html index files in gcloud, to speed up later movements"
  dead_dev_link_html_location="$GCLOUD_BUCKET_ROOT/____dead_dev_link_html"
  gsutil -m rsync -c -a public-read -d "$tmpfile" $dead_dev_link_html_location

  while IFS= read -r branch_name; do
    echo ""
    echo "Clobbering $branch_name dev link files"
    gsutil -m rsync -cdr -a public-read "$dead_dev_link_html_location" "$GCLOUD_BUCKET_ROOT/$branch_name"
  done <<< "$inactive_branches_with_dev_link_buckets"

  rm -r "$tmpfile"
fi


source ~/InfoBase/scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"