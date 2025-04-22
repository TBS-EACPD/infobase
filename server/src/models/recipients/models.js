import _ from "lodash";
import mongoose from "mongoose";

import { create_resource_by_foreignkey_attr_dataloader } from "../loader_utils.js";
import { str_type } from "../model_utils.js";
import { make_schema_with_search_terms } from "../search_utils.js";

export default function (model_singleton) {
  const RecipientsSchema = make_schema_with_search_terms({
    id: str_type,
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
  });

  const RecipientsGeneralStatsSchema = mongoose.Schema({
    year: str_type,
    org_id: str_type,
    recipient: str_type,
    total_exp: { type: Number },
    num_transfer_payments: { type: Number },
  });

  model_singleton.define_model("Recipients", RecipientsSchema);
  model_singleton.define_model(
    "RecipientsGeneralStats",
    RecipientsGeneralStatsSchema
  );

  const { Recipients, RecipientsGeneralStats } = model_singleton.models;

  const loaders = {
    recipients_loader: create_resource_by_foreignkey_attr_dataloader(
      Recipients,
      "id"
    ),
    recipients_by_org_id: create_resource_by_foreignkey_attr_dataloader(
      Recipients,
      "org_id"
    ),
    recipients_general_stat_by_org_id:
      create_resource_by_foreignkey_attr_dataloader(
        RecipientsGeneralStats,
        "org_id"
      ),
  };

  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
