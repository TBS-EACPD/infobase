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

gsutil -m rsync -j -d -a public-read -c -r ./build/InfoBase $GCLOUD_BUCKET_URL

# set no-cache on html and js entry files, always needs to be fresh to guarantee the rest of the cache-busting will work as intended
gsutil setmeta -h "Cache-Control:no-cache" $GCLOUD_BUCKET_URL/index-*.html
gsutil setmeta -h "Cache-Control:no-cache" $GCLOUD_BUCKET_URL/app/a*-[ef][nr].min.js
