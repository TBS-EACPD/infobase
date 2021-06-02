import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React from "react";

import { Subject } from "src/models/subject";

import { newIBLightCategoryColors } from "src/core/color_schemes";
import { formats } from "src/core/format";

import { WrappedNivoTreemap } from "./WrappedNivoTreemap";

export default {
  title: "charts/WrappedNivoTreemap",
  component: WrappedNivoTreemap,
};

const graph_data_values = [
  32432432,
  2324234,
  6456354,
  3456456,
  23746845,
  8723476,
];

const graph_data_total_amt = _.sum(graph_data_values);

const graph_data = {
  children: [
    {
      dept: "124",
      desc: "Description 1",
      id: 0,
      total: graph_data_total_amt,
      total_of: "Group 1",
      value: graph_data_values[0],
    },
    {
      dept: "124",
      desc: "Description 2",
      id: 1,
      total: graph_data_total_amt,
      total_of: "Group 2",
      value: graph_data_values[1],
    },
    {
      dept: "128",
      desc: "Description 3",
      id: 2,
      total: graph_data_total_amt,
      total_of: "Group 2",
      value: graph_data_values[2],
    },
    {
      dept: "128",
      desc: "Description 4",
      id: 3,
      total: graph_data_total_amt,
      total_of: "Group 1",
      value: graph_data_values[3],
    },
    {
      dept: "128",
      desc: "Description 5",
      id: 4,
      total: graph_data_total_amt,
      total_of: "Group 1",
      value: graph_data_values[4],
    },
    {
      dept: "128",
      desc: "Description 6",
      id: 5,
      total: graph_data_total_amt,
      total_of: "Group 1",
      value: graph_data_values[5],
    },
  ],
  color: "white",
  name: "root",
};

const d3_scale = scaleOrdinal(newIBLightCategoryColors);
const color_scale = (vs) =>
  function (d) {
    return d3_scale(text_func(vs, d, ""));
  };
// const scale = scaleOrdinal()
//   .domain(
//     _.reverse(
//       _.sortBy(graph_data.children, function (o) {
//         return o.value;
//       })
//     )
//   )
//   .range(newIBLightCategoryColors);
// const color_scale = (item) =>
//   function (o) {
//     return scale(o);
//   };

const { Dept } = Subject;

const text_func = (vs, d, break_str) => {
  if (vs == "voted") {
    return d.dept
      ? `${Dept.lookup(d.dept).name} ${break_str}  ${d.desc}`
      : d.desc;
  } else {
    return d.dept
      ? `${d.desc} ${break_str} ${Dept.lookup(d.dept).name}`
      : d.desc;
  }
};

const Template = (args) => <WrappedNivoTreemap {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  data: graph_data,
  colorScale: color_scale,
  value_string: "value",
  formatter: formats.compact1,
  label_id: "desc",
};
