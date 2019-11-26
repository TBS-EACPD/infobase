#!/bin/bash
export CURRENT_SHA=$(git rev-parse HEAD | cut -c1-7)
export MDB_NAME=prod-db-${CURRENT_SHA}
export USE_REMOTE_DB=1