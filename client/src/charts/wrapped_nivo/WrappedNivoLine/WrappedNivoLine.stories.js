import _ from "lodash";
import React from "react";

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

const raw_graph_data = _.chain(graph_data)
  .map((row) => _.map(row.data, (point) => point.y))
  .flatten()
  .value();

console.log(raw_graph_data);

const [blue, teal, orange, purple] = newIBCategoryColors;

export const Basic = Template.bind({});
Basic.args = {
  data: graph_data,
  raw_data: raw_graph_data,
  colors: [blue, teal, orange, purple],
  is_money: false,
  remove_left_axis: false,
  remove_bottom_axis: false,
  enableLabel: false,
  enableGridX: true,
  enableGridY: true,
  disable_table_view: false,
};
