import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

const no_data_or_na_to_null = (value) =>
  value === "Not Available" || value === null ? "-" : value;

export default async function ({ models }) {
  const { Recipients, RecipientSummary, RecipientDetails } = models;

  const raw_recipient_rows = get_standard_csv_file_rows(
    "transfer_payment_recipients.csv"
  );

  const recipient_rows = _.chain(raw_recipient_rows)
    .map(
      ({
        year,
        org_id,
        transfer_payment_en,
        transfer_payment_fr,
        recipient,
        city_en,
        city_fr,
        province_en,
        province_fr,
        country_en,
        country_fr,
        expenditure,
      }) => ({
        year,
        org_id,
        transfer_payment_en,
        transfer_payment_fr,
        recipient,
        city_en: no_data_or_na_to_null(city_en),
        city_fr: no_data_or_na_to_null(city_fr),
        province_en: no_data_or_na_to_null(province_en),
        province_fr: no_data_or_na_to_null(province_fr),
        country_en: no_data_or_na_to_null(country_en),
        country_fr: no_data_or_na_to_null(country_fr),
        expenditure: _.toNumber(expenditure) || 0,
      })
    )
    .forEach((item, index) => {
      item.id = (index + 1).toString();
    })
    .value();

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
      subject_id: "gov",
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
          subject_id: org_id,
          year,
          top_ten: get_top_ten(recipients_per_year),
          total_exp: _.sumBy(get_top_ten(recipients_per_year), "total_exp"),
        }))
        .value()
    )
    .value();

  const get_details = (data) =>
    _.flatMap(data, ({ subject_id, top_ten = [] }) =>
      _.flatMap(top_ten, ({ row_id, transfer_payments = [] }) =>
        transfer_payments.map(
          ({
            id,
            year,
            org_id,
            transfer_payment_en,
            transfer_payment_fr,
            recipient,
            city_en,
            city_fr,
            province_en,
            province_fr,
            country_en,
            country_fr,
            expenditure,
          }) => ({
            subject_id,
            row_id,
            id,
            year,
            recipient,
            org_id,
            transfer_payment_en,
            transfer_payment_fr,
            city_en,
            city_fr,
            province_en,
            province_fr,
            country_en,
            country_fr,
            expenditure,
          })
        )
      )
    );

  const get_summary = (data) =>
    data.map((item) => ({
      ...item,
      top_ten: item.top_ten.map(({ transfer_payments, ...rest }) => rest),
    }));

  return await Promise.all([
    Recipients.insertMany(recipient_rows),
    RecipientSummary.insertMany([
      ...get_summary(gov_top_ten),
      ...get_summary(org_top_ten),
    ]),
    RecipientDetails.insertMany([
      ...get_details(gov_top_ten),
      ...get_details(org_top_ten),
    ]),
  ]);
}
