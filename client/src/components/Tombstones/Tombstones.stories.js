import { useArgs } from "@storybook/client-api";
import React, { Fragment } from "react";

import { Tombstones } from "./Tombstones";

export default {
  title: "Tombstones",
  component: Tombstones,
};

const Template = (args) => {
  return <Tombstones {...args} />;
};

export const UnlabeledTombstone = Template.bind({});
UnlabeledTombstone.args = {
  items: ["Item 1", "Item 2"],
};
