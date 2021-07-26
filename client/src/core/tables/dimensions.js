import _ from "lodash";

import * as text_maker from "src/models/text";

export function attach_dimensions(table) {
  table.dimensions = _.concat("all", table.dimensions);
}

export const trivial_dimension = {
  title_key: "all",
  include_in_report_builder: true,
  filter_func: () => () => text_maker("all"),
};
