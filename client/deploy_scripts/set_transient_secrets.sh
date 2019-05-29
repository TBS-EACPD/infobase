#!/bin/bash
set -e # will exit if any command has non-zero exit value

#meant to be called with source
#get GCloud service worker json key and save it in a temp dir, authenticate as service worker
#get cloudflare secrets
#adds a trap on EXIT to clean up and revoke the service worker account

scratch=$(mktemp -d -t tmp.XXXXXXXXXX)
function cleanup {
  rm -rf "$scratch"
  
  #log out the service user
  gcloud auth revoke

  unset SCRATCH
  unset CLOUDFLARE_ZONE
  unset CLOUDFLARE_USER
  unset CLOUDFLARE_KEY
}
trap cleanup EXIT

echo $(lpass show IB_SERVICE_KEY --notes) | base64 --decode > $scratch/key.json
gcloud auth activate-service-account --key-file=$scratch/key.json

export CLOUDFLARE_ZONE=$(lpass show CLOUDFLARE_ZONE --notes)
export CLOUDFLARE_USER=$(lpass show CLOUDFLARE_USER --notes)
export CLOUDFLARE_KEY=$(lpass show CLOUDFLARE_KEY --notes)