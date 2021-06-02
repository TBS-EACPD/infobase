import { useArgs } from "@storybook/client-api";
import React from "react";

import { Select } from "./Select";

export default {
  title: "Input/Select",
  component: Select,
  argTypes: {
    selected: {
      defaultValue: "",
    },
  },
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();
  function onSelect(value) {
    updateArgs({ ...args, selected: value });
    console.log("Option " + value + " has been chosen. ");
  }

  return <Select {...args} onSelect={onSelect} />;
};

export const Basic = Template.bind({});
Basic.args = {
  id: 1,
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
  disabled: false,
  style: {},
  title: "Hi",
};
