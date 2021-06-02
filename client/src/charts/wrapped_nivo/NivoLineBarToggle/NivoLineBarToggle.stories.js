import { scaleOrdinal } from "d3-scale";
import React from "react";

import { newIBCategoryColors } from "src/core/color_schemes";

import { infobase_colors_smart } from "src/charts/wrapped_nivo/wrapped_nivo_common";

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
    ticks: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
    y_axis: "y-axis",
  },
  get_colors: () =>
    infobase_colors_smart(scaleOrdinal().range(newIBCategoryColors)),
  initial_graph_mode: "bar_grouped",
  data: [
    {
      active: true,
      data: [1001, 2003, 1998, 347, 800],
      label: "Group 1",
    },
    {
      active: true,
      data: [609, 343, 888, 2456, 2232],
      label: "Group 2",
    },
    {
      active: true,
      data: [2000, 3000, 3333, 778, 1500],
      label: "Group 3",
    },
    {
      active: true,
      data: [900, 877, 2009, 2700, 777],
      label: "Group 4",
    },
  ],
  disable_toggle: false,
  legend_col_full_size: 4,
  graph_col_full_size: 8,
};
