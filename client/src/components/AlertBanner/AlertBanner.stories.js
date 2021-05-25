import React from "react";

import { AlertBanner } from "./AlertBanner";

export default {
  title: "AlertBanner",
  component: AlertBanner,
};

const Template = (args) => <AlertBanner {...args} />;

const children =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export const Basic = Template.bind({});
Basic.args = {
  // text
  children,

  // css
  banner_class: "",
  additional_banner_class: "",
  style: {},
};
