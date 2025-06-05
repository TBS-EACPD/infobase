import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

import { provinces_def } from "./constants.js";

const format_year = (year) => _.split(year, "-")[0];

const format_country = (country) => {
  if (_.isEmpty(country)) {
    return "Not Available";
  } else if (country === "Canada") {
    return country;
  } else {
    return "Abroad";
  }
};

const format_province = (province) => {
  if (_.isEmpty(province)) {
    return "na";
  } else if (_.isEmpty(provinces_def[province])) {
    return "abroad";
  } else {
    return provinces_def[province];
  }
};

export default async function ({ models }) {
  const { Recipients, GovRecipientSummary, OrgRecipientSummary } = models;

  const raw_recipient_rows = get_standard_csv_file_rows(
    "transfer_payments.csv"
  );

  const recipient_rows = _.chain(raw_recipient_rows)
    .map(
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
        year: format_year(year),
        org_id,
        program,
        recipient,
        city,
        province,
        country: format_country(country),
        expenditure: _.toNumber(expenditure) || 0,
      })
    )
    .forEach((item, index) => {
      item.id = (index + 1).toString();
    })
    .value();

  const get_recipient_location_summary = (recipients) =>
    _.chain(recipients)
      .map(({ province, country, ...other_fields }) => ({
        province: format_province(province),
        country: format_country(country),
        ...other_fields,
      }))
      .groupBy("year")
      .map((recipients_grouped_by_year, year) => ({
        year,
        ..._.chain(recipients_grouped_by_year)
          .groupBy("province")
          .map((value, key) => [key, _.sumBy(value, "expenditure")])
          .fromPairs()
          .value(),
      }))
      .value();

  const get_recipient_overview = (recipients) =>
    _.chain(recipients)
      .groupBy("year")
      .map((recipients_grouped_by_year, year) => ({
        year,
        total_tf_exp: _.sumBy(recipients_grouped_by_year, "expenditure"),
      }))
      .value();

  const get_recipient_summary = (recipients) =>
    _.chain(recipients)
      .groupBy("year")
      .flatMap((recipients_by_year, year) =>
        _.chain(recipients_by_year)
          .groupBy("recipient")
          .flatMap((recipient_rows, recipient) => ({
            year,
            recipient,
            total_exp: _.sumBy(recipient_rows, "expenditure"),
            num_transfer_payments: _.uniqBy(recipient_rows, "program").length,
            transfer_payments: recipient_rows,
          }))
          .orderBy("total_exp", "desc")
          .take(10)
          .value()
      )
      .value();

  const get_report_years = (recipients) =>
    _.chain(recipients).map("year").uniq().value();

  const gov_summary = [
    {
      id: "gov",
      report_years: get_report_years(recipient_rows),
      recipient_overview: get_recipient_overview(recipient_rows),
      recipient_exp_summary: get_recipient_summary(recipient_rows),
      recipient_location: get_recipient_location_summary(recipient_rows),
    },
  ];

  const org_summary = _.chain(recipient_rows)
    .groupBy("org_id")
    .flatMap((recipients, org_id) => ({
      id: org_id,
      report_years: get_report_years(recipients),
      recipient_overview: get_recipient_overview(recipients),
      recipient_exp_summary: get_recipient_summary(recipients),
      recipient_location: get_recipient_location_summary(recipients),
    }))
    .value();

  return await Promise.all([
    Recipients.insertMany(recipient_rows),
    GovRecipientSummary.insertMany(gov_summary),
    OrgRecipientSummary.insertMany(org_summary),
  ]);
}
