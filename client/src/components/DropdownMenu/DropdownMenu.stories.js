import React from "react";

import { DropdownMenu } from "./DropdownMenu";

export default {
  title: "Dropdown/DropdownMenu",
  component: DropdownMenu,
};

const Template = (args) => <DropdownMenu {...args} />;
const dropdown_content = <div>Dropdown Content</div>;

export const Basic = Template.bind({});
Basic.args = {
  // text
  dropdown_content,
  button_description: "Button",
  dropdown_trigger_text: "Trigger Text",
  dropdown_a11y_text: "Accessibility Text",

  // css
  opened_button_class_name: "",
  closed_button_class_name: "",
  dropdown_content_class_name: "",
};
