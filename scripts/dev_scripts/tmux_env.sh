#!/bin/bash

# Start a tmux session and runs all client and server project dev build and serve scripts.
# End result is 7 tmux panes, one for working and 6 running various watching dev scripts.
# If an IB tmux session already exists, just connects to it instead.
# Requires tmux.

existing_IB_session=$(tmux list-sessions 2> /dev/null | grep -oh ^IB-[0-9] | head -1)

if [[ -n $existing_IB_session ]]; then
 tmux attach-session -t "$existing_IB_session"
else

  # ping the main npm registry. Will only npm ci if we can reach it, because npm ci itself deletes all local modules first before
  # it checks if it's going to be able to replace them...
  if curl -f https://registry.npmjs.org/; then
    can_reach_npm='true'
  else
    can_reach_npm='false'
  fi
  

  # to avoid client webpack and base build race condition, make sure the build dir exists in advance
  if [[ ! -d client/build ]]; then 
    mkdir client/build && mkdir client/build/InfoBase 
  fi

  # note: lots of while loops used to keep scripts retrying until their relevant node modules finish installing
  tmux new-session -t "IB" \; \
    rename-window "client" \; \
    send-keys "$can_reach_npm && npm ci" C-m \; \
    split-window -h \; \
    send-keys 'cd client' C-m \; \
    send-keys "$can_reach_npm && npm ci" C-m \; \
    send-keys "npm run webpack -- EN FR" C-m \; \
    split-window -v \; \
    send-keys 'cd client' C-m \; \
    send-keys 'while true; do npm run gqlgen:watch; sleep 30; done' C-m \; \
    split-window -v \; \
    send-keys 'cd client' C-m \; \
    send-keys 'while true; do npm run serve; sleep 30; done' C-m \; \
    split-window -h \; \
    send-keys 'cd client' C-m \; \
    send-keys 'while true; do npm run build_static:watch; sleep 30; done' C-m \; \
    new-window \; \
    rename-window "server" \; \
    send-keys 'cd server' C-m \; \
    send-keys "$can_reach_npm && npm ci" C-m \; \
    split-window -h \; \
    send-keys 'cd server' C-m \; \
    send-keys 'while true; do npm run start; sleep 30; done' C-m \; \
    split-window -v \; \
    send-keys 'cd server' C-m \; \
    send-keys 'npm run mongod' C-m \; \
    split-window -h \; \
    send-keys 'cd server' C-m \; \
    send-keys 'while true; do npm run populate_db:exitcrash; sleep 30; done' C-m \; \
    new-window \; \
    rename-window "form_backend" \; \
    send-keys 'cd form_backend' C-m \; \
    send-keys "$can_reach_npm && npm ci" C-m \; \
    split-window -h \; \
    send-keys 'cd form_backend' C-m \; \
    send-keys 'while true; do npm run start; sleep 30; done' C-m \; \
    split-window -v \; \
    send-keys 'cd form_backend' C-m \; \
    send-keys 'npm run mongod' C-m \; \
    select-window -t 0 \;
fi
