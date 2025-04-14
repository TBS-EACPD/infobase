#!/bin/bash
set -e

echo "Starting dev functions cleanup..."

active_branches=$(git branch -r | sed -E 's/(.*\/)(.*)/\2/g')

current_functions=$(gcloud functions list --format="value(name)")
to_delete_functions=$(grep -Fxvf <(echo "$active_branches") <(echo "$current_functions") || echo "")

if [[ ! -z "$to_delete_functions" ]]; then
    echo "start deleting functions"
    while IFS= read -r branch_name; do
        echo $branch_name
        gcloud functions delete $branch_name --quiet --region=us-central1 --project=$DEV_API_PROJECT_ID
    done <<< "$to_delete_functions"
    echo "finish deleting functions"
else
    echo "no functions to delete"
fi

current_run_services=$(gcloud run services list --format="value(name)")
to_delete_services=$(grep -Fxvf <(echo "$active_branches" | sed 's/_/-/g') <(echo "$current_run_services") || echo "")

if [[ ! -z "$to_delete_services" ]]; then
    echo "start deleting run services"
    while IFS= read -r branch_name; do
        echo $branch_name
        gcloud run services delete $branch_name --quiet --region=us-central1 --project=ib-serverless-api-dev --async
    done <<< "$to_delete_services"
    echo "finish deleting run services"
else
    echo "no run services to delete"
fi