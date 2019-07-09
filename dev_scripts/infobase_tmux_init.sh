#!/bin/bash

existing_IB_session=$(tmux list-sessions 2> /dev/null | grep -oh ^IB-[0-9] | head -1)

cd $HOME/*/InfoBase

if [[ -n $existing_IB_session ]]; then
 tmux attach-session -t "$existing_IB_session"
else

  # to avoid client webpack and base build race condition, make sure the build dir exists in advance
  [[ -d build ]] || mkdir build && mkdir build/InfoBase
  
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
    send-keys 'cd client && npm ci && npm run IB_q' C-m \; \
    split-window -v \; \
    send-keys 'cd client && while true; do npm run serve-loopback; sleep 30; done' C-m \; \
    split-window -v \; \
    send-keys 'cd server && npm ci && npm start' C-m \; \
    selectp -t 2 \; \
    split-window -h \; \
    send-keys 'cd client && while true; do npm run IB_base_watch; sleep 30; done' C-m \; \
    selectp -t 4 \; \
    split-window -v \; \
    send-keys 'cd server && mongod' C-m \; \
    split-window -h \; \
    send-keys 'cd server && while true; do npm run populate_db_exitcrash; sleep 30; done' C-m \;
fi
