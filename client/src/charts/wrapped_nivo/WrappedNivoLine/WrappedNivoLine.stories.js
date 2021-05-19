import _ from "lodash";
import React from "react";

import { create_text_maker, run_template } from "src/models/text";

import { year_templates } from "src/models/years";

import { formats } from "src/core/format";

import { WrappedNivoLine } from "./WrappedNivoLine";

import text from "./WrappedNivoLine.yaml";
const { text_maker, TM } = create_text_maker(text);

export default {
  title: "charts/WrappedNivoLine",
  component: WrappedNivoLine,
};

const Template = (args) => <WrappedNivoLine {...args} />;

// Working on parameters
// const { people_years } = year_templates;

// const series = _.chain(data)
//   .filter(({ label }) => _.includes(selected, label))
//   .map(({ label, data }) => [label, data])
//   .fromPairs()
//   .value();

// const testData = ["label1", "label2", "label3", "label4", "label5"];
// const ticks = _.map(people_years, (y) => `${run_template(y)}`);

// const graph_options = {
//   ticks: ticks,
//   y_axis: text_maker("employees"),
//   formatter: formats.big_int_raw,
// },

// const selected = _.chain(props.data)
// .filter(({ active }) => _.isUndefined(active) || active)
// .map(({ label }) => label)
// .value(),

// const data_formatter_line = _.map(series, (data_array, data_label) => ({
//   id: data_label,
//   data: _.map(data_array, (spending_value, tick_index) => ({
//     x: graph_options.ticks[tick_index],
//     y: spending_value,
//   })),
// }));

// const data = _.map(testData, (label, index) => ({}));

export const Basic = Template.bind({});
Basic.args = {
  // data: data_formatter_line,
  margin: {
    top: 30,
    right: 20,
    bottom: 65,
    left: 65,
  },
  bttm_axis: {
    tickSize: 3,
    tickRotation: -45,
    tickPadding: 10,
  },
};
