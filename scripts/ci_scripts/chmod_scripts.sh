#!/bin/bash
# CI scripts
chmod +x scripts/ci_scripts/create_envs.sh
chmod +x scripts/ci_scripts/create_deploy_envs.sh
chmod +x scripts/ci_scripts/authenticate-client-gcloud.sh
chmod +x scripts/ci_scripts/authenticate-server-gcloud.sh
chmod +x scripts/ci_scripts/redact_env_vars_from_logging.sh
chmod +x scripts/ci_scripts/cleanup_dev_dbs.sh

# Client scripts
chmod +x client/deploy_scripts/build_all.sh
chmod +x client/deploy_scripts/push_to_gcloud_bucket.sh

# Server scripts
chmod +x server/deploy_scripts/ci_deploy_function.sh