import React from "react";

import { CircleProportionGraph } from "./CircleProportionGraph";

export default {
  title: "charts/CircleProportionGraph",
  component: CircleProportionGraph,
};

const common_args = {
  height: 200,
  is_money: false,
  child_name: "Child",
  parent_value: 506,
  parent_name: "Parent",
};

const Template = (args) => <CircleProportionGraph {...args} />;

export const Basic = Template.bind({});
export const SmallChild = Template.bind({});

Basic.args = {
  ...common_args,
  child_value: 117,
};

SmallChild.args = {
  ...common_args,
  child_value: 1,
};
