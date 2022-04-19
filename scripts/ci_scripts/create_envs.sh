echo 'export CDN_URL="$CDN_BASE_URL/$CIRCLE_BRANCH"' >> $BASH_ENV
echo 'export PREVIOUS_DEPLOY_SHA=$(command -v curl 1>/dev/null && curl --fail --silent $CDN_URL/.txt)' >> $BASH_ENV
echo 'export GCLOUD_BUCKET_URL="$GCLOUD_BUCKET_ROOT/$CIRCLE_BRANCH"' >> $BASH_ENV
echo 'export MDB_NAME="$CIRCLE_BRANCH"' >> $BASH_ENV
source $BASH_ENV