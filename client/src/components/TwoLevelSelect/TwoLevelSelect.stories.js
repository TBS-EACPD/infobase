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
    setSelected(value);
  }

  return <TwoLevelSelect {...args} {...onSelect} />;
};

const grouped_options = [
  {
    children: [
      {
        display: "Option 1",
        id: "option11",
      },
      {
        display: "Option 2",
        id: "option12",
      },
    ],
    display: "Label1",
    id: "label_id1",
  },
  {
    children: [
      {
        display: "Option 1",
        id: "option21",
      },
      {
        display: "Option 2",
        id: "option22",
      },
    ],
    display: "Label2",
    id: "label_id2",
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
