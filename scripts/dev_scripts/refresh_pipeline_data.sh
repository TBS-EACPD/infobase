#!/bin/sh

# Assumes a clone of the EACPD pipeline repo exists in a dir named "pipeline" as a sibling of the infobase repo.
# Pulls in the latest version of the pipeline on the argument branch (default master) and copies its InfoBase output in to the infobase repo data dir.

repo_path=$(pwd)

branch_name=$(
  if [ -z "$var" ]; then
    echo "$1"
  else
    echo "master"
  fi
)

cd ../pipeline

git pull origin
git checkout $branch_name
git pull origin $branch_name

cp -f outputs/Infobase/* $repo_path/data