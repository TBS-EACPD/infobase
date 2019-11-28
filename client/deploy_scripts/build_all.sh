#!/bin/bash
set -e # will exit if any command has non-zero exit value 

[ -e $BUILD_DIR/InfoBase ] && rm -r $BUILD_DIR/InfoBase # clean up build dir

npm run IB_base


scratch=$(mktemp -d -t captured_build_output.XXXXXXXXXX)

npm run IB_prod_no_watch > $scratch/ib_prod_build_out 2> $scratch/ib_prod_build_err &
ib_prod_pid=$!

npm run a11y_prod_no_watch > $scratch/a11y_prod_build_out 2> $scratch/a11y_prod_build_err &
a11y_prod_pid=$!


spinner_pid=$(sh ../scripts/spinner.sh)


function print_captured_output {
  kill -9 $spinner_pid

  cat $scratch/ib_prod_build_out
  cat $scratch/ib_prod_build_err

  cat $scratch/a11y_prod_build_out
  cat $scratch/a11y_prod_build_err
}
trap print_captured_output EXIT


wait $ib_prod_pid
wait $a11y_prod_pid

kill -9 $spinner_pid