import _ from "lodash";
import React from "react";

import { CountdownCircle } from "./CountdownCircle.js";

export default {
  title: "CountdownCircle",
  component: CountdownCircle,
};

// not sure if the component works or not
const Template = (args) => <CountdownCircle {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  time: 10000,
  size: "20em",
};
