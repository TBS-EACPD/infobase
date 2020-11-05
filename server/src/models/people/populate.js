import _ from "lodash";

import { people_years } from "../constants";
import { get_standard_csv_file_rows } from "../load_utils.js";

import {
  camel_case_headcount_model_names,
  snake_case_headcount_model_names,
} from "./headcount_model_utils.js";

const headcount_csv_names_by_headcount_model_name = _.chain(
  camel_case_headcount_model_names
)
  .zip(snake_case_headcount_model_names)
  .fromPairs()
  .value();

const format_csv_records_then_register_to_headcount_models = (
  headcount_models_and_records
) => {
  _.each(headcount_models_and_records, (model_and_record) => {
    _.each(model_and_record.records, (record) =>
      _.each(
        people_years,
        (col) => (record[col] = record[col] && parseFloat(record[col]))
      )
    );
    _.each(model_and_record.records, (record) =>
      model_and_record.model.register(record)
    );
  });
};

export default function ({ models }) {
  const headcount_models_and_records = _.map(
    headcount_csv_names_by_headcount_model_name,
    (headcount_csv_name, headcount_model_name) => ({
      model: models[headcount_model_name],
      records: get_standard_csv_file_rows(`${headcount_csv_name}.csv`),
    })
  );

  format_csv_records_then_register_to_headcount_models(
    headcount_models_and_records
  );
}
