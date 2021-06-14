import React from "react";

import { LabeledBox } from "./LabeledBox";

export default {
  title: "LabeledBox",
  component: LabeledBox,
};

const Template = (args) => <LabeledBox {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  label: "Label",
  children: "Children",
};
