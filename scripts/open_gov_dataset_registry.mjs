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
