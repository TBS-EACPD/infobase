import { Story, Meta } from "@storybook/react";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { UnlabeledTombstone, LabeledTombstone } from "./Tombstones";

export default {
  title: "Tombstones",
  component: UnlabeledTombstone,
} as Meta;

type UnlabeledTombstoneProps = ComponentProps<typeof UnlabeledTombstone>;

const UnlabeledTemplate: Story<UnlabeledTombstoneProps> = (args) => {
  return <UnlabeledTombstone {...args} />;
};

export const UnlabeledTombstones = UnlabeledTemplate.bind({});
UnlabeledTombstones.args = {
  items: ["Item 1", "Item 2"],
};

type LabeledTombstoneProps = ComponentProps<typeof LabeledTombstone>;

const LabeledTemplate: Story<LabeledTombstoneProps> = (args) => {
  return <LabeledTombstone {...args} />;
};

export const LabeledTombstones = LabeledTemplate.bind({});
LabeledTombstones.args = {
  labels_and_items: [
    ["Label 1", "Item 1"],
    ["Label 2", "Item 2"],
  ],
};
