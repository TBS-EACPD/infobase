import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

export default async function ({ models }) {
  const { CovidInitiative, CovidInitiativeEstimates } = models;

  const CovidInitiative_records = _.chain(
    get_standard_csv_file_rows("covid_initiatives.csv")
  )
    .map((obj) => new CovidInitiative(obj))
    .value();

  const CovidInitiativeEstimates_records = _.chain(
    get_standard_csv_file_rows("covid_initative_estimates.csv")
  )
    .map((obj) => new CovidInitiativeEstimates(obj))
    .value();

  return await Promise.all([
    CovidInitiative.insertMany(CovidInitiative_records),
    CovidInitiativeEstimates.insertMany(CovidInitiativeEstimates_records),
  ]);
}
