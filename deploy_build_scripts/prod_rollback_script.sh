#!/bin/bash
set -e # will exit if any command has non-zero exit value

source ./deploy_build_Scripts/create_transient_secrets.sh
source ./deploy_build_Scripts/create_prod_env_vars.sh

gsutil -m rsync -a public-read -r -d $ROLLBACK_BUCKET $PROD_BUCKET

#clear certain cloudflare caches
./deploy_build_scripts/selectively_clear_cloudflare_cache.sh