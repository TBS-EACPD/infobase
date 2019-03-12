#!/bin/bash
export SHOULD_USE_REMOTE_DB=1
export APP_PROJ_ID="ib-serverless-api-dev"
export MDB_NAME="${MDB_NAME:"prod"}" #todo get default MDB_NAME value from current API