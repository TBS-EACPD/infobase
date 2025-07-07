import _ from "lodash";
import mongoose from "mongoose";

import { create_resource_by_foreignkey_attr_dataloader } from "../loader_utils.js";
import { number_type, str_type } from "../model_utils.js";

export default function (model_singleton) {
  const common_fields = {
    id: number_type,
    year: str_type,
    org_id: str_type,
    program: str_type,
    recipient: str_type,
    city: str_type,
    province: str_type,
    country: str_type,
    expenditure: number_type,
  };

  const RecipientsSchema = mongoose.Schema({
    ...common_fields,
  });

  const RecipientSummarySchema = mongoose.Schema({
    id: str_type,
    year: str_type,
    top_ten: [
      {
        index: str_type,
        row_id: str_type,
        recipient: str_type,
        total_exp: number_type,
        num_transfer_payments: number_type,
        transfer_payments: [common_fields],
      },
    ],
    total_exp: number_type,
  });

  model_singleton.define_model("Recipients", RecipientsSchema);
  model_singleton.define_model("RecipientSummary", RecipientSummarySchema);

  const { Recipients, RecipientSummary } = model_singleton.models;

  const loaders = {
    recipients_loader: create_resource_by_foreignkey_attr_dataloader(
      Recipients,
      "id"
    ),
    recipients_by_org_id: create_resource_by_foreignkey_attr_dataloader(
      Recipients,
      "org_id"
    ),
    recipient_summary_loader: create_resource_by_foreignkey_attr_dataloader(
      RecipientSummary,
      "id"
    ),
  };

  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
