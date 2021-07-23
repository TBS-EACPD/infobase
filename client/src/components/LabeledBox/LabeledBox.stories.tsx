import { Story, Meta } from "@storybook/react";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { LabeledBox } from "./LabeledBox";

export default {
  title: "LabeledBox",
  component: LabeledBox,
} as Meta;

type LabeledBoxProps = ComponentProps<typeof LabeledBox>;

const Template: Story<LabeledBoxProps> = (args) => <LabeledBox {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  label: "Label",
  children: "Children",
};
