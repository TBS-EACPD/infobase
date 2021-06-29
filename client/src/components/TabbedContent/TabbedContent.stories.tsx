import { Story, Meta } from "@storybook/react";

import React from "react";

import { TabbedContent } from "./TabbedContent";

export default {
  title: "TabbedContent",
  component: TabbedContent,
} as Meta;

type TabbedContentProps = React.ComponentProps<typeof TabbedContent>;

const Template: Story<TabbedContentProps> = (args) => (
  <TabbedContent {...args} />
);

export const Basic = Template.bind({});
Basic.args = {
  tab_keys: ["NA", "SA", "EU"],
  tab_labels: {
    NA: "North America",
    SA: "South America",
    EU: "Europe",
  },
  tab_pane_contents: {
    NA: <div>Surrounded by the Arctic, Atlantic, and Pacific Oceans </div>,
    SA: <div>Surrounded by the Atlantic and Pacific Oceans</div>,
    EU: <div>Surrounded by the Arctic and Atlantic Oceans</div>,
  },
  disabled_tabs: ["EU"],
  disabled_message: "",
};
