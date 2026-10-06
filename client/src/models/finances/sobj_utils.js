import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";

import { compact_finance_rows } from "./finance_utils";

const { sos } = businessConstants;

export const ORG_SOBJ_STD_YEAR_FIELDS = [
  "pa_last_year_5",
  "pa_last_year_4",
  "pa_last_year_3",
  "pa_last_year_2",
  "pa_last_year_1",
];

export const get_sobj_label = (so_num) => sos[so_num]?.text ?? String(so_num);

export const filter_org_sobjs_by_subject = (rows, subject) => {
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

export const sum_org_sobjs_grouped_by_so_num = (rows, subject, field) =>
  _.chain(filter_org_sobjs_by_subject(rows, subject))
    .groupBy("so_num")
    .mapValues((group) => _.sumBy(group, (row) => row[field] || 0))
    .value();

export const sum_org_sobjs_for_so_num = (rows, subject, so_num, field) =>
  sum_org_sobjs_grouped_by_so_num(rows, subject, field)[so_num] || 0;

const is_revenue = (so_num) => +so_num > 19;

export const program_sobj_rows_to_rev_split = (rows) => {
  const compact_rows = compact_finance_rows(rows);
  const [neg_exp, gross_exp] = _.chain(compact_rows)
    .partition((row) => is_revenue(row.so_num))
    .map((group) => _.sumBy(group, (row) => row.pa_last_year || 0))
    .value();
  const net_exp = gross_exp + neg_exp;
  if (neg_exp === 0) {
    return false;
  }
  return { neg_exp, gross_exp, net_exp };
};

export const program_sobjs_to_rows_by_so = (rows, { filter_fn } = {}) => {
  const compact_rows = compact_finance_rows(rows);
  if (_.isEmpty(compact_rows)) {
    return [];
  }

  return _.chain(compact_rows)
    .groupBy("so_num")
    .map((group, so_num) => ({
      label: get_sobj_label(+so_num),
      so_num: +so_num,
      value: _.sumBy(group, (row) => row.pa_last_year || 0),
    }))
    .filter(filter_fn || (() => true))
    .sortBy((row) => -row.value)
    .value();
};
