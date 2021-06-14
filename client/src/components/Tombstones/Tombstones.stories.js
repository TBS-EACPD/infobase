import React from "react";

import { UnlabeledTombstone, LabeledTombstone } from "./Tombstones";

export default {
  title: "Tombstones",
  component: UnlabeledTombstone,
};

const UnlabeledTemplate = (args) => {
  return <UnlabeledTombstone {...args} />;
};

export const UnlabeledTombstones = UnlabeledTemplate.bind({});
UnlabeledTombstones.args = {
  items: ["Item 1", "Item 2"],
};

const LabeledTemplate = (args) => {
  return <LabeledTombstone {...args} />;
};

export const LabeledTombstones = LabeledTemplate.bind({});
LabeledTombstones.args = {
  labels_and_items: [
    ["Label 1", "Item 1"],
    ["Label 2", "Item 2"],
  ],
};
