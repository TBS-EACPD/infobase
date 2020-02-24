#!/bin/bash

# Deploy the current server and client in to production. Requires the LastPass CLI.

set -e # will exit if any command has non-zero exit value

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
while [ $CURRENT_BRANCH != 'master' ]; do
  read -p "You are not on master, do you really mean to deploy from $CURRENT_BRANCH? [YES/oops]" yn
  case $yn in
    [YES]* ) break;;
    [oops]* ) exit;;
    * ) echo "Please answer YES or oops.";;
  esac
done


# prod db name convention is "prod-db-{short sha}", this is assumed/relied on in a few places so be careful if you ever want to change that convention
DB_SUFFIX=prod-db-
CURRENT_SHA=$(git rev-parse HEAD | cut -c1-7)
NEW_PROD_MDB_NAME=$DB_SUFFIX$CURRENT_SHA

CURRENT_PROD_MDB_NAME=$(mongo $(lpass show MDB_SHELL_CONNECT_STRING --notes) \
  --username $(lpass show MDB_WRITE_USER --notes) --password $(lpass show MDB_WRITE_PW --notes) \
  --eval "printjson(db.getSiblingDB('metadata').metadata.findOne({}).prod)" | tail -n 1 | sed 's/"//g')
if [[ ! $CURRENT_PROD_MDB_NAME =~ ^$DB_SUFFIX  ]]; then
  >&2 echo "ERROR: failed to get current prod DB name. Expected something with the suffix \"$DB_SUFFIX\", got \"$CURRENT_PROD_MDB_NAME\""
  exit
elif [[ $CURRENT_PROD_MDB_NAME = $NEW_PROD_MDB_NAME ]] ; then
  >&2 echo "ERROR: attempting to deploy from $CURRENT_SHA, but $CURRENT_SHA is already in production. If you really need a re-deploy, make a do-nothing commit first"
  exit
fi


(cd server && sh deploy_scripts/prod_deploy_data.sh)
(cd server && sh deploy_scripts/prod_deploy_function.sh)

(cd client && sh deploy_scripts/prod_deploy_client.sh)

# --eval seems to be the go-to way to passing args in to a JS mongo script
mongo $(lpass show MDB_SHELL_CONNECT_STRING --notes) \
  --username $(lpass show MDB_WRITE_USER --notes) --password $(lpass show MDB_WRITE_PW --notes) \
  --eval "const new_prod_db_name = '$NEW_PROD_MDB_NAME';" \
  scripts/prod_scripts/mongo_post_deploy_cleanup.js