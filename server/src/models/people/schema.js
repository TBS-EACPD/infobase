const employee_org_fields = `
  org_id: String
  data: [DataObjectWithDim]
`;

const employee_gov_fields = `
  dimension: String
  data: [DataObjectNoDim]
`;
const schema = `
  extend type Org{
    employee {

      employee_age_group: [EmployeeAgeGroup]
      employee_ex_lvl: [EmployeeExLvl]
      employee_gender: [EmployeeGender]
      employee_fol: [EmployeeFol]
      employee_region: [EmployeeRegion]
      employee_type: [EmployeeType]
      employee_avg_age: [EmployeeAvgAge]
    }
  }

  extend type Gov {
    employee {
      employee_age_totals: [EmployeeAgeTotals]
      employee_ex_lvl_totals: [EmployeeExLvlTotals]
      employee_gender_totals: [EmployeeGenderTotals]
      employee_fol_totals: [EmployeeFolTotals]
      employee_region_totals: [EmployeeRegionTotals]
      employee_type_totals: [EmployeeTypeTotals]
      employee_gov_avgs: [EmployeeGovAvgs]
    }
    
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


  type EmployeeAgeGroup {
    ${employee_org_fields}
  }

  type EmployeeExLvl {
    ${employee_org_fields}
  }

  type EmployeeFol {
    ${employee_org_fields}
  }

  type EmployeeGender {
    ${employee_org_fields}
  }

  type EmployeeRegion {
    ${employee_org_fields}
  }

  type EmployeeType {
    ${employee_org_fields}
  }

  type EmployeeAvgAge {
    org_id: String
    data: DataObjectNoDim
  }

  type EmployeeAgeTotals {
    ${employee_gov_fields}
  }

  type EmployeeExLvlTotals  {
    ${employee_gov_fields}
  }

  type EmployeeFolTotals  {
    ${employee_gov_fields}
  }

  type EmployeeGenderTotals  {
    ${employee_gov_fields}
  }

  type EmployeeRegionTotals  {
    ${employee_gov_fields}
  }

  type EmployeeTypeTotals  {
    ${employee_gov_fields}
  }

  type EmployeeGovAvgs {
    data: [DataObjectNoDim]
  }
`;

export default function ({ models, loaders }) {
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
  const resolvers = {
    Org: {
      employee_age_group: async ({ org_id }) => {
        return await EmployeeAgeGroup.find({ org_id: org_id });
      },
      employee_ex_lvl: async ({ org_id }) => {
        return await EmployeeExLvl.find({ org_id: org_id });
      },
      employee_gender: async ({ org_id }) => {
        return await EmployeeGender.find({ org_id: org_id });
      },
      employee_fol: async ({ org_id }) => {
        return await EmployeeFol.find({ org_id: org_id });
      },
      employee_region: async ({ org_id }) => {
        return await EmployeeRegion.find({ org_id: org_id });
      },
      employee_type: async ({ org_id }) => {
        return await EmployeeType.find({ org_id: org_id });
      },

      employee_avg_age: async ({ org_id }) => {
        return await EmployeeAvgAge.find({ org_id: org_id });
      },
    },
    Gov: {
      employee_age_totals: async ({ org_id }) => {
        return await EmployeeAgeTotals.find({ org_id: org_id });
      },
      employee_ex_lvl_totals: async ({ org_id }) => {
        return await EmployeeExLvlTotals.find({ org_id: org_id });
      },
      employee_gender_totals: async ({ org_id }) => {
        return await EmployeeGenderTotals.find({ org_id: org_id });
      },
      employee_fol_totals: async ({ org_id }) => {
        return await EmployeeFolTotals.find({ org_id: org_id });
      },
      employee_region_totals: async ({ org_id }) => {
        return await EmployeeRegionTotals.find({ org_id: org_id });
      },
      employee_type_totals: async ({ org_id }) => {
        return await EmployeeTypeTotals.find({ org_id: org_id });
      },
      employee_gov_avgs: async ({ org_id }) => {
        return await EmployeeGovAvgs.find({ org_id: org_id });
      },
    },
  };
  return {
    schema,
    resolvers,
  };
}
