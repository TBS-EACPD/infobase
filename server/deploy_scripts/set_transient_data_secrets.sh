#!/bin/bash
set -e # will exit if any command has non-zero exit value

#meant to be called with source
#adds a trap on EXIT to unset env vars

function cleanup {
  unset TEMP_MDB_CONNECT_STRING
  unset MDB_USERNAME
  unset MDB_PW
}
trap cleanup EXIT

export TEMP_MDB_CONNECT_STRING=$(lpass show TEMP_MDB_CONNECT_STRING_3 --notes)
export MDB_USERNAME=$(lpass show TEMP_MDB_WRITE_USER --notes)
export MDB_PW=$(lpass show TEMP_MDB_WRITE_PW --notes)