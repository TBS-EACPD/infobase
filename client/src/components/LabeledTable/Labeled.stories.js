import React from "react";

import { LabeledTable } from "./LabeledTable";

export default {
  title: "LabeledTable",
  component: LabeledTable,
};

const Template = (args) => <LabeledTable {...args} />;

export const Basic = Template.bind({});
Basic.args = {};
