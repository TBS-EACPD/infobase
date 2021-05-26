import _ from "lodash";
import React from "react";

import { TM } from "src/components/index";

import { KeyConceptList } from "./KeyConceptList";

export default {
  title: "KeyConceptList",
  component: KeyConceptList,
};

const Template = (args) => <KeyConceptList {...args} />;

const question_answer_pairs = _.map(
  [
    "MtoM_tag_warning_reporting_level",
    "MtoM_tag_warning_resource_splitting",
    "MtoM_tag_warning_double_counting",
  ],
  (key) => [
    <TM key={key + "_q"} k={key + "_q"} />,
    <TM key={key + "_a"} k={key + "_a"} />,
  ]
);

export const Basic = Template.bind({});
Basic.args = {
  question_answer_pairs,
  compact: true,
};
