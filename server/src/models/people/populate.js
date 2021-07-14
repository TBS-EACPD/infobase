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
  const {
    EmployeeAgeGroup,
    EmployeeAvgAge,
    EmployeeExLvl,
    EmployeeFirstOfficialLang,
    EmployeeGender,
    EmployeeRegion,
    EmployeeType,
  } = models;

  let employee_age_rows,
    employee_avg_age_rows,
    employee_ex_lvl_rows,
    employee_fol_rows,
    employee_gender_rows,
    employee_region_rows,
    employee_type_rows;
  const process_employee_csv = (csv_name) =>
    _.chain(get_standard_csv_file_rows(csv_name))
      .reject(["dept_code", "ZGOC"])
      .map(({ dept_code, dimension, ...data_columns }) => ({
        dept_code,
        dimension,
        ..._.mapValues(data_columns, _.toNumber),
      }))
      .value();
  try {
    employee_age_rows = process_employee_csv("org_employee_age_group.csv");

    employee_avg_age_rows = _.chain(
      get_standard_csv_file_rows("org_employee_avg_age.csv")
    )
      .map(({ dept_code, dimension, ...data_columns }) => ({
        dept_code,
        ..._.mapValues(data_columns, _.toNumber),
      }))
      .value();

    employee_ex_lvl_rows = process_employee_csv("org_employee_ex_lvl.csv");

    employee_fol_rows = process_employee_csv("org_employee_fol.csv");

    employee_gender_rows = process_employee_csv("org_employee_gender.csv");

    employee_region_rows = process_employee_csv("org_emplyee_region.csv");

    employee_type_rows = process_employee_csv("org_employee_type.csv");
  } catch (err) {
    console.log(err);
  }

  return await Promise.all([
    EmployeeAgeGroup.insertMany(employee_age_rows),
    EmployeeAvgAge.insertMany(employee_avg_age_rows),
    EmployeeExLvl.insertMany(employee_ex_lvl_rows),
    EmployeeFirstOfficialLang.insertMany(employee_fol_rows),
    EmployeeGender.insertMany(employee_gender_rows),
    EmployeeRegion.insertMany(employee_region_rows),
    EmployeeType.insertMany(employee_type_rows),
  ]);
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
