import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React from "react";

import { newIBCategoryColors } from "src/core/color_schemes";

import { WrappedNivoLine } from "./WrappedNivoLine";

export default {
  title: "charts/WrappedNivoLine",
  component: WrappedNivoLine,
};

const Template = (args) => <WrappedNivoLine {...args} />;

const graph_data_basic = [
  {
    id: "Group 1",
    data: [
      { x: "Year 1", y: 3247 },
      { x: "Year 2", y: 2008 },
      { x: "Year 3", y: 2278 },
    ],
  },
  {
    id: "Group 2",
    data: [
      { x: "Year 1", y: 1487 },
      { x: "Year 2", y: 2856 },
      { x: "Year 3", y: 2728 },
      { x: "Year 4", y: 3878 },
      { x: "Year 5", y: 2769 },
      { x: "Year 6", y: 1111 },
    ],
  },
];

const graph_data_overlap = [
  {
    id: "Group 1",
    data: [
      { x: "Year 1", y: 2008 },
      { x: "Year 2", y: 1278 },
      { x: "Year 3", y: 909 },
      { x: "Year 4", y: 925 },
    ],
  },
  {
    id: "Group 2",
    data: [
      { x: "Year 1", y: 3248 },
      { x: "Year 2", y: 1278 },
      { x: "Year 3", y: 909 },
      { x: "Year 4", y: 2998 },
      { x: "Year 5", y: 1367 },
      { x: "Year 6", y: 3432 },
    ],
  },
];

const raw_graph_data = (graph_data) => {
  return _.chain(graph_data)
    .map((row) => _.map(row.data, (point) => point.y))
    .flatten()
    .value();
};

const colors = scaleOrdinal().range(newIBCategoryColors);

const common_args = {
  colors: (d) => colors(d.id),
  is_money: false,
  remove_left_axis: false,
  remove_bottom_axis: false,
  enableLabel: false,
  enableGridX: true,
  enableGridY: true,
  disable_table_view: false,
};

export const Basic = Template.bind({});
export const Overlap = Template.bind({});

Basic.args = {
  ...common_args,
  data: graph_data_basic,
  raw_data: raw_graph_data(graph_data_basic),
};

Overlap.args = {
  ...common_args,
  data: graph_data_overlap,
  raw_data: raw_graph_data(graph_data_overlap),
};
