import _ from "lodash";
import { check } from "prettier";

import { get_standard_csv_file_rows } from "../load_utils.js";

export default async function ({ models }) {
  const { HasCovidData, CovidMeasure, CovidEstimatesSummary } = models;

  const covid_estimates_rows = _.map(
    get_standard_csv_file_rows("covid_estimates.csv"),
    (row) => ({ ...row, vote: +row.vote, stat: +row.stat })
  );
  const covid_expenditures_rows = _.map(
    get_standard_csv_file_rows("covid_expenditures.csv"),
    (row) => ({
      ...row,
      is_budgetary: !!row.is_budgetary,
      vote: +row.vote,
      stat: +row.stat,
    })
  );
  const covid_commitments_rows = _.map(
    get_standard_csv_file_rows("covid_commitments.csv"),
    (row) => ({ ...row, commitment: +row.commitment })
  );

  const has_covid_data_records = _.chain([
    ...covid_estimates_rows,
    ...covid_expenditures_rows,
    ...covid_commitments_rows,
  ])
    .map("org_id")
    .uniq()
    .map((org_id) => new HasCovidData({ org_id }))
    .value();

  const covid_measure_records = _.map(
    get_standard_csv_file_rows("covid_measures.csv"),
    (row) =>
      new CovidMeasure({
        ...row,
        covid_estimates: _.filter(
          covid_estimates_rows,
          ({ covid_measure_id }) => covid_measure_id === row.covid_measure_id
        ),
        covid_expenditures: _.filter(
          covid_expenditures_rows,
          ({ covid_measure_id }) => covid_measure_id === row.covid_measure_id
        ),
        covid_commitments: _.filter(
          covid_commitments_rows,
          ({ covid_measure_id }) => covid_measure_id === row.covid_measure_id
        ),
      })
  );

  const coivd_estimates_summary_records = _.chain(covid_estimates_rows)
    .groupBy("org_id")
    .flatMap((org_rows, org_id) =>
      _.chain(org_rows)
        .groupBy("fiscal_year")
        .flatMap((year_rows, fiscal_year) =>
          _.chain(year_rows)
            .groupBy("est_doc")
            .flatMap((doc_rows, est_doc) => ({
              org_id,
              fiscal_year,
              est_doc,
              ..._.reduce(
                doc_rows,
                (memo, row) => ({
                  vote: memo.vote + row.vote,
                  stat: memo.stat + row.stat,
                }),
                { vote: 0, stat: 0 }
              ),
            }))
            .value()
        )
        .value()
    )
    .thru((org_summary_rows) => [
      ...org_summary_rows,
      ..._.chain(org_summary_rows)
        .groupBy("fiscal_year")
        .flatMap((year_rows, fiscal_year) =>
          _.chain(year_rows)
            .groupBy("est_doc")
            .flatMap((doc_rows, est_doc) => ({
              org_id: "gov",
              fiscal_year,
              est_doc,
              ..._.reduce(
                doc_rows,
                (memo, row) => ({
                  vote: memo.vote + row.vote,
                  stat: memo.stat + row.stat,
                }),
                { vote: 0, stat: 0 }
              ),
            }))
            .value()
        )
        .value(),
    ])
    .map((row) => new CovidEstimatesSummary(row))
    .value();

  return await Promise.all([
    HasCovidData.insertMany(has_covid_data_records),
    CovidMeasure.insertMany(covid_measure_records),
    CovidEstimatesSummary.insertMany(coivd_estimates_summary_records),
  ]);
}
