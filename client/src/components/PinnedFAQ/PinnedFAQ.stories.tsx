import { Story, Meta } from "@storybook/react";
import React from "react";

import common_lang from "src/panels/panel_declarations/misc/key_concept_panels/common_questions.yaml";

import { ComponentProps } from "src/types/util_types.d";

import { qa_pairs_maker } from "./faq_utils";
import { PinnedFAQ } from "./PinnedFAQ";

import common_subapp_lang from "./common_faq_questions.yaml";
import sample_lang from "./PinnedFAQ.yaml";

export default {
  title: "PinnedFAQ",
  component: PinnedFAQ,
} as Meta;

type PinnedFAQProps = ComponentProps<typeof PinnedFAQ>;

const Template: Story<PinnedFAQProps> = (args) => <PinnedFAQ {...args} />;

const q_a_keys = ["question1", "question2", "question3"];

const question_answer_pairs = qa_pairs_maker(
  { bundles: [sample_lang, common_lang, common_subapp_lang] },
  q_a_keys
);

export const Basic = Template.bind({});
Basic.args = {
  question_answer_pairs: question_answer_pairs,
};
