#!/bin/bash

# Starts a spinner and reports the spinners PID on stdout (the spinner itself is on stderr, to be out of the way of the PID)
# Keep track of that PID, you need to use it to kill the spinner when you want it stopped

(
  i=0
  echo "\n"
  while [ true ]; do
    c=`expr ${i} % 9`
    case ${c} in
      0) printf "\b⠋" ;;
      1) printf "\b⠙" ;;
      2) printf "\b⠹" ;;
      3) printf "\b⠸" ;;
      4) printf "\b⠼" ;;
      5) printf "\b⠴" ;;
      6) printf "\b⠦" ;;
      7) printf "\b⠧" ;;
      8) printf "\b⠇" ;;
      9) printf "\b⠏" ;;
    esac
    i=`expr ${i} + 1`
    # change the speed of the spinner by altering the 1 below
    sleep 1
  done
) 1>&2 &

function exit_newline {
  echo ""
}
trap exit_newline EXIT

spinner_pid=$!

echo $spinner_pid