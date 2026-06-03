import _ from "lodash";

import { year_templates } from "src/models/years";

const { std_years, planning_years } = year_templates;

export const PROGRAM_SPENDING_EXP_FIELDS = [
  "pa_last_year_5_exp",
  "pa_last_year_4_exp",
  "pa_last_year_3_exp",
  "pa_last_year_2_exp",
  "pa_last_year_exp",
];

export const PROGRAM_SPENDING_PLANNING_FIELDS = [
  "planning_year_1",
  "planning_year_2",
  "planning_year_3",
];

export const PROGRAM_FTE_HIST_FIELDS = [
  "pa_last_year_5",
  "pa_last_year_4",
  "pa_last_year_3",
  "pa_last_year_2",
  "pa_last_year",
];

export const ORG_VOTE_STAT_PA_EXP_FIELDS = PROGRAM_SPENDING_EXP_FIELDS;

export const sum_field_across_rows = (rows, field) =>
  _.sumBy(rows || [], (row) => row?.[field] || 0);

export const sum_fields_across_rows = (rows, fields) =>
  _.map(fields, (field) => sum_field_across_rows(rows, field));

const spending_exp_col_to_field = _.fromPairs(
  _.map(std_years, (yr, i) => [`${yr}exp`, PROGRAM_SPENDING_EXP_FIELDS[i]])
);

const spending_planning_col_to_field = _.fromPairs(
  _.map(planning_years, (yr, i) => [yr, PROGRAM_SPENDING_PLANNING_FIELDS[i]])
);

const fte_hist_col_to_field = _.fromPairs(
  _.map(std_years, (yr, i) => [yr, PROGRAM_FTE_HIST_FIELDS[i]])
);

export const sum_program_spending_col = (rows, col) =>
  sum_field_across_rows(
    rows,
    spending_exp_col_to_field[col] || spending_planning_col_to_field[col]
  );

export const sum_program_fte_col = (rows, col) =>
  sum_field_across_rows(
    rows,
    fte_hist_col_to_field[col] || spending_planning_col_to_field[col]
  );

export const sum_org_vote_stat_pa_exp_cols = (rows) =>
  sum_fields_across_rows(rows, ORG_VOTE_STAT_PA_EXP_FIELDS);

export const sum_org_vote_stat_estimates_in_year = (rows) =>
  sum_field_across_rows(rows, "est_in_year");

export const compact_finance_rows = (rows) => _.compact(rows || []);
