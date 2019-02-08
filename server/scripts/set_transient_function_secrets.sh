#!/bin/bash
set -e # will exit if any command has non-zero exit value

#meant to be called with source
#adds a trap on EXIT to clean up and revoke the service worker account

scratch=$(mktemp -d -t tmp.XXXXXXXXXX)
function cleanup {
  rm -rf "$scratch"
  
  #log out the service user
  gcloud auth list --filter="account:$APP_PROJ_ID.iam.gserviceaccount.com" --format="value(account)" | gcloud auth revoke

  unset SCRATCH

  unset MDB_USERNAME
  unset MDB_PW
}
trap cleanup EXIT

echo $(lpass show API_SERVICE_KEY --notes) | base64 -D > $scratch/key.json
gcloud auth activate-service-account --key-file=$scratch/key.json

gcloud config set project $APP_PROJ_ID

export MDB_USERNAME=$(lpass show MDB_USER_READONLY --notes)
export MDB_PW=$(lpass show MDB_PW_READONLY --notes)

touch $scratch/envs.yaml
echo "SHOULD_USE_REMOTE_DB: '$SHOULD_USE_REMOTE_DB'" >> $scratch/envs.yaml
echo "MDB_NAME: '$MDB_NAME'" >> $scratch/envs.yaml
echo "MDB_USERNAME: '$MDB_USERNAME'" >> $scratch/envs.yaml
echo "MDB_PW: '$MDB_PW'" >> $scratch/envs.yaml