import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React from "react";

import {
  primaryColor,
  secondaryColor,
  tertiaryColor,
} from "src/core/color_defs";
import { newIBCategoryColors } from "src/core/color_schemes";

// eslint-disable-next-line no-restricted-imports
import { infobase_colors_smart } from "../wrapped_nivo_common";

import { NivoLineBarToggle } from "./NivoLineBarToggle";

export default {
  title: "charts/NivoLineBarToggle",
  component: NivoLineBarToggle,
};

const Template = (args) => <NivoLineBarToggle {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  legend_title: "Legend Title",
  bar: true,
  graph_options: {
    ticks: ["10", "20", "30", "40", "50", "60", "70", "80", "90", "100"],
    y_axis: "y-axis",
  },
  // get_colors: () =>
  //   infobase_colors_smart(scaleOrdinal().range(newIBCategoryColors)),
  // colors: [primaryColor, secondaryColor, tertiaryColor],
  // get_colors: () => [primaryColor, secondaryColor, tertiaryColor],
  initial_graph_mode: "bar_grouped",
  data: [],
  disable_toggle: false,
  legend_col_full_size: 4,
  graph_col_full_size: 8,
  legend_class: false,
  graph_col_class: false,
};
