import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React from "react";

import { newIBLightCategoryColors } from "src/core/color_schemes";
import { formats } from "src/core/format";

import { WrappedNivoTreemap } from "./WrappedNivoTreemap";

export default {
  title: "charts/WrappedNivoTreemap",
  component: WrappedNivoTreemap,
};

const graph_data_values = [
  32432432,
  8324234,
  9456354,
  5795646,
  23746845,
  8723476,
  23435435,
  324323,
];

const graph_data_total_amt = _.sum(graph_data_values);

const graph_data = {
  children: [
    {
      desc: "Description 1",
      id: 0,
      total: graph_data_total_amt,
      value: graph_data_values[0],
    },
    {
      desc: "Description 2",
      id: 1,
      total: graph_data_total_amt,
      value: graph_data_values[1],
    },
    {
      desc: "Description 3",
      id: 2,
      total: graph_data_total_amt,
      value: graph_data_values[2],
    },
    {
      desc: "Description 4",
      id: 3,
      total: graph_data_total_amt,
      value: graph_data_values[3],
    },
    {
      desc: "Description 5",
      id: 4,
      total: graph_data_total_amt,
      value: graph_data_values[4],
    },
    {
      desc: "Description 6",
      id: 5,
      total: graph_data_total_amt,
      value: graph_data_values[5],
    },
    {
      desc: "Description 7",
      id: 6,
      total: graph_data_total_amt,
      value: graph_data_values[6],
    },
    {
      desc: "Description 8",
      id: 7,
      total: graph_data_total_amt,
      value: graph_data_values[7],
    },
  ],
  color: "white",
  name: "root",
};

const sorted_children = _.reverse(
  _.sortBy(graph_data.children, function (o) {
    return o.value;
  })
);

const domain = [];
_.forEach(sorted_children, function (child) {
  _.concat(domain, child.value);
});

const scale = scaleOrdinal().domain(domain).range(newIBLightCategoryColors);

const color_scale = (data) => {
  return scale(data.value);
};

const Template = (args) => <WrappedNivoTreemap {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  data: graph_data,
  colorScale: color_scale,
  formatter: formats.compact1,
  label_id: "desc",
};
