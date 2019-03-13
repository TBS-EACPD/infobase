#!/bin/bash
set -e # will exit if any command has non-zero exit value

MDB_NAME=prod-db-$(git rev-parse HEAD | cut -c1-7)

(cd ../server && sh deploy_scripts/prod_deploy_data.sh)
(cd ../server && sh deploy_scripts/prod_deploy_function.sh)

(cd ../client && sh deploy_scripts/prod_deploy_client.sh)

# --eval seems to be the go-to way to passing args in to a JS mongo script
mongo $(lpass show MDB_SHELL_CONNECT_STRING --notes) \
  --username $(lpass show MDB_WRITE_USER --notes) --password $(lpass show MDB_WRITE_PW --notes) \
  --eval "const new_prod_db_name = '$MDB_NAME';" \ 
  mongo_post_deploy_cleanup.js