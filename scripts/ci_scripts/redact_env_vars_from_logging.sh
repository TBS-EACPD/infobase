if [[ $CIRCLECI && $REDACT_LOGS && ($1 == "redact-start") ]] ; then
  stdout_file=$(mktemp -t stdout.XXXXXXXXXX)
  stderr_file=$(mktemp -t stderr.XXXXXXXXXX)

  # if the shell as errexit set, turn it off temporarily (but remember it did so it can be re-set later)
  # otherwise we'd be exiting without a chance to print anything
  if [[ $- =~ e ]]; then
    errexit_was_set=1
    set +e

    # also, if errors should have exited, remember if any occured while we'd turned errexit off
    an_error_occured=0
    trap "an_error_occured=1" ERR
  else
    errexit_was_set=0
  fi

  exec 8>&1 9>&2 # save stdout and stderr by assigning them to streams 8 and 9
  exec 1>$stdout_file 2>$stderr_file # redirect stdout and stderr to temp files
elif [[ $CIRCLECI && $REDACT_LOGS && ($1 == "redact-end") ]] ; then
  exec 1>&8 2>&9 # restore stdout and stderr

  function redact_env_vars_from_file(){
    file_to_redact=$1

    filtered_env_file=$(mktemp -t env.XXXXXXXXXX)
    env_names_file=$(mktemp -t env_names.XXXXXXXXXX)
    env_vals_file=$(mktemp -t env_vals.XXXXXXXXXX)
    env_map_file=$(mktemp -t env_vals.XXXXXXXXXX)
    sorted_env_map_file=$(mktemp -t sorted_env_vals.XXXXXXXXXX)

    # bunch of small, generic (eg. short numbers) CI env vars we don't want to over-redact for. Filter them out
    env_whitelist_pattern="(CI|CIRCLECI|CIRCLE_BRANCH|CIRCLE_BUILD_NUM|CIRCLE_BUILD_URL|CIRCLE_COMPARE_URL|CIRCLE_JOB|CIRCLE_NODE_INDEX|CIRCLE_NODE_TOTAL|CIRCLE_PREVIOUS_BUILD_NUM|CIRCLE_PROJECT_REPONAME|CIRCLE_PROJECT_USERNAME|CIRCLE_REPOSITORY_URL|CIRCLE_SHA1|CIRCLE_SHELL_ENV|CIRCLE_STAGE|CIRCLE_USERNAME|CIRCLE_WORKFLOW_ID|CIRCLE_WORKFLOW_JOB_ID|CIRCLE_WORKFLOW_UPSTREAM_JOB_IDS|CIRCLE_WORKFLOW_WORKSPACE_ID|CIRCLE_WORKING_DIRECTORY|SHLVL|REDACT_LOGS|SHOULD_USE_REMOTE_DB|IS_DEV_LINK)"
    env | grep -Ev "^$env_whitelist_pattern=" > $filtered_env_file

    cat $filtered_env_file | sed 's/=.*$//' > $env_names_file
    cat $filtered_env_file | sed 's/^[^=]*=//' > $env_vals_file

    paste $env_vals_file $env_names_file > $env_map_file

    # sort the maping file by the length of the env var values, don't want to only redact a sub-string of a longer env var by coincidence
    awk -F $'\t' '{print $0"\t"length($1)}' $env_map_file | sort -k3rn | sed -E 's/\t[0-9]*$//' > $sorted_env_map_file
    
    env_map_length=$( cat $sorted_env_map_file | wc -l )

    redacted_file=$(mktemp -t redacted_file.XXXXXXXXXX)

    # do the redacting using the env map file
    awk -v map_length="${env_map_length}" -F $'\t' '
      BEGIN {
        redacted_target_file = ""
      }

      NR <= map_length {
        pattern_map[NR] = $1
        replace_map[NR] = "**$"$2"**"
      }

      NR > map_length {
        for (i = 1; i <= map_length; i++){
          gsub(pattern_map[i], replace_map[i], $0) 
        }
        redacted_target_file = redacted_target_file"\n"$0
      }
     
      END {
        print redacted_target_file
      }
    ' $sorted_env_map_file $file_to_redact > $redacted_file

    echo $redacted_file
  }

  cat $(redact_env_vars_from_file $stdout_file) >&1
  cat $(redact_env_vars_from_file $stderr_file) >&2

  if [[ $errexit_was_set == 1 ]]; then
    set -e

    if [[ $an_error_occured == 1 ]]; then
      exit 1
    fi
  fi
fi