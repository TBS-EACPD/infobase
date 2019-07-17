
touch ./envs.yaml
echo "SHOULD_USE_REMOTE_DB: '$SHOULD_USE_REMOTE_DB'" >> ./envs.yaml
echo "MDB_NAME: '$MDB_NAME'" >> ./envs.yaml
echo "MDB_CONNECT_STRING: '$MDB_CONNECT_STRING_3'" >> ./envs.yaml
echo "MDB_USERNAME: '$MDB_USERNAME'" >> ./envs.yaml
echo "MDB_PW: '$MDB_PW'" >> ./envs.yaml

source ../ci_scripts/redact_env_vars_from_logging.sh "mute"

gcloud functions deploy $CIRCLE_BRANCH --entry-point app --stage-bucket api-staging-bucket --runtime nodejs8 --trigger-http --env-vars-file ./envs.yaml

source ../ci_scripts/redact_env_vars_from_logging.sh "unmute"