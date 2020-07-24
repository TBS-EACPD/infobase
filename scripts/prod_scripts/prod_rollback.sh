#!/bin/bash

# Rolls back the currently deployed client (effectively rolling back the server google cloud function as well.
# Only one roll back version, the version deployed prior to the current, is available at any given time.
# On rollback, the current deployed version becomes the new rollback version.
# Requires the LastPass CLI.

set -e # will exit if any command has non-zero exit value

# Functions don't die automatically, and the previous db and bucket deploys are available for rollback
# Rolling back just the bucket is enough because it points to the old function which itself points to the rollback db
(cd client && sh deploy_scripts/prod_rollback_client.sh)

mongo $(lpass show MDB_SHELL_CONNECT_STRING --notes) \
  --username $(lpass show MDB_WRITE_USER --notes) --password $(lpass show MDB_WRITE_PW --notes) \
  scripts/prod_scripts/mongo_post_rollback_cleanup.js

curl -X POST -H 'Content-type: application/json' --data '{"text":"New update has been rolled back!"}' $(lpass show UPDATE_DEPLOYED_BOT_SERVICE_LINK --notes)