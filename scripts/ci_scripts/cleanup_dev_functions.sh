#!/bin/bash
set -e

echo "Starting dev functions cleanup..."

active_branches=$(git branch -r | sed -E 's/(.*\/)(.*)/\2/g')
current_functions=$(gcloud functions list --format="value(name)")
current_run_services=$(gcloud run services list --format="value(name)")

to_delete_functions=$(grep -Fxvf <(echo "$active_branches") <(echo "$current_functions") || echo "")
to_delete_services=$(grep -Fxvf <(echo "$active_branches" | sed 's/_/-/g') <(echo "$current_run_services") || echo "")

echo "start deleting functions"
while IFS= read -r branch_name; do
    echo $branch_name
    gcloud functions delete $branch_name --quiet --region=us-central1 --project=ib-serverless-api-dev
done <<< "$to_delete_functions"
echo "finish deleting functions"

echo "start deleting run services"
while IFS= read -r branch_name; do
    echo $branch_name
    gcloud run services delete $branch_name --quiet --region=us-central1 --project=ib-serverless-api-dev --namespace=961991692823
done <<< "$to_delete_services"
echo "finish deleting run services"