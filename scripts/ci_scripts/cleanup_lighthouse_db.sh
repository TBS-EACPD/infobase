set -e
active_branches_with_remote=$(git for-each-ref --sort=-committerdate --format='%(refname:short)' refs/remotes/origin)
git_remote="origin/"
active_branches=${active_branches_with_remote//$git_remote/}
sql_cmd_branches_with_suffix=$(sed "s/[^ ]*/branch!='&' AND/g" <<< $active_branches)
sql_cmd_branch_conditional=${sql_cmd_branches_with_suffix:0:$((${#sql_cmd_branches_with_suffix}-3))}

DATABASE_URL=$(heroku config -s | cut -d \' -f2)
inactive_build_ids=$(psql $DATABASE_URL -t -c "SELECT id FROM public.builds WHERE $sql_cmd_branch_conditional")
if [ -z "$inactive_build_ids" ]; then
  echo "No inactive builds in heroku psql DB"
else
  sql_cmd_delete_runs_stats_with_suffix=$(sed "s/[^ ]*/\"buildId\"='&' OR/g" <<< $inactive_build_ids)
  sql_cmd_delete_runs_stats_conditional=${sql_cmd_delete_runs_stats_with_suffix:0:$((${#sql_cmd_delete_runs_stats_with_suffix}-2))}

  sql_cmd_delete_build_with_suffix=$(sed "s/[^ ]*/\"id\"='&' OR/g" <<< $inactive_build_ids)
  sql_cmd_delete_build_conditional=${sql_cmd_delete_build_with_suffix:0:$((${#sql_cmd_delete_build_with_suffix}-2))}

  echo $(psql $DATABASE_URL -t -c "DELETE FROM public.runs WHERE $sql_cmd_delete_runs_stats_conditional")
  echo $(psql $DATABASE_URL -t -c "DELETE FROM public.statistics WHERE $sql_cmd_delete_runs_stats_conditional")
  echo $(psql $DATABASE_URL -t -c "DELETE FROM public.builds WHERE $sql_cmd_delete_build_conditional")
fi