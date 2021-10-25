import { Story, Meta } from "@storybook/react";
import React from "react";

import { ComponentProps } from "src/types/util_types.d";

import { ModalButtonWithRouter } from "./ModalButtonWithRouter";

export default {
  title: "modals and popovers/ModalButtonWithRouter",
  component: ModalButtonWithRouter,
} as Meta;

type ModalButtonWithRouterProps = ComponentProps<typeof ModalButtonWithRouter>;

const Template: Story<ModalButtonWithRouterProps> = (args) => (
  <ModalButtonWithRouter {...args} />
);

const children = <div>Body</div>;

export const Basic = Template.bind({});
Basic.args = {
  children,
  button_text: "Button Text",
  title: "Title",
};
