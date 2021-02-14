import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

export default async function ({ models }) {
  const {
    HasCovidData,
    CovidMeasure,
    CovidOrgSummary,
    CovidGovSummary,
  } = models;

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
  const covid_funding_rows = _.map(
    get_standard_csv_file_rows("covid_funding.csv"),
    (row) => ({ ...row, funding: +row.funding })
  );

  const covid_measure_records = _.map(
    get_standard_csv_file_rows("covid_measures.csv"),
    (row) => {
      const filter_by_row_id = ({ covid_measure_id }) =>
        covid_measure_id === row.covid_measure_id;

      return new CovidMeasure({
        ...row,
        covid_estimates: _.filter(covid_estimates_rows, filter_by_row_id),
        covid_expenditures: _.filter(covid_expenditures_rows, filter_by_row_id),
        covid_commitments: _.filter(covid_commitments_rows, filter_by_row_id),
        covid_funding: _.filter(covid_funding_rows, filter_by_row_id),
      });
    }
  );

  const all_rows_with_org_data = [
    ...covid_estimates_rows,
    ...covid_expenditures_rows,
    ...covid_commitments_rows,
  ];
  const covid_org_summary_records = _.chain(all_rows_with_org_data)
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
        .flatMap((year_rows, fiscal_year) => ({
          fiscal_year,
          // note is_budgetary is excluded from the summary, bud and non-bud rolled up here
          ..._.reduce(
            year_rows,
            (memo, row) => ({
              vote: memo.vote + row.vote,
              stat: memo.stat + row.stat,
            }),
            { vote: 0, stat: 0 }
          ),
        }))
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
    .value();

  const covid_gov_summary_record = [
    {
      org_id: "gov",
      covid_estimates: _.chain(covid_org_summary_records)
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
      covid_expenditures: _.chain(covid_org_summary_records)
        .flatMap("covid_expenditures")
        .groupBy("fiscal_year")
        .flatMap((year_rows, fiscal_year) => ({
          fiscal_year,
          // note is_budgetary is excluded from the summary, bud and non-bud rolled up here
          ..._.reduce(
            year_rows,
            (memo, row) => ({
              vote: memo.vote + row.vote,
              stat: memo.stat + row.stat,
            }),
            { vote: 0, stat: 0 }
          ),
        }))
        .value(),
      covid_commitments: _.chain(covid_org_summary_records)
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
      covid_funding: _.chain(covid_funding_rows)
        .groupBy("fiscal_year")
        .map((year_rows, fiscal_year) => ({
          fiscal_year,
          funding: _.reduce(
            year_rows,
            (memo, { funding }) => memo + funding,
            0
          ),
        }))
        .value(),
      spending_sorted_org_ids: _.chain(covid_expenditures_rows)
        .groupBy("fiscal_year")
        .map((year_rows, fiscal_year) => ({
          fiscal_year,
          org_ids: _.chain(year_rows)
            .groupBy("org_id")
            .flatMap((org_rows, org_id) => ({
              org_id,
              total: _.reduce(
                org_rows,
                (memo, { vote, stat }) => memo + vote + stat,
                0
              ),
            }))
            .sortBy("total")
            .reverse()
            .map("org_id")
            .value(),
        }))
        .value(),
      spending_sorted_measure_ids: _.chain(covid_expenditures_rows)
        .groupBy("fiscal_year")
        .map((year_rows, fiscal_year) => ({
          fiscal_year,
          covid_measure_ids: _.chain(year_rows)
            .groupBy("covid_measure_id")
            .flatMap((measure_rows, covid_measure_id) => ({
              covid_measure_id,
              total: _.reduce(
                measure_rows,
                (memo, { vote, stat }) => memo + vote + stat,
                0
              ),
            }))
            .sortBy("total")
            .reverse()
            .map("covid_measure_id")
            .value(),
        }))
        .value(),
    },
  ];

  const has_covid_data_records = _.flatMap(
    ["org_id", "covid_measure_id"],
    (subject_id_key) =>
      _.chain(all_rows_with_org_data)
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
    CovidMeasure.insertMany(covid_measure_records),
    CovidOrgSummary.insertMany(covid_org_summary_records),
    CovidGovSummary.insertMany(covid_gov_summary_record),
    HasCovidData.insertMany(has_covid_data_records),
  ]);
}
