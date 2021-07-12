import _ from "lodash";

import { people_years } from "../constants.js";
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
export default async function ({ models }) {
  const { EmployeeAgeGroup } = models;

  const employee_age_rows = _.chain(
    get_standard_csv_file_rows("org_employee_age_group.csv")
  )
    .reject(["dept_code", "ZGOC"])
    .map((row) => ({
      ...row,
      2016: +row[2016],
      2017: +row[2017],
      2018: +row[2018],
      2019: +row[2019],
      2020: +row[2020],
      avg_share: +row.avg_share,
    }))
    .value();

  const employee_avg_age_rows = _.map(
    get_standard_csv_file_rows("org_employee_avg_age.csv"),
    (row) => ({
      dept_code: row.dept_code,
      2016: +row[2016],
      2017: +row[2017],
      2018: +row[2018],
      2019: +row[2019],
      2020: +row[2020],
    })
  );

  const employee_ex_lvl_rows = _.chain(
    get_standard_csv_file_rows("org_employee_ex_lvl.csv")
  )
    .reject(["dept_code", "ZGOC"])
    .map((row) => ({
      ...row,
      2016: +row[2016],
      2017: +row[2017],
      2018: +row[2018],
      2019: +row[2019],
      2020: +row[2020],
      avg_share: +row.avg_share,
    }))
    .value();

  const first_official_language_rows = _.chain(
    get_standard_csv_file_rows("org_employee_fol.csv")
  )
    .reject(["dept_code", "ZGOC"])
    .map((row) => ({
      ...row,
      2016: +row[2016],
      2017: +row[2017],
      2018: +row[2018],
      2019: +row[2019],
      2020: +row[2020],
      avg_share: +row.avg_share,
    }))
    .value();

  const employee_gender_rows = _.chain(
    get_standard_csv_file_rows("org_employee_gender.csv")
  )
    .reject(["dept_code", "ZGOC"])
    .map((row) => ({
      ...row,
      2016: +row[2016],
      2017: +row[2017],
      2018: +row[2018],
      2019: +row[2019],
      2020: +row[2020],
    }))
    .value();

  const employee_region_rows = _.chain(
    get_standard_csv_file_rows("org_employee_region.csv")
  )
    .reject(["dept_code", "ZGOC"])
    .map((row) => ({
      ...row,
      2016: +row[2016],
      2017: +row[2017],
      2018: +row[2018],
      2019: +row[2019],
      2020: +row[2020],
      avg_share: +row.avg_share,
    }))
    .value();

  const employee_type_rows = _.chain(
    get_standard_csv_file_rows("org_employee_type.csv")
  )
    .reject(["dept_code", "ZGOC"])
    .map((row) => ({
      ...row,
      2016: +row[2016],
      2017: +row[2017],
      2018: +row[2018],
      2019: +row[2019],
      2020: +row[2020],
      avg_share: +row.avg_share,
    }))
    .value();
}
// export default function ({ models }) {
//   const headcount_models_and_records = _.map(
//     headcount_csv_names_by_headcount_model_name,
//     (headcount_csv_name, headcount_model_name) => ({
//       model: models[headcount_model_name],
//       records: get_standard_csv_file_rows(`${headcount_csv_name}.csv`),
//     })
//   );

//   format_csv_records_then_register_to_headcount_models(
//     headcount_models_and_records
//   );
// }
