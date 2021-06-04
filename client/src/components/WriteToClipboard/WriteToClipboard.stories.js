import React from "react";

import { WriteToClipboard } from "./WriteToClipboard";

export default {
  title: "WriteToClipboard",
  component: WriteToClipboard,
  argTypes: {
    IconComponent: {
      control: "",
    },
  },
};

const Template = (props) => {
  return <WriteToClipboard {...props} />;
};

export const Basic = Template.bind({});
Basic.args = {
  text_to_copy: "",
  button_class_name: "",
  button_description: "",
  icon_color: "",
};
