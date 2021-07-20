import { Story, Meta } from "@storybook/react";
import React, { useState } from "react";

import { ComponentProps } from "src/types/util_types.d";

import { TwoLevelSelect } from "./TwoLevelSelect";

export default {
  title: "Input/TwoLevelSelect",
  component: TwoLevelSelect,
} as Meta;

type TwoSelectProps = ComponentProps<typeof TwoLevelSelect>;

const Template: Story<TwoSelectProps> = (args) => {
  const [selected, setSelected] = useState("");

  function onSelect(value: string) {
    console.log(value + " has been chosen.");
    setSelected(value);
  }

  return <TwoLevelSelect {...args} onSelect={onSelect} />;
};

const grouped_options = [
  {
    children: [
      {
        display: "Option 1",
        id: "Label 1 Option 1",
      },
      {
        display: "Option 2",
        id: "Label 1 Option 2",
      },
    ],
    display: "Label1",
    id: "Label 1",
  },
  {
    children: [
      {
        display: "Option 1",
        id: "Label 2 Option 1",
      },
      {
        display: "Option 2",
        id: "Label 2 Option 2",
      },
    ],
    display: "Label2",
    id: "Label 2",
  },
];

export const Basic = Template.bind({});
Basic.args = {
  style: {},
  id: "",
  className: "",
  grouped_options,
  disabled: false,
};
