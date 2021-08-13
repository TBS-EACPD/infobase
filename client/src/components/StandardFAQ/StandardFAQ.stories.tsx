import { Story, Meta } from "@storybook/react";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { StandardFAQ } from "./StandardFAQ";

export default {
  title: "StandardFAQ",
  component: StandardFAQ,
} as Meta;

type StandardFAQProps = ComponentProps<typeof StandardFAQ>;

const Template: Story<StandardFAQProps> = (args) => <StandardFAQ {...args} />;

const q_a_keys = ["question1", "question2", "question3"];

export const Basic = Template.bind({});
Basic.args = {
  rendered_q_a_keys: q_a_keys,
};
