import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

export default async function ({ models }) {
  const { CovidMeasure, CovidInitiative } = models;

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
        estimates: initiative_estimates_rows,
      });
    })
    .value();

  return await Promise.all([
    CovidMeasure.insertMany(covid_measure_records),
    CovidInitiative.insertMany(covid_initiative_records),
  ]);
}
