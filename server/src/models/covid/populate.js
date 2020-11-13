import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

export default async function ({ models }) {
  const { CovidMeasure, CovidInitiative, CovidInitiativeEstimates } = models;

  const CovidMeasure_records = _.chain(
    get_standard_csv_file_rows("covid_measures.csv")
  )
    .map((row) => new CovidMeasure(row))
    .value();

  const CovidInitiative_records = _.chain(
    get_standard_csv_file_rows("covid_initiatives.csv")
  )
    .map((row) => {
      const cleaned_row = {
        ...row,
        covid_measure_ids: _.split(row.covid_measure_ids, ","),
      };

      return new CovidInitiative(cleaned_row);
    })
    .value();

  const CovidInitiativeEstimates_records = _.chain(
    get_standard_csv_file_rows("covid_initative_estimates.csv")
  )
    .map((row) => new CovidInitiativeEstimates(row))
    .value();

  return await Promise.all([
    CovidMeasure.insertMany(CovidMeasure_records),
    CovidInitiative.insertMany(CovidInitiative_records),
    CovidInitiativeEstimates.insertMany(CovidInitiativeEstimates_records),
  ]);
}
