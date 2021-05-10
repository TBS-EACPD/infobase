import _ from "lodash";
import React from "react";

import { FixedPopover } from "./FixedPopover.js";

export default {
  title: "FixedPopover",
  component: FixedPopover,
};

const Template = (args) => <FixedPopover {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  show: true,

  // text
  title: "Title",
  body: "Body",
  header: "Header",
  subtitle: "Subtitle",
  footer: "Footer",

  // booleans
  restore_focus: false,
  close_button_in_header: false,
  close_text: false,

  // dimensions
  max_body_height: "3em",

  // css
  dialog_position: "",
  additional_dialog_position: "",

  // clock
  auto_close_time: 1000,
};
