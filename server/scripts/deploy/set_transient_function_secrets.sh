#!/bin/bash
set -e # will exit if any command has non-zero exit value

#meant to be called with source
#adds a trap on EXIT to clean up and revoke the service worker account

scratch=$(mktemp -d -t tmp.XXXXXXXXXX)
function cleanup {
  rm -rf "$scratch"
  
  #log out the service user
  gcloud auth revoke

  unset SCRATCH

  unset PROJECT

  unset MDB_CONNECT_STRING
  unset MDB_USERNAME
  unset MDB_PW
}
trap cleanup EXIT


echo $(lpass show PROD_API_SERVICE_KEY --notes) | base64 --decode > $scratch/key.json
gcloud auth activate-service-account --key-file=$scratch/key.json

export PROJECT=$(lpass show PROD_API_PROJECT_ID --notes)

touch $scratch/envs.yaml
echo "MDB_NAME: '$MDB_NAME'" >> $scratch/envs.yaml

export MDB_CONNECT_STRING=$(lpass show MDB_CONNECT_STRING --notes)
export MDB_USERNAME=$(lpass show MDB_READ_USER --notes)
export MDB_PW=$(lpass show MDB_READ_PW --notes)
echo "MDB_CONNECT_STRING: '$MDB_CONNECT_STRING'" >> $scratch/envs.yaml
echo "MDB_USERNAME: '$MDB_USERNAME'" >> $scratch/envs.yaml
echo "MDB_PW: '$MDB_PW'" >> $scratch/envs.yaml

echo "USE_REMOTE_DB: '1'" >> $scratch/envs.yaml