import React from "react";

import { Countdown } from "./Countdown";

export default {
  title: "Countdown",
  component: Countdown,
};

const Template = (args) => <Countdown {...args} />;

// does not respond to the change in props
export const Basic = Template.bind({});
Basic.args = {
  time: 10,
};
