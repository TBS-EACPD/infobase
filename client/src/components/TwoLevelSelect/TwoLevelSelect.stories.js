import React from "react";

import { TwoLevelSelect } from "./TwoLevelSelect";

export default {
  title: "TwoLevelSelect",
  component: TwoLevelSelect,
};

const Template = (args) => <TwoLevelSelect {...args} />;

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
  // selected,
  className: "",
  grouped_options,
  // onSelect,
  disabled: false,
};
