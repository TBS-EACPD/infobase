import React from "react";

import { FancyUL } from "./FancyUL";

export default {
  title: "FancyUL",
  component: FancyUL,
};

const Template = (args) => <FancyUL {...args} />;

const children = ["Child 1", "Child 2", "Child 3"];

export const Basic = Template.bind({});
Basic.args = {
  // text
  children,
  title: "Title",
  TitleComponent: "",

  // css
  className: "",
};
