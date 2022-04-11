#!/bin/bash
set -e # will exit if any command has non-zero exit value

scratch=$(mktemp -d -t tmp.XXXXXXXXXX)
function cleanup {
  rm -rf "$scratch"
}
trap cleanup EXIT

echo $(lpass show INFOBASE_CORS_JSON --notes) | base64 --decode > $scratch/cors-json-file.json

gsutil cors set $scratch/cors-json-file.json gs://cdn-rdc.ea-ad.ca
gsutil cors set $scratch/cors-json-file.json gs://ib-outage-bucket
gsutil cors set $scratch/cors-json-file.json $(lpass show INFOBASE_DEV_BUCKET --notes)