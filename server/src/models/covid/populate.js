import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

export default async function ({ models }) {
  const {
    YearsWithCovidData,
    CovidMeasure,
    CovidGovSummary,
    CovidOrgSummary,
  } = models;

  const covid_estimates_rows = _.map(
    get_standard_csv_file_rows("covid_estimates.csv"),
    (row) => ({
      ...row,
      vote: +row.vote,
      stat: +row.stat,
    })
  );
  const covid_expenditures_rows = _.chain(
    get_standard_csv_file_rows("covid_expenditures.csv")
  )
    .map((row) => ({
      // covid_expenditures.csv contains the bud/non-bud split, but the client doesn't use it yet and supporting it creates lots of room for error,
      // so for now it's dropped and rolled up here
      ..._.omit(row, ["is_budgetary", "calendar_month"]),
      month_last_updated: +row.calendar_month - 1,
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

  const covid_expenditures_month_last_updated_by_fiscal_year = _.chain(
    get_standard_csv_file_rows("covid_expenditures.csv")
  )
    .groupBy("fiscal_year")
    .mapValues((rows, fiscal_year) =>
      _.chain(rows)
        .map("calendar_month")
        .uniq()
        .thru((calendar_month) => {
          if (calendar_month.length > 1) {
            throw new Error(
              `covid_expenditures.csv contains more than one uniqe calendar_month (${calendar_month}) for ${fiscal_year}`
            );
          } else {
            return _.first(calendar_month) - 1;
          }
        })
        .value()
    )
    .value();

  const all_rows_with_org_data = [
    ...covid_estimates_rows,
    ...covid_expenditures_rows,
  ];
  const covid_years = _.chain(covid_estimates_rows)
    .map("fiscal_year")
    .uniq()
    .value();

  const covid_measure_records = _.map(
    get_standard_csv_file_rows("covid_measures.csv"),
    (row) => {
      const covid_data = _.map(covid_years, (fiscal_year) => ({
        fiscal_year,
        covid_estimates: _.filter(covid_estimates_rows, {
          covid_measure_id: row.covid_measure_id,
          fiscal_year,
        }),
        covid_expenditures: _.filter(covid_expenditures_rows, {
          covid_measure_id: row.covid_measure_id,
          fiscal_year,
        }),
      }));

      const related_org_ids = _.map(
        covid_data,
        ({ fiscal_year, covid_estimates, covid_expenditures }) => ({
          fiscal_year,
          org_ids: _.chain([...covid_estimates, ...covid_expenditures])
            .map("org_id")
            .uniq()
            .value(),
        })
      );

      return new CovidMeasure({
        ...row,
        related_org_ids,
        covid_data,
      });
    }
  );

  const covid_org_summary_records = _.chain(all_rows_with_org_data)
    .map("org_id")
    .uniq()
    .flatMap((org_id) =>
      _.map(covid_years, (fiscal_year) => ({
        org_id,
        fiscal_year,
        covid_estimates: _.chain(covid_estimates_rows)
          .filter({ org_id, fiscal_year })
          .groupBy("est_doc")
          .flatMap((doc_rows, est_doc) => ({
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
          .value(),
        covid_expenditures: _.chain(covid_expenditures_rows)
          .filter({ org_id, fiscal_year })
          .reduce(
            (memo, row) => ({
              vote: memo.vote + row.vote,
              stat: memo.stat + row.stat,
            }),
            { vote: 0, stat: 0 }
          )
          .assign({
            month_last_updated:
              covid_expenditures_month_last_updated_by_fiscal_year[fiscal_year],
          })
          .value(),
      }))
    )
    .value();

  const covid_gov_summary_record = _.map(covid_years, (fiscal_year) => ({
    org_id: "gov",
    fiscal_year,
    covid_estimates: _.chain(covid_org_summary_records)
      .filter({ fiscal_year })
      .flatMap("covid_estimates")
      .groupBy("est_doc")
      .flatMap((doc_rows, est_doc) => ({
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
      .value(),
    covid_expenditures: _.chain(covid_org_summary_records)
      .filter({ fiscal_year })
      .flatMap("covid_expenditures")
      .reduce(
        (memo, row) => ({
          vote: memo.vote + row.vote,
          stat: memo.stat + row.stat,
        }),
        { vote: 0, stat: 0 }
      )
      .assign({
        month_last_updated:
          covid_expenditures_month_last_updated_by_fiscal_year[fiscal_year],
      })
      .value(),
    spending_sorted_org_ids: _.chain(covid_expenditures_rows)
      .filter({ fiscal_year })
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
    spending_sorted_measure_ids: _.chain(covid_expenditures_rows)
      .filter({ fiscal_year })
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
    measure_counts: {
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
    },
    org_counts: {
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
    },
  }));

  const years_with_covid_data_records = _.flatMap(
    ["org_id", "covid_measure_id"],
    (subject_id_key) =>
      _.chain(all_rows_with_org_data)
        .map(subject_id_key)
        .uniq()
        .map(
          (subject_id) =>
            new YearsWithCovidData({
              subject_id,
              ..._.chain({
                estimates: covid_estimates_rows,
                expenditures: covid_expenditures_rows,
              })
                .map((rows, data_type) => [
                  `years_with_${data_type}`,
                  _.chain(rows)
                    .filter({ [subject_id_key]: subject_id })
                    .map("fiscal_year")
                    .uniq()
                    .sortBy()
                    .value(),
                ])
                .fromPairs()
                .value(),
            })
        )
        .value()
  );
  const gov_years_with_covid_data_record = new YearsWithCovidData({
    subject_id: "gov",
    years_with_estimates: _.chain(covid_estimates_rows)
      .map("fiscal_year")
      .uniq()
      .sortBy()
      .value(),
    years_with_expenditures: _.chain(covid_expenditures_rows)
      .map("fiscal_year")
      .uniq()
      .sortBy()
      .value(),
  });

  return await Promise.all([
    YearsWithCovidData.insertMany([
      ...years_with_covid_data_records,
      gov_years_with_covid_data_record,
    ]),
    CovidMeasure.insertMany(covid_measure_records),
    CovidGovSummary.insertMany(covid_gov_summary_record),
    CovidOrgSummary.insertMany(covid_org_summary_records),
  ]);
}
