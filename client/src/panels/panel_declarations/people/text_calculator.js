import _ from "lodash";
import { run_template, year_templates } from "../shared.js";
const { people_years } = year_templates;

export const text_calculate = (all_data) => {
  const group_data = _.map(all_data, (group) => group.data);
  const group_data_by_year = _.zip(...group_data);
  const group_data_sums_by_year = _.map(group_data_by_year, (year_group) =>
    _.sum(year_group)
  );
  const first_active_year_index = _.findIndex(
    group_data_by_year,
    (year_group) => year_group !== 0
  );
  const last_active_year_index = _.findLastIndex(
    group_data_sums_by_year,
    (year_group) => year_group !== 0
  );

  const first_active_year = run_template(
    `${people_years[first_active_year_index]}`
  );
  const last_active_year = run_template(
    `${people_years[last_active_year_index]}`
  );

  const top_group_pct = _.chain(all_data)
    .map((group) => group.five_year_percent)
    .max()
    .value();
  const top_group = _.chain(all_data)
    .find((group) => group.five_year_percent === top_group_pct)
    .thru((group) =>
      lang === "en" ? group.label.replace("Age ", "") : group.label
    )
    .value();

  return {
    first_active_year,
    last_active_year,
    top_group_pct,
    top_group,
  };
};
