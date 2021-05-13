import React from "react";

import { ModalButton } from "./ModalButton.js";

export default {
  title: "ModalButton",
  component: ModalButton,
};

const Template = (args) => <ModalButton {...args} />;

const children = <div>Body</div>;

export const Basic = Template.bind({});
Basic.args = {
  children,
  button_text: "Button Text",
  show_modal: true,
  title: "Title",
};
