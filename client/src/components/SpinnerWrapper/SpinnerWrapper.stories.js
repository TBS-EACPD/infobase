import React from "react";

import { SpinnerWrapper } from "./SpinnerWrapper.js";

export default {
  title: "SpinnerWrapper",
  component: SpinnerWrapper,
};

const Template = (args) => <SpinnerWrapper {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  scale: 1,
  config_name: "",
  use_leaf_spinner: true,
};
