const employee_org_fields = `
  dept_code: String
  data: [DataObjectWithDim]
`;

const employee_gov_fields = `
  dimension: String
  data: [DataObjectNoDim]
`;
const schema = `
  extend type Org{
    employee_age_group: [EmployeeAgeGroup]
    employee_ex_lvl: [EmployeeExLvl]
    employee_gender: [EmployeeGender]
    employee_fol: [EmployeeFol]
    employee_region: [EmployeeRegion]
    employee_type: [EmployeeType]
    employee_avg_age: [EmployeeAvgAge]
  }

  extend type Gov {
    employee_age_totals: [EmployeeAgeTotals]
    employee_ex_lvl_totals: [EmployeeExLvlTotals]
    employee_gender_totals: [EmployeeGenderTotals]
    employee_fol_totals: [EmployeeFolTotals]
    employee_region_totals: [EmployeeRegionTotals]
    employee_type_totals: [EmployeeTypeTotals]
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
    dept_code: String
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
      employee_age_group: async ({ dept_code }) => {
        return await EmployeeAgeGroup.find({ dept_code: dept_code });
      },
      employee_ex_lvl: async ({ dept_code }) => {
        return await EmployeeExLvl.find({ dept_code: dept_code });
      },
      employee_gender: async ({ dept_code }) => {
        return await EmployeeGender.find({ dept_code: dept_code });
      },
      employee_fol: async ({ dept_code }) => {
        return await EmployeeFol.find({ dept_code: dept_code });
      },
      employee_region: async ({ dept_code }) => {
        return await EmployeeRegion.find({ dept_code: dept_code });
      },
      employee_type: async ({ dept_code }) => {
        return await EmployeeType.find({ dept_code: dept_code });
      },

      employee_avg_age: async ({ dept_code }) => {
        return await EmployeeAvgAge.find({ dept_code: dept_code });
      },
    },
    Gov: {
      employee_age_totals: async ({ dept_code }) => {
        return await EmployeeAgeTotals.find({ dept_code: dept_code });
      },
      employee_ex_lvl_totals: async ({ dept_code }) => {
        return await EmployeeExLvlTotals.find({ dept_code: dept_code });
      },
      employee_gender_totals: async ({ dept_code }) => {
        return await EmployeeGenderTotals.find({ dept_code: dept_code });
      },
      employee_fol_totals: async ({ dept_code }) => {
        return await EmployeeFolTotals.find({ dept_code: dept_code });
      },
      employee_region_totals: async ({ dept_code }) => {
        return await EmployeeRegionTotals.find({ dept_code: dept_code });
      },
      employee_type_totals: async ({ dept_code }) => {
        return await EmployeeTypeTotals.find({ dept_code: dept_code });
      },
      employee_gov_avgs: async ({ dept_code }) => {
        return await EmployeeGovAvgs.find({ dept_code: dept_code });
      },
    },
  };
  return {
    schema,
    resolvers,
  };
}
