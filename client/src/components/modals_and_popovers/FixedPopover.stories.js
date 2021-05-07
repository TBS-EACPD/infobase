import _ from "lodash";
import React from "react";

import { FixedPopover } from "./FixedPopover.js";

export default {
  title: "FixedPopover",
  component: FixedPopover,
};

// not sure if the component works or not
const Template = (args) => <FixedPopover {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  title: "Title",
  show: true,
  body: "Body",
  header: "Header",
  subtitle: "Subtitle",
  footer: "footer",
  restore_focus: false,
  max_body_height: "3em",
  close_button_in_header: true,
  close_text: false,
};
