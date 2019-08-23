#!/bin/bash
set -e

active_branches=$(git branch -r)

echo "Starting dev link MongoDB cleanup..."

source scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"

mongo $MDB_SHELL_CONNECT_STRING --username $MDB_USERNAME --password $MDB_PW \
  --eval "const active_branches = '$active_branches';" \
  scripts/ci_scripts/cleanup_dev_dbs.js

source scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"