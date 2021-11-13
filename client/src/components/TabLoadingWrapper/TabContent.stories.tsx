import { Story, Meta } from "@storybook/react";

import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { TabContent } from "./TabContent";

export default {
  title: "TabContent",
  component: TabContent,
} as Meta;

type TabContentProps = ComponentProps<typeof TabContent>;

const Template: Story<TabContentProps> = (args) => <TabContent {...args} />;

const data = "Hello World!";
const args = "";

export const Basic = Template.bind({});
Basic.args = {
  args: args,
  data: data,
};
