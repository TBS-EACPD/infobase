import _ from "lodash";
import mongoose from "mongoose";

import {
  create_resource_by_id_attr_dataloader,
  create_resource_by_foreignkey_attr_dataloader,
} from "../loader_utils.js";
import { number_type, pkey_type, str_type } from "../model_utils.js";

export default function (model_singleton) {
  const common_fields = {
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
  };

  const common_recipient_fields = {
    id: pkey_type(),
    recipient_overview: [
      {
        year: str_type,
        total_tf_exp: number_type,
      },
    ],
    recipient_exp_summary: [
      {
        year: str_type,
        recipient: str_type,
        total_exp: number_type,
        num_transfer_payments: number_type,
        programs: [str_type],
        transfer_payments: [common_fields],
      },
    ],
    recipient_location: [
      {
        year: str_type,
        qc: number_type,
        nb: number_type,
        bc: number_type,
        on: number_type,
        ns: number_type,
        mb: number_type,
        nl: number_type,
        nu: number_type,
        na: number_type,
        pe: number_type,
        nt: number_type,
        yt: number_type,
        abroad: number_type,
        sk: number_type,
        ab: number_type,
      },
    ],
  };

  const RecipientsSchema = mongoose.Schema({
    ...common_fields,
  });

  const GovRecipientSummarySchema = mongoose.Schema({
    ...common_recipient_fields,
  });

  const OrgRecipientSummarySchema = mongoose.Schema({
    ...common_recipient_fields,
  });

  model_singleton.define_model("Recipients", RecipientsSchema);
  model_singleton.define_model(
    "GovRecipientSummary",
    GovRecipientSummarySchema
  );
  model_singleton.define_model(
    "OrgRecipientSummary",
    OrgRecipientSummarySchema
  );

  const { Recipients, GovRecipientSummary, OrgRecipientSummary } =
    model_singleton.models;

  const loaders = {
    recipients_loader: create_resource_by_foreignkey_attr_dataloader(
      Recipients,
      "id"
    ),
    recipients_by_org_id: create_resource_by_foreignkey_attr_dataloader(
      Recipients,
      "org_id"
    ),
    gov_recipient_summary_loader: create_resource_by_id_attr_dataloader(
      GovRecipientSummary,
      "id"
    ),
    org_recipient_summary_loader: create_resource_by_id_attr_dataloader(
      OrgRecipientSummary,
      "id"
    ),
  };

  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
