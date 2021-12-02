import { Story, Meta } from "@storybook/react";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { LeafSpinner } from "./LeafSpinner";

export default {
  title: "LeafSpinner",
  component: LeafSpinner,
} as Meta;

type LeafSpinnerProps = ComponentProps<typeof LeafSpinner>;

const Template: Story<LeafSpinnerProps> = (args) => <LeafSpinner {...args} />;
export const Initial = Template.bind({});
export const Route = Template.bind({});
export const SubRoute = Template.bind({});
export const RelativeSmall = Template.bind({});
export const TabbedContent = Template.bind({});

Route.args = {
  config_name: "route",
};

TabbedContent.args = {
  config_name: "subroute",
};

RelativeSmall.args = {
  config_name: "relative_small",
};
