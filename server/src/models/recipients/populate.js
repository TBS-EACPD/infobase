import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

const format_year = (year) => _.split(year, "-")[0];

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
        country,
        expenditure: _.toNumber(expenditure) || 0,
      })
    )
    .forEach((item, index) => {
      item.id = (index + 1).toString();
    })
    .value();

  const most_recent_submission_year = _.chain(recipient_rows)
    .map("year")
    .uniq()
    .sort()
    .last()
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
        year: year,
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
          }))
          .value()
      )
      .value();

  const gov_summary = [
    {
      id: "gov",
      recipient_overview: get_recipient_overview(recipient_rows),
      recipient_exp_summary: get_recipient_summary(recipient_rows),
    },
  ];

  const org_summary = _.chain(recipient_rows)
    .groupBy("org_id")
    .flatMap((recipients, org_id) => ({
      id: org_id,
      recipient_overview: get_recipient_overview(recipients),
      recipient_exp_summary: get_recipient_summary(recipients),
    }))
    .value();

  return await Promise.all([
    Recipients.insertMany(recipient_rows),
    RecipientsGeneralStats.insertMany(general_stats),
    GovRecipientSummary.insertMany(gov_summary),
    OrgRecipientSummary.insertMany(org_summary),
  ]);
}
