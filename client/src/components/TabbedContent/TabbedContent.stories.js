import React from "react";

import { TabbedContent } from "./TabbedContent";

export default {
  title: "TabbedContent",
  component: TabbedContent,
};

const Template = (args) => <TabbedContent {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  tab_keys: ["NA", "SA", "EU"],
  tab_labels: {
    NA: "North America",
    SA: "South America",
    EU: "Europe",
  },
  tab_pane_contents: {
    NA: "Surrounded by the Arctic, Atlantic, and Pacific Oceans",
    SA: "Surrounded by the Atlantic and Pacific Oceans",
    EU: "Surrounded by the Arctic and Atlantic Oceans",
  },
  disabled_tabs: "EU",
  disabled_message: "",
};
