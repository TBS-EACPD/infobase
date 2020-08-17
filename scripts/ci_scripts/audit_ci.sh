#!/bin/bash

npm ci --no-audit
audit-ci -m

cd ./client
npm ci --no-audit
audit-ci -m

cd ../email_backend
npm ci --no-audit
audit-ci -m

cd ../server
npm ci--no-audi
audit-ci -m