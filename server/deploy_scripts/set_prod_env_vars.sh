#!/bin/bash
export SHOULD_USE_REMOTE_DB=1
export APP_PROJ_ID="ib-serverless-api-dev"
export CURRENT_SHA=$(git rev-parse HEAD | cut -c1-7)
export MDB_NAME=prod-db-${CURRENT_SHA}