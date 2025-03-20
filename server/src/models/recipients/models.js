import _ from "lodash";
import mongoose from "mongoose";

import {
  create_resource_by_foreignkey_attr_dataloader,
  create_resource_by_id_attr_dataloader,
} from "../loader_utils.js";
import {
  pkey_type,
  parent_fkey_type,
  sparse_parent_fkey_type,
  str_type,
  bilingual_str,
  bilingual,
  number_type,
} from "../model_utils.js";

export default function (model_singleton) {
  const common_recipients_fields = {
    id: pkey_type(),
    recipients: [
      {
        year: str_type,
        department: str_type,
        org_id: str_type,
        program: str_type,
        record_type: str_type,
        recipient: str_type,
        city: str_type,
        province: str_type,
        country: str_type,
        expenditure: { type: Number },
      },
    ],
    recipients_general_stats: [
      {
        year: str_type,
        org_id: str_type,
        program: str_type,
        total: { type: Number },
      },
    ],
  };

  const OrgRecipientsSchema = mongoose.Schema({
    ...common_recipients_fields,
  });

  model_singleton.define_model("OrgRecipients", OrgRecipientsSchema);

  const { OrgRecipients } = model_singleton.models;

  const loaders = {
    org_recipients_loader: create_resource_by_id_attr_dataloader(
      OrgRecipients,
      "id"
    ),
  };

  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
