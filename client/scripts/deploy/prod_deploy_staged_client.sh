#!/bin/bash
set -e # will exit if any command has non-zero exit value

source ./scripts/deploy/set_transient_secrets.sh
source ./scripts/deploy/create_prod_env_vars.sh

#within the GCloud bucket, backup the live prod directory (/InfoBase) to the /rollback dir, rsync /staging to /InfoBase
#leaves us a safe version to roll back to in /rollback, and minimizes the mid-deploy downtime for the InfoBase
gsutil -m rsync -a public-read -r -d $PROD_BUCKET $ROLLBACK_BUCKET
gsutil -m rsync -a public-read -r -d $STAGING_BUCKET $PROD_BUCKET

#clear certain cloudflare caches
./scripts/deploy/selectively_clear_cloudflare_cache.sh

exit