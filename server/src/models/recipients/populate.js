import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

const format_year = (year) => _.split(year, "-")[0];

export default async function ({ models }) {
  const { OrgRecipients } = models;

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
        expenditure,
      })
    )
    .value();

  const report_years = _.chain(recipient_rows).map("year").uniq().value();

  const get_general_stats = (recipients) =>
    _.chain(recipients)
      .groupBy("recipient")
      .flatMap((rows, recipient) =>
        _.map(report_years, (year) => ({
          year,
          org_id: rows[0].org_id,
          recipient,
          total: _.reduce(
            _.filter(rows, (row) => row.year === year),
            (sum, row) => sum + _.toNumber(row.expenditure) || 0,
            0
          ),
        }))
      )
      .value();

  const org_summary = _.chain(recipient_rows)
    .groupBy("org_id")
    .flatMap((value, org_id) => {
      return {
        id: org_id,
        recipients: value,
        recipients_general_stats: get_general_stats(value),
      };
    })
    .value();

  return await Promise.all([OrgRecipients.insertMany(org_summary)]);
}
