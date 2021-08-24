import { Story, Meta } from "@storybook/react";
import React from "react";

import { create_text_maker_component } from "src/components/misc_util_components";

import { ComponentProps } from "src/types/util_types.d";

import { PinnedFAQ } from "./PinnedFAQ";

export default {
  title: "PinnedFAQ",
  component: PinnedFAQ,
} as Meta;

const sample_faq = {
  question1_q: { en: "Question 1?" },
  question1_a: { en: "Answer 1" },
  question2_q: { en: "Question 2?" },
  question2_a: { en: "Answer 2" },
  question3_q: { en: "Question 3?" },
  question3_a: { en: "Answer 3" },
};

type PinnedFAQProps = ComponentProps<typeof PinnedFAQ>;

const Template: Story<PinnedFAQProps> = (args) => <PinnedFAQ {...args} />;

const q_a_key_pairs = [
  ["question1_q", "question1_a"],
  ["question2_q", "question2_a"],
  ["question3_q", "question3_a"],
];
const { TM } = create_text_maker_component([sample_faq]);

export const Basic = Template.bind({});
Basic.args = {
  q_a_key_pairs: q_a_key_pairs,
  TM: TM,
};
