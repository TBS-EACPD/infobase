import _ from "lodash";

import { ProgramTag } from "src/models/subjects";

import { year_templates } from "src/models/years";

import {
  filter_rows_by_program_ids,
  sum_program_fte_col,
} from "./finance_utils";

const { std_years } = year_templates;
const last_year_fte_col = "{{pa_last_year}}";

export function calculate_internal_services_from_finance_data(
  subject,
  finance_data,
  { isc_label, non_isc_label }
) {
  const isc_crsos = _.filter(subject.crsos, "is_internal_service");
  const isc_program_ids = _.flatMap(isc_crsos, (crso) =>
    _.map(crso.programs, (program) => program.id)
  );
  const isc_tag = ProgramTag.store.lookup("GOC017");
  const tag_program_ids = _.map(isc_tag.programs, (program) => program.id);

  const dept_fte_rows = finance_data.org_program_fte;
  const gov_fte_rows = finance_data.gov_program_fte;

  const gov_fte_total = sum_program_fte_col(gov_fte_rows, last_year_fte_col);
  const gov_isc_fte = sum_program_fte_col(
    filter_rows_by_program_ids(gov_fte_rows, tag_program_ids),
    last_year_fte_col
  );

  const series = _.map(std_years, (yr) => {
    const isc_amt = sum_program_fte_col(
      filter_rows_by_program_ids(dept_fte_rows, isc_program_ids),
      yr
    );
    const dept_total = sum_program_fte_col(dept_fte_rows, yr);

    return {
      [isc_label]: isc_amt,
      [non_isc_label]: dept_total - isc_amt,
    };
  });

  const total_fte = sum_program_fte_col(dept_fte_rows, last_year_fte_col);
  if (total_fte === 0) {
    return false;
  }

  const isc_fte = _.last(series)[isc_label];

  return {
    gov_fte_total,
    gov_isc_fte,
    total_fte,
    isc_fte,
    series,
  };
}
