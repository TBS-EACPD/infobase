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
  const {
    Recipients,
    RecipientsGeneralStats,
    GovRecipientSummary,
    OrgRecipientSummary,
  } = models;

  const raw_recipient_rows = get_standard_csv_file_rows(
    "transfer_payments.csv"
  );

  const igoc_rows = get_standard_csv_file_rows("igoc.csv");

  const org_id_by_dept_name = _.chain(igoc_rows)
    .map(({ org_id, legal_title_en }) => [legal_title_en, org_id])
    .fromPairs()
    .value();

  const recipient_rows = _.chain(raw_recipient_rows)
    .map(
      ({
        fyear: year,
        department,
        transfer_payment: program,
        record_type,
        recipient,
        city,
        province,
        country,
        expenditure,
      }) => ({
        year: format_year(year),
        department,
        org_id: org_id_by_dept_name[department],
        program,
        record_type,
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

  const grouped_stats = _.chain(recipient_rows)
    .groupBy("year")
    .mapValues((years) =>
      _.chain(years)
        .groupBy("org_id")
        .mapValues((orgs) =>
          _.chain(orgs)
            .groupBy("recipient")
            .mapValues((recipient_rows) => ({
              recipient: recipient_rows[0].recipient,
              total_exp: _.sumBy(recipient_rows, "expenditure"),
              num_transfer_payments: _.uniqBy(recipient_rows, "program").length,
              programs: _.uniq(_.map(recipient_rows, "program")),
            }))
            .value()
        )
        .value()
    )
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

  const general_stats = _.flatMap(grouped_stats, (orgs, year) =>
    _.flatMap(orgs, (recipients, org_id) =>
      _.map(recipients, (summary) => ({
        year,
        org_id,
        recipient: summary.recipient,
        total_exp: summary.total_exp,
        num_transfer_payments: summary.num_transfer_payments,
      }))
    )
  );

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

  const gov_summary = [
    {
      id: "gov",
      recipient_overview: get_recipient_overview(recipient_rows),
      recipient_exp_summary: get_recipient_summary(recipient_rows),
      recipient_location: get_recipient_location_summary(recipient_rows),
    },
  ];

  const org_summary = _.chain(recipient_rows)
    .groupBy("org_id")
    .flatMap((recipients, org_id) => ({
      id: org_id,
      recipient_overview: get_recipient_overview(recipients),
      recipient_exp_summary: get_recipient_summary(recipients),
      recipient_location: get_recipient_location_summary(recipients),
    }))
    .value();

  return await Promise.all([
    Recipients.insertMany(recipient_rows),
    RecipientsGeneralStats.insertMany(general_stats),
    GovRecipientSummary.insertMany(gov_summary),
    OrgRecipientSummary.insertMany(org_summary),
  ]);
}
