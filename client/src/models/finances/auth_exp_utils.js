import _ from "lodash";

import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

const { std_years } = year_templates;

export const PA_AUTH_FIELDS = [
  "pa_last_year_5_auth",
  "pa_last_year_4_auth",
  "pa_last_year_3_auth",
  "pa_last_year_2_auth",
  "pa_last_year_auth",
];

export const PA_EXP_FIELDS = [
  "pa_last_year_5_exp",
  "pa_last_year_4_exp",
  "pa_last_year_3_exp",
  "pa_last_year_2_exp",
  "pa_last_year_exp",
];

export const PA_UNLAPSED_FIELDS = [
  "pa_last_year_5_unlapsed",
  "pa_last_year_4_unlapsed",
  "pa_last_year_3_unlapsed",
  "pa_last_year_2_unlapsed",
  "pa_last_year_unlapsed",
];

export const ESTIMATES_AUTH_FIELD_BY_TEMPLATE = {
  "{{est_last_year_4}}": "est_last_year_4",
  "{{est_last_year_3}}": "est_last_year_3",
  "{{est_last_year_2}}": "est_last_year_2",
  "{{est_last_year}}": "est_last_year",
  "{{est_in_year}}": "est_in_year",
};

export const auth_cols = _.map(std_years, (yr) => `${yr}auth`);
export const exp_cols = _.map(std_years, (yr) => `${yr}exp`);
export const flat_auth_exp_years = _.flatMap(
  ["exp", "auth", "unlapsed"],
  (type) => _.map(std_years, (yr) => `${yr}${type}`)
);

export const filter_org_vote_stat_pa_by_subject = (rows, subject) => {
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

export const get_org_vote_stat_pa_desc = (row) => {
  if (is_stat_vote_stat_pa_row(row)) {
    return row.name;
  }
  if (row.dept_code === "ZGOC") {
    return row.name;
  }
  return `${row.name} - ${row.vote_num}`;
};

export const is_stat_vote_stat_pa_row = (row) => {
  if (row?.vs_type === 999) {
    return true;
  }
  const vote_num = row?.vote_num;
  return vote_num != null && Number.isNaN(Number(vote_num));
};

export const map_org_vote_stat_pa_row_to_table_row = (row) => {
  const table_row = {
    votenum: row.vote_num,
    votestattype: is_stat_vote_stat_pa_row(row) ? 999 : row.vs_type,
    desc: get_org_vote_stat_pa_desc(row),
  };

  std_years.forEach((yr, index) => {
    table_row[`${yr}auth`] = row[PA_AUTH_FIELDS[index]] || 0;
    table_row[`${yr}exp`] = row[PA_EXP_FIELDS[index]] || 0;
    table_row[`${yr}unlapsed`] = row[PA_UNLAPSED_FIELDS[index]] || 0;
  });

  return table_row;
};

export const sum_org_vote_stat_pa_fields = (rows, subject, fields) =>
  _.map(fields, (field) =>
    _.sumBy(filter_org_vote_stat_pa_by_subject(rows, subject), (row) =>
      row?.[field] ? row[field] : 0
    )
  );

export const get_future_auth_year_templates = () => {
  const history_years_written = _.map(std_years, run_template);
  return _.takeRightWhile(
    year_templates.estimates_years,
    (est_year) => !_.includes(history_years_written, run_template(est_year))
  );
};

export const calculate_lapse = (auth, exp, unlapsed, is_pct = false) => {
  const lapse = auth - exp - unlapsed;
  return is_pct ? lapse / auth || 0 : lapse;
};
