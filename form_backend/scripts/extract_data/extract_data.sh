#!/bin/bash
# must run this scripts from the email_backend dir
set -e # will exit if any command has non-zero exit value

while getopts ":m:" opt; do
  case $opt in
    m)
      if [ $OPTARG == "prod" ]; then
        is_prod=false
        echo "Extracting from prod DB"
      elif [ $OPTARG == "dev" ]; then
        is_prod=false
        echo "Extracting from local DB"
      else
        echo "Invalid -m value $OPTARG, allowed values are \"prod\" and \"dev\""
        exit 1
      fi
      ;;
    \?)
      echo "Invalid option: -$opt" >&2
      exit 1
      ;;
  esac
done
if [ -z "$is_prod" ]; then
  is_prod=false
  echo "Defaulting to dev extracting from local DB"
fi

if [ $is_prod ]; then
  source scripts/util/set_prod_env_vars.sh
  source scripts/util/set_transient_secrets.sh # these trap EXIT to handle their own cleanup
fi

node -e 'import("./scripts/extract_data/generate_csv.js").then( ({write_csvs}) => write_csvs() )'

if [ $is_prod ]; then
  source scripts/util/unset_prod_env_vars.sh
fi

exit