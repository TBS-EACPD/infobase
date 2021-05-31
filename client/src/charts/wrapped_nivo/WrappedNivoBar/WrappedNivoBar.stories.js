import _ from "lodash";
import React from "react";

import { newIBCategoryColors } from "src/core/color_schemes";

import {
  WrappedNivoBar,
  WrappedNivoHBar,
} from "src/charts/wrapped_nivo/WrappedNivoBar/wrapped_nivo_bar";

export default {
  title: "charts/WrappedNivoBar",
  component: WrappedNivoBar,
};

const Template = (args) => <WrappedNivoBar {...args} />;
const HTemplate = (args) => <WrappedNivoHBar {...args} />;

const graph_data = [
  {
    "Group 1": 1997,
    "Group 2": 3407,
    index_key: "Year 1",
  },
  {
    "Group 1": 1098,
    "Group 2": 4004,
    index_key: "Year 2",
  },
  {
    "Group 1": 3677,
    "Group 2": 2050,
    index_key: "Year 3",
  },
];

const graph_keys = _.chain(graph_data).first().omit("index_key").keys().value();

const [blue, teal] = newIBCategoryColors;

export const NivoBar = Template.bind({});
NivoBar.args = {
  data: graph_data,
  keys: graph_keys,
  indexBy: "index_key",
  colors: [blue, teal],
  is_money: false,
  remove_left_axis: false,
  remove_bottom_axis: false,
  enableLabel: false,
  enableGridX: true,
  enableGridY: true,
  disable_table_view: false,
};

export const NivoHBar = HTemplate.bind({});
NivoHBar.args = {
  data: graph_data,
  keys: graph_keys,
  indexBy: "index_key",
  colors: [blue, teal],
  is_money: false,
  remove_left_axis: false,
  remove_bottom_axis: false,
  enableLabel: false,
  enableGridX: true,
  enableGridY: true,
  disable_table_view: false,
};
