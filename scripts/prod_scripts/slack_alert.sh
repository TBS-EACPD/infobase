#!/bin/bash
set -e

text_payload=$(echo '{"text":"'$1'"}')

curl -X POST -H 'Content-type: application/json' --data "$text_payload" $(lpass show UPDATE_DEPLOYED_BOT_SERVICE_LINK --notes)