#!/bin/bash
# to be called after build has run 

set -e # will exit if any command has non-zero exit value

# Prefering parallel processes over parallel threads, as per docs on usage of -j (bottle-necks on some un-thredable Python)
# also set super short cache max-age values on everything, so we don't get stale content stuck in GCloud edge caches
# this is ok because Cloudflare has been configured with both it's own longer edge cache TTLs, and to set longer browser-cache TTLs too
gsutil -o "GSUtil:parallel_process_count=8" -o "GSUtil:parallel_thread_count=1" -m \
  -h "Cache-Control:public, max-age=1" \
  rsync -j html,css,js,json,xml,svg,txt,csv -d -a public-read -c -r ./$BUILD_DIR/InfoBase $GCLOUD_BUCKET_URL

# Cloudflare doesn't compress csv files, so giving our csv's a content type it WILL compress
gsutil setmeta -h "Content-Type:text/plain" $GCLOUD_BUCKET_URL/csv/*.csv

# set no-cache on html and js entry files, always needs to be fresh to guarantee the rest of the cache-busting will work as intended
gsutil setmeta -h "Cache-Control:no-cache" $GCLOUD_BUCKET_URL/*.html
gsutil setmeta -h "Cache-Control:no-cache" $GCLOUD_BUCKET_URL/app/a*-[ef][nr].min.js
