#!/bin/bash
set -e

active_branches=(git branch -r)

source scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"

mongo $MDB_CONNECT_STRING_3 --username $MDB_USERNAME --password $MDB_PW \
  --eval "const active_branches = '$active_branches';" \
  scripts/prod_scripts/clean_up_dev_dbs.js

source scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"