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
  const EmployeeWholeDataSchema = mongoose.Schema({
    dept_code: str_type,
    dimension: str_type,
    2016: number_type,
    2017: number_type,
    2018: number_type,
    2019: number_type,
    2020: number_type,
    avg_share: number_type,
  });

  const EmployeeAveragesSchema = mongoose.Schema({
    dept_code: str_type,
    2016: number_type,
    2017: number_type,
    2018: number_type,
    2019: number_type,
    2020: number_type,
  });

  model_singleton.define_model("EmployeeAgeGroup", EmployeeWholeDataSchema);
  model_singleton.define_model("EmployeeAvgAge", EmployeeAveragesSchema);
  model_singleton.define_model("EmployeeExLvl", EmployeeWholeDataSchema);
  model_singleton.define_model(
    "EmployeeFirstOfficialLang",
    EmployeeWholeDataSchema
  );
  model_singleton.define_model("EmployeeGender", EmployeeWholeDataSchema);
  model_singleton.define_model("EmployeeRegion", EmployeeWholeDataSchema);
  model_singleton.define_model("EmployeeType", EmployeeWholeDataSchema);

  const {
    EmployeeAgeGroup,
    EmployeeAvgAge,
    EmployeeExLvl,
    EmployeeFirstOfficialLang,
    EmployeeGender,
    EmployeeRegion,
    EmployeeType,
  } = model_singleton.models;
}
