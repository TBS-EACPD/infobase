const schema = `
  extend type Org{
    employee_summary: [OrgEmployeeSummary]
  }

  extend type Gov {
    employee_summary: [GovEmployeeSummary]
  }
  
  type OrgEmployeeSummary {
    org_id: String
    employee_age_group: [EmployeePopData]
    employee_ex_lvl: [EmployeePopData]
    employee_gender: [EmployeePopData]
    employee_fol: [EmployeePopData]
    employee_region: [EmployeePopData]
    employee_type: [EmployeePopData]
    employee_avg_age: [EmployeeAvgAge]
  }

  type GovEmployeeSummary {
    id: String
    employee_age_totals: [EmployeeGovData]
    employee_ex_lvl_totals: [EmployeeGovData]
    employee_gender_totals: [EmployeeGovData]
    employee_fol_totals: [EmployeeGovData]
    employee_region_totals: [EmployeeGovData]
    employee_type_totals: [EmployeeGovData]
    employee_gov_avgs: [EmployeeGovAvgs]
  }
  type DataObjectWithDim {
    dimension: String
    by_year: [ByYearData]
    avg_share: Float
  }

  type DataObjectNoDim {
    by_year: [ByYearData]
  }

  type ByYearData {
    year: Int,
    value: Float
  }

  type EmployeePopData {
    org_id: String
    data: [DataObjectWithDim]
  }

  type EmployeeGovData{
    dimension: String
    data: [DataObjectNoDim]
  }
  type EmployeeAvgAge {
    org_id: String
    data: DataObjectNoDim
  }

  type EmployeeGovAvgs {
    id: String
    data: [DataObjectNoDim]
  }
`;

export default function ({ models, loaders }) {
  const { OrgEmployeeSummary, GovEmployeeSummary } = models;
  const resolvers = {
    Org: {
      employee_summary: async ({ org_id }) => {
        return await OrgEmployeeSummary.find({ org_id: org_id });
      },
    },
    Gov: {
      employee_summary: async ({ org_id }) => {
        return await GovEmployeeSummary.find({ org_id: org_id });
      },
    },
  };
  return {
    schema,
    resolvers,
  };
}
