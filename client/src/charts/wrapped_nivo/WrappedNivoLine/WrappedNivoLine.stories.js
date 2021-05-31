import _ from "lodash";
import React from "react";

import { primaryColor } from "src/core/color_defs";
import { newIBCategoryColors } from "src/core/color_schemes";

import { WrappedNivoLine } from "./WrappedNivoLine";

export default {
  title: "charts/WrappedNivoLine",
  component: WrappedNivoLine,
};

const Template = (args) => <WrappedNivoLine {...args} />;

const graph_data = [
  {
    id: "Group 1",
    data: [
      { x: "Year 1", y: 2008 },
      { x: "Year 2", y: 1278 },
      { x: "Year 3", y: 909 },
    ],
  },
  {
    id: "Group 2",
    data: [
      { x: "Year 2", y: 1278 },
      { x: "Year 3", y: 909 },
      { x: "Year 4", y: 2998 },
      { x: "Year 5", y: 1900 },
    ],
  },
  {
    id: "Group 3",
    data: [
      { x: "Year 5", y: 2008 },
      { x: "Year 6", y: 1278 },
    ],
  },
  {
    id: "Group 4",
    data: [
      { x: "Year 3", y: 128 },
      { x: "Year 4", y: 3878 },
      { x: "Year 5", y: 2769 },
      { x: "Year 6", y: 1111 },
    ],
  },
];

const [
  blue,
  teal,
  orange,
  purple,
  light_green,
  dark_teal,
] = newIBCategoryColors;

export const Basic = Template.bind({});
Basic.args = {
  data: graph_data,
  colors: [blue, teal, orange, purple],
  is_money: false,
  remove_left_axis: false,
  remove_bottom_axis: false,
  enableLabel: false,
  enableGridX: true,
  enableGridY: true,
  disable_table_view: false,
  enableSlices: "x",
  pointColor: primaryColor,
  pointSize: 10,
  xScale: { type: "point" },
  yScale: {
    max: 4000,
    min: 0,
    stacked: false,
    toggle: false,
    type: "linear",
    zoomed: false,
  },
};
