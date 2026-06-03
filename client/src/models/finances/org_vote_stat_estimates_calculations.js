import { sum } from "d3-array";
import _ from "lodash";

import { estimates_docs } from "src/models/estimates";

import { sum_org_vote_stat_estimates_in_year } from "./finance_utils";
import {
  est_in_year_col,
  filter_org_vote_stat_estimates_by_subject,
  get_est_doc_label,
  get_org_vote_stat_estimate_desc,
  is_stat_estimate_row,
  sum_est_in_year_by_vote_vs_stat,
  sum_est_in_year_for_subject,
} from "./vote_stat_utils";

export function calculate_estimates_in_perspective_from_finance_data(
  subject,
  finance_data
) {
  const dept_tabled_est_in_year = sum_org_vote_stat_estimates_in_year(
    finance_data.org_vote_stat_estimates
  );
  const gov_tabled_est_in_year = sum_org_vote_stat_estimates_in_year(
    finance_data.gov_org_vote_stat_estimates
  );

  if (!dept_tabled_est_in_year) {
    return false;
  }

  return {
    subject,
    gov_tabled_est_in_year,
    dept_tabled_est_in_year,
  };
}

export function calculate_in_year_voted_stat_split_from_finance_data(
  subject,
  finance_data,
  { stat, voted }
) {
  const rows =
    subject.subject_type === "gov"
      ? finance_data.gov_org_vote_stat_estimates
      : finance_data.org_vote_stat_estimates;

  const voted_stat = sum_est_in_year_by_vote_vs_stat(rows, subject, {
    stat,
    voted,
  });
  const vote_stat_est_in_year = [
    { value: voted_stat[stat] || 0, label: stat },
    { value: voted_stat[voted] || 0, label: voted },
  ];
  const stat_est_in_year = vote_stat_est_in_year[0].value;
  const voted_est_in_year = vote_stat_est_in_year[1].value;
  const tabled_est_in_year = sum_est_in_year_for_subject(rows, subject);
  const text_calculations = {
    subject,
    stat_est_in_year,
    voted_est_in_year,
    tabled_est_in_year,
    voted_percent_est_in_year: voted_est_in_year / tabled_est_in_year,
    stat_percent_est_in_year: stat_est_in_year / tabled_est_in_year,
  };

  if (subject.subject_type === "dept") {
    if (
      (stat_est_in_year < 0 && voted_est_in_year >= 0) ||
      (voted_est_in_year < 0 && stat_est_in_year >= 0) ||
      (stat_est_in_year === 0 && voted_est_in_year === 0)
    ) {
      return false;
    }
  }

  return { vote_stat_est_in_year, text_calculations };
}

export function calculate_in_year_estimates_split_from_finance_data(
  subject,
  finance_data
) {
  const rows =
    subject.subject_type === "gov"
      ? finance_data.gov_org_vote_stat_estimates
      : finance_data.org_vote_stat_estimates;

  const filtered = filter_org_vote_stat_estimates_by_subject(rows, subject);

  const in_year_estimates_split = _.chain(filtered)
    .groupBy((row) => get_est_doc_label(row))
    .toPairs()
    .sortBy(
      ([, est_doc_rows]) =>
        estimates_docs[est_doc_rows[0]?.doc]?.order ?? Infinity
    )
    .map(([est_doc, est_doc_rows]) => [
      est_doc,
      sum(est_doc_rows, (row) => row.est_in_year || 0),
    ])
    .filter(([, est_amnt]) => est_amnt !== 0)
    .value();

  const tabled_est_in_year = sum_est_in_year_for_subject(rows, subject);

  if (_.isEmpty(in_year_estimates_split)) {
    return false;
  }

  return {
    subject,
    tabled_est_in_year,
    in_year_estimates_split,
  };
}

export function calculate_in_year_vote_stat_breakdown_from_finance_data(
  vs,
  finance_data,
  { text_maker }
) {
  const rows = finance_data.gov_org_vote_stat_estimates;
  const text = text_maker(vs);
  const is_voted = vs === "voted";

  const all_rows = _.chain(rows)
    .filter((row) =>
      is_voted ? !is_stat_estimate_row(row) : is_stat_estimate_row(row)
    )
    .groupBy("dept_code")
    .flatMap((dept_group, dept) =>
      _.chain(dept_group)
        .groupBy((row) => get_org_vote_stat_estimate_desc(row))
        .map((desc_group, desc) => ({
          dept,
          desc: is_voted ? desc.replace(/-.+$/, "") : desc,
          [est_in_year_col]: _.sumBy(desc_group, (row) => row.est_in_year || 0),
        }))
        .value()
    )
    .sortBy((row) => -row[est_in_year_col])
    .value();

  const data = _.take(all_rows, 10);
  data.push({
    desc: text_maker(`all_other_${vs}_items`),
    others: true,
    [est_in_year_col]: sum(
      _.takeRight(all_rows, all_rows.length - 10),
      (row) => row[est_in_year_col]
    ),
  });

  const voted_stat_totals = sum_est_in_year_by_vote_vs_stat(
    rows,
    { subject_type: "gov" },
    {
      stat: text_maker("stat"),
      voted: text_maker("voted"),
    }
  );

  return {
    data,
    voted_stat_est_in_year: voted_stat_totals[text] || 0,
  };
}
