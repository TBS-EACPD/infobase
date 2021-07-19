import { Story, Meta } from "@storybook/react";
import React from "react";

import { ModalButton } from "./ModalButton";

export default {
  title: "modals and popovers/ModalButton",
  component: ModalButton,
} as Meta;

type ComponentProps<T> = T extends
  | React.ComponentType<infer P>
  | React.Component<infer P>
  ? JSX.LibraryManagedAttributes<T, P>
  : never;

type ModalButtonProps = ComponentProps<typeof ModalButton>;

const Template: Story<ModalButtonProps> = (args) => <ModalButton {...args} />;

const children = <div>Body</div>;

export const Basic = Template.bind({});
Basic.args = {
  children,
  button_text: "Button Text",
  show_modal: true,
  title: "Title",
};
