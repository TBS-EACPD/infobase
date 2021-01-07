import { run_template, year_templates } from "../shared.js";
const { people_years } = year_templates;

export const text_calculate = (all_data, custom_group_pop = null) => {
  const [first_active_year_index, last_active_year_index] = _.chain(all_data)
    .map("data")
    .thru((data_by_group) => _.zip(...data_by_group))
    .map(_.sum)
    .thru((totals_by_year) => [
      _.findIndex(totals_by_year, (total) => total !== 0),
      _.findLastIndex(totals_by_year, (total) => total !== 0),
    ])
    .value();

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
    .get("label")
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
    .get("label")
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
