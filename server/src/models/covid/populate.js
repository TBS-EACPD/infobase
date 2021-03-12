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
  const covid_expenditures_rows = _.chain(
    get_standard_csv_file_rows("covid_expenditures.csv")
  )
    .map((row) => ({
      // covid_expenditures.csv contains the bud/non-bud split, but the client doesn't use it yet and supporting it creates lots of room for error,
      // so for now it's dropped and rolled up here
      ..._.omit(row, "is_budgetary"),
      vote: +row.vote,
      stat: +row.stat,
    }))
    .groupBy(({ org_id, fiscal_year, covid_measure_id }) =>
      _.join([org_id, fiscal_year, covid_measure_id], "__")
    )
    .map((rolled_up_rows) => ({
      ..._.first(rolled_up_rows),
      ..._.reduce(
        rolled_up_rows,
        (memo, row) => ({
          vote: memo.vote + row.vote,
          stat: memo.stat + row.stat,
        }),
        { vote: 0, stat: 0 }
      ),
    }))
    .map()
    .value();

  const covid_measure_records = _.map(
    get_standard_csv_file_rows("covid_measures.csv"),
    (row) => {
      const filter_by_row_id = ({ covid_measure_id }) =>
        covid_measure_id === row.covid_measure_id;

      return new CovidMeasure({
        ...row,
        covid_estimates: _.filter(covid_estimates_rows, filter_by_row_id),
        covid_expenditures: _.filter(covid_expenditures_rows, filter_by_row_id),
      });
    }
  );

  const all_rows_with_org_data = [
    ...covid_estimates_rows,
    ...covid_expenditures_rows,
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
      measure_counts: _.chain([
        ...covid_estimates_rows,
        ...covid_expenditures_rows,
      ])
        .map("fiscal_year")
        .uniq()
        .map((fiscal_year) => ({
          fiscal_year,
          with_authorities: _.chain(covid_estimates_rows)
            .filter({ fiscal_year })
            .map("covid_measure_id")
            .uniq()
            .size()
            .value(),
          with_spending: _.chain(covid_expenditures_rows)
            .filter({ fiscal_year })
            .map("covid_measure_id")
            .uniq()
            .size()
            .value(),
        }))
        .value(),
      org_counts: _.chain([...covid_estimates_rows, ...covid_expenditures_rows])
        .map("fiscal_year")
        .uniq()
        .map((fiscal_year) => ({
          fiscal_year,
          with_authorities: _.chain(covid_estimates_rows)
            .filter({ fiscal_year })
            .map("org_id")
            .uniq()
            .size()
            .value(),
          with_spending: _.chain(covid_expenditures_rows)
            .filter({ fiscal_year })
            .map("org_id")
            .uniq()
            .size()
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
