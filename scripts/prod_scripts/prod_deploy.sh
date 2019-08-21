#!/bin/bash
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

(cd server && sh scripts/deploy_scripts/prod_deploy_data.sh)
(cd server && sh scripts/deploy_scripts/prod_deploy_function.sh)

(cd client && sh scripts/deploy_scripts/prod_deploy_client.sh)

# prod db name convention is "prod-db-{short sha}", this is assumed/relied on in a few places so
# be careful if you ever want to change that convention
MDB_NAME=prod-db-$(git rev-parse HEAD | cut -c1-7)

# --eval seems to be the go-to way to passing args in to a JS mongo script
mongo $(lpass show MDB_SHELL_CONNECT_STRING --notes) \
  --username $(lpass show MDB_WRITE_USER --notes) --password $(lpass show MDB_WRITE_PW --notes) \
  --eval "const new_prod_db_name = '$MDB_NAME';" \
  scripts/prod_scripts/mongo_post_deploy_cleanup.js