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

const graph_data_total = _.sumBy(graph_data, function (o) {
  return o.value;
});

const graph_data = [
  {
    dept: "000",
    desc: "Group 1",
    id: 0,
    total: graph_data_total,
    total_of: "idk",
    value: 32432432,
  },
  {
    dept: "001",
    desc: "Group 2",
    id: 0,
    total: graph_data_total,
    total_of: "idk",
    value: 908432,
  },
];

const d3_scale = scaleOrdinal(newIBLightCategoryColors);
const color_scale = (vs) =>
  function (d) {
    return d3_scale(text_func(vs, d, ""));
  };

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
  label_id: "id",
};
