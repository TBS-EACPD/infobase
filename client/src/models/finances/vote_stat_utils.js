import _ from "lodash";

import { estimates_docs } from "src/models/estimates";
import { run_template } from "src/models/text";

import { lang } from "src/core/injected_build_constants";

import { sum_field_across_rows } from "./finance_utils";

export const est_in_year_col = run_template("{{est_in_year}}_estimates");

const STAT_VS_TYPE = 999;

// Table CSV stores statutory rows with vote_num "S" and vs_type 0; the client
// table mapper normalizes those to vs_type 999. Match both representations.
export const is_stat_estimate_row = (row) => {
  if (row?.vs_type === STAT_VS_TYPE) {
    return true;
  }
  const vote_num = row?.vote_num;
  return vote_num != null && Number.isNaN(Number(vote_num));
};

export const filter_org_vote_stat_estimates_by_subject = (rows, subject) => {
  switch (subject?.subject_type) {
    case "gov":
      return rows || [];
    case "dept":
      return _.filter(
        rows || [],
        (row) => row.dept_code == (subject.dept_code ?? subject.id)
      );
    default:
      return [];
  }
};

export const get_est_doc_label = (row) =>
  estimates_docs[row?.doc]?.[lang] ?? row?.doc;

export const get_org_vote_stat_estimate_desc = (row) => {
  if (is_stat_estimate_row(row)) {
    return row.name;
  }
  return `${row.name} - ${row.vote_num}`;
};

export const sum_est_in_year_for_subject = (rows, subject) =>
  sum_field_across_rows(
    filter_org_vote_stat_estimates_by_subject(rows, subject),
    "est_in_year"
  );

export const sum_est_in_year_by_vote_vs_stat = (rows, subject, { stat, voted }) => {
  const filtered = filter_org_vote_stat_estimates_by_subject(rows, subject);
  return {
    [stat]: _.sumBy(_.filter(filtered, is_stat_estimate_row), (row) =>
      row?.est_in_year ? row.est_in_year : 0
    ),
    [voted]: _.sumBy(
      _.filter(filtered, (row) => row && !is_stat_estimate_row(row)),
      (row) => (row?.est_in_year ? row.est_in_year : 0)
    ),
  };
};
