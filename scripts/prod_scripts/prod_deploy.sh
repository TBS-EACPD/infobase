#!/bin/bash

# Deploy the current server and client in to production. Requires the LastPass CLI.

set -e # will exit if any command has non-zero exit value

read -p "Provide a one sentence reason for this deploy, for the slack alert:
> " DEPLOY_MESSAGE

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
while [ $CURRENT_BRANCH != 'master' ]; do
  read -p "You are not on master, do you really mean to deploy from $CURRENT_BRANCH? [YES/oops]: >" yn
  case $yn in
    [YES]* ) break;;
    [oops]* ) exit;;
    * ) echo "Please answer YES or oops.";;
  esac
done

# prod db name convention is "prod-db-{short sha}", this is assumed/relied on in a few places so be careful if you ever want to change that convention
DB_SUFFIX=prod-db-
REMOTE_MASTER_SHA=$(git rev-parse origin/master | cut -c1-7)
CURRENT_SHA=$(git rev-parse HEAD | cut -c1-7)
NEW_PROD_MDB_NAME=$DB_SUFFIX$CURRENT_SHA

while [ $CURRENT_SHA != $REMOTE_MASTER_SHA ]; do
  read -p "You are deploying from a commit that does not match the head of origin/master. Do you want to continue? [YES/oops]: >" yn
  case $yn in
    [YES]* ) break;;
    [oops]* ) exit;;
    * ) echo "Please answer YES or oops.";;
  esac
done

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

CDN_URL="https://cdn-rdc.ea-ad.ca/InfoBase"
PREVIOUS_DEPLOY_SHA=$(curl --fail $CDN_URL/build_sha | cut -c1-7)

GITHUB_LINK="https://github.com/TBS-EACPD/infobase/compare/$PREVIOUS_DEPLOY_SHA...$CURRENT_SHA"  && [[ -z $PREVIOUS_DEPLOY_SHA ]] && GITHUB_LINK="https://github.com/TBS-EACPD/infobase/commit/$CURRENT_SHA"

SLACK_ALERT_DIFF_LINK="<$GITHUB_LINK|$CURRENT_SHA>"

sh scripts/prod_scripts/slack_deploy_alert.sh "
$SLACK_ALERT_DIFF_LINK: STARTED!\\n
By: $(git config user.name)\\n
Reason for deploying: \"$DEPLOY_MESSAGE\"
"

function safe_deploy_exit_alert {
  if [[ $? != 0 ]]; then
    sh scripts/prod_scripts/slack_deploy_alert.sh "$SLACK_ALERT_DIFF_LINK: EARLY EXIT! No changes to the production site."
  fi
}
trap safe_deploy_exit_alert EXIT

(cd server && sh deploy_scripts/prod_deploy_data.sh)
(cd server && sh deploy_scripts/prod_deploy_function.sh)

(cd client && sh deploy_scripts/prod_build_client.sh)
(cd client && sh deploy_scripts/prod_stage_client.sh)

function unsafe_deploy_exit_alert {
  if [[ $? != 0 ]]; then
    sh scripts/prod_scripts/slack_deploy_alert.sh "
'$CURRENT_SHA': LATE EXIT! UH OH! Prod site may or may not be updated, but post-deploy cleanup not properly complete!\\n
Should probably run a client rollback, fix any issues, and then run a fresh prod deploy to clean things up.
"
  fi
}
trap unsafe_deploy_exit_alert EXIT

(cd client && sh deploy_scripts/prod_deploy_staged_client.sh)

# --eval seems to be the go-to way to passing args in to a JS mongo script
mongo $(lpass show MDB_SHELL_CONNECT_STRING --notes) \
  --username $(lpass show MDB_WRITE_USER --notes) --password $(lpass show MDB_WRITE_PW --notes) \
  --eval "const new_prod_db_name = '$NEW_PROD_MDB_NAME';" \
  scripts/prod_scripts/mongo_post_deploy_cleanup.js

sh scripts/prod_scripts/slack_deploy_alert.sh "$SLACK_ALERT_DIFF_LINK: FINISHED! Changes are live."