import React from "react";

import { WrappedNivoCircleProportion } from "./WrappedNivoCircleProportion";

export default {
  title: "charts/WrappedNivoCircleProportion",
  component: WrappedNivoCircleProportion,
};

const Template = (args) => <WrappedNivoCircleProportion {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  height: 200,
  is_money: false,
  child_value: 100,
  child_name: "Child",
  parent_value: 500,
  parent_name: "Parent",
};
