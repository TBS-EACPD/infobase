echo 'export CDN_URL="$CDN_BASE_URL/$CIRCLE_BRANCH"' >> $BASH_ENV
echo 'export PREVIOUS_DEPLOY_SHA=$(curl --fail $CDN_URL/build_sha)' >> $BASH_ENV
echo 'export GCLOUD_BUCKET_URL="$GCLOUD_BUCKET_ROOT/$CIRCLE_BRANCH"' >> $BASH_ENV
echo 'export MDB_NAME="$CIRCLE_BRANCH"' >> $BASH_ENV
source $BASH_ENV