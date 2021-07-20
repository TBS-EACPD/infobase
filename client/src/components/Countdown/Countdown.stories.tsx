import { Story, Meta } from "@storybook/react";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { Countdown } from "./Countdown";

export default {
  title: "Countdown",
  component: Countdown,
} as Meta;

type CountdownProps = ComponentProps<typeof Countdown>;

const Template: Story<CountdownProps> = (args) => <Countdown {...args} />;

// does not respond to the change in props
export const Basic = Template.bind({});
Basic.args = {
  time: 10,
};
