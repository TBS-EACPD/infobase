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

  const all_rows = [
    ...covid_estimates_rows,
    ...covid_expenditures_rows,
    ...covid_commitments_rows,
  ];

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

  const coivd_summary_records = _.chain(all_rows)
    .map("org_id")
    .uniq()
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

  const has_covid_data_records = _.flatMap(
    ["org_id", "covid_measure_id"],
    (subject_id_key) =>
      _.chain(all_rows)
        .map(subject_id_key)
        .uniq()
        .map((subject_id) => {
          const has_data_type = _.chain({
            estimates: covid_estimates_rows,
            expenditures: covid_expenditures_rows,
            commitments: covid_commitments_rows,
          })
            .map((rows, data_type) => [
              `has_${data_type}`,
              _.some(rows, (row) => row[subject_id_key] === subject_id),
            ])
            .fromPairs()
            .value();

          return new HasCovidData({ subject_id, ...has_data_type });
        })
        .value()
  );

  return await Promise.all([
    HasCovidData.insertMany(has_covid_data_records),
    CovidMeasure.insertMany(covid_measure_records),
    CovidSummary.insertMany(coivd_summary_records),
  ]);
}
