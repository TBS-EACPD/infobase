#!/bin/bash
set -e # will exit if any command has non-zero exit value 

concurrency="full"
while getopts "c:" opt; do
  case ${opt} in
    c) concurrency=$OPTARG;;
  esac
done

if [[ ! $concurrency =~ ^(full|half|none)$ ]]; then
  echo "Concurrency options, -c, are full, half, or none"
  exit 1
fi

[ -e $BUILD_DIR/InfoBase ] && rm -r $BUILD_DIR/InfoBase # clean up build dir

npm run static_build

if [ $concurrency == "none" ]; then
  # Just running all builds one at a time, no backgrounding or output redirection
  npm run webpack_build -- PROD NO-WATCH EN
  
  npm run webpack_build -- PROD NO-WATCH FR
  
  npm run webpack_build -- PROD NO-WATCH EN A11Y

  npm run webpack_build -- PROD NO-WATCH FR A11Y
else
  # Run standard and a11y builds in parallel as background processes, store thieir stdout and stderr in temp files and hold on to their pids, 
  # clean up and dump output on exit

  echo ""
  echo "Running prod builds in background, $concurrency concurrency..."
  spinner_pid=$(sh ../scripts/spinner.sh)

  # When exiting, either from finishing, being killed, or throwing an error, kill the spinner and dump the captured build process output to terminal
  scratch=$(mktemp -d -t captured_build_output.XXXXXXXXXX)
  function print_captured_output {
    kill -9 $spinner_pid
  
    [ -f $scratch/ib_prod_en_build_out ] && cat $scratch/ib_prod_en_build_out
    [ -f $scratch/ib_prod_en_build_err ] && cat $scratch/ib_prod_en_build_err
  
    [ -f $scratch/ib_prod_fr_build_out ] && cat $scratch/ib_prod_fr_build_out
    [ -f $scratch/ib_prod_fr_build_err ] && cat $scratch/ib_prod_fr_build_err
  
    [ -f $scratch/a11y_prod_en_build_out ] && cat $scratch/a11y_prod_en_build_out
    [ -f $scratch/a11y_prod_en_build_err ] && cat $scratch/a11y_prod_en_build_err
  
    [ -f $scratch/a11y_prod_fr_build_out ] && cat $scratch/a11y_prod_fr_build_out
    [ -f $scratch/a11y_prod_fr_build_err ] && cat $scratch/a11y_prod_fr_build_err
  }
  trap print_captured_output EXIT

  npm run webpack_build -- PROD NO-WATCH EN > $scratch/ib_prod_en_build_out 2> $scratch/ib_prod_en_build_err &
  ib_prod_en_pid=$!
  
  npm run webpack_build -- PROD NO-WATCH FR > $scratch/ib_prod_fr_build_out 2> $scratch/ib_prod_fr_build_err &
  ib_prod_fr_pid=$!
  
  if [ $concurrency == "half" ]; then
    wait $ib_prod_en_pid
    wait $ib_prod_fr_pid
  fi

  npm run webpack_build -- PROD NO-WATCH EN A11Y > $scratch/a11y_prod_en_build_out 2> $scratch/a11y_prod_en_build_err &
  a11y_prod_en_pid=$!
  
  npm run webpack_build -- PROD NO-WATCH FR A11Y > $scratch/a11y_prod_fr_build_out 2> $scratch/a11y_prod_fr_build_err &
  a11y_prod_fr_pid=$!

  if [ $concurrency == "half" ]; then
    wait $a11y_prod_en_pid
    wait $a11y_prod_fr_pid
  else 
    wait $ib_prod_en_pid
    wait $ib_prod_fr_pid
    wait $a11y_prod_en_pid
    wait $a11y_prod_fr_pid
  fi
fi

exit