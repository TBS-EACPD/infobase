import _ from "lodash";

import { run_template, year_templates } from "../shared.js";

const { people_years } = year_templates;

export const calculate_common_text_args = (
  all_data,
  alternate_five_year_total = false
) => {
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

  const group_avg_shares = _.chain(all_data)
    .map(({ label, five_year_percent, data }) => [
      label,
      !alternate_five_year_total
        ? five_year_percent
        : _.sum(data) / alternate_five_year_total,
    ])
    .sortBy(([_label, group_avg_share]) => group_avg_share)
    .value();

  const [top_avg_group, top_avg_group_share] = _.last(group_avg_shares);
  const [bottom_avg_group, bottom_avg_group_share] = _.first(group_avg_shares);

  return {
    first_active_year_index,
    last_active_year_index,
    first_active_year,
    last_active_year,
    top_avg_group,
    top_avg_group_share,
    bottom_avg_group,
    bottom_avg_group_share,
  };
};
