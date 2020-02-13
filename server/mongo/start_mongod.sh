#! /bin/bash

if [[ ! -e ./mongo/db ]]; then 
  mkdir ./mongo/db
fi

mongod --config ./mongo/mongod.conf