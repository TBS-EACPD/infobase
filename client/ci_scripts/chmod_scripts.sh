#!/bin/bash
# prep scripts
chmod +x ./ci_scripts/create_envs.sh

# build scripts
chmod +x ./deploy_build_scripts/build_all.sh

# deploy scripts
chmod +x ./ci_scripts/authenticate-gcloud.sh
chmod +x ./deploy_build_scripts/push_to_gcloud_bucket.sh

