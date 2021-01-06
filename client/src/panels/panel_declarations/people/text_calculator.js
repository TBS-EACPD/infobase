import { run_template, year_templates } from "../shared.js";
const { people_years } = year_templates;

export const text_calculate = (all_data, custom_group_pop = null) => {
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

  const top_group_avg_pct = _.chain(all_data)
    .map((group) =>
      !custom_group_pop
        ? group.five_year_percent
        : _.sum(group.data) / custom_group_pop
    )
    .max()
    .value();
  const top_group = _.chain(all_data)
    .find((group) =>
      !custom_group_pop
        ? group.five_year_percent === top_group_avg_pct
        : _.sum(group.data) / custom_group_pop === top_group_avg_pct
    )
    .thru(
      (group) =>
        group && (lang === "en" ? group.label.replace("Age ", "") : group.label)
    )
    .value();

  const bottom_group_avg_pct = _.chain(all_data)
    .map((group) =>
      !custom_group_pop
        ? group.five_year_percent
        : _.sum(group.data) / custom_group_pop
    )
    .min()
    .value();
  const bottom_group = _.chain(all_data)
    .find((group) =>
      !custom_group_pop
        ? group.five_year_percent === bottom_group_avg_pct
        : _.sum(group.data) / custom_group_pop === bottom_group_avg_pct
    )
    .thru(
      (group) =>
        group && (lang === "en" ? group.label.replace("Age ", "") : group.label)
    )
    .value();

  return {
    first_active_year_index,
    last_active_year_index,
    first_active_year,
    last_active_year,
    top_group_avg_pct,
    top_group,
    bottom_group_avg_pct,
    bottom_group,
  };
};
