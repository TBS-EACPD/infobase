#!/bin/bash
set -e # will exit if any command has non-zero exit value

#meant to be called with source
#get GCloud service worker json key and save it in a temp dir, authenticate as service worker
#set CLOUDFLARE_KEY env var
#adds a trap on EXIT to clean up and revoke the service worker account

scratch=$(mktemp -d -t tmp.XXXXXXXXXX)
function cleanup {
  rm -rf "$scratch"
  gcloud auth revoke infobase-prod-cdn-account@infobase-prod.iam.gserviceaccount.com #log out the service user
  unset SCRATCH
  unset CLOUDFLARE_KEY
}
trap cleanup EXIT

echo $(lpass show IB_SERVICE_KEY --notes) | base64 -D > $scratch/key.json
gcloud auth activate-service-account --key-file=$scratch/key.json

gcloud config set project infobase-prod
gcloud config set compute/zone northamerica-northeast1-a

export CLOUDFLARE_KEY=$(lpass show CLOUDFLARE_KEY --notes)