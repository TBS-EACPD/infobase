import _ from "lodash";
import React from "react";

import { SortDirection } from "./SortDirection";

export default {
  title: "SortDirection",
  component: SortDirection,
};

const Template = (args) => <SortDirection {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  className: "",
  style: {},
  active: true,
  sortDirection: "",
};
