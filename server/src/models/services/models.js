import _ from "lodash";
import mongoose from "mongoose";

import { create_resource_by_foreignkey_attr_dataloader } from "../loader_utils.js";
import {
  pkey_type,
  parent_fkey_type,
  sparse_parent_fkey_type,
  str_type,
  bilingual_str,
  bilingual,
} from "../model_utils.js";

export default function (model_singleton) {
  const ServiceStandardSchema = mongoose.Schema({
    standard_id: pkey_type(),
    service_id: parent_fkey_type(),
    is_active: { type: Boolean },

    ...bilingual_str("name"),

    last_gcss_tool_year: str_type,
    channel: str_type, // TODO should be an enum, get possible values
    standard_type: str_type, // TODO should be an enum, get possible values
    ...bilingual_str("other_type_comment"),

    target_type: str_type, // TODO should be an enum, get possible values
    lower: { type: Number },
    upper: { type: Number },
    count: { type: Number },
    met_count: { type: Number },
    is_target_met: { type: Boolean },
    ...bilingual_str("target_comment"),
    ...bilingual("urls", [str_type]),
    ...bilingual("rtp_urls", [str_type]),
  });

  const ServiceSchema = mongoose.Schema({
    service_id: pkey_type(),
    org_id: parent_fkey_type(),
    program_ids: [parent_fkey_type()],
    year: str_type,
    is_active: { type: Boolean },

    ...bilingual_str("name"),
    ...bilingual_str("description"),
    ...bilingual("service_type", [str_type]),
    ...bilingual("scope", [str_type]),
    ...bilingual("target_groups", [str_type]),
    ...bilingual("feedback_channels", [str_type]),
    ...bilingual("urls", [str_type]),
    ...bilingual_str("comment"),

    last_gender_analysis: str_type,

    collects_fees: { type: Boolean },
    cra_buisnss_number_is_identifier: { type: Boolean },
    sin_is_identifier: { type: Boolean },
    account_reg_digital_status: { type: Boolean },
    authentication_status: { type: Boolean },
    application_digital_status: { type: Boolean },
    decision_digital_status: { type: Boolean },
    issuance_digital_status: { type: Boolean },
    issue_res_digital_status: { type: Boolean },
    ...bilingual_str("digital_enablement_comment"),

    telephone_enquires: { type: Number },
    website_visits: { type: Number },
    online_applications: { type: Number },
    in_person_applications: { type: Number },
    mail_applications: { type: Number },
    other_channel_applications: { type: Number },

    standards: [ServiceStandardSchema],
  });

  model_singleton.define_model("ServiceStandard", ServiceStandardSchema);
  model_singleton.define_model("Service", ServiceSchema);

  const { Service } = model_singleton.models;

  const loaders = {
    services_by_org_id: create_resource_by_foreignkey_attr_dataloader(
      Service,
      "org_id"
    ),
    services_by_program_id: create_resource_by_foreignkey_attr_dataloader(
      Service,
      "program_ids"
    ),
  };
  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
