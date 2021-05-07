import _ from "lodash";
import React from "react";

import { Countdown } from "./Countdown.js";

export default {
  title: "Countdown",
  component: Countdown,
};

// not sure if the component works or not
const Template = (args) => <Countdown {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  time: 10,
};
