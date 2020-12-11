import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

export default async function ({ models }) {
  const { HasCovidData, CovidMeasure, CovidSummary } = models;

  const covid_estimates_rows = _.map(
    get_standard_csv_file_rows("covid_estimates.csv"),
    (row) => ({ ...row, vote: +row.vote, stat: +row.stat })
  );
  const covid_expenditures_rows = _.map(
    get_standard_csv_file_rows("covid_expenditures.csv"),
    (row) => ({
      ...row,
      is_budgetary: !!+row.is_budgetary,
      vote: +row.vote,
      stat: +row.stat,
    })
  );
  const covid_commitments_rows = _.map(
    get_standard_csv_file_rows("covid_commitments.csv"),
    (row) => ({ ...row, commitment: +row.commitment })
  );

  const orgs_with_covid_data = _.chain([
    ...covid_estimates_rows,
    ...covid_expenditures_rows,
    ...covid_commitments_rows,
  ])
    .map("org_id")
    .uniq()
    .value();
  const has_covid_data_records = _.map(
    orgs_with_covid_data,
    (org_id) => new HasCovidData({ org_id })
  );

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

  const coivd_summary_records = _.chain(orgs_with_covid_data)
    .map((org_id) => ({
      org_id,
      covid_estimates: _.chain(covid_estimates_rows)
        .filter(({ org_id: row_org_id }) => row_org_id === org_id)
        .groupBy("fiscal_year")
        .flatMap((year_rows, fiscal_year) =>
          _.chain(year_rows)
            .groupBy("est_doc")
            .flatMap((doc_rows, est_doc) => ({
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
      covid_expenditures: _.chain(covid_expenditures_rows)
        .filter(({ org_id: row_org_id }) => row_org_id === org_id)
        .groupBy("fiscal_year")
        .flatMap((year_rows, fiscal_year) =>
          _.chain(year_rows)
            .groupBy("is_budgetary")
            .flatMap((doc_rows, is_budgetary) => ({
              fiscal_year,
              is_budgetary,
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
      covid_commitments: _.chain(covid_commitments_rows)
        .filter(({ org_id: row_org_id }) => row_org_id === org_id)
        .groupBy("fiscal_year")
        .map((year_rows, fiscal_year) => ({
          fiscal_year,
          commitment: _.reduce(
            year_rows,
            (memo, { commitment }) => memo + commitment,
            0
          ),
        }))
        .value(),
    }))
    .thru((org_summary_rows) => [
      ...org_summary_rows,
      {
        org_id: "gov",
        covid_estimates: _.chain(org_summary_rows)
          .flatMap("covid_estimates")
          .groupBy("fiscal_year")
          .flatMap((year_rows, fiscal_year) =>
            _.chain(year_rows)
              .groupBy("est_doc")
              .flatMap((doc_rows, est_doc) => ({
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
        covid_expenditures: _.chain(org_summary_rows)
          .flatMap("covid_expenditures")
          .groupBy("fiscal_year")
          .flatMap((year_rows, fiscal_year) =>
            _.chain(year_rows)
              .groupBy("is_budgetary")
              .flatMap((doc_rows, is_budgetary) => ({
                fiscal_year,
                is_budgetary,
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
        covid_commitments: _.chain(org_summary_rows)
          .flatMap("covid_commitments")
          .groupBy("fiscal_year")
          .map((year_rows, fiscal_year) => ({
            fiscal_year,
            commitment: _.reduce(
              year_rows,
              (memo, { commitment }) => memo + commitment,
              0
            ),
          }))
          .value(),
      },
    ])
    .value();

  return await Promise.all([
    HasCovidData.insertMany(has_covid_data_records),
    CovidMeasure.insertMany(covid_measure_records),
    CovidSummary.insertMany(coivd_summary_records),
  ]);
}
