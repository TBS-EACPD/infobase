#!/bin/sh

# Assumes a clone of the EACPD pipeline repo exists in a dir named "pipeline" as a sibling of the infobase repo.
# Pulls in the latest version of the pipeline on master and copies its InfoBase output in to the infobase repo data dir.

repo_path=$(pwd)

cd ../pipeline

git checkout master
git pull origin master

cp -f outputs/Infobase/* $repo_path/data