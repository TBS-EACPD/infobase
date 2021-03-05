#! /bin/bash

while getopts ":p:" opt; do
  case $opt in
    p)
      port=$OPTARG
      ;;
    \?)
      echo "Invalid option: -$opt" >&2
      exit 1
      ;;
  esac
done
if [ -z "$port" ]; then
   port="27017"
   echo "No -p option, defaulting to port 27017"
fi


if [ ! -e ./local_mongo ]; then 
  mkdir -p ./local_mongo/db
fi


if [ -e ./local_mongo/db/mongod.lock ]; then 
  running_mongod_pid=$(lsof ./local_mongo/db/mongod.lock | awk 'NR == 2 {print $2}')

  # sticks in loop until the process is actually dead, otherwise it's a race between the 
  # subsequent mongod starting and this old one finishing its cleanup
  while kill $running_mongod_pid; do 
    sleep 1
  done
fi


echo "storage:
  dbPath: ./local_mongo/db
net:
  bindIp: 127.0.0.1
  port: $port
" > ./local_mongo/mongod.conf

mongod --config ./local_mongo/mongod.conf