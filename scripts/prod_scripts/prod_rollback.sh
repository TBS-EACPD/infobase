#!/bin/bash
set -e # will exit if any command has non-zero exit value

# Functions don't die automatically, and the previous db and bucket deploys are available for rollback
# Rolling back just the bucket is enough because it points to the old function which itself points to the rollback db
(cd client && sh scripts/deploy_scripts/prod_rollback_client.sh)

mongo $(lpass show MDB_SHELL_CONNECT_STRING --notes) \
  --username $(lpass show MDB_WRITE_USER --notes) --password $(lpass show MDB_WRITE_PW --notes) \
  scripts/prod_scripts/mongo_post_rollback_cleanup.js