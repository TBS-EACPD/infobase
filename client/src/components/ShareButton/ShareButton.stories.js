import React from "react";

import { ShareButton } from "./ShareButton.js";

export default {
  title: "ShareButton",
  component: ShareButton,
};

const Template = (args) => <ShareButton {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  url: "",
  button_class_name: "",
  title: "Title",
  button_description: "",
  icon_color: "black",
  icon_alternate_color: "",
  icon_size: "2em",
};
