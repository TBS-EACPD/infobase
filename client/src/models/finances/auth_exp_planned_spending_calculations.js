import _ from "lodash";

import { isSpecialWarrants } from "src/models/estimates";
import { run_template } from "src/models/text";
import { year_templates, actual_to_planned_gap_year } from "src/models/years";

import {
  calculate_lapse,
  ESTIMATES_AUTH_FIELD_BY_TEMPLATE,
  flat_auth_exp_years,
  get_future_auth_year_templates,
  map_org_vote_stat_pa_row_to_table_row,
  PA_AUTH_FIELDS,
  PA_EXP_FIELDS,
  filter_org_vote_stat_pa_by_subject,
  sum_org_vote_stat_pa_fields,
} from "./auth_exp_utils";
import { sum_program_spending_col } from "./finance_utils";
import { filter_org_vote_stat_estimates_by_subject } from "./vote_stat_utils";

const { std_years, planning_years } = year_templates;

export function calculate_auth_exp_planned_spending_from_finance_data(
  subject,
  finance_data,
  { text_maker }
) {
  const query_subject =
    subject.subject_type === "gov" ? { subject_type: "gov" } : subject;
  const pa_rows = finance_data.org_vote_stat_pa;
  const gov_pa_rows = finance_data.gov_org_vote_stat_pa || pa_rows;
  const estimate_rows = finance_data.org_vote_stat_estimates;

  const exp_values = sum_org_vote_stat_pa_fields(
    pa_rows,
    query_subject,
    PA_EXP_FIELDS
  );

  const historical_auth_values = sum_org_vote_stat_pa_fields(
    pa_rows,
    query_subject,
    PA_AUTH_FIELDS
  );

  const future_auth_year_templates = get_future_auth_year_templates();
  let future_auth_values = _.map(future_auth_year_templates, (year_template) =>
    _.sumBy(
      filter_org_vote_stat_estimates_by_subject(estimate_rows, query_subject),
      (row) => row?.[ESTIMATES_AUTH_FIELD_BY_TEMPLATE[year_template]] || 0
    )
  );

  const is_special_warrants = isSpecialWarrants();
  if (is_special_warrants && future_auth_values.length > 0) {
    future_auth_values = future_auth_values.slice(0, -1);
  }

  const auth_values = _.concat(historical_auth_values, future_auth_values);

  const program_spending_rows = finance_data.program_spending;
  const planned_spending_values = _.map(planning_years, (yr) =>
    sum_program_spending_col(program_spending_rows, yr)
  );

  const data_series = _.chain([
    {
      key: "budgetary_expenditures",
      untrimmed_year_templates: std_years,
      untrimmed_values: exp_values,
    },
    {
      key: "authorities",
      untrimmed_year_templates: _.concat(std_years, future_auth_year_templates),
      untrimmed_values: auth_values,
    },
    subject.has_planned_spending && {
      key: "planned_spending",
      untrimmed_year_templates: planning_years,
      untrimmed_values: planned_spending_values,
      year_templates: planning_years,
      values: planned_spending_values,
    },
  ])
    .compact()
    .map((series) => {
      const { year_templates: trimmed_templates, values } = (() => {
        if (series.year_templates && series.values) {
          return series;
        }

        const [trimmed_year_templates, trimmed_values] = _.chain(
          series.untrimmed_year_templates
        )
          .zip(series.untrimmed_values)
          .dropWhile(([_year_template, value]) => !value)
          .unzip()
          .value();

        return {
          year_templates: trimmed_year_templates,
          values: trimmed_values,
        };
      })();

      return {
        ...series,
        year_templates: trimmed_templates,
        values,
        years: _.map(trimmed_templates, run_template),
        label: text_maker(series.key),
      };
    })
    .value();

  const last_shared_index = _.min([exp_values.length, auth_values.length]) - 1;

  const hist_unspent_avg_pct =
    _.reduce(
      exp_values,
      (result, value, i) => result + auth_values[i] - value,
      0
    ) /
    _.reduce(
      auth_values,
      (result, value, index) =>
        index <= last_shared_index ? result + value : result,
      0
    );

  const unspent_last_year =
    auth_values[last_shared_index] - exp_values[last_shared_index];

  const table_vote_rows = _.map(
    filter_org_vote_stat_pa_by_subject(pa_rows, query_subject),
    map_org_vote_stat_pa_row_to_table_row
  );
  const gov_table_vote_rows = _.map(
    gov_pa_rows,
    map_org_vote_stat_pa_row_to_table_row
  );

  const get_five_year_auth_average = (auth_or_exp) =>
    _.chain(std_years)
      .map((year) =>
        _.sumBy(table_vote_rows, (row) => row[`${year}${auth_or_exp}`] || 0)
      )
      .sum()
      .divide(std_years.length)
      .value();

  const gov_stat_filtered_votes = _.reject(
    gov_table_vote_rows,
    ({ votenum }) => votenum === "S"
  );
  const gov_aggregated_votes = _.chain(gov_stat_filtered_votes)
    .reduce(
      (result, vote_row) => ({
        ...result,
        [vote_row.votestattype]: {
          ...result[vote_row.votestattype],
          ..._.chain(flat_auth_exp_years)
            .map((yr) => [yr, result[vote_row.votestattype][yr] + vote_row[yr]])
            .fromPairs()
            .value(),
        },
      }),
      _.chain(gov_stat_filtered_votes)
        .map(({ votestattype }) => [
          votestattype,
          {
            desc: text_maker(`vstype${votestattype}`),
            ..._.chain(flat_auth_exp_years)
              .map((yr) => [yr, 0])
              .fromPairs()
              .value(),
          },
        ])
        .fromPairs()
        .value()
    )
    .map((aggregated_sum, votestattype) => ({
      votestattype: _.toInteger(votestattype),
      ...aggregated_sum,
    }))
    .value();

  const queried_votes =
    subject.subject_type === "gov"
      ? gov_aggregated_votes
      : _.reject(table_vote_rows, ({ votenum }) => votenum === "S");

  const gov_avg_lapsed_by_votes_pct = _.chain(gov_aggregated_votes)
    .reduce(
      (result, vote_row) => ({
        ..._.chain(flat_auth_exp_years)
          .map((yr) => [yr, result[yr] + vote_row[yr]])
          .fromPairs()
          .value(),
      }),
      _.chain(flat_auth_exp_years)
        .map((yr) => [yr, 0])
        .fromPairs()
        .value()
    )
    .thru((gov_aggregated_lapse_by_year) =>
      _.map(
        std_years,
        (yr) =>
          calculate_lapse(
            gov_aggregated_lapse_by_year[`${yr}auth`],
            gov_aggregated_lapse_by_year[`${yr}exp`],
            gov_aggregated_lapse_by_year[`${yr}unlapsed`]
          ) / gov_aggregated_lapse_by_year[`${yr}auth`]
      )
    )
    .mean()
    .value();

  const additional_info = {
    five_year_auth_average: get_five_year_auth_average("auth"),
    five_year_exp_average: get_five_year_auth_average("exp"),
    has_planned_spending: subject.has_planned_spending,
    last_planned_spending: _.last(planned_spending_values),
    last_planned_year: run_template(_.last(planning_years)),
    plan_change: _.last(planned_spending_values) - _.last(exp_values),
    last_history_year: run_template(_.last(std_years)),
    gap_year:
      (subject.has_planned_spending && actual_to_planned_gap_year) || null,
    hist_avg_tot_pct: hist_unspent_avg_pct,
    last_year_lapse_amt: unspent_last_year || 0,
    last_year_lapse_pct:
      (unspent_last_year || 0) / auth_values[last_shared_index],
    gov_avg_lapsed_by_votes_pct,
  };

  return {
    data_series,
    additional_info,
    queried_votes,
    is_special_warrants,
  };
}
