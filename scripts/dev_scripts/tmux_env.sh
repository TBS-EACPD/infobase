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

  # steps:
  #  - split, with working window to the left, area for watch scripts on the right
  #  - start installing client packages in window that will run client webpack
  #  - open window for client server. Keep trying (with delay) to run until serve works, as installation above may not have finished yet
  #  - split window vertically to make window for local API server, start installing API server packages
  #  - move back to client server window, need to open windows in jumbled order to get desired layout
  #  - open window for client base build to the right of the client server window, keep trying to start as client packages may still be installing
  #  - move back to API server window
  #  - open window for mongod
  #  - to the right of mongod, open window for API populate_db process, keep trying to start it as the API packages may still be installing
  tmux new-session -t "IB" \; \
    split-window -h \; \
    send-keys "cd client && $can_reach_npm && npm ci" C-m \; \
    send-keys "npm run IB_q_both" C-m \; \
    split-window -v \; \
    send-keys 'cd client' C-m \; \
    send-keys 'while true; do npm run serve-loopback; sleep 30; done' C-m \; \
    split-window -v \; \
    send-keys "cd server && $can_reach_npm && npm ci" C-m \; \
    send-keys "npm start" C-m \; \
    selectp -t 2 \; \
    split-window -h \; \
    send-keys 'cd client' C-m \; \
    send-keys 'while true; do npm run IB_base_watch; sleep 30; done' C-m \; \
    selectp -t 4 \; \
    split-window -v \; \
    send-keys 'cd server' C-m \; \
    send-keys 'npm run mongod' C-m \; \
    split-window -h \; \
    send-keys 'cd server' C-m \; \
    send-keys 'while true; do npm run populate_db:exitcrash; sleep 30; done' C-m \; \
    selectp -t 0 \; \
    send-keys "$can_reach_npm && npm ci" C-m \;
fi
