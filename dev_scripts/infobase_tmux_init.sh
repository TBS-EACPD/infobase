#!/bin/bash

existing_IB_session=$(tmux list-sessions 2> /dev/null | grep -oh ^IB-[0-9] | head -1)

cd $HOME/*/InfoBase

if [[ -n $existing_IB_session ]]; then
 tmux attach-session -t "$existing_IB_session"
else
  tmux new-session -t "IB" \; \
    split-window -h \; \
    send-keys 'cd client && npm ci && npm run IB_base && npm run IB_q' C-m \; \
    split-window -v \; \
    send-keys 'cd client && npm run serve-loopback' C-m \; \
    split-window -v \; \
    send-keys 'cd server && npm ci && npm start' C-m \; \
    split-window -v \; \
    send-keys 'cd server && mongod' C-m \; \
    split-window -h \; \
    send-keys 'cd server && while true; do npm run populate_db; done' C-m \;
fi
