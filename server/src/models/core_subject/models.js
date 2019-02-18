import _ from 'lodash';
import mongoose from "mongoose";

import { 
  str_type, 
  bilingual, 
  pkey_type,
  parent_fkey_type,
} from '../model_utils.js';

import { 
  create_resource_by_foreignkey_attr_dataloader, 
  create_resource_by_id_attr_dataloader,
} from '../loader_utils.js';

export default function define_core_subjects(model_singleton){

  const OrgSchema = new mongoose.Schema({
    org_id: pkey_type(),
    dept_code: {
      ...str_type,
      index: true,
      sparse: true,
    },
    ministry_id: str_type,
    inst_form_id: str_type,
    status: str_type,
    incorp_year: str_type,
    end_yr: str_type,
    PAS: str_type,
    dp_status: str_type,
    ...bilingual("name", { ...str_type, required: true }),
    ...bilingual("legal_title", { ...str_type, required: true }),
    ...bilingual("applied_title", str_type),
    ...bilingual("acronym", str_type),
    ...bilingual("description", str_type),
    ...bilingual("notes", str_type),
    ...bilingual("fed_ownership", str_type),
    ...bilingual("enabling_instrument", str_type),
    ...bilingual("auditor", str_type),
    ...bilingual("dp_url",str_type),
    ...bilingual("qfr_url",str_type),
    ...bilingual("eval_url",str_type),
    article_1: str_type,
    article_2: str_type,

  });

  const ProgramSchema = new mongoose.Schema({
    dept_code: parent_fkey_type(),
    activity_code: {
      ...str_type,
      required: true,
    },
    crso_id: parent_fkey_type(),
    program_id: pkey_type(),
    is_internal_service: { type: Boolean },
    is_crown: { type: Boolean },
    is_active: { type: Boolean },
    ...bilingual("name", str_type),
    ...bilingual("description", str_type),
  });
  
  
  // "id","dept_code","name_en","name_fr","desc_en","desc_fr","is_active"
  const CrsoSchema = mongoose.Schema({
    // TODO: add CR codes 
    crso_id: pkey_type(),
    dept_code: parent_fkey_type(),
    ...bilingual("name", str_type),
    ...bilingual("description", str_type),
    is_active: { type: Boolean },
  });

  //TODO: 
  // UrlLookups,
  // Crso,
  // InstForm,
  // Ministry,
  // Minister,  

  model_singleton.define_model("Org",OrgSchema);
  model_singleton.define_model("Program",ProgramSchema);
  model_singleton.define_model("Crso",CrsoSchema);

  const { Org, Program, Crso } = model_singleton.models;

  
  const loaders = {
    org_deptcode_loader: create_resource_by_id_attr_dataloader(Org,'dept_code'),
    org_id_loader: create_resource_by_id_attr_dataloader(Org,'org_id'),
    prog_dept_code_loader: create_resource_by_foreignkey_attr_dataloader(Program, "dept_code"),
    prog_crso_id_loader: create_resource_by_foreignkey_attr_dataloader(Program, "crso_id"),
    prog_id_loader: create_resource_by_id_attr_dataloader(Program,'program_id'),
    crso_from_deptcode_loader: create_resource_by_foreignkey_attr_dataloader(Crso, 'dept_code'),
    crso_id_loader: create_resource_by_id_attr_dataloader(Program,'crso_id'), 
  };
  _.each(loaders, (val,key) =>  model_singleton.define_loader(key,val) )
}
