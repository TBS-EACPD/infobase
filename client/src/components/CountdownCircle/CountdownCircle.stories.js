import React from "react";

import { CountdownCircle } from "./CountdownCircle";

export default {
  title: "CountdownCircle",
  component: CountdownCircle,
  argTypes: {
    on_end_callback: { time: 20000 },
  },
};

const Template = (args) => {
  return <CountdownCircle {...args} />;
};

export const Basic = Template.bind({});
Basic.args = {
  time: 10000,
  size: "20em",
  color: "blue",
  stroke_width: "1em",
  show_numbers: true,
};
