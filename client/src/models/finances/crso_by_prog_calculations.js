import _ from "lodash";

import { year_templates, actual_to_planned_gap_year } from "src/models/years";

import {
  program_fte_rows_to_table_rows,
  program_spending_rows_to_table_rows,
} from "./program_finance_utils";
const { planning_years, std_years } = year_templates;

const get_valid_years_for_data = (data, years) =>
  _.chain(data)
    .reduce(
      (sum_by_year, row) => {
        _.each(years, (year) => {
          sum_by_year[year] = sum_by_year[year] + row[year];
        });
        return sum_by_year;
      },
      _.chain(years)
        .map((year) => [year, 0])
        .fromPairs()
        .value()
    )
    .pickBy((sum_by_year) => sum_by_year !== 0)
    .keys()
    .value();

export function calculate_crso_by_prog_from_finance_data(
  subject,
  finance_data,
  is_fte
) {
  if (subject.is_dead) {
    return false;
  }

  const queried_exp = program_spending_rows_to_table_rows(
    finance_data.program_spending
  );
  const queried_fte = program_fte_rows_to_table_rows(finance_data.program_fte);

  const exp_historical_years = get_valid_years_for_data(
    queried_exp,
    _.map(std_years, (year) => `${year}exp`)
  );
  const exp_planning_years = get_valid_years_for_data(
    queried_exp,
    planning_years
  );
  const fte_historical_years = get_valid_years_for_data(queried_fte, std_years);
  const fte_planning_years = get_valid_years_for_data(
    queried_fte,
    planning_years
  );

  const exp_gap_year_exists =
    subject.has_planned_spending &&
    _.includes(exp_historical_years, "{{pa_last_year}}exp") &&
    _.includes(exp_planning_years, "{{planning_year_1}}");
  const fte_gap_year_exists =
    subject.has_planned_spending &&
    _.includes(fte_historical_years, "{{pa_last_year}}") &&
    _.includes(fte_planning_years, "{{planning_year_1}}");

  const exp_gap_year =
    (exp_gap_year_exists && actual_to_planned_gap_year) || null;
  const fte_gap_year =
    (fte_gap_year_exists && actual_to_planned_gap_year) || null;

  const exp_years_with_gap_year = _.chain(exp_historical_years)
    .concat([exp_gap_year], planning_years)
    .compact()
    .value();
  const fte_years_with_gap_year = _.chain(fte_historical_years)
    .concat([fte_gap_year], planning_years)
    .compact()
    .value();

  const total_exp = _.sumBy(exp_years_with_gap_year, (col) =>
    _.sumBy(queried_exp, (row) => row[col] || 0)
  );
  const total_fte = _.sumBy(fte_years_with_gap_year, (col) =>
    _.sumBy(queried_fte, (row) => row[col] || 0)
  );

  const should_bail = is_fte ? total_fte === 0 : total_exp === 0;
  if (should_bail) {
    return false;
  }

  const exp_data = _.map(queried_exp, (row) => ({
    label: row.prgm,
    data: exp_years_with_gap_year.map((col) =>
      _.isUndefined(row[col]) ? null : row[col]
    ),
  }));
  const fte_data = _.map(queried_fte, (row) => ({
    label: row.prgm,
    data: fte_years_with_gap_year.map((col) =>
      _.isUndefined(row[col]) ? null : row[col]
    ),
  }));

  const relevant_data = is_fte ? queried_fte : queried_exp;
  const valid_most_recent_year = is_fte
    ? _.last(fte_historical_years)
    : _.last(exp_historical_years);

  const most_recent_top_2_programs = _.chain(relevant_data)
    .flatMap((program_data) => ({
      prgm: program_data.prgm,
      value: program_data[valid_most_recent_year],
    }))
    .sortBy("value")
    .takeRight(2)
    .reverse()
    .value();
  const first_planning_year_top_2_programs = _.chain(relevant_data)
    .flatMap((program_data) => ({
      prgm: program_data.prgm,
      value: program_data["{{planning_year_1}}"],
    }))
    .sortBy("value")
    .takeRight(2)
    .reverse()
    .value();

  return {
    fte_data,
    exp_data,
    exp_years: _.map(exp_years_with_gap_year, (year) =>
      _.replace(year, "exp", "")
    ),
    fte_years: fte_years_with_gap_year,
    exp_gap_year,
    fte_gap_year,
    most_recent_number_of_programs: _.filter(
      relevant_data,
      valid_most_recent_year
    ).length,
    first_planning_year_number_of_programs: _.filter(
      relevant_data,
      "{{planning_year_1}}"
    ).length,
    ..._.chain(most_recent_top_2_programs)
      .flatMap(({ prgm, value }, ix) => [
        [`most_recent_top_${ix + 1}_name`, prgm],
        [`most_recent_top_${ix + 1}_value`, value],
      ])
      .fromPairs()
      .value(),
    ..._.chain(first_planning_year_top_2_programs)
      .flatMap(({ prgm, value }, ix) => [
        [`first_planning_year_top_${ix + 1}_name`, prgm],
        [`first_planning_year_top_${ix + 1}_value`, value],
      ])
      .fromPairs()
      .value(),
  };
}
