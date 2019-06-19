#!/bin/bash
export IS_PROD_SERVER=true
export CURRENT_SHA=$(git rev-parse HEAD | cut -c1-7)