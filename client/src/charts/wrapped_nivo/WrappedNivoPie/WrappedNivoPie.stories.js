import _ from "lodash";
import React from "react";

import { WrappedNivoPie } from "./WrappedNivoPie";

export default {
  title: "charts/WrappedNivoPie",
  component: WrappedNivoPie,
};

const Template = (args) => <WrappedNivoPie {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  title: "WrappedNivoPie",
};
