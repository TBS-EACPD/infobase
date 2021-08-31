import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

export const population_datasets = [
  "employee_type",
  "employee_region",
  "employee_age_group",
  "employee_ex_lvl",
  "employee_gender",
  "employee_fol",
];

const population_non_year_headers = ["dept_code", "dimension", "avg_share"];
const validate_population_headers = (csv_name, csv) =>
  _.chain(csv)
    .first()
    .keys()
    .thru((headers) => {
      const has_expected_non_year_headers = _.chain(headers)
        .intersection(population_non_year_headers)
        .size()
        .eq(population_non_year_headers.length)
        .value();

      if (!has_expected_non_year_headers) {
        throw new Error(
          `${csv_name} is being processed as a standard population dataset but is missing one of the expected non-year headers (expect ${_.join(
            population_non_year_headers,
            ", "
          )})`
        );
      }

      const other_non_year_columns = _.chain(headers)
        .keys()
        .without(population_non_year_headers)
        .filter(
          (expected_year) =>
            _.isNaN(+expected_year) ||
            (+expected_year < 1900 && +expected_year > 2100)
        )
        .value();
      const all_remaining_columns_are_years = _.isEmpty(other_non_year_columns);

      if (!all_remaining_columns_are_years) {
        throw new Error(
          `${csv_name} is being processed as a standard population dataset but has unexpected headers ${_.join(
            other_non_year_columns,
            ", "
          )}`
        );
      }

      return has_expected_non_year_headers && all_remaining_columns_are_years;
    })
    .value();

const org_id_by_dept_code = _.chain(get_standard_csv_file_rows("igoc.csv"))
  .map(({ dept_code, org_id }) => [dept_code, org_id])
  .fromPairs()
  .value();
const get_org_id_from_dept_code = (csv_name, dept_code) => {
  if (!_.has(org_id_by_dept_code, dept_code)) {
    throw new Error(
      `${csv_name} contains a dept_code, "${dept_code}", which can not be mapped to an org_id via the igoc`
    );
  }
  return org_id_by_dept_code[dept_code];
};

const process_standard_population_dataset = (name) => {
  const csv_name = `org_${name}.csv`;

  const csv = get_standard_csv_file_rows(csv_name);

  validate_population_headers(csv_name, csv);

  return _.chain(csv)
    .reject({ dept_code: "ZGOC" })
    .groupBy("dept_code")
    .map((dept_rows, dept_code) => ({
      org_id: get_org_id_from_dept_code(csv_name, dept_code),
      data: _.chain(dept_rows)
        .map(({ dept_code, dimension, avg_share, ...values_by_year }) => ({
          dimension,
          by_year: _.map(values_by_year, (value, year) => ({
            year,
            value: +value,
          })),
          avg_share: +avg_share,
        }))
        .value(),
    }))
    .value();
};

export default async function ({ models }) {
  const { OrgEmployeeSummary, GovEmployeeSummary } = models;

  const processed_population_datasets = _.chain(population_datasets)
    .map((dataset_name) => [
      dataset_name,
      process_standard_population_dataset(dataset_name),
    ])
    .fromPairs()
    .value();

  const employee_avg_age = _.map(
    get_standard_csv_file_rows("org_employee_avg_age.csv"),
    ({ dept_code, ...values_by_year }) => ({
      org_id:
        dept_code === "ZGOC"
          ? "ZGOC"
          : get_org_id_from_dept_code("org_employee_avg_age.csv", dept_code),
      data: {
        by_year: _.map(values_by_year, (value, year) => ({
          year,
          value: +value,
        })),
      },
    })
  );

  const find_data_by_org_id = (dataset, org_id) => {
    const org_rows = _.find(dataset, { org_id });
    if (org_rows !== undefined) {
      return {
        org_id: org_id,
        data: org_rows,
      };
    } else {
      return null;
    }
  };

  const org_summaries = _.chain({
    ...processed_population_datasets,
    employee_avg_age,
  })
    .flatMap((dataset) => _.map(dataset, "org_id"))
    .uniq()
    .map((org_id) => ({
      org_id,
      ..._.mapValues(processed_population_datasets, (dataset) =>
        find_data_by_org_id(dataset, org_id)
      ),
      employee_avg_age: find_data_by_org_id(employee_avg_age, org_id),
    }))
    .value();

  const gov_summary = {
    id: "gov",
    ..._.chain(processed_population_datasets)
      .map((dataset, dataset_name) => {
        const dataset_years = _.chain(dataset)
          .flatMap(({ data }) =>
            _.flatMap(data, ({ by_year }) => _.map(by_year, "year"))
          )
          .uniq()
          .value();

        const data = _.chain(dataset)
          .flatMap("data")
          .groupBy("dimension")
          .map((dimension_data, dimension) => ({
            dimension,
            by_year: _.reduce(
              dimension_data,
              (memo, { by_year }) =>
                _.map(memo, ({ year, value }) => ({
                  year,
                  value: value + (_.find(by_year, { year }).value || 0),
                })),
              _.map(dataset_years, (year) => ({ year, value: 0 }))
            ),
          }))
          .value();

        return [`${dataset_name}_totals`, [{ id: "gov", data }]];
      })
      .fromPairs()
      .value(),
    employee_gov_avgs: [
      { ...find_data_by_org_id(employee_avg_age, "ZGOC"), id: "gov" },
    ],
  };

  // TODO could add some checks such as asserting that the population tables have consistent totals by year and dept

  return await Promise.all([
    OrgEmployeeSummary.insertMany(org_summaries),
    GovEmployeeSummary.insertMany(gov_summary),
  ]);
}
