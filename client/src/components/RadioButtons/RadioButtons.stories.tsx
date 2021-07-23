import { Story, Meta } from "@storybook/react";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { RadioButtons } from "./RadioButtons";

export default {
  title: "Input/RadioButton",
  component: RadioButtons,
} as Meta;

type RadioButtonsProps = ComponentProps<typeof RadioButtons>;

// TODO Implement the props in more completeness
const Template: Story<RadioButtonsProps> = (args) => <RadioButtons {...args} />;

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
