import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";
import { year_templates } from "src/models/years";

const { std_years } = year_templates;
const { transfer_payments } = businessConstants;

export const TRANSFER_PAYMENT_EXP_FIELDS = [
  "pa_last_year_5_exp",
  "pa_last_year_4_exp",
  "pa_last_year_3_exp",
  "pa_last_year_2_exp",
  "pa_last_year_1_exp",
];

export const transfer_payment_exp_years = _.map(std_years, (yr) => `${yr}exp`);

export const filter_org_transfer_payments_by_subject = (rows, subject) => {
  switch (subject?.subject_type) {
    case "gov":
      return rows || [];
    case "dept": {
      const scoped_rows = rows || [];
      if (_.every(scoped_rows, (row) => row.dept_code == null)) {
        return scoped_rows;
      }
      return _.filter(
        scoped_rows,
        (row) => row.dept_code == (subject.dept_code ?? subject.id)
      );
    }
    default:
      return [];
  }
};

export const map_org_transfer_payment_row_to_table_row = (row) => {
  const type_id = row.type;
  const table_row = {
    type_id,
    type: transfer_payments[type_id]?.text ?? type_id,
    tp: row.name,
  };

  std_years.forEach((yr, index) => {
    table_row[`${yr}exp`] = row[TRANSFER_PAYMENT_EXP_FIELDS[index]] || 0;
    table_row[yr] = row[TRANSFER_PAYMENT_EXP_FIELDS[index]] || 0;
  });

  return table_row;
};

export const sum_transfer_payments_grouped_by_type = (rows, subject) => {
  const filtered = filter_org_transfer_payments_by_subject(rows, subject);

  return _.chain(filtered)
    .groupBy("type")
    .mapValues((group) =>
      TRANSFER_PAYMENT_EXP_FIELDS.map((field) =>
        _.sumBy(group, (row) => row[field] || 0)
      )
    )
    .value();
};

export const sum_transfer_payment_exp = (rows, subject, field) =>
  _.sumBy(filter_org_transfer_payments_by_subject(rows, subject), (row) =>
    row?.[field] ? row[field] : 0
  );
