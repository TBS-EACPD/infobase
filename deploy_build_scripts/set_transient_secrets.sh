#!/bin/bash
set -e # will exit if any command has non-zero exit value

#meant to be called with source
#get GCloud service worker json key and save it in a temp dir, authenticate as service worker
#set CLOUDFLARE_KEY env var
#adds a trap on EXIT to clean up and revoke the service worker account

projectname='infobase-prod'

scratch=$(mktemp -d -t tmp.XXXXXXXXXX)
function cleanup {
  rm -rf "$scratch"
  
  #log out the service user
  gcloud auth list --filter="account:$projectname.iam.gserviceaccount.com" --format="value(account)" | gcloud auth revoke

  unset SCRATCH
  unset CLOUDFLARE_KEY
}
trap cleanup EXIT

echo $(lpass show IB_SERVICE_KEY --notes) | base64 -D > $scratch/key.json
gcloud auth activate-service-account --key-file=$scratch/key.json

gcloud config set project $projectname
gcloud config set compute/zone northamerica-northeast1-a

export CLOUDFLARE_KEY=$(lpass show CLOUDFLARE_KEY --notes)