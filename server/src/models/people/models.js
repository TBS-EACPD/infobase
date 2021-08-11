import _ from "lodash";
import mongoose from "mongoose";

import {
  create_resource_by_id_attr_dataloader,
  create_resource_by_foreignkey_attr_dataloader,
} from "../loader_utils.js";
import {
  pkey_type,
  parent_fkey_type,
  fyear_type,
  number_type,
  str_type,
  bilingual,
} from "../model_utils.js";

export default function (model_singleton) {
  const EmployeePopulationDataSchema = mongoose.Schema({
    org_id: pkey_type(),
    data: [
      {
        dimension: str_type,
        by_year: [
          {
            year: fyear_type(),
            value: number_type,
          },
        ],
        avg_share: number_type,
      },
    ],
  });

  const EmployeeAvgAgeSchema = mongoose.Schema({
    org_id: pkey_type(),
    data: {
      by_year: [
        {
          year: fyear_type(),
          value: number_type,
        },
      ],
    },
  });

  const EmployeeDataGovTotalsSchema = mongoose.Schema({
    id: pkey_type(),
    dimension: parent_fkey_type(),
    data: [
      {
        by_year: [
          {
            year: fyear_type(),
            value: number_type,
          },
        ],
      },
    ],
  });

  const EmployeeGovAvgsSchema = mongoose.Schema({
    id: pkey_type(),
    data: [
      {
        by_year: [
          {
            year: fyear_type(),
            value: number_type,
          },
        ],
      },
    ],
  });

  const OrgEmployeeSummarySchema = mongoose.Schema({
    org_id: pkey_type(),
    employee_age_group: [EmployeePopulationDataSchema],
    employee_ex_lvl: [EmployeePopulationDataSchema],
    employee_fol: [EmployeePopulationDataSchema],
    employee_gender: [EmployeePopulationDataSchema],
    employee_region: [EmployeePopulationDataSchema],
    employee_type: [EmployeePopulationDataSchema],
    employee_avg_age: [EmployeeAvgAgeSchema],
  });

  const GovEmployeeSummarySchema = mongoose.Schema({
    id: pkey_type(),
    employee_age_totals: [EmployeeDataGovTotalsSchema],
    employee_ex_lvl_totals: [EmployeeDataGovTotalsSchema],
    employee_gender_totals: [EmployeeDataGovTotalsSchema],
    employee_fol_totals: [EmployeeDataGovTotalsSchema],
    employee_region_totals: [EmployeeDataGovTotalsSchema],
    employee_type_totals: [EmployeeDataGovTotalsSchema],
    employee_gov_avgs: [EmployeeGovAvgsSchema],
  });

  model_singleton.define_model("OrgEmployeeSummary", OrgEmployeeSummarySchema);
  model_singleton.define_model("GovEmployeeSummary", GovEmployeeSummarySchema);

  const { OrgEmployeeSummary, GovEmployeeSummary } = model_singleton.models;

  const loaders = {
    org_employee_summary_loader: create_resource_by_id_attr_dataloader(
      OrgEmployeeSummary,
      "org_id"
    ),
    gov_employee_summary_loader: create_resource_by_id_attr_dataloader(
      GovEmployeeSummary,
      "id"
    ),
  };

  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
