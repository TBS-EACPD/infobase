#!/bin/bash

# starts a spinner (on stderr), reports the spinners PID on stdout,
# use the PID to kill the spinner

(
  # based on https://unix.stackexchange.com/a/512170
  i=0
  while [ true ]; do
    c=`expr ${i} % 4`
    case ${c} in
      0) echo "/\c" ;;
      1) echo "-\c" ;;
      2) echo "\\ \b\c" ;;
      3) echo "|\c" ;;
    esac
    i=`expr ${i} + 1`
    # change the speed of the spinner by altering the 1 below
    sleep 1
    echo "\b\c"
  done
) 1>&2 &

spinner_pid=$!

echo $spinner_pid