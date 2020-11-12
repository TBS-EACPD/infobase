#!/bin/bash
set -e # will exit if any command has non-zero exit value 

concurrency="full"
max_old_space_size=512

while getopts ":c:concurrency:m:max_old_space_size:" arg; do
  case $arg in
    c) concurrency=$OPTARG;;
    concurrency) concurrency=$OPTARG;;
    m) max_old_space_size=$OPTARG;;
    max_old_space_size) max_old_space_size=$OPTARG;;
  esac
done


[ -e $BUILD_DIR/InfoBase ] && rm -r $BUILD_DIR/InfoBase # clean up build dir

npm run IB_base

# When exiting, either from finishing, being killed, or throwing an error, kill the spinner and dump the captured build process output to terminal
function print_captured_output {
  kill -9 $spinner_pid

  cat $scratch/ib_prod_en_build_out
  cat $scratch/ib_prod_en_build_err

  cat $scratch/ib_prod_fr_build_out
  cat $scratch/ib_prod_fr_build_err

  cat $scratch/a11y_prod_en_build_out
  cat $scratch/a11y_prod_en_build_err

  cat $scratch/a11y_prod_fr_build_out
  cat $scratch/a11y_prod_fr_build_err
}


scratch=$(mktemp -d -t captured_build_output.XXXXXXXXXX)
if [ $concurrency == "full" ]; then
  # Run standard and a11y builds in parallel as background processes, store thieir stdout and stderr in temp files and hold on to their pids, 
  # clean up and dump output on exit
  trap print_captured_output EXIT

  echo ""
  echo "Running prod builds in background, full concurrency..."
  spinner_pid=$(sh ../scripts/spinner.sh)

  npm run IB_prod_no_watch_en --max_old_space_size=$max_old_space_size > $scratch/ib_prod_en_build_out 2> $scratch/ib_prod_en_build_err &
  ib_prod_en_pid=$!
  
  npm run IB_prod_no_watch_fr --max_old_space_size=$max_old_space_size > $scratch/ib_prod_fr_build_out 2> $scratch/ib_prod_fr_build_err &
  ib_prod_fr_pid=$!
  
  npm run a11y_prod_no_watch_en --max_old_space_size=$max_old_space_size > $scratch/a11y_prod_en_build_out 2> $scratch/a11y_prod_en_build_err &
  a11y_prod_en_pid=$!
  
  npm run a11y_prod_no_watch_fr --max_old_space_size=$max_old_space_size > $scratch/a11y_prod_fr_build_out 2> $scratch/a11y_prod_fr_build_err &
  a11y_prod_fr_pid=$!

  wait $ib_prod_en_pid
  wait $ib_prod_fr_pid
  wait $a11y_prod_en_pid
  wait $a11y_prod_fr_pid
elif [ $concurrency == "half" ]; then
  # Same as "full" concurrency, but only run two builds at a time 
  trap print_captured_output EXIT

  echo ""
  echo "Running prod builds in background, half concurrency..."
  spinner_pid=$(sh ../scripts/spinner.sh)

  npm run IB_prod_no_watch_en --max_old_space_size=$max_old_space_size > $scratch/ib_prod_en_build_out 2> $scratch/ib_prod_en_build_err &
  ib_prod_en_pid=$!
  
  npm run IB_prod_no_watch_fr --max_old_space_size=$max_old_space_size > $scratch/ib_prod_fr_build_out 2> $scratch/ib_prod_fr_build_err &
  ib_prod_fr_pid=$!

  spinner_pid=$(sh ../scripts/spinner.sh)

  wait $ib_prod_en_pid
  wait $ib_prod_fr_pid
  
  npm run a11y_prod_no_watch_en --max_old_space_size=$max_old_space_size > $scratch/a11y_prod_en_build_out 2> $scratch/a11y_prod_en_build_err &
  a11y_prod_en_pid=$!
  
  npm run a11y_prod_no_watch_fr --max_old_space_size=$max_old_space_size > $scratch/a11y_prod_fr_build_out 2> $scratch/a11y_prod_fr_build_err &
  a11y_prod_fr_pid=$!
  
  wait $a11y_prod_en_pid
  wait $a11y_prod_fr_pid
elif [ $concurrency == "none" ]; then
  # Just running all builds one at a time, no backgrounding or output redirection

  npm run IB_prod_no_watch_en --max_old_space_size=$max_old_space_size 
  
  npm run IB_prod_no_watch_fr --max_old_space_size=$max_old_space_size 
  
  npm run a11y_prod_no_watch_en --max_old_space_size=$max_old_space_size 

  npm run a11y_prod_no_watch_fr --max_old_space_size=$max_old_space_size
else
  echo ""
  echo "Bad concurrency (c) option. Must be one of full, half, or none"
  exit 1
fi

exit