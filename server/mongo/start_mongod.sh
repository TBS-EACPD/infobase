#! /bin/bash

if [[ ! -e ./mongo/db ]]; then 
  mkdir ./mongo/db
fi

if [[ -e ./mongo/db/mongod.lock ]]; then 
  running_mongod_pid=$(lsof ./mongo/db/mongod.lock | awk 'NR == 2 {print $2}')

  # sticks in loop until the process is actually dead, otherwise it's a race between the subsequent mongod starting and this old one finishing its cleanup
  while kill $running_mongod_pid; do 
    sleep 1
  done
fi

mongod --config ./mongo/mongod.conf