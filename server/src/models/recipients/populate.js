import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

const no_data_or_na_to_null = (value) =>
  value === "Not Available" || value === null ? "-" : value;

const format_year = (year) => _.split(year, "-")[0];

export default async function ({ models }) {
  const { Recipients, RecipientSummary } = models;

  const raw_recipient_rows = get_standard_csv_file_rows(
    "transfer_payments.csv"
  );

  const recipient_id_by_recipient_name = _.chain(raw_recipient_rows)
    .map("recipient")
    .uniq()
    .map((recipient, index) => [recipient, index])
    .fromPairs()
    .value();

  const recipient_rows = _.map(
    raw_recipient_rows,
    ({
      fyear: year,
      org_id,
      tpname: program,
      recipient,
      city,
      province,
      country,
      expenditure,
    }) => ({
      id: recipient_id_by_recipient_name[recipient],
      year: format_year(year),
      org_id,
      program,
      recipient,
      city: no_data_or_na_to_null(city),
      province: no_data_or_na_to_null(province),
      country: no_data_or_na_to_null(country),
      expenditure: _.toNumber(expenditure) || 0,
    })
  );

  const get_top_ten = (recipients) => {
    const all_recipients = _.chain(recipients)
      .groupBy("recipient")
      .map((rows, recipient) => ({
        recipient,
        total_exp: _.sumBy(rows, "expenditure"),
        num_transfer_payments: rows.length,
        transfer_payments: _.orderBy(rows, "expenditure", "desc"),
      }))
      .orderBy("total_exp", "desc")
      .forEach((item, index) => {
        item.row_id = (index + 1).toString();
      })
      .value();

    const top_ten = _.take(all_recipients, 10);
    const remaining = _.slice(all_recipients, 10);

    if (remaining.length > 0) {
      const other_row = {
        row_id: "11",
        recipient: "All Other Recipients",
        total_exp: _.sumBy(remaining, "total_exp"),
        num_transfer_payments: _.sumBy(remaining, "num_transfer_payments"),
        transfer_payments: _.chain(remaining)
          .flatMap("transfer_payments")
          .orderBy("expenditure", "desc")
          .value(),
      };
      return [...top_ten, other_row];
    } else {
      return top_ten;
    }
  };

  const gov_top_ten = _.chain(recipient_rows)
    .groupBy("year")
    .flatMap((recipients_per_year, year) => ({
      id: "gov",
      year,
      top_ten: get_top_ten(recipients_per_year),
      total_exp: _.sumBy(get_top_ten(recipients_per_year), "total_exp"),
    }))
    .value();

  const org_top_ten = _.chain(recipient_rows)
    .groupBy("org_id")
    .flatMap((recipients_per_org, org_id) =>
      _.chain(recipients_per_org)
        .groupBy("year")
        .flatMap((recipients_per_year, year) => ({
          id: org_id,
          year,
          top_ten: get_top_ten(recipients_per_year),
          total_exp: _.sumBy(get_top_ten(recipients_per_year), "total_exp"),
        }))
        .value()
    )
    .value();

  return await Promise.all([
    Recipients.insertMany(recipient_rows),
    RecipientSummary.insertMany([...gov_top_ten, ...org_top_ten]),
  ]);
}
