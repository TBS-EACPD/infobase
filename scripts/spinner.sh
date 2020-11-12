#!/bin/bash

# Starts a spinner and reports the spinners PID on stdout (the spinner itself is on stderr, to be out of the way of the PID)
# Keep track of that PID, you need to use it to kill the spinner when you want it stopped

(
  # based on https://unix.stackexchange.com/a/512170
  i=0
  echo "\n"
  while [ true ]; do
    spinner="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
    while :
    do
      for i in `seq 0 9`
      do
        printf "\b${spinner:$i:1}"
        sleep 1 # change the speed of the spinner by altering the sleep time
      done
    done
  done
) 1>&2 &

spinner_pid=$!

echo $spinner_pid