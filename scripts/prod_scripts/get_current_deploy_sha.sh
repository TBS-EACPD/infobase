#!/bin/bash

set -e # will exit if any command has non-zero exit value

CDN_URL="https://cdn-rdc.ea-ad.ca/InfoBase"
PREVIOUS_DEPLOY_SHA=$(curl --fail $CDN_URL/build_sha | cut -c1-7)

echo "$PREVIOUS_DEPLOY_SHA"