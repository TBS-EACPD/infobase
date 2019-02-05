#!/bin/bash
IMAGE_URL="gcr.io/ib-api-first/ib-api:${CIRCLE_SHA1}"
docker build -t $IMAGE_URL .
gcloud docker -- push $IMAGE_URL
kubectl set image deployment/ib-api ib-api=$IMAGE_URL