/**
 * Open Government Portal → data/*.csv mappings (CKAN package
 * f0d12b41-54dc-4784-ad2b-83dffed2ab84, English resources).
 *
 * If you add rows here, update CircleCI pipeline default
 * `open_gov_refresh_datasets` and `scheduled_open_gov_refresh` job
 * `dataset_keys` to match (comma-separated keys).
 */
export const OPEN_GOV_DATASET_REGISTRY = {
  org_employee_type: {
    description:
      "Population of the federal public service by department and tenure",
    resource_id: "6d238af7-2212-4d36-8ee3-abbfba4392c7",
    out_file: "org_employee_type.csv",
    expected_header_parts: [
      "year",
      "department or agency",
      "tenure",
      "number of employees",
    ],
  },
  org_employee_region: {
    description:
      "Population of the federal public service by department and province or territory of work",
    resource_id: "33a658fe-3d05-4344-af2b-f462d5c1e6b7",
    out_file: "org_employee_region.csv",
    expected_header_parts: [
      "year",
      "department or agency",
      "province or territory of work",
      "number of employees",
    ],
  },
  org_employee_age_group: {
    description:
      "Population of the federal public service by department and age band",
    resource_id: "baa05779-9c69-40c9-ba42-875b340b5c47",
    out_file: "org_employee_age_group.csv",
    expected_header_parts: [
      "year",
      "department or agency",
      "age band",
      "number of employees",
    ],
  },
  org_employee_ex_lvl: {
    description:
      "Population of the federal public service by department and executive level",
    resource_id: "f11fa61f-9a5b-4b8a-b9ab-280ca332443f",
    out_file: "org_employee_ex_lvl.csv",
    expected_header_parts: [
      "year",
      "department or agency",
      "executive level",
      "number of employees",
    ],
  },
  org_employee_gender: {
    description:
      "Population of the federal public service by department and sex",
    resource_id: "a45bb8c6-8df9-4a02-bb18-730f01e3e8a4",
    out_file: "org_employee_gender.csv",
    expected_header_parts: [
      "year",
      "department or agency",
      "sex",
      "number of employees",
    ],
  },
  org_employee_fol: {
    description:
      "Population of the federal public service by department and first official language",
    resource_id: "1608d1f4-3667-4322-b676-11e2ae292289",
    out_file: "org_employee_fol.csv",
    expected_header_parts: [
      "year",
      "department or agency",
      "first official language",
      "number of employees",
    ],
  },
  org_employee_avg_age: {
    description:
      "Population of the federal public service by department and average age",
    resource_id: "cb8b52a3-8a2a-4f2b-ba71-50479a2e6b23",
    out_file: "org_employee_avg_age.csv",
    expected_header_parts: [
      "year",
      "universe",
      "department or agency",
      "average age",
    ],
  },
  org_employee_dept: {
    description:
      "Population of the federal public service by department or agency",
    resource_id: "3391238b-f537-4231-8572-493b9392565b",
    out_file: "org_employee_dept.csv",
    expected_header_parts: [
      "year",
      "universe",
      "department or agency",
      "number of employees",
    ],
  },
};

export function getRequestedKeys(selectedKeys) {
  const allKeys = Object.keys(OPEN_GOV_DATASET_REGISTRY);
  const keys = selectedKeys.length > 0 ? [...new Set(selectedKeys)] : allKeys;
  const unknownKeys = keys.filter((key) => !OPEN_GOV_DATASET_REGISTRY[key]);

  if (unknownKeys.length > 0) {
    throw new Error(
      `Unknown dataset key(s): ${unknownKeys.join(
        ", "
      )}. Use --list to inspect available keys.`
    );
  }

  return keys;
}
