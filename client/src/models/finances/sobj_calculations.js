import { sum } from "d3-array";
import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";
import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import {
  ORG_SOBJ_STD_YEAR_FIELDS,
  program_sobj_rows_to_rev_split,
  program_sobjs_to_rows_by_so,
  sum_org_sobjs_for_so_num,
  sum_org_sobjs_grouped_by_so_num,
} from "./sobj_utils";

const { sos } = businessConstants;
const { std_years } = year_templates;

const is_non_revenue = (row) => +row.so_num < 19;

export function calculate_personnel_spend_from_finance_data(finance_data) {
  const rows = finance_data.org_sobjs;
  const personnel_so_num = sos[1].so_num;

  const series = _.map(ORG_SOBJ_STD_YEAR_FIELDS, (field) =>
    sum_org_sobjs_for_so_num(
      rows,
      { subject_type: "gov" },
      personnel_so_num,
      field
    )
  );

  const five_year_avg = _.sum(series) / series.length;
  const year_value_pairs = _.map(std_years, (year, index) => [
    run_template(year),
    series[index],
  ]);
  const sorted_pairs = _.sortBy(year_value_pairs, _.last);
  const [max_year, max_spend] = _.last(sorted_pairs);
  const [min_year, min_spend] = _.first(sorted_pairs);

  return {
    series,
    text_calculations: {
      five_year_avg,
      max_spend,
      max_year,
      min_spend,
      min_year,
    },
  };
}

export function calculate_spend_by_so_hist_from_finance_data(
  subject,
  finance_data
) {
  const rows = finance_data.org_sobjs;

  const data = _.chain(sos)
    .sortBy((sobj) => sobj.so_num)
    .map((sobj) => ({
      label: sobj.text,
      data: ORG_SOBJ_STD_YEAR_FIELDS.map((field) =>
        sum_org_sobjs_for_so_num(rows, subject, sobj.so_num, field)
      ),
    }))
    .filter((row) => sum(row.data))
    .value();

  if (_.isEmpty(data)) {
    return false;
  }

  const avg_data = _.map(
    data,
    (object) => _.sum(object.data) / object.data.length
  );
  const max_avg = _.max(avg_data);
  const max_index = avg_data.indexOf(max_avg);

  return {
    data,
    text_calculations: {
      subject,
      max_avg,
      max_share: data[max_index].label,
      five_year_avg_spending: _.sum(avg_data),
    },
  };
}

export function calculate_dept_spend_rev_split_from_finance_data(
  subject,
  finance_data
) {
  const last_year_field = _.last(ORG_SOBJ_STD_YEAR_FIELDS);
  const last_year_spend = sum_org_sobjs_grouped_by_so_num(
    finance_data.org_sobjs,
    subject,
    last_year_field
  );

  const last_year_rev = (last_year_spend[22] || 0) + (last_year_spend[21] || 0);
  if (last_year_rev === 0) {
    return false;
  }

  const minus_last_year_rev = -last_year_rev;
  const last_year_gross_exp = _.sum(
    _.map(_.range(1, 13), (i) => last_year_spend[i] || 0)
  );
  const last_year_net_exp = last_year_gross_exp - minus_last_year_rev;

  return {
    text_calculations: {
      subject,
      last_year_rev,
      minus_last_year_rev,
      last_year_gross_exp,
      last_year_net_exp,
    },
  };
}

export function calculate_program_spend_rev_split_from_finance_data(
  subject,
  finance_data
) {
  const rev_split = program_sobj_rows_to_rev_split(finance_data.program_sobjs);
  if (!rev_split || rev_split.neg_exp === 0) {
    return false;
  }

  return {
    text_calculations: {
      subject,
      last_year_rev: rev_split.neg_exp,
      minus_last_year_rev: -rev_split.neg_exp,
      last_year_gross_exp: rev_split.gross_exp,
      last_year_net_exp: rev_split.net_exp,
    },
  };
}

export function calculate_top_spending_areas_from_finance_data(
  subject,
  finance_data
) {
  const rows_by_so = _.filter(
    program_sobjs_to_rows_by_so(finance_data.program_sobjs, {
      filter_fn: is_non_revenue,
    }),
    (row) => row.value
  );

  if (_.isEmpty(rows_by_so)) {
    return false;
  }

  const total_spent = _.sumBy(rows_by_so, "value");
  const top_so = _.maxBy(rows_by_so, "value");
  const low_so = _.minBy(rows_by_so, "value");

  return {
    rows_by_so,
    text_calculations: {
      subject,
      top_so_name: top_so.label,
      top_so_value: top_so.value,
      low_so_name: low_so.label,
      low_so_value: low_so.value,
      total_spent,
    },
  };
}
