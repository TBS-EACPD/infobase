import { Story, Meta } from "@storybook/react";
import React from "react";

import common_lang from "src/panels/panel_declarations/misc/key_concept_panels/common_questions.yaml";

import { ComponentProps } from "src/types/util_types.d";

import { faq_content_maker } from "./faq_utils";
import { StandardFAQ } from "./StandardFAQ";

import common_subapp_lang from "./common_faq_questions.yaml";
import sample_lang from "./StandardFAQ.yaml";

export default {
  title: "StandardFAQ",
  component: StandardFAQ,
} as Meta;

type StandardFAQProps = ComponentProps<typeof StandardFAQ>;

const Template: Story<StandardFAQProps> = (args) => <StandardFAQ {...args} />;

const q_a_keys = ["question1", "question2", "question3"];

const faq_content = faq_content_maker(
  { bundles: [sample_lang, common_lang, common_subapp_lang] },
  q_a_keys
);

export const Basic = Template.bind({});
Basic.args = {
  faq_content: faq_content,
};
