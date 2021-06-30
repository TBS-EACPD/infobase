import { Story, Meta } from "@storybook/react";
import React from "react";

import { DropdownMenu, DropdownMenuProps } from "./DropdownMenu";

export default {
  title: "Dropdown/DropdownMenu",
  component: DropdownMenu,
} as Meta;

const Template: Story<DropdownMenuProps> = (args) => <DropdownMenu {...args} />;
const dropdown_content = <div>Dropdown Content</div>;

export const Basic = Template.bind({});
Basic.args = {
  // text
  dropdown_content,
  button_description: "Button",
  dropdown_trigger_txt: "Trigger Text",
  dropdown_a11y_txt: "Accessibility Text",

  // css
  opened_button_class_name: "",
  closed_button_class_name: "",
  dropdown_content_class_name: "",
};
