import _ from "lodash";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { sum_field_for_program_ids } from "./finance_utils";

const planning_year_1_field = "planning_year_1";

export function calculate_spending_in_tag_perspective_from_finance_data(
  subject,
  finance_data
) {
  if (is_a11y_mode || subject.is_dead) {
    return false;
  }

  const prog_row = _.first(finance_data.program_spending);
  const prog_exp = prog_row?.[planning_year_1_field];

  if (!prog_exp || prog_exp <= 0) {
    return false;
  }

  const tag_exps = _.map(subject.tags, (tag) => ({
    tag,
    amount: sum_field_for_program_ids(
      finance_data.gov_program_spending,
      _.map(tag.programs, (program) => program.id),
      planning_year_1_field
    ),
  }));

  return { tag_exps, prog_exp };
}
