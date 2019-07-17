if [[ $CIRCLECI && $REDACT_LOGS && ($1 == "redact-start") ]] ; then
  stdout_file=$(mktemp -t stdout.XXXXXXXXXX)
  stderr_file=$(mktemp -t stderr.XXXXXXXXXX)

  # if the shell as errexit set, turn it off temporarily (but remember it did so it can be re-set later)
  # otherwise we'd be exiting without a chance to print anything, let alone something redacted
  if [[ $- =~ e ]]; then
    errexit_was_set=1
    set +e

    # also, if errors should have exited, remember if anyone occured while we'd turned errexit off
    an_error_occured=0
    trap "an_error_occured=1" ERR
  else
    errexit_was_set=0
  fi

  exec 8>&1 9>&2 # save stdout and stderr by assigning them to 8 9
  exec 1>$stdout_file 2>$stderr_file # redirect stdout and stderr to temp files
elif [[ $CIRCLECI && $REDACT_LOGS && ($1 == "redact-end") ]] ; then
  exec 1>&8 2>&9 # restore stdout and stderr

  function redact_env_vars_from_file(){
    file_to_redact=$1

    env_names_file=$(mktemp -t env_names.XXXXXXXXXX)
    env_vals_file=$(mktemp -t env_vals.XXXXXXXXXX)
    env_map_file=$(mktemp -t env_vals.XXXXXXXXXX)
    sorted_env_map_file=$(mktemp -t sorted_env_vals.XXXXXXXXXX)

    env | sed 's/=.*$//' > $env_names_file
    env | sed 's/^[^=]*=//' > $env_vals_file

    paste $env_vals_file $env_names_file > $env_map_file

    # sort the maping file by the length of the env var value, don't want to redact a sub-string of a longer env var by coincidence
    awk -F $'\t' '{print $0" "length($2)}' $env_map_file | sort -k5,5rn | sed -e 's/ [0-9]*$//' > $sorted_env_map_file
    
    env_map_length=$( cat $sorted_env_map_file | wc -l )

    redacted_file=$(mktemp -t redacted_file.XXXXXXXXXX)

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