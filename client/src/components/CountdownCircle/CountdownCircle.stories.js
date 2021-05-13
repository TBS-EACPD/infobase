import React from "react";

import { CountdownCircle } from "./CountdownCircle.js";

export default {
  title: "CountdownCircle",
  component: CountdownCircle,
};

const Template = (args) => <CountdownCircle {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  time: 10000,
  size: "20em",
  color: "blue",
  stroke_width: "1em",
  show_numbers: true,
  on_end_callback: "",
};
