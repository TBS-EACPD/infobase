import { Story, Meta } from "@storybook/react";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { FAQPanel } from "./FAQPanel";

export default {
  title: "FAQPanel",
  component: FAQPanel,
} as Meta;

type FAQPanelProps = ComponentProps<typeof FAQPanel>;

const Template: Story<FAQPanelProps> = (args) => <FAQPanel {...args} />;

const q_a_keys = ["question1", "question2", "question3"];

export const Basic = Template.bind({});
Basic.args = {
  rendered_q_a_keys: q_a_keys,
};
