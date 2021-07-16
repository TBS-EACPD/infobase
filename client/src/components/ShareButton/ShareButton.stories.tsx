import { Story, Meta } from "@storybook/react";
import React from "react";

import { ShareButton } from "./ShareButton";

export default {
  title: "ShareButton",
  component: ShareButton,
} as Meta;

type ComponentProps<T> = T extends
  | React.ComponentType<infer P>
  | React.Component<infer P>
  ? JSX.LibraryManagedAttributes<T, P>
  : never;

type ShareButtonProps = ComponentProps<typeof ShareButton>;

const Template: Story<ShareButtonProps> = (args) => <ShareButton {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  url: "",
  button_class_name: "",
  title: "Title",
  button_description: "",
  icon_color: "black",
  icon_alternate_color: false,
  icon_size: "2em",
};
