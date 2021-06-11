#!/bin/bash
set -e # will exit if any command has non-zero exit value

source ./deploy_scripts/set_transient_secrets.sh
source ./deploy_scripts/create_prod_env_vars.sh

# Move current prod to staging as swap location (staging SHOULD already be current prod,
# this is just to cover the case where a deploy aborted mid-stage since the current prod was deployed)
gsutil -m rsync -a public-read -r -d $ROLLBACK_BUCKET $PROD_BUCKET

# Move rollback bucket contents to prod
gsutil -m rsync -a public-read -r -d $ROLLBACK_BUCKET $PROD_BUCKET

# Move staging (previous prod) contents to rollback
# NOTE: this means consequitive rollbacks, without any new deploys inbetween, will toggle between the current and previous deploys
gsutil -m rsync -a public-read -r -d $STAGING_BUCKET $ROLLBACK_BUCKET

#clear certain cloudflare caches
./deploy_scripts/selectively_clear_cloudflare_cache.sh

exit