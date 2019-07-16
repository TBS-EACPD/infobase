#!/bin/bash
if [[ $CIRCLECI && $SILENCE_RISKY_LOGGING && ($1 == "mute") ]] ; then
  echo "**REDACTED**"
  exec 8>&1 9>&2 &>/dev/null # in CI, silence stdout and stderr
elif [[ $CIRCLECI && $SILENCE_RISKY_LOGGING && ($1 == "unmute") ]] ; then
  exec 1>&8 2>&9 # restore stdout and stderr
fi