import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";
import { year_templates } from "src/models/years";

import { sum_program_spending_col } from "./finance_utils";
import {
  filter_org_transfer_payments_by_subject,
  map_org_transfer_payment_row_to_table_row,
  sum_transfer_payment_exp,
  sum_transfer_payments_grouped_by_type,
  TRANSFER_PAYMENT_EXP_FIELDS,
  transfer_payment_exp_years,
} from "./transfer_payment_utils";

const { std_years } = year_templates;
const { transfer_payments } = businessConstants;

const last_year_exp_field = _.last(TRANSFER_PAYMENT_EXP_FIELDS);
const exp_pa_last_year = "{{pa_last_year}}exp";

export function calculate_gov_historical_g_and_c_from_finance_data(
  finance_data
) {
  const payments = sum_transfer_payments_grouped_by_type(
    finance_data.org_transfer_payments,
    { subject_type: "gov" }
  );

  const five_year_avg =
    (_.sum(payments.c) + _.sum(payments.g) + _.sum(payments.o)) /
    std_years.length;
  const avgs = _.map(payments, (payment, type) => ({
    type,
    value: _.sum(payment) / payment.length,
  }));
  const largest_avg_payment = _.maxBy(avgs, "value");

  return {
    payments,
    five_year_avg,
    largest_avg: largest_avg_payment.value,
    largest_type: transfer_payments[largest_avg_payment.type].text,
  };
}

export function calculate_dept_historical_g_and_c_from_finance_data(
  subject,
  finance_data
) {
  const rolled_up = sum_transfer_payments_grouped_by_type(
    finance_data.org_transfer_payments,
    subject
  );

  const has_transfer_payments = _.chain(rolled_up)
    .values()
    .flatten()
    .some((value) => value !== 0)
    .value();

  if (!has_transfer_payments) {
    return false;
  }

  const five_year_avg =
    (_.sum(rolled_up.c) + _.sum(rolled_up.g) + _.sum(rolled_up.o)) /
    std_years.length;

  const avgs = _.map(rolled_up, (payments, type) => ({
    type,
    value: _.sum(payments) / payments.length,
  }));
  const max_payment = _.maxBy(avgs, "value");
  const rows = _.chain(finance_data.org_transfer_payments)
    .thru((rows) =>
      _.map(
        filter_org_transfer_payments_by_subject(rows, subject),
        map_org_transfer_payment_row_to_table_row
      )
    )
    .sortBy(exp_pa_last_year)
    .reverse()
    .value();

  const tp_average_payments = _.map(
    rows,
    (row) =>
      _.reduce(transfer_payment_exp_years, (sum, year) => sum + row[year], 0) /
      transfer_payment_exp_years.length
  );

  const max_tp_avg = _.max(tp_average_payments);
  const max_tp = rows[_.indexOf(tp_average_payments, max_tp_avg)].tp;

  return {
    rolled_up,
    rows,
    text_calculations: {
      dept: subject,
      five_year_avg,
      max_avg: max_payment.value,
      max_type: transfer_payments[max_payment.type].text,
      max_tp_avg,
      max_tp,
    },
  };
}

export function calculate_last_year_g_and_c_perspective_from_finance_data(
  subject,
  finance_data
) {
  const org_tp = sum_transfer_payment_exp(
    finance_data.org_transfer_payments,
    subject,
    last_year_exp_field
  );
  const gov_tp = sum_transfer_payment_exp(
    finance_data.gov_org_transfer_payments,
    { subject_type: "gov" },
    last_year_exp_field
  );
  const dept_spending = sum_program_spending_col(
    finance_data.program_spending,
    "{{pa_last_year}}"
  );

  return {
    subject,
    gov_tp,
    org_tp,
    dept_spending,
    dept_pct: org_tp / dept_spending,
    total_pct: org_tp / gov_tp,
  };
}
