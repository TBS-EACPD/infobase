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

  # notes:
  #  - setting some session level (-g) and panel level (-p) settings to get descriptive titles on panes created by this script, might mess with dev's personal settings
  #  - after splitting, the tmux command context is the _new_ pane, which is why there's not a bunch of manual pane selecting between setup steps
  #  - `C-m` appears at the end of `send-keys` lines because it's the readline code for hitting enter, to make bash execute the command in quotes 
  #  - `while true; ...; sleep 30; done` being used to keep commands retrying until their dependencies sort out, works as long as they exit with error codes
  #    - notable exception, `gqlgen:watch` will fail and stay failed if it can't find the server on its first try, hence the curl test preceding it
  tmux new-session -t "IB" \; \
    set -g pane-border-status top \; \
    set -g pane-border-format '#{?@manual_pane_title,#{@manual_pane_title} (#{pane_tty}),#{pane_tty}}' \; \
    rename-window "client" \; \
    set -p @manual_pane_title "Workspace" \; \
    send-keys "$can_reach_npm && npm ci" C-m \; \
    split-window -h \; \
    set -p @manual_pane_title "Webpack Build" \; \
    send-keys 'cd client' C-m \; \
    send-keys "$can_reach_npm && npm ci" C-m \; \
    send-keys "npm run webpack -- EN FR" C-m \; \
    split-window -v \; \
    set -p @manual_pane_title "Non-webpack build tasks" \; \
    send-keys 'cd client' C-m \; \
    send-keys 'while true; do npm run build_static:watch; sleep 10; done' C-m \; \
    split-window -v \; \
    set -p @manual_pane_title "GQL Types Codegen" \; \
    send-keys 'cd client' C-m \; \
    send-keys 'while true; do sleep 10; curl -f http://localhost:1337/.well-known/apollo/server-health || continue && break; done; while true; do npm run gqlgen:watch; sleep 10; done' C-m \; \
    split-window -h \; \
    set -p @manual_pane_title "HTTP server" \; \
    send-keys 'cd client' C-m \; \
    send-keys 'while true; do npm run serve; sleep 10; done' C-m \; \
    new-window \; \
    rename-window "server" \; \
    set -p @manual_pane_title "Workspace" \; \
    send-keys 'cd server' C-m \; \
    send-keys "$can_reach_npm && npm ci" C-m \; \
    split-window -h \; \
    set -p @manual_pane_title "GQL Server" \; \
    send-keys 'cd server' C-m \; \
    send-keys 'while true; do npm run start; sleep 10; done' C-m \; \
    split-window -v \; \
    set -p @manual_pane_title "GQL MongoDB" \; \
    send-keys 'cd server' C-m \; \
    send-keys 'npm run mongod' C-m \; \
    split-window -h \; \
    set -p @manual_pane_title "Populate GQL MongoDB" \; \
    send-keys 'cd server' C-m \; \
    send-keys 'while true; do npm run populate_db:exitcrash; sleep 10; done' C-m \; \
    new-window \; \
    rename-window "form_backend" \; \
    set -p @manual_pane_title "Workspace" \; \
    send-keys 'cd form_backend' C-m \; \
    send-keys "$can_reach_npm && npm ci" C-m \; \
    split-window -h \; \
    set -p @manual_pane_title "Form Backend Server" \; \
    send-keys 'cd form_backend' C-m \; \
    send-keys 'while true; do npm run start; sleep 10; done' C-m \; \
    split-window -v \; \
    set -p @manual_pane_title "Form Backend MongoDB" \; \
    send-keys 'cd form_backend' C-m \; \
    send-keys 'npm run mongod' C-m \; \
    select-window -t 0 \;
fi
