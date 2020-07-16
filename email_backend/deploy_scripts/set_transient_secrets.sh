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

  unset EMAIL_BACKEND_SENDING_ADDRESS
  unset EMAIL_BACKEND_RECEIVING_ADDRESS
  unset EMAIL_BACKEND_CLIENT_ID
  unset EMAIL_BACKEND_CLIENT_SECRET
  unset EMAIL_BACKEND_REFRESH_TOKEN
}
trap cleanup EXIT


echo $(lpass show EMAIL_BACKEND_SERVICE_KEY --notes) | base64 --decode > $scratch/key.json
gcloud auth activate-service-account --key-file=$scratch/key.json

export PROJECT=$(lpass show EMAIL_BACKEND_PROJECT_ID --notes)

touch $scratch/envs.yaml
echo "IS_PROD_SERVER: '$IS_PROD_SERVER'" >> $scratch/envs.yaml
echo "USE_REMOTE_DB: '$USE_REMOTE_DB'" >> $scratch/envs.yaml
echo "CURRENT_SHA: '$CURRENT_SHA'" >> $scratch/envs.yaml

export EMAIL_BACKEND_SENDING_ADDRESS=$(lpass show EMAIL_BACKEND_SENDING_ADDRESS --notes)
export EMAIL_BACKEND_RECEIVING_ADDRESS=$(lpass show EMAIL_BACKEND_RECEIVING_ADDRESS --notes)
export EMAIL_BACKEND_CLIENT_ID=$(lpass show EMAIL_BACKEND_CLIENT_ID --notes)
export EMAIL_BACKEND_CLIENT_SECRET=$(lpass show EMAIL_BACKEND_CLIENT_SECRET --notes)
export EMAIL_BACKEND_REFRESH_TOKEN=$(lpass show EMAIL_BACKEND_REFRESH_TOKEN --notes)
echo "EMAIL_BACKEND_SENDING_ADDRESS: '$EMAIL_BACKEND_SENDING_ADDRESS'" >> $scratch/envs.yaml
echo "EMAIL_BACKEND_RECEIVING_ADDRESS: '$EMAIL_BACKEND_RECEIVING_ADDRESS'" >> $scratch/envs.yaml
echo "EMAIL_BACKEND_CLIENT_ID: '$EMAIL_BACKEND_CLIENT_ID'" >> $scratch/envs.yaml
echo "EMAIL_BACKEND_CLIENT_SECRET: '$EMAIL_BACKEND_CLIENT_SECRET'" >> $scratch/envs.yaml
echo "EMAIL_BACKEND_REFRESH_TOKEN: '$EMAIL_BACKEND_REFRESH_TOKEN'" >> $scratch/envs.yaml


export MDB_NAME=$(lpass show EMAIL_BACKEND_MDB_NAME --notes)
export MDB_CONNECT_STRING=$(lpass show EMAIL_BACKEND_MDB_CONNECT_STRING_3 --notes)
export MDB_USERNAME=$(lpass show EMAIL_BACKEND_MDB_USER --notes)
export MDB_PW=$(lpass show EMAIL_BACKEND_MDB_PW --notes)
echo "MDB_NAME: '$MDB_NAME'" >> $scratch/envs.yaml
echo "MDB_CONNECT_STRING: '$MDB_CONNECT_STRING'" >> $scratch/envs.yaml
echo "MDB_USERNAME: '$MDB_USERNAME'" >> $scratch/envs.yaml
echo "MDB_PW: '$MDB_PW'" >> $scratch/envs.yaml