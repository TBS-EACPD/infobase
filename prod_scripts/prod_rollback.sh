#!/bin/bash
set -e # will exit if any command has non-zero exit value

(cd ../client && sh deploy_scripts/prod_rollback_client.sh) # moving to an old client deploy points to an old function and thus old data, rollbacks all at once

mongo $(lpass show MDB_SHELL_CONNECT_STRING --notes) --username $(lpass show MDB_WRITE_USER --notes) --password $(lpass show MDB_WRITE_PW --notes) mongo_post_rollback_cleanup.js