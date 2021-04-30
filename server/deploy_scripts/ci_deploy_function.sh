#!/bin/bash
set -e

touch ./envs.yaml
echo "MDB_NAME: '$MDB_NAME'" >> ./envs.yaml
echo "MDB_CONNECT_STRING: '$MDB_CONNECT_STRING_3'" >> ./envs.yaml
echo "MDB_USERNAME: '$MDB_USERNAME'" >> ./envs.yaml
echo "MDB_PW: '$MDB_PW'" >> ./envs.yaml

echo "USE_REMOTE_DB: '1'" >> ./envs.yaml

source ../scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"

npm run prod_build

gcloud functions deploy $CIRCLE_BRANCH --entry-point app --stage-bucket api-staging-bucket --runtime nodejs14 --trigger-http --env-vars-file ./envs.yaml
gcloud alpha functions add-iam-policy-binding $CIRCLE_BRANCH --member allUsers --role roles/cloudfunctions.invoker

source ../scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"