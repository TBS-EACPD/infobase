import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

export default async function ({ models }) {
  const { OrgEmployeeSummary, GovEmployeeSummary } = models;

  const igoc_rows = get_standard_csv_file_rows("igoc.csv");
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
        org_id: _.find(
          igoc_rows,
          (igoc_row) => igoc_row.dept_code === dept_code
        ).org_id,
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
        id: dimension_group,
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
    .reject(["dept_code", "ZGOC"])
    .map(({ dept_code, dimension, ...data_columns }) => ({
      dept_code,
      ..._.mapValues(data_columns, _.toNumber),
    }))
    .map(({ dept_code, ...values_by_year }) => ({
      org_id: _.find(igoc_rows, (igoc_row) => igoc_row.dept_code === dept_code)
        .org_id,
      data: {
        by_year: _.map(values_by_year, (value, year) => ({
          year,
          value,
        })),
      },
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

  let employee_gov_avgs = {
    id: "gov",
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

  let org_id_list = _.map(employee_age_rows, "org_id"); // all the csv files should have the same list of org_ids

  let org_summary = _.map(org_id_list, (org_id) => ({
    org_id: org_id,
    employee_age_group: {
      org_id: org_id,
      data: _.find(employee_age_rows, (z) => {
        return z.org_id == org_id;
      }).data,
    },
    employee_ex_lvl: {
      org_id: org_id,
      data: _.find(employee_ex_lvl_rows, (z) => {
        return z.org_id == org_id;
      }).data,
    },
    employee_fol: {
      org_id: org_id,
      data: _.find(employee_fol_rows, (z) => {
        return z.org_id == org_id;
      }).data,
    },
    employee_gender: {
      org_id: org_id,
      data: _.find(employee_gender_rows, (z) => {
        return z.org_id == org_id;
      }).data,
    },
    employee_region: {
      org_id: org_id,
      data: _.find(employee_region_rows, (z) => {
        return z.org_id == org_id;
      }).data,
    },
    employee_type: {
      org_id: org_id,
      data: _.find(employee_type_rows, (z) => {
        return z.org_id == org_id;
      }).data,
    },
    employee_avg_age: {
      org_id: org_id,
      data: _.find(employee_avg_age_rows, (z) => {
        return z.org_id == org_id;
      }).data,
    },
  }));

  let gov_summary = {
    id: "gov",
    employee_age_totals: employee_age_totals,
    employee_ex_lvl_totals: employee_ex_lvl_totals,
    employee_gender_totals: employee_gender_totals,
    employee_fol_totals: employee_fol_totals,
    employee_region_totals: employee_region_totals,
    employee_type_totals: employee_type_totals,
    employee_gov_avgs: employee_gov_avgs,
  };
  return await Promise.all([
    OrgEmployeeSummary.insertMany(org_summary),
    GovEmployeeSummary.insertMany(gov_summary),
  ]);
}
