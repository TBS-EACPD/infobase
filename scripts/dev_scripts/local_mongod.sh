#! /bin/bash

while getopts ":p:d:" opt; do
  case $opt in
    p)
      port=$OPTARG
      ;;
    d)
      dbpath=$OPTARG
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

if [ -z "$port" ]; then
   port="27017"
   echo "No -p option, defaulting to port 27017"
fi

if [ -z "$dbpath" ]; then
   dbpath="./.local_mongo/db"
   echo "No -d option, defaulting to ./.local_mongo/db"
fi

# Create the database directory if it doesn't exist
if [[ "$dbpath" == "./.local_mongo/db" ]]; then
  if [ ! -e ./.local_mongo ]; then 
    mkdir -p "$dbpath"
  fi
else
  if [ ! -e "$dbpath" ]; then
    mkdir -p "$dbpath"
  fi
fi

# Check for existing mongod process
if [ -e "$dbpath/mongod.lock" ]; then 
  running_mongod_pid=$(lsof "$dbpath/mongod.lock" | awk 'NR == 2 {print $2}')

  # sticks in loop until the process is actually dead, otherwise it's a race between the 
  # subsequent mongod starting and this old one finishing its cleanup
  while kill $running_mongod_pid 2>/dev/null; do 
    sleep 1
  done
fi

# Create config file
echo "storage:
  dbPath: $dbpath
net:
  bindIp: 127.0.0.1
  port: $port
" > ./.local_mongo/mongod.conf

mongod --config ./.local_mongo/mongod.conf