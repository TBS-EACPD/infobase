#!/bin/bash
# CI scripts
chmod +x ./ci_scripts/create_envs.sh
chmod +x ./ci_scripts/create_deploy_envs.sh
chmod +x ./ci_scripts/authenticate-client-gcloud.sh
chmod +x ./ci_scripts/authenticate-server-gcloud.sh

# Client scripts
chmod +x ./client/deploy_build_scripts/build_all.sh
chmod +x ./client/deploy_build_scripts/push_to_gcloud_bucket.sh

# API scripts
