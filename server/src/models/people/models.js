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
    dimension: pkey_type(),
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
  model_singleton.define_model(
    "EmployeeAgeGroup",
    EmployeePopulationDataSchema
  );
  model_singleton.define_model("EmployeeExLvl", EmployeePopulationDataSchema);
  model_singleton.define_model("EmployeeFol", EmployeePopulationDataSchema);
  model_singleton.define_model("EmployeeGender", EmployeePopulationDataSchema);
  model_singleton.define_model("EmployeeRegion", EmployeePopulationDataSchema);
  model_singleton.define_model("EmployeeType", EmployeePopulationDataSchema);
  model_singleton.define_model("EmployeeAvgAge", EmployeeAvgAgeSchema);
  model_singleton.define_model(
    "EmployeeAgeTotals",
    EmployeeDataGovTotalsSchema
  );
  model_singleton.define_model(
    "EmployeeExLvlTotals",
    EmployeeDataGovTotalsSchema
  );
  model_singleton.define_model(
    "EmployeeFolTotals",
    EmployeeDataGovTotalsSchema
  );
  model_singleton.define_model(
    "EmployeeGenderTotals",
    EmployeeDataGovTotalsSchema
  );
  model_singleton.define_model(
    "EmployeeRegionTotals",
    EmployeeDataGovTotalsSchema
  );
  model_singleton.define_model(
    "EmployeeTypeTotals",
    EmployeeDataGovTotalsSchema
  );
  model_singleton.define_model("EmployeeGovAvgs", EmployeeGovAvgsSchema);
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
    EmployeeGovAvgs  ,
  } = model_singleton.models;
}
