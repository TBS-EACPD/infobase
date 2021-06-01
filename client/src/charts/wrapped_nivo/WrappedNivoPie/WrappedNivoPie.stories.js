import React from "react";

import { newIBCategoryColors } from "src/core/color_schemes";

import { WrappedNivoPie } from "./WrappedNivoPie";

export default {
  title: "charts/WrappedNivoPie",
  component: WrappedNivoPie,
};

const graph_data = [
  {
    id: "Group 1",
    label: "Group 1",
    value: 32432084,
  },
  {
    id: "Group 2",
    label: "Group 2",
    value: 934234,
  },
  {
    id: "Group 3",
    label: "Group 3",
    value: 5573653,
  },
  {
    id: "Group 4",
    label: "Group 4",
    value: 7436534,
  },
  {
    id: "Group 5",
    label: "Group 5",
    value: 2348634,
  },
];

const [blue, teal, orange, purple, light_green] = newIBCategoryColors;

const Template = (args) => <WrappedNivoPie {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  data: graph_data,
  colors: [blue, teal, orange, purple, light_green],
  disable_table_view: false,
  display_horizontal: true,
  show_legend: true,
  sort_legend: false,
  include_percent: true,
  is_money: false,
};
