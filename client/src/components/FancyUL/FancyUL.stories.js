import React from "react";

import { FancyUL } from "./FancyUL.tsx";

export default {
  title: "FancyUL",
  component: FancyUL,
};

const Template = (args) => <FancyUL {...args} />;

const children = <div>Children</div>;

export const Basic = Template.bind({});
Basic.args = {
  // text
  children,
  title: "Title",
  TitleComponent: "",

  // css
  className: "",
};
