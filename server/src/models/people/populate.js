import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

import { headcount_types } from "./utils.js";

const headcount_non_year_headers = ["dept_code", "dimension", "avg_share"];
const validate_headcount_headers = (csv_name, csv) =>
  _.chain(csv)
    .first()
    .keys()
    .thru((headers) => {
      const has_expected_non_year_headers = _.chain(headers)
        .intersection(headcount_non_year_headers)
        .size()
        .eq(headcount_non_year_headers.length)
        .value();

      if (!has_expected_non_year_headers) {
        throw new Error(
          `${csv_name} is being processed as a standard headcount dataset but is missing one of the expected non-year headers (expect ${_.join(
            headcount_non_year_headers,
            ", "
          )})`
        );
      }

      const other_non_year_columns = _.chain(headers)
        .keys()
        .without(headcount_non_year_headers)
        .filter(
          (expected_year) =>
            _.isNaN(+expected_year) ||
            (+expected_year < 1900 && +expected_year > 2100)
        )
        .value();
      const all_remaining_columns_are_years = _.isEmpty(other_non_year_columns);

      if (!all_remaining_columns_are_years) {
        throw new Error(
          `${csv_name} is being processed as a standard headcount dataset but has unexpected headers ${_.join(
            other_non_year_columns,
            ", "
          )}`
        );
      }

      return has_expected_non_year_headers && all_remaining_columns_are_years;
    })
    .value();

// awkward little gotcha with the server code, the populate modules aren't written to run in the deployed cloud function environment (where, for instance,
// the data that get_standard_csv_file_rows doesn't exist)... but the modules are still loaded and parsed because populate and run time overlap in src/models/index.js
// SO top level code in a populate script can break the google cloud run time (... e.g. with a call to get_standard_csv_file_rows)
// Luckily that will be caught and prevent the function from deploying, but it might be a pain to debug (you have to read multiple logs on GCloud to piece the error
// together, for some reason). Spliting up src/models/index.js is a TODO
const get_org_id_by_dept_code = _.memoize(() =>
  _.chain(get_standard_csv_file_rows("igoc.csv"))
    .map(({ dept_code, org_id }) => [dept_code, org_id])
    .fromPairs()
    .value()
);
const get_org_id_from_dept_code = (csv_name, dept_code) => {
  const org_id_by_dept_code = get_org_id_by_dept_code();

  if (!_.has(org_id_by_dept_code, dept_code)) {
    throw new Error(
      `${csv_name} contains a dept_code, "${dept_code}", which could not be mapped to an org_id via the igoc`
    );
  }
  return org_id_by_dept_code[dept_code];
};

const process_standard_headcount_dataset = (headcount_type) => {
  const csv_name = `org_employee_${headcount_type}.csv`;

  const csv = get_standard_csv_file_rows(csv_name);

  validate_headcount_headers(csv_name, csv);

  return _.chain(csv)
    .reject({ dept_code: "ZGOC" })
    .map(({ dept_code, dimension, avg_share, ...values_by_year }) => ({
      org_id: get_org_id_from_dept_code(csv_name, dept_code),
      dimension,
      yearly_data: _.map(values_by_year, (value, year) => ({
        year,
        value: +value,
      })),
      avg_share: +avg_share,
    }))
    .value();
};

export default async function ({ models }) {
  const { OrgPeopleData, GovPeopleSummary } = models;

  const headcount_datasets_by_type = _.chain(headcount_types)
    .map((headcount_type) => [
      headcount_type,
      process_standard_headcount_dataset(headcount_type),
    ])
    .fromPairs()
    .value();

  const { true: gov_average_age_rows, false: org_average_age_rows } = _.chain(
    get_standard_csv_file_rows("org_employee_avg_age.csv")
  )
    .flatMap(({ dept_code, dimension, ...values_by_year }) =>
      _.map(values_by_year, (value, year) => ({
        org_id:
          dept_code === "ZGOC"
            ? "ZGOC"
            : get_org_id_from_dept_code("org_employee_avg_age.csv", dept_code),
        year,
        value: +value,
      }))
    )
    .groupBy(({ org_id }) => org_id === "ZGOC")
    .value();

  const org_people_data = _.chain({
    ...headcount_datasets_by_type,
    org_average_age_rows,
  })
    .flatMap((dataset) => _.map(dataset, "org_id"))
    .uniq()
    .map((org_id) => ({
      org_id,
      average_age: _.filter(org_average_age_rows, { org_id }),
      ..._.mapValues(headcount_datasets_by_type, (dataset) =>
        _.filter(dataset, { org_id })
      ),
    }))
    .value();

  const gov_people_summary = {
    id: "gov",
    average_age: gov_average_age_rows,
    ..._.mapValues(headcount_datasets_by_type, (dataset) => {
      const dataset_years = _.chain(dataset)
        .flatMap(({ yearly_data }) => _.map(yearly_data, "year"))
        .uniq()
        .value();

      return _.chain(dataset)
        .groupBy("dimension")
        .map((dimension_rows, dimension) => ({
          dimension,
          yearly_data: _.reduce(
            dimension_rows,
            (summed_dimension_row, { yearly_data }) =>
              _.map(summed_dimension_row, ({ year, value }) => ({
                year,
                value: value + (_.find(yearly_data, { year }).value || 0),
              })),
            _.map(dataset_years, (year) => ({ year, value: 0 }))
          ),
        }))
        .value();
    }),
  };

  // TODO could add some checks such as asserting that the headcount tables have consistent totals by year and dept

  return await Promise.all([
    OrgPeopleData.insertMany(org_people_data),
    GovPeopleSummary.insertMany(gov_people_summary),
  ]);
}
