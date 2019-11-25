import _ from "lodash";
import mongoose from "mongoose";

import { 
  pkey_type,
  sparse_pkey_type,
  parent_fkey_type,
  str_type,
  bilingual_str,
  bilingual,
} from '../model_utils.js';

import {
  create_resource_by_foreignkey_attr_dataloader,
} from '../loader_utils.js';


const service_status_type = {
  type: String,
  enum : ['ENABLED', 'NOT_ENABLED', 'NA'],
};


export default function(model_singleton){

  const ServiceStandardSchema = mongoose.Schema({
    standard_id: sparse_pkey_type(),
    service_id: parent_fkey_type(),
    is_active: {type: Boolean},

    ...bilingual_str('name'),

    last_gcss_tool_year: str_type,
    channel: str_type, // TODO should be an enum, get possible values
    standard_type: str_type, // TODO should be an enum, get possible values
    ...bilingual_str('other_type_comment'),

    target_type: str_type, // TODO should be an enum, get possible values
    lower: {type: Number},
    upper: {type: Number},
    count: {type: Number},
    met_count: {type: Number},
    is_target_met: {type: Boolean},
    ...bilingual_str('target_comment'),
    ...bilingual('urls', [str_type]),
    ...bilingual('rtp_urls', [str_type]),
  });

  const ServiceSchema = mongoose.Schema({
    service_id: pkey_type(),
    org_id: parent_fkey_type(),
    year: str_type,
    is_active: {type: Boolean},

    ...bilingual_str('name'),
    ...bilingual_str('description'),
    ...bilingual_str('service_type'),
    ...bilingual_str('scope'),

    last_gender_analysis: str_type,

    collects_fees: {type: Boolean},
    
    account_reg_digital_status: service_status_type,
    authentication_status: service_status_type,
    application_digital_status: service_status_type,
    decision_digital_status: service_status_type,
    issuance_digital_status: service_status_type,
    issue_res_digital_status: service_status_type,
    ...bilingual_str('digital_enablement_comment'),

    standards: [ServiceStandardSchema],
  });


  model_singleton.define_model("ServiceStandard", ServiceStandardSchema);
  model_singleton.define_model("Service", ServiceSchema);
  
  const {
    Service,
  } = model_singleton.models;

  const loaders = {
    services_by_org_id: create_resource_by_foreignkey_attr_dataloader(Service, 'org_id'),
  };
  _.each( loaders, (val, key) =>  model_singleton.define_loader(key, val) );
}