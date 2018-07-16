#!/bin/bash
# to be called after build has run 

set -e # will exit if any command has non-zero exit value

# flags explained
# gsutil
#   -m enables multi-core 
#   -h Content-Encoding:gzip
# rsync
#   -d will delete files in destination that aren't in source
#   -a public read 
#   -c use checksums to compare files instead of mtime 
#   -r recursively sync directories

gsutil -m -h Content-Encoding:gzip rsync -d -a public-read -c -r gzip/InfoBase $GCLOUD_BUCKET_URL
# node that -d will get rid of all other files. This means non-gzipped assets get copied even though they haven't changed
gsutil -m rsync -a public-read -c -r non-gzip/InfoBase $GCLOUD_BUCKET_URL
#This will make sure any new files immediately get public read access

gsutil setmeta -h "Cache-Control:no-cache" $GCLOUD_BUCKET_URL/index-*.html
gsutil setmeta -h "Cache-Control:no-cache" $GCLOUD_BUCKET_URL/app/a*-[ef][nr].min.js
# set no-cache on html and js entry files, always needs to be fresh to guarantee the rest of the cache-busting will work as intended