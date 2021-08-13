import { Story, Meta } from "@storybook/react";
import React from "react";

import common_lang from "src/panels/panel_declarations/misc/key_concept_panels/common_questions.yaml";

import { create_text_maker_component } from "src/components/misc_util_components";

import { ComponentProps } from "src/types/util_types.d";

import { StandardFAQ } from "./StandardFAQ";

import common_subapp_lang from "./common_faq_questions.yaml";

import sample_lang from "./StandardFAQ.yaml";

export default {
  title: "StandardFAQ",
  component: StandardFAQ,
} as Meta;

type StandardFAQProps = ComponentProps<typeof StandardFAQ>;

const Template: Story<StandardFAQProps> = (args) => <StandardFAQ {...args} />;

const { TM } = create_text_maker_component([
  sample_lang,
  common_lang,
  common_subapp_lang,
]);

const q_a_keys = ["question1", "question2", "question3"];

export const Basic = Template.bind({});
Basic.args = {
  q_a_base_keys: q_a_keys,
  TM: TM,
};
