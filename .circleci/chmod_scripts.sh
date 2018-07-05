#!/bin/sh
# prep scripts
chmod +x ./.circleci/create_envs.sh

# build scripts
chmod +x ./deploy_build_scripts/build_all.sh

# deploy scripts
chmod +x ./.circleci/authenticate-gcloud.sh
chmod +x ./deploy_build_scripts/split_gzip_build.sh
chmod +x ./deploy_build_scripts/push_to_gcloud_bucket.sh

