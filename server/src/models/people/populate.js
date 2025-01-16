import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

import { headcount_types } from "./utils.js";

// Memoize CSV parsing
const get_org_id_by_dept_name = _.memoize(() => {
  return _.chain(get_standard_csv_file_rows("goc-org-variants.csv"))
    .map(({ org_name_variant, org_id }) => [org_name_variant, org_id])
    .fromPairs()
    .value();
});

// Mapping headcount types to respective CSV columns
const headcountTypeMapping = {
  type: "tenure",
  gender: "sex",
  fol: "first_official_language",
  ex_lvl: "executive_level",
  age_group: "age_band",
  region: "province_or_territory_of_work",
};

// Transform headers: lowercase and replace spaces with underscores
const transformHeaders = (csv) =>
  csv.map((record) =>
    _.mapKeys(record, (value, key) => key.toLowerCase().replace(/ /g, "_"))
  );

// Retrieve value based on dept_name, year, dimension, headcount_type
const getValue = (filteredCsv, dept_name, year, dimension, headcount_type) => {
  const record = filteredCsv.find(
    (item) =>
      item.department_or_agency === dept_name &&
      item.year == year &&
      item[headcountTypeMapping[headcount_type]] === dimension
  );
  return record && record.number_of_employees !== "*"
    ? record.number_of_employees
    : null;
};

// Cache org IDs for departments
const get_org_id_from_dept_name = (csv_name, dept_name) => {
  const org_id_by_dept_name = get_org_id_by_dept_name();
  const orgId = org_id_by_dept_name[dept_name];
  if (!orgId) {
    console.warn(`No org_id found for department name: ${dept_name}`);
  }
  return orgId;
};

// Calculate average share for all departments
const calculateAverageShare = (data, headcount_type, orgIdCache) => {
  if (headcount_type === "avg_age") return null;

  const dataWithOrgIds = data
    .map((record) => ({
      ...record,
      orgId: orgIdCache[record.department_or_agency],
    }))
    .filter((record) => record.orgId);

  return _.chain(dataWithOrgIds)
    .groupBy("orgId")
    .mapValues((orgData) => {
      const totalEmployees = _.sumBy(orgData, (record) =>
        parseInt(record.number_of_employees, 10)
      );
      return _.chain(orgData)
        .groupBy(headcountTypeMapping[headcount_type])
        .mapValues(
          (records) =>
            _.sumBy(records, (record) =>
              parseInt(record.number_of_employees, 10)
            ) / totalEmployees
        )
        .value();
    })
    .value();
};

// Get the range of the 5 most recent years dynamically
const getMostRecentYears = (csv) => {
  const maxYear =
    _.maxBy(csv, (record) => parseInt(record.year, 10))?.year || 0;
  const maxYearInt = parseInt(maxYear, 10);
  return _.range(maxYearInt - 4, maxYearInt + 1); // Get the last 5 years
};

// Main dataset processing for headcount types
const process_standard_headcount_dataset = (headcount_type) => {
  const csv_name = `test_org_employee_${headcount_type}.csv`;
  const csv = get_standard_csv_file_rows(csv_name);

  // Transform headers and filter by the 5 most recent years dynamically
  const recentYears = getMostRecentYears(csv);
  const filteredCsv = transformHeaders(csv).filter(
    (record) =>
      record.department_or_agency !== "Office of the Prime Minister" &&
      recentYears.includes(parseInt(record.year, 10))
  );

  if (_.isEmpty(filteredCsv)) {
    console.warn(`No data found for headcount type: ${headcount_type}`);
    return [];
  }

  const orgIdCache = {};
  filteredCsv.forEach((record) => {
    const deptName = record.department_or_agency;
    if (!orgIdCache[deptName]) {
      orgIdCache[deptName] =
        deptName === "Federal public service"
          ? "gov"
          : get_org_id_from_dept_name(csv_name, deptName);
    }
  });

  const averageShares = calculateAverageShare(
    filteredCsv,
    headcount_type,
    orgIdCache
  );

  const reported_years = recentYears;

  const createDeptRecord = (rows, orgIdCache) => {
    const deptName = rows[0]?.department_or_agency;
    return {
      org_id: orgIdCache[deptName],
      dimension: "Total",
      yearly_data: _.chain(rows)
        .map((record) => ({
          year: record.year,
          value: record.number_of_employees,
        }))
        .value(),
      avg_share: averageShares[orgIdCache[deptName]]?.["Total"] || 0,
    };
  };

  if (headcount_type === "avg_age") {
    return _.chain(filteredCsv)
      .groupBy("department_or_agency")
      .map((rows) => ({
        org_id: orgIdCache[rows[0]?.department_or_agency],
        average_age: rows
          .map((record) => ({
            year: parseInt(record.year, 10),
            value:
              record.average_age === "*"
                ? null
                : parseFloat(record.average_age),
          }))
          .filter(({ value }) => _.isFinite(value) || value === null),
      }))
      .filter(Boolean)
      .value();
  }

  if (headcount_type === "dept") {
    return _.chain(filteredCsv)
      .groupBy("department_or_agency")
      .map((rows) => createDeptRecord(rows, orgIdCache))
      .value();
  }

  return _.chain(filteredCsv)
    .groupBy(
      (row) =>
        `${row.department_or_agency}__${
          row[headcountTypeMapping[headcount_type]]
        }`
    )
    .map((rows, key) => {
      const [deptName, dimension] = key.split("__");
      const dimensionToUse = headcount_type === "dept" ? "Total" : dimension;

      return {
        org_id: orgIdCache[deptName],
        dimension: dimensionToUse,
        yearly_data: reported_years.map((year) => ({
          year,
          value: getValue(
            filteredCsv,
            deptName,
            year,
            dimensionToUse,
            headcount_type
          ),
        })),
        avg_share: averageShares[orgIdCache[deptName]]?.[dimensionToUse] || 0,
      };
    })
    .value();
};

// Main function to process all headcount datasets
export default async function ({ models }) {
  const { OrgPeopleData, GovPeopleSummary } = models;

  // Process headcount datasets for all types
  const headcount_datasets_by_type = _.chain(headcount_types)
    .map((headcount_type) => {
      const dataset = process_standard_headcount_dataset(headcount_type);
      return dataset
        ? [
            headcount_type === "avg_age" ? "average_age" : headcount_type,
            dataset,
          ]
        : null;
    })
    .filter(Boolean)
    .fromPairs()
    .value();

  const org_people_data = _.chain(headcount_datasets_by_type)
    .flatMap((dataset) => _.map(dataset, "org_id"))
    .uniq()
    .map((org_id) => ({
      org_id,
      ..._.mapValues(headcount_datasets_by_type, (dataset) =>
        _.filter(dataset, { org_id })
      ),
    }))
    .value();

  const getHeadcountData = (headcount_type, isGovFiltered = false) => {
    const dataset = process_standard_headcount_dataset(headcount_type);
    return _.chain(dataset)
      .filter(({ org_id }) => (isGovFiltered ? org_id === "gov" : true))
      .groupBy("dimension")
      .mapValues((dimension_rows) => {
        const yearly_data = _.chain(dimension_rows)
          .flatMap("yearly_data")
          .groupBy("year")
          .map((yearRows, year) => ({
            year: parseInt(year, 10),
            value: _.sumBy(yearRows, (row) => parseFloat(row.value) || 0),
          }))
          .value();

        return { dimension: dimension_rows[0]?.dimension, yearly_data };
      })
      .filter((val) => val.dimension && val.yearly_data.length > 0)
      .value();
  };

  const gov_people_summary = {
    id: "gov",
    gender: getHeadcountData("gender", true),
    fol: getHeadcountData("fol", true),
    age_group: getHeadcountData("age_group", true),
  };

  headcount_types.forEach((headcount_type) => {
    if (!["gender", "fol", "age_group", "avg_age"].includes(headcount_type)) {
      const data = getHeadcountData(headcount_type, false);
      if (data.length > 0) {
        gov_people_summary[headcount_type] = data;
      }
    }
  });

  gov_people_summary.average_age = _.chain(
    process_standard_headcount_dataset("avg_age")
  )
    .filter(({ org_id }) => !!org_id)
    .flatMap((item) => item.average_age || [])
    .groupBy("year")
    .map((rows, year) => ({
      year: parseInt(year, 10),
      value: _.meanBy(rows, (row) => row.value),
    }))
    .filter(({ value }) => _.isFinite(value))
    .value();

  await Promise.all([
    OrgPeopleData.insertMany(org_people_data),
    GovPeopleSummary.insertMany(gov_people_summary),
  ]);
}
