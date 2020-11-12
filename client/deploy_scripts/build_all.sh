#!/bin/bash
set -e # will exit if any command has non-zero exit value 

[ -e $BUILD_DIR/InfoBase ] && rm -r $BUILD_DIR/InfoBase # clean up build dir

npm run IB_base


# Run standard and a11y builds in parallel as background processes, store thieir stdout and stderr in temp files and hold on to their pids
scratch=$(mktemp -d -t captured_build_output.XXXXXXXXXX)

npm run IB_prod_no_watch_en --max_old_space_size=600 > $scratch/ib_prod_en_build_out 2> $scratch/ib_prod_en_build_err &
ib_prod_en_pid=$!

npm run IB_prod_no_watch_fr --max_old_space_size=600 > $scratch/ib_prod_fr_build_out 2> $scratch/ib_prod_fr_build_err &
ib_prod_fr_pid=$!

npm run a11y_prod_no_watch_en --max_old_space_size=600 > $scratch/a11y_prod_en_build_out 2> $scratch/a11y_prod_en_build_err &
a11y_prod_en_pid=$!

npm run a11y_prod_no_watch_fr --max_old_space_size=600 > $scratch/a11y_prod_fr_build_out 2> $scratch/a11y_prod_fr_build_err &
a11y_prod_fr_pid=$!


# Start a spinner going in the terminal meanwhile, hold on to its pid to stop it later
spinner_pid=$(sh ../scripts/spinner.sh)


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
trap print_captured_output EXIT


wait $ib_prod_en_pid
wait $ib_prod_fr_pid
wait $a11y_prod_en_pid
wait $a11y_prod_fr_pid
exit