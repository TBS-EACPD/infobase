import { Story, Meta } from "@storybook/react";
import React from "react";

import { FancyUL } from "./FancyUL";

export default {
  title: "FancyUL",
  component: FancyUL,
} as Meta;

type FancyULProps = React.ComponentProps<typeof FancyUL>;

const Template: Story<FancyULProps> = (args) => <FancyUL {...args} />;

const children = ["Child 1", "Child 2", "Child 3"];

export const Basic = Template.bind({});
Basic.args = {
  // text
  children,
  title: "Title",

  // css
  className: "",
};
