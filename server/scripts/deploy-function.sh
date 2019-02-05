#!/bin/bash
# must run this scripts in root of api project
npm run build

# TODO: make this script non-secret and grab credentials the safe way
source scripts/write_envs.sh

touch ./envs.yaml
echo "MDB_NAME: '$MDB_NAME'" >> ./envs.yaml
echo "MDB_USERNAME: '$MDB_USERNAME'" >> ./envs.yaml
echo "MDB_PW: '$MDB_PW'" >> ./envs.yaml


gcloud functions deploy app --stage-bucket api-staging-bucket --runtime nodejs6 --trigger-http --env-vars-file envs.yaml
rm ./envs.yaml
source scripts/destroy_envs.sh