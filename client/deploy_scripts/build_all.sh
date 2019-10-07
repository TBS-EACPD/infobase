#!/bin/bash
set -e # will exit if any command has non-zero exit value
[ -e $BUILD_DIR/InfoBase ] && rm -r $BUILD_DIR/InfoBase
ls $BUILD_DIR
npm run IB_base
npm run IB_prod_no_watch
npm run a11y_prod_no_watch