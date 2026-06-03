import _ from "lodash";

import { compact_finance_rows } from "./finance_utils";

export function calculate_program_vote_stat_split_from_finance_data(
  finance_data,
  { voted_label, stat_label }
) {
  const rows = compact_finance_rows(finance_data.program_vote_stat);

  const vote_stat = _.map(rows, (row) => ({
    label: row.vs_type === "V" ? voted_label : stat_label,
    value: row.pa_last_year || 0,
  }));

  if (
    _.every(vote_stat, ({ value }) => value === 0) ||
    (_.minBy(vote_stat, "value").value < 0 &&
      _.maxBy(vote_stat, "value").value >= 0)
  ) {
    return false;
  }

  const voted_rows = _.filter(rows, (row) => row.vs_type === "V");
  const stat_rows = _.filter(rows, (row) => row.vs_type === "S");

  const voted_exp = _.sumBy(voted_rows, (row) => row.pa_last_year || 0);
  const stat_exp = _.sumBy(stat_rows, (row) => row.pa_last_year || 0);
  const total_exp = voted_exp + stat_exp;

  return {
    vote_stat,
    text_calculations: {
      total_exp,
      stat_pct: stat_exp / total_exp,
      voted_pct: voted_exp / total_exp,
      stat_exp,
      voted_exp,
    },
  };
}
