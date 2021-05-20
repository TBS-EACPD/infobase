import React from "react";

import { RadioButtons } from "./RadioButtons";

export default {
  title: "Input/RadioButton",
  component: RadioButtons,
};

const Template = (args) => <RadioButtons {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  options: [
    {
      display: "Option 1",
      id: "1",
      active: false,
    },
    {
      display: "Option 2",
      id: "2",
      active: false,
    },
  ],
};
