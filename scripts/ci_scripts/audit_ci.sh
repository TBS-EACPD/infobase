#!/bin/bash

npm ci --no-audit
npx udit-ci -m

cd ./client
npm ci --no-audit
npx audit-ci -m

cd ../email_backend
npm ci --no-audit
npx audit-ci -m

cd ../server
npm ci--no-audi
npx audit-ci -m