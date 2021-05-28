import React from "react";

import { StatelessModal } from "./StatelessModal";

export default {
  title: "modals and popovers/StatlelessModal",
  component: StatelessModal,
};

const Template = (args) => <StatelessModal {...args} />;

const body =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export const Basic = Template.bind({});
Basic.args = {
  show: true,
  title: "Title",
  subtitle: "Subtitle",
  body,
  close_text: "Close",
  close_button_in_header: false,
  additional_diolog_class: "",
};

export const HeaderOptions = Template.bind({});
HeaderOptions.args = {
  show: true,
  header: "Header",
  footer: "Footer",
  body,
  additional_diolog_class: "",
};
