import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

export default async function ({ models }) {
  const { CovidMeasure, CovidEstimatesSummary } = models;

  const covid_estimates_rows = get_standard_csv_file_rows(
    "covid_estimates.csv"
  );

  const covid_measure_records = _.map(
    get_standard_csv_file_rows("covid_measures.csv"),
    (row) =>
      new CovidMeasure({
        ...row,
        estimates: _.filter(
          covid_estimates_rows,
          ({ covid_measure_id }) => covid_measure_id === row.covid_measure_id
        ),
      })
  );

  const coivd_estimates_summary_records = _.chain(covid_estimates_rows)
    .groupBy("org_id")
    .map((org_rows, org_id) =>
      _.chain(org_rows)
        .groupBy("fiscal_year")
        .map((year_rows, fiscal_year) =>
          _.chain(year_rows)
            .groupBy("est_doc")
            .map((doc_rows, est_doc) => ({
              org_id,
              fiscal_year,
              est_doc,
              ..._.reduce(
                doc_rows,
                ({ memo_vote, memo_stat }, { row_vote, row_stat }) => ({
                  vote: memo_vote + row_vote,
                  stat: memo_stat + row_stat,
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
        .map((year_rows, fiscal_year) =>
          _.chain(year_rows)
            .groupBy("est_doc")
            .map((doc_rows, est_doc) => ({
              org_id: "gov",
              fiscal_year,
              est_doc,
              ..._.reduce(
                doc_rows,
                ({ memo_vote, memo_stat }, { row_vote, row_stat }) => ({
                  vote: memo_vote + row_vote,
                  stat: memo_stat + row_stat,
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
    CovidMeasure.insertMany(covid_measure_records),
    CovidEstimatesSummary.insertMany(coivd_estimates_summary_records),
  ]);
}
