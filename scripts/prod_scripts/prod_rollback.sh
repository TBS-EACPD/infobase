#!/bin/bash

# Rolls back the currently deployed client (effectively rolling back the server google cloud function as well.
# Only one roll back version, the version deployed prior to the current, is available at any given time.
# On rollback, the current deployed version becomes the new rollback version.
# Requires the LastPass CLI.

set -e # will exit if any command has non-zero exit value

read -p "Provide a one sentence reason for this rollback, for the slack alert:
> " ROLLBACK_MESSAGE

PRE_ROLLBACK_SHA=$(sh scripts/prod_scripts/get_current_deploy_sha.sh)

sh scripts/prod_scripts/slack_deploy_alert.sh "
$PRE_ROLLBACK_SHA: Performing prod rollback!\\n
By: $(git config user.name)\\n
Reason for rollback: $ROLLBACK_MESSAGE
"

function rollback_exit_alert {
  if [[ $? != 0 ]]; then
    sh scripts/prod_scripts/slack_deploy_alert.sh "
$PRE_ROLLBACK_SHA: UH OH! Rollback exited early...\\n
Could mean a number of things, give $(git config user.name) a bit to put out the fire before asking what went wrong
"
  fi
}
trap rollback_exit_alert EXIT

# Functions don't die automatically, and the previous db and bucket deploys are available for rollback
# Rolling back just the bucket is enough because it points to the old function which itself points to the rollback db
(cd client && sh deploy_scripts/prod_rollback_client.sh)

mongo $(lpass show MDB_SHELL_CONNECT_STRING --notes) \
  --username $(lpass show MDB_WRITE_USER --notes) --password $(lpass show MDB_WRITE_PW --notes) \
  scripts/prod_scripts/mongo_post_rollback_cleanup.js

POST_ROLLBACK_SHA=$(sh scripts/prod_scripts/get_current_deploy_sha.sh)

sh scripts/prod_scripts/slack_deploy_alert.sh "
$PRE_ROLLBACK_SHA: Rollback complete!\\n
Returned prod site to $POST_ROLLBACK_SHA
"