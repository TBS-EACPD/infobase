import { useArgs } from "@storybook/client-api";
import { Story, Meta } from "@storybook/react";
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
} as Meta;

type SelectProps = React.ComponentProps<typeof Select>;

const Template: Story<SelectProps> = (args) => {
  const [_, updateArgs] = useArgs();
  function onSelect(value: string) {
    updateArgs({ ...args, selected: value });
    console.log("Option " + value + " has been chosen. ");
  }

  return <Select {...args} onSelect={onSelect} />;
};

export const Basic = Template.bind({});
Basic.args = {
  id: "1",
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
