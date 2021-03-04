import { run_template } from "src/models/text.js";

import { formats } from "src/core/format.js";

import { text_maker } from "../partition_text_provider.js";

const get_common_popup_options = (d) => {
  return {
    year: run_template("{{pa_last_year}}"),
    up_to: false,
    exp: d.exp,
    exp_is_negative: d.exp < 0,
    fte: d.fte,
    org_info: d.org_info,
    name: d.data.name,
    tags: d.data.tags,
    level: d.data.level,
    id: d.data.id,
    color: d.color,
    first_column: d.depth === 1,
    focus_text: d.magnified
      ? text_maker("partition_unfocus_button")
      : text_maker("partition_focus_button"),
  };
};

const wrap_in_brackets = (text) => " (" + text + ")";

const { compact1, big_int } = formats;

const formats_by_data_type = {
  exp: compact1,
  fte: big_int,
  estimates: compact1,
  org_info: big_int,
};

const data_types = [
  {
    id: "exp",
    name: text_maker("partition_spending_data"),
  },
  {
    id: "fte",
    name: text_maker("fte_written"),
  },
  {
    id: "estimates",
    name: text_maker("partition_estimates_spending_data"),
  },
  {
    id: "org_info",
    name: text_maker("orgs"),
  },
];
const remapped_data_types = {
  planned_exp: "estimates",
};

export {
  get_common_popup_options,
  wrap_in_brackets,
  formats_by_data_type,
  data_types,
  remapped_data_types,
};
