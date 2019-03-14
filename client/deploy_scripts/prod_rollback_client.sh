#!/bin/bash
set -e # will exit if any command has non-zero exit value

source ./deploy_scripts/set_transient_secrets.sh
source ./deploy_scripts/create_prod_env_vars.sh

# Move rollback bucket contents to prod
gsutil -m rsync -a public-read -r -d $ROLLBACK_BUCKET $PROD_BUCKET

# Move staging contents to rollback (staging would be the same as prod before rollback was run)
# NOTE: this means a consequitive rollback rolls back the first rollback
gsutil -m rsync -a public-read -r -d $STAGING_BUCKET $ROLLBACK_BUCKET

#clear certain cloudflare caches
./deploy_scripts/selectively_clear_cloudflare_cache.sh

exit