import _ from "lodash";
import React from "react";

import { Select } from "./Select.js";

export default {
  title: "Select",
  component: Select,
};

const Template = (args) => <Select {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  className: "",
  options: [
    {
      id: 1,
      display: "Option 1",
    },
    {
      id: 2,
      display: "Option 2",
    },
  ],
  selected: 0,
  disabled: false,
  style: {},
  title: "",
};
