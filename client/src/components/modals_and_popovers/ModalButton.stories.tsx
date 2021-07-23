import { Story, Meta } from "@storybook/react";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { ModalButton } from "./ModalButton";

export default {
  title: "modals and popovers/ModalButton",
  component: ModalButton,
} as Meta;

type ModalButtonProps = ComponentProps<typeof ModalButton>;

const Template: Story<ModalButtonProps> = (args) => <ModalButton {...args} />;

const children = <div>Body</div>;

export const Basic = Template.bind({});
Basic.args = {
  children,
  button_text: "Button Text",
  title: "Title",
};
