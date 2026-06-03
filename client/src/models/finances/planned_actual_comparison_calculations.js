import _ from "lodash";

import { get_footnotes_by_subject_and_topic } from "src/models/footnotes/footnotes";
import { get_late_actual_fte_orgs } from "src/models/results";

import { sum_field_across_rows } from "./finance_utils";

function is_eligible_subject(subject) {
  const late_actual_fte_orgs = get_late_actual_fte_orgs();

  if (subject.subject_type === "dept") {
    return subject.is_dp_org && !_.includes(late_actual_fte_orgs, subject.id);
  }

  return (
    subject.dept.is_dp_org && !_.includes(late_actual_fte_orgs, subject.dept.id)
  );
}

function count_crso_programs_with_last_year_activity(spending_rows, fte_rows) {
  const fte_by_program_id = _.keyBy(fte_rows, "program_id");
  const program_ids = _.uniq(
    _.compact([
      ..._.map(spending_rows, "program_id"),
      ..._.map(fte_rows, "program_id"),
    ])
  );

  return _.filter(program_ids, (program_id) => {
    const spend_row = _.find(spending_rows, { program_id }) || {};
    const fte_row = fte_by_program_id[program_id] || {};

    return (
      (spend_row.pa_last_year_exp || 0) !== 0 ||
      (fte_row.pa_last_year || 0) !== 0
    );
  }).length;
}

export function calculate_planned_actual_comparison_from_finance_data(
  subject,
  finance_data
) {
  if (!is_eligible_subject(subject)) {
    return false;
  }

  const spending_rows = finance_data.program_spending;
  const fte_rows = finance_data.program_fte;

  const planned_spend = sum_field_across_rows(
    spending_rows,
    "pa_last_year_planned"
  );
  const planned_ftes = sum_field_across_rows(fte_rows, "pa_last_year_planned");
  const actual_spend = sum_field_across_rows(spending_rows, "pa_last_year_exp");
  const actual_ftes = sum_field_across_rows(fte_rows, "pa_last_year");

  if (!_.some([actual_spend, actual_ftes, planned_ftes, planned_spend])) {
    return false;
  }

  const footnotes = get_footnotes_by_subject_and_topic(subject, [
    "DRR_EXP",
    "DRR_FTE",
  ]);

  const program_count_last_year =
    subject.subject_type === "crso"
      ? count_crso_programs_with_last_year_activity(spending_rows, fte_rows)
      : undefined;

  const text_calculations = {
    subject,
    planned_spend,
    planned_ftes,
    actual_spend,
    actual_ftes,
    program_count_last_year,
  };

  return {
    text_calculations,
    planned_ftes,
    planned_spend,
    actual_ftes,
    actual_spend,
    diff_spend: actual_spend - planned_spend,
    diff_ftes: actual_ftes - planned_ftes,
    footnotes,
  };
}
