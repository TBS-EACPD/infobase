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

/*
// Retrieve value based on dept_name, year, dimension, headcount_type
const getValue = (filteredCsv, dept_name, year, dimension, headcount_type) => {
  // Find all matching records instead of just one
  const matchingRecords = filteredCsv.filter(
    (item) =>
      item.department_or_agency === dept_name &&
      item.year == year &&
      item[headcountTypeMapping[headcount_type]] === dimension
  );

  // Sum all values from matching records
  let total = 0;
  matchingRecords.forEach((record) => {
    if (record && record.number_of_employees !== "*") {
      total += parseInt(record.number_of_employees, 10);
    }
  });

  return matchingRecords.length > 0 ? total : null;
};
*/

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
        record.number_of_employees === "*"
          ? 0
          : parseInt(record.number_of_employees, 10)
      );

      if (totalEmployees === 0) return {};

      return _.chain(orgData)
        .groupBy(headcountTypeMapping[headcount_type])
        .mapValues((records) => {
          const sum = _.sumBy(records, (record) =>
            record.number_of_employees === "*"
              ? 0
              : parseInt(record.number_of_employees, 10)
          );
          return totalEmployees > 0 ? sum / totalEmployees : 0;
        })
        .value();
    })
    .value();
};

// Get the range of the 5 most recent years dynamically
const getMostRecentYears = (csv) => {
  const years = _.chain(csv)
    .map((record) => parseInt(record.year, 10))
    .filter((year) => !isNaN(year))
    .uniq()
    .sortBy()
    .value();

  return years.slice(-5); // Get the last 5 years
};

// Process average age data separately
const process_avg_age_dataset = () => {
  const csv_name = `org_employee_avg_age.csv`;
  const csv = get_standard_csv_file_rows(csv_name);

  if (_.isEmpty(csv)) {
    console.warn("No data found for average_age");
    return [];
  }

  // Transform headers and filter
  const transformedCsv = transformHeaders(csv);
  const recentYears = getMostRecentYears(transformedCsv);

  const filteredCsv = transformedCsv.filter(
    (record) =>
      record.department_or_agency !== "Office of the Prime Minister" &&
      recentYears.includes(parseInt(record.year, 10))
  );

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

  // Group by department and create records
  return _.chain(filteredCsv)
    .groupBy("department_or_agency")
    .map((rows) => {
      const deptName = rows[0]?.department_or_agency;
      const orgId = orgIdCache[deptName];

      if (!orgId) return null;

      // Create a map of year to value for this department
      const yearValueMap = _.chain(rows)
        .map((record) => [
          parseInt(record.year, 10),
          record.average_age === "*" ? -1 : parseFloat(record.average_age),
        ])
        .fromPairs()
        .value();

      // Create entries for all years, even missing ones
      const average_age = recentYears.map((year) => ({
        year,
        value: yearValueMap[year] !== undefined ? yearValueMap[year] : null,
      }));

      return {
        org_id: orgId,
        average_age,
      };
    })
    .filter(Boolean)
    .value();
};

// Main dataset processing for headcount types
const process_standard_headcount_dataset = (headcount_type) => {
  if (headcount_type === "avg_age") {
    return process_avg_age_dataset();
  }

  const csv_name = `org_employee_${headcount_type}.csv`;
  const csv = get_standard_csv_file_rows(csv_name);

  // Transform headers and filter by the 5 most recent years dynamically
  const transformedCsv = transformHeaders(csv);
  const recentYears = getMostRecentYears(transformedCsv);

  const filteredCsv = transformedCsv.filter(
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

  // For department-level data
  if (headcount_type === "dept") {
    return _.chain(filteredCsv)
      .groupBy("department_or_agency")
      .map((rows) => {
        const deptName = rows[0]?.department_or_agency;
        const orgId = orgIdCache[deptName];

        if (!orgId) return null;

        // Create a map of year to value for this department
        const yearValueMap = _.chain(rows)
          .map((record) => [
            parseInt(record.year, 10),
            record.number_of_employees === "*"
              ? -1
              : parseInt(record.number_of_employees, 10),
          ])
          .fromPairs()
          .value();

        // Create entries for all years, even missing ones
        const yearly_data = recentYears.map((year) => ({
          year,
          value: yearValueMap[year] !== undefined ? yearValueMap[year] : null,
        }));

        return {
          org_id: orgId,
          dimension: "Total",
          yearly_data,
        };
      })
      .filter(Boolean)
      .value();
  }

  // Group by department and dimension
  return _.chain(filteredCsv)
    .groupBy((record) => {
      const dimension = record[headcountTypeMapping[headcount_type]];
      return `${record.department_or_agency}_${dimension}`;
    })
    .map((records) => {
      const firstRecord = records[0];
      if (!firstRecord) return null;

      const deptName = firstRecord.department_or_agency;
      const dimension = firstRecord[headcountTypeMapping[headcount_type]];
      const orgId = orgIdCache[deptName];

      if (!orgId || !dimension) return null;

      // Create a map of year to value for this department-dimension pair
      const yearValueMap = _.chain(records)
        .map((record) => [
          parseInt(record.year, 10),
          record.number_of_employees === "*"
            ? -1
            : parseInt(record.number_of_employees, 10),
        ])
        .fromPairs()
        .value();

      // Create entries for all years, even missing ones
      const yearly_data = recentYears.map((year) => ({
        year,
        value: yearValueMap[year] !== undefined ? yearValueMap[year] : null,
      }));

      return {
        org_id: orgId,
        dimension,
        yearly_data,
        avg_share:
          orgId && averageShares[orgId] && averageShares[orgId][dimension]
            ? averageShares[orgId][dimension]
            : 0,
      };
    })
    .filter(Boolean)
    .value();
};

// Process government-level data
const processGovData = (headcount_datasets_by_type) => {
  const gov_people_summary = { id: "gov" };

  // Process average_age for government
  if (headcount_datasets_by_type.average_age) {
    const govData = headcount_datasets_by_type.average_age.find(
      (item) => item.org_id === "gov"
    );

    if (govData && govData.average_age) {
      gov_people_summary.average_age = govData.average_age;
    } else {
      // Calculate average from all departments if no direct gov data
      gov_people_summary.average_age = _.chain(
        headcount_datasets_by_type.average_age
      )
        .flatMap((item) => item.average_age || [])
        .groupBy("year")
        .map((yearData, year) => ({
          year: parseInt(year, 10),
          value: _.meanBy(yearData, (d) => d.value),
        }))
        .filter((item) => !isNaN(item.value))
        .sortBy("year")
        .value();
    }
  }

  // Process other headcount types
  _.without(headcount_types, "avg_age").forEach((headcount_type) => {
    if (!headcount_datasets_by_type[headcount_type]) return;

    // Get government data directly if available
    const govData = _.filter(
      headcount_datasets_by_type[headcount_type],
      (item) => item.org_id === "gov" && item.dimension !== "Total"
    );

    if (govData.length > 0) {
      // Recalculate avg_share without considering "Total"
      const yearlyTotals = {};

      // Calculate totals for each year
      govData.forEach((item) => {
        item.yearly_data.forEach((yearData) => {
          if (yearData.value) {
            const year = yearData.year.toString();
            yearlyTotals[year] = (yearlyTotals[year] || 0) + yearData.value;
          }
        });
      });

      gov_people_summary[headcount_type] = _.map(govData, (item) => {
        // Calculate new avg_share
        let totalShare = 0;
        let validYearCount = 0;

        item.yearly_data.forEach((yearData) => {
          const year = yearData.year.toString();
          if (yearData.value && yearlyTotals[year]) {
            totalShare += yearData.value / yearlyTotals[year];
            validYearCount++;
          }
        });

        return {
          dimension: item.dimension,
          yearly_data: item.yearly_data,
          avg_share: validYearCount > 0 ? totalShare / validYearCount : 0,
        };
      });
    } else {
      // Aggregate data from all departments if no direct gov data
      const dimensionGroups = _.chain(
        headcount_datasets_by_type[headcount_type]
      )
        .filter((item) => item.dimension !== "Total") // Filter out "Total" dimension
        .groupBy("dimension")
        .value();

      // First, calculate total employees across all dimensions for each year
      const totalsByYear = {};

      _.forEach(dimensionGroups, (items) => {
        const yearlyData = _.chain(items)
          .flatMap("yearly_data")
          .groupBy("year")
          .mapValues((yearItems) =>
            _.sum(_.map(yearItems, (item) => item.value || 0))
          )
          .value();

        _.forEach(yearlyData, (value, year) => {
          totalsByYear[year] = (totalsByYear[year] || 0) + value;
        });
      });

      // Now calculate the data for each dimension with proper avg_share
      gov_people_summary[headcount_type] = _.map(
        dimensionGroups,
        (items, dimension) => {
          // Sum values for each year
          const yearly_data = _.chain(items)
            .flatMap("yearly_data")
            .groupBy("year")
            .map((yearItems, year) => {
              const yearValue = _.sum(
                _.map(yearItems, (item) => item.value || 0)
              );
              return {
                year: parseInt(year, 10),
                value: yearValue,
              };
            })
            .sortBy("year")
            .value();

          // Calculate average share across all years
          let totalShare = 0;
          let validYearCount = 0;

          yearly_data.forEach((yearData) => {
            const year = yearData.year.toString();
            if (yearData.value && totalsByYear[year]) {
              totalShare += yearData.value / totalsByYear[year];
              validYearCount++;
            }
          });

          const avg_share =
            validYearCount > 0 ? totalShare / validYearCount : 0;

          return {
            dimension,
            yearly_data,
            avg_share,
          };
        }
      );
    }
  });

  return gov_people_summary;
};

// Main function to process all headcount datasets
export default async function ({ models }) {
  const { OrgPeopleData, GovPeopleSummary } = models;

  console.log("Starting to process people data...");

  try {
    // Process headcount datasets for all types
    const headcount_datasets_by_type = _.chain(headcount_types)
      .map((headcount_type) => {
        console.log(`Processing ${headcount_type} data...`);
        const dataset = process_standard_headcount_dataset(headcount_type);
        return dataset && dataset.length > 0
          ? [
              headcount_type === "avg_age" ? "average_age" : headcount_type,
              dataset,
            ]
          : null;
      })
      .filter(Boolean)
      .fromPairs()
      .value();

    console.log("Organizing data by organization...");

    // Organize data by organization
    const all_org_ids = _.chain(headcount_datasets_by_type)
      .flatMap((dataset, type) => {
        if (type === "average_age") {
          return _.map(dataset, "org_id");
        } else {
          return _.map(dataset, "org_id");
        }
      })
      .uniq()
      .value();

    const org_people_data = _.map(all_org_ids, (org_id) => {
      // For each organization, collect all its data
      const org_data = { org_id };

      // Handle average_age specially
      if (headcount_datasets_by_type.average_age) {
        const avg_age_data = _.find(headcount_datasets_by_type.average_age, {
          org_id,
        });
        if (avg_age_data && avg_age_data.average_age) {
          org_data.average_age = avg_age_data.average_age;
        }
      }

      // Handle other headcount types
      _.without(Object.keys(headcount_datasets_by_type), "average_age").forEach(
        (type) => {
          org_data[type] = _.filter(headcount_datasets_by_type[type], {
            org_id,
          });
        }
      );

      return org_data;
    });

    console.log("Processing government-level summary...");

    // Process government-level summary
    const gov_people_summary = processGovData(headcount_datasets_by_type);

    console.log("Saving data to database...");

    // Save to database
    await Promise.all([
      OrgPeopleData.deleteMany({}),
      GovPeopleSummary.deleteMany({}),
    ]);

    await Promise.all([
      OrgPeopleData.insertMany(org_people_data),
      GovPeopleSummary.insertMany([gov_people_summary]),
    ]);

    console.log("People data processing completed successfully!");
  } catch (error) {
    console.error("Error processing people data:", error);
    throw error;
  }
}
