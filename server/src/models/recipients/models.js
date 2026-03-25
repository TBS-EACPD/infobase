import DataLoader from "dataloader";
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
    subject_id: str_type,
    year: str_type,
    top_ten: [
      {
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
      "subject_id"
    ),

    // RecipientSummary is very large (embedded transfer payments + other fields).
    // Many GraphQL resolvers ask for a single year, so we must fetch only
    // { subject_id, year } instead of loading all years and filtering in JS.
    //
    // This loader is keyed by `${subject_id}::${year}`.
    recipient_summary_by_subject_year_loader: new DataLoader(
      async (keys) => {
        const parsed = keys.map((key) => {
          const [subject_id, year] = String(key).split("::");
          return { subject_id, year };
        });

        const subject_ids = _.uniq(parsed.map(({ subject_id }) => subject_id));
        const years = _.uniq(parsed.map(({ year }) => year));

        const rows = await RecipientSummary.find(
          {
            subject_id: { $in: subject_ids },
            year: { $in: years },
          },
          {
            _id: 0,
            subject_id: 1,
            year: 1,
            total_exp: 1,
            // Include only the fields requested by GraphQL for RecipientSummary.
            "top_ten.row_id": 1,
            "top_ten.recipient": 1,
            "top_ten.total_exp": 1,
            "top_ten.num_transfer_payments": 1,
            "top_ten.transfer_payments.program": 1,
            "top_ten.transfer_payments.recipient": 1,
            "top_ten.transfer_payments.city": 1,
            "top_ten.transfer_payments.province": 1,
            "top_ten.transfer_payments.country": 1,
            "top_ten.transfer_payments.expenditure": 1,
          }
        )
          .lean()
          .exec();

        const rows_by_key = _.keyBy(
          rows,
          (row) => `${row.subject_id}::${row.year}`
        );

        return keys.map((key) => rows_by_key[key] || null);
      },
      { cache: !!process.env.USE_REMOTE_DB }
    ),

    recipient_years_loader: new DataLoader(
      async (subject_ids) => {
        const ids = _.uniq(subject_ids);
        const rows = await RecipientSummary.find(
          { subject_id: { $in: ids } },
          { subject_id: 1, year: 1, _id: 0 }
        )
          .lean()
          .exec();

        const rows_by_subject_id = _.groupBy(rows, (row) => row.subject_id);
        return _.map(subject_ids, (id) =>
          _.isEmpty(rows_by_subject_id[id]) ? null : rows_by_subject_id[id]
        );
      },
      { cache: !!process.env.USE_REMOTE_DB }
    ),
  };

  _.each(loaders, (val, key) => model_singleton.define_loader(key, val));
}
