import { Story, Meta } from "@storybook/react";
import React from "react";

import { Countdown, CountdownProps } from "./Countdown";

export default {
  title: "Countdown",
  component: Countdown,
} as Meta;

const Template: Story<CountdownProps> = (args) => <Countdown {...args} />;

// does not respond to the change in props
export const Basic = Template.bind({});
Basic.args = {
  time: 10,
};
