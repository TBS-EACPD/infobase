import _ from "lodash";

import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import {
  sum_org_vote_stat_estimates_in_year,
  sum_program_fte_col,
  sum_program_spending_col,
} from "./finance_utils";

const { std_years, planning_years, fte_years } = year_templates;
const exp_cols = _.map(std_years, (yr) => `${yr}exp`);
const actual_history_years = _.map(std_years, run_template);
const actual_history_years_fte = _.map(fte_years, run_template);

function has_hist_data(spending_rows) {
  return _.chain(exp_cols)
    .map((yr) => sum_program_spending_col(spending_rows, yr) || 0)
    .some()
    .value();
}

function has_planning_data(subject, spending_rows) {
  let has_dp;
  switch (subject.subject_type) {
    case "dept":
      has_dp = subject.is_dp_org;
      break;
    case "program":
    case "crso":
      has_dp = subject.dept.is_dp_org;
      break;
    case "gov":
      has_dp = true;
  }

  return (
    has_dp &&
    _.chain(planning_years)
      .map((yr) => sum_program_spending_col(spending_rows, yr) || 0)
      .some()
      .value()
  );
}

function get_calcs(subject, spending_rows, fte_rows) {
  const has_planned = has_planning_data(subject, spending_rows);
  const has_hist = has_hist_data(spending_rows);

  const hist_spend_data = _.map(exp_cols, (col) =>
    sum_program_spending_col(spending_rows, col)
  );
  const planned_spend_data = _.map(planning_years, (col) =>
    sum_program_spending_col(spending_rows, col)
  );
  const spend_data = _.concat(hist_spend_data, planned_spend_data);

  const hist_fte_data = _.map(std_years, (col) =>
    sum_program_fte_col(fte_rows, col)
  );
  const planned_fte_data = _.map(planning_years, (col) =>
    sum_program_fte_col(fte_rows, col)
  );
  const fte_data = _.concat(hist_fte_data, planned_fte_data);

  const has_data = (data) =>
    !(_.isEmpty(data) || _.every(data, (e) => e === 0));
  const has_spending = has_data(spend_data);
  const has_fte = has_data(fte_data);

  const get_non_zero_data_year = (data, years, reverse) => {
    const loop = reverse ? _.forEachRight : _.forEach;
    let matched_data;
    loop(data, (value, key) => {
      if (value > 0) {
        matched_data = {
          year: years[key],
          value: value,
        };
        return false;
      }
    });
    matched_data = matched_data
      ? matched_data
      : {
          year: reverse ? _.last(years) : _.first(years),
          value: 0,
        };
    return matched_data;
  };

  const oldest_hist_spend_data = get_non_zero_data_year(
    hist_spend_data,
    actual_history_years
  );
  const latest_hist_spend_data = get_non_zero_data_year(
    hist_spend_data,
    actual_history_years,
    true
  );

  const spend_latest_year = latest_hist_spend_data.value;
  const spend_plan_1 = _.first(planned_spend_data);
  const spend_plan_3 = _.last(planned_spend_data);

  const latest_year_hist_spend_diff =
    (latest_hist_spend_data.value - oldest_hist_spend_data.value) /
    oldest_hist_spend_data.value;
  const planned_spend_diff =
    (spend_plan_3 - spend_latest_year) / spend_latest_year;

  const fte_oldest_hist_spend_data = get_non_zero_data_year(
    hist_fte_data,
    actual_history_years_fte
  );
  const fte_latest_hist_spend_data = get_non_zero_data_year(
    hist_fte_data,
    actual_history_years_fte,
    true
  );

  const fte_latest_year = fte_latest_hist_spend_data.value;
  const fte_plan_1 = _.first(planned_fte_data);
  const fte_plan_3 = _.last(planned_fte_data);

  const latest_year_hist_fte_diff =
    (fte_latest_hist_spend_data.value - fte_oldest_hist_spend_data.value) /
    fte_oldest_hist_spend_data.value;
  const planned_fte_diff = (fte_plan_3 - fte_latest_year) / fte_latest_year;

  return {
    oldest_hist_spend_data,
    latest_hist_spend_data,
    fte_oldest_hist_spend_data,
    fte_latest_hist_spend_data,
    has_hist,
    has_planned,
    spend_latest_year,
    spend_plan_1,
    spend_plan_3,
    latest_year_hist_spend_diff,
    planned_spend_diff,
    has_spending,
    fte_latest_year,
    fte_plan_1,
    fte_plan_3,
    latest_year_hist_fte_diff,
    planned_fte_diff,
    has_fte,
    fte_data,
  };
}

function calculate_program_or_crso(subject, finance_data) {
  const spending_rows = finance_data.program_spending;
  const fte_rows = finance_data.program_fte;

  const has_planned = has_planning_data(subject, spending_rows);
  const has_hist = has_hist_data(spending_rows);
  const calcs = get_calcs(subject, spending_rows, fte_rows);

  let type;
  if (has_hist && has_planned) {
    type = "hist_planned";
  } else if (has_planned) {
    type = "planned";
  } else if (has_hist) {
    type = "hist";
  } else {
    return false;
  }

  return { type, calcs };
}

function calculate_gov(finance_data) {
  const calcs = get_calcs(
    { subject_type: "gov", has_planned_spending: true },
    finance_data.program_spending,
    finance_data.program_fte
  );

  return {
    type: "hist_planned",
    calcs,
  };
}

function calculate_dept(subject, finance_data) {
  const spending_rows = finance_data.program_spending;
  const fte_rows = finance_data.program_fte;
  const estimates_rows = finance_data.org_vote_stat_estimates;

  const has_planned = has_planning_data(subject, spending_rows);
  const has_hist = has_hist_data(spending_rows);
  const estimates_amt = sum_org_vote_stat_estimates_in_year(estimates_rows);
  const calcs = get_calcs(subject, spending_rows, fte_rows);

  if (!(has_planned || has_hist)) {
    if (estimates_amt) {
      return {
        type: "estimates",
        calcs: Object.assign({}, calcs, {
          spend_plan_1: estimates_amt,
        }),
      };
    } else {
      return false;
    }
  }

  if (!subject.is_dp_org) {
    const proper_calcs = Object.assign({}, calcs, {
      spend_plan_1: estimates_amt,
    });
    return {
      type: "hist_estimates",
      calcs: proper_calcs,
    };
  }

  const type =
    has_hist && has_planned
      ? "hist_planned"
      : (has_hist && "hist") || (has_planned && "planned");

  return (
    type && {
      type,
      calcs,
    }
  );
}

export function calculate_welcome_mat_from_finance_data(subject, finance_data) {
  switch (subject.subject_type) {
    case "gov":
      return calculate_gov(finance_data);
    case "dept":
      return calculate_dept(subject, finance_data);
    case "program":
    case "crso":
      return calculate_program_or_crso(subject, finance_data);
    default:
      return false;
  }
}
