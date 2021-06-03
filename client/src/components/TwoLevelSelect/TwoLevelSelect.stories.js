import React, { useState } from "react";

import { TwoLevelSelect } from "./TwoLevelSelect";

export default {
  title: "Input/TwoLevelSelect",
  component: TwoLevelSelect,
};

const Template = (args) => {
  // I don't think the initial value of selected matters
  const [selected, setSelected] = useState("0");

  function onSelect(value) {
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
