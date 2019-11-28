#!/bin/bash

# Starts a spinner and reports the spinners PID on stdout (the spinner itself is on stderr, to be out of the way of the PID)
# Keep track of that PID, you need to use it to kill the spinner when you want it stopped

(
  # based on https://unix.stackexchange.com/a/512170
  i=0
  echo "\n"
  while [ true ]; do
    c=`expr ${i} % 9`
    case ${c} in
      0) echo "⠋\c" ;;
      1) echo "⠙\c" ;;
      2) echo "⠹\c" ;;
      3) echo "⠸\c" ;;
      4) echo "⠼\c" ;;
      5) echo "⠴\c" ;;
      6) echo "⠦\c" ;;
      7) echo "⠧\c" ;;
      8) echo "⠇\c" ;;
      9) echo "⠏\c" ;;
    esac
    i=`expr ${i} + 1`
    # change the speed of the spinner by altering the 1 below
    sleep 1
    echo "\b\c"
  done
) 1>&2 &

spinner_pid=$!

echo $spinner_pid