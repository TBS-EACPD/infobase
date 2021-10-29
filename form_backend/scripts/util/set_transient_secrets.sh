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

  unset MDB_NAME
  unset MDB_CONNECT_STRING
  unset MDB_USERNAME
  unset MDB_PW

  unset FORM_BACKEND_SLACK_BOT_SERVICE_LINK
}
trap cleanup EXIT


echo $(lpass show FORM_BACKEND_SERVICE_KEY --notes) | base64 --decode > $scratch/key.json
gcloud auth activate-service-account --key-file=$scratch/key.json

export PROJECT=$(lpass show FORM_BACKEND_PROJECT_ID --notes)

touch $scratch/envs.yaml
echo "IS_PROD_SERVER: '$IS_PROD_SERVER'" >> $scratch/envs.yaml
echo "USE_REMOTE_DB: '$USE_REMOTE_DB'" >> $scratch/envs.yaml
echo "CURRENT_SHA: '$CURRENT_SHA'" >> $scratch/envs.yaml

export MDB_NAME=$(lpass show FORM_BACKEND_MDB_NAME --notes)
export MDB_CONNECT_STRING=$(lpass show FORM_BACKEND_MDB_CONNECT_STRING_3 --notes)
export MDB_USERNAME=$(lpass show FORM_BACKEND_MDB_USER --notes)
export MDB_PW=$(lpass show FORM_BACKEND_MDB_PW --notes)
echo "MDB_NAME: '$MDB_NAME'" >> $scratch/envs.yaml
echo "MDB_CONNECT_STRING: '$MDB_CONNECT_STRING'" >> $scratch/envs.yaml
echo "MDB_USERNAME: '$MDB_USERNAME'" >> $scratch/envs.yaml
echo "MDB_PW: '$MDB_PW'" >> $scratch/envs.yaml

export FORM_BACKEND_SLACK_BOT_SERVICE_LINK=$(lpass show FORM_BACKEND_SLACK_BOT_SERVICE_LINK --notes)
echo "SLACK_BOT_SERVICE_LINK: '$SLACK_BOT_SERVICE_LINK'" >> $scratch/envs.yaml