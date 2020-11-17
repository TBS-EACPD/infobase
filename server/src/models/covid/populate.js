import _, { thru } from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

export default async function ({ models }) {
  const { CovidMeasure, CovidInitiative, CovidEstimates } = models;

  const covid_measure_records = _.chain(
    get_standard_csv_file_rows("covid_measures.csv")
  )
    .map((row) => new CovidMeasure(row))
    .value();

  const covid_initative_estimates_rows = _.map(
    get_standard_csv_file_rows("covid_initative_estimates.csv"),
    (row) => ({
      ...row,
      covid_measure_ids: _.split(row.covid_measure_ids, ","),
    })
  );
  const covid_estimates_records = _.chain(covid_initative_estimates_rows)
    .groupBy("org_id")
    .flatMap((org_group, org_id) =>
      _.chain(org_group)
        .groupBy("fiscal_year")
        .flatMap((year_group, fiscal_year) =>
          _.chain(year_group)
            .groupBy("est_doc")
            .flatMap((doc_group, est_doc) =>
              _.reduce(
                doc_group,
                (roll_up, row) => ({
                  ...roll_up,
                  vote: roll_up.vote + +row.vote,
                  stat: roll_up.stat + +row.stat,
                }),
                { org_id, fiscal_year, est_doc, vote: 0, stat: 0 }
              )
            )
            .value()
        )
        .value()
    )
    .value();

  const covid_initiative_records = _.chain(
    get_standard_csv_file_rows("covid_initiatives.csv")
  )
    .map((row) => {
      const initiative_estimates_rows = _.filter(
        covid_initative_estimates_rows,
        ({ covid_initiative_id }) =>
          covid_initiative_id === row.covid_initiative_id
      );

      return new CovidInitiative({
        ...row,
        covid_initiative_estimates: initiative_estimates_rows,
      });
    })
    .value();

  return await Promise.all([
    CovidMeasure.insertMany(covid_measure_records),
    CovidInitiative.insertMany(covid_initiative_records),
    CovidEstimates.insertMany(covid_estimates_records),
  ]);
}
