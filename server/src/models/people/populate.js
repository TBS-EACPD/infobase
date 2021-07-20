import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

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
      .groupBy("dept_code")
      .map((dept_rows, dept_code) => ({
        dept_code,
        data: _.chain(dept_rows)
          .map(({ dept_code, dimension, avg_share, ...data_columns }) => ({
            dimension,
            by_year: Object.keys(data_columns).map((key) => ({
              year: key,
              value: data_columns[key],
            })),
            avg_share,
          }))
          .value(),
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
      .map(({ dept_code, ...data_columns }) => ({
        dept_code,
        by_year: Object.keys(data_columns).map((key) => ({
          year: key,
          value: data_columns[key],
        })),
      }))
      .value();
    employee_ex_lvl_rows = process_employee_csv("org_employee_ex_lvl.csv");

    employee_fol_rows = process_employee_csv("org_employee_fol.csv");

    employee_gender_rows = process_employee_csv("org_employee_gender.csv");

    employee_region_rows = process_employee_csv("org_employee_region.csv");

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
