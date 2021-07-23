import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

export default async function ({ models }) {
  const {
    EmployeeAgeGroup,
    EmployeeExLvl,
    EmployeeFol,
    EmployeeGender,
    EmployeeRegion,
    EmployeeType,
    EmployeeAvgAge,
    EmployeeAgeTotals,
    EmployeeExLvlTotals,
    EmployeeFolTotals,
    EmployeeGenderTotals,
    EmployeeRegionTotals,
    EmployeeTypeTotals,
    EmployeeGovAvgs,
  } = models;

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
          .map(({ dept_code, dimension, avg_share, ...values_by_year }) => ({
            dimension,
            by_year: _.map(values_by_year, (value, year) => ({
              year,
              value,
            })),
            avg_share,
          }))
          .value(),
      }))
      .value();

  const process_employee_data_sums = (csv_name) => {
    let raw_data = get_standard_csv_file_rows(csv_name);
    let years = _.chain(raw_data[0])
      .keys()
      .toArray()
      .map((element) => {
        if (!isNaN(element)) {
          return element;
        }
      })
      .compact()
      .value();
    return _.chain(raw_data)
      .groupBy("dimension")
      .map((dimension_arr, dimension_group) => ({
        dimension: dimension_group,
        data: {
          by_year: _.chain(years)
            .map((year) => [
              year,
              _.sumBy(dimension_arr, (row) => _.toNumber(row[year])),
            ])
            .fromPairs()
            .map((value, key) => ({
              year: [key][0],
              value: value,
            }))
            .value(),
        },
      }))
      .value();
  };
  let employee_age_rows = process_employee_csv("org_employee_age_group.csv");

  let employee_ex_lvl_rows = process_employee_csv("org_employee_ex_lvl.csv");

  let employee_fol_rows = process_employee_csv("org_employee_fol.csv");

  let employee_gender_rows = process_employee_csv("org_employee_gender.csv");

  let employee_region_rows = process_employee_csv("org_employee_region.csv");

  let employee_type_rows = process_employee_csv("org_employee_type.csv");

  let employee_avg_age_rows = _.chain(
    get_standard_csv_file_rows("org_employee_avg_age.csv")
  )
    .map(({ dept_code, dimension, ...data_columns }) => ({
      dept_code,
      ..._.mapValues(data_columns, _.toNumber),
    }))
    .map(({ dept_code, ...values_by_year }) => ({
      dept_code,
      by_year: _.map(values_by_year, (value, year) => ({
        year,
        value,
      })),
    }))
    .value();

  let employee_age_totals = process_employee_data_sums(
    "org_employee_age_group.csv"
  );

  let employee_ex_lvl_totals = process_employee_data_sums(
    "org_employee_ex_lvl.csv"
  );

  let employee_fol_totals = process_employee_data_sums("org_employee_fol.csv");

  let employee_gender_totals = process_employee_data_sums(
    "org_employee_gender.csv"
  );

  let employee_region_totals = process_employee_data_sums(
    "org_employee_region.csv"
  );

  let employee_type_totals = process_employee_data_sums(
    "org_employee_type.csv"
  );

  let employee_gov_avg = {
    data: _.chain(get_standard_csv_file_rows("org_employee_avg_age.csv"))
      .filter({ dept_code: "ZGOC" })
      .head()
      .omit(["dept_code", "dimension"])
      .map((value, key) => ({
        by_year: {
          year: [key][0],
          value: value,
        },
      }))
      .value(),
  };
  return await Promise.all([
    EmployeeAgeGroup.insertMany(employee_age_rows),
    EmployeeExLvl.insertMany(employee_ex_lvl_rows),
    EmployeeFol.insertMany(employee_fol_rows),
    EmployeeGender.insertMany(employee_gender_rows),
    EmployeeRegion.insertMany(employee_region_rows),
    EmployeeType.insertMany(employee_type_rows),
    EmployeeAvgAge.insertMany(employee_avg_age_rows),
    EmployeeAgeTotals.insertMany(employee_age_totals),
    EmployeeExLvlTotals.insertMany(employee_ex_lvl_totals),
    EmployeeFolTotals.insertMany(employee_fol_totals),
    EmployeeGenderTotals.insertMany(employee_gender_totals),
    EmployeeRegionTotals.insertMany(employee_region_totals),
    EmployeeTypeTotals.insertmany(employee_type_totals),
    EmployeeGovAvgs.insertMany(employee_gov_avg),
  ]);
}
