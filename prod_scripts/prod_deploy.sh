#!/bin/bash
set -e # will exit if any command has non-zero exit value

(cd ../server && sh deploy_scripts/prod_deploy_data.sh)
(cd ../server && sh deploy_scripts/prod_deploy_function.sh)

(cd ../client && sh deploy_scripts/prod_deploy_client.sh)

mongo $(lpass show MDB_SHELL_CONNECT_STRING --notes) --username $(lpass show MDB_WRITE_USER --notes) --password $(lpass show MDB_WRITE_PW --notes) mongo_post_deploy_cleanup.js