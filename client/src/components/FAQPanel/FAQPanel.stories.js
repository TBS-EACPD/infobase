import React from "react";

import { secondaryColor } from "src/core/color_defs";

import { FAQPanel } from "./FAQPanel";

export default {
  title: "FAQPanel",
  component: FAQPanel,
};

const Template = (args) => <FAQPanel {...args} />;

const q_a_keys = ["question1", "question2", "question3"];

export const Basic = Template.bind({});
Basic.args = {
  rendered_q_a_keys: q_a_keys,
  is_initially_expanded: false,
  background_color: secondaryColor,
};
